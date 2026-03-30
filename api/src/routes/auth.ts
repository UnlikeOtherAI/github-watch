import { Hono } from "hono";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  createSession,
  setSessionCookie,
  clearSession,
  getSession,
} from "../lib/session";

const auth = new Hono();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:3210";
const APP_URL = process.env.APP_URL || "/app";

auth.get("/login", (c) => {
  // Derive callback from current request URL to work with both
  // host-based (api.ghwatch.live/auth/callback) and path-based (/api/auth/callback) routing
  const url = new URL(c.req.url);
  const callbackUrl = `${url.origin}${url.pathname.replace(/\/login$/, "/callback")}`;
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: callbackUrl,
    scope: "repo",
  });
  return c.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
  );
});

auth.get("/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.text("Missing code", 400);

  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    },
  );
  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
  };
  if (!tokenData.access_token) return c.text("OAuth failed", 400);

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const ghUser = (await userRes.json()) as {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string;
  };

  const existing = await db.query.users.findFirst({
    where: eq(users.githubId, ghUser.id),
  });

  let userId: string;
  if (existing) {
    await db
      .update(users)
      .set({
        login: ghUser.login,
        name: ghUser.name,
        avatarUrl: ghUser.avatar_url,
        accessToken: tokenData.access_token,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));
    userId = existing.id;
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        githubId: ghUser.id,
        login: ghUser.login,
        name: ghUser.name,
        avatarUrl: ghUser.avatar_url,
        accessToken: tokenData.access_token,
      })
      .returning();
    userId = newUser.id;
  }

  const sessionToken = await createSession(userId);
  setSessionCookie(c, sessionToken);
  return c.redirect(APP_URL);
});

auth.get("/me", async (c) => {
  const userId = await getSession(c);
  if (!userId) return c.json({ user: null }, 401);

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, login: true, name: true, avatarUrl: true },
  });
  return c.json({ user });
});

auth.post("/logout", async (c) => {
  await clearSession(c);
  return c.redirect("/");
});

export { auth };
