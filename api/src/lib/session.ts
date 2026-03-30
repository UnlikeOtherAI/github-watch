import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";

const SESSION_COOKIE = "gh_watch_session";
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export function createSession(userId: string): string {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  sessions.set(token, { userId, expiresAt });
  return token;
}

export function getSession(c: Context): string | null {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return session.userId;
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearSession(c: Context) {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) sessions.delete(token);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}
