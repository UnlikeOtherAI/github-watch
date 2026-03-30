import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";
import { db } from "../db";
import { sessions } from "../db/schema";
import { eq, lt } from "drizzle-orm";

const SESSION_COOKIE = "gh_watch_session";
const SESSION_MAX_AGE_DAYS = 90;

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  return token;
}

export async function getSession(c: Context): Promise<string | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }

  // Extend session on activity — reset to 90 days from now
  const newExpiry = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  await db.update(sessions).set({ expiresAt: newExpiry }).where(eq(sessions.token, token));

  return session.userId;
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
  });
}

export async function clearSession(c: Context) {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

export async function cleanExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
