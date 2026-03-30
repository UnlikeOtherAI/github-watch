import { createMiddleware } from "hono/factory";
import { getSession } from "../lib/session";

export const requireAuth = createMiddleware(async (c, next) => {
  const userId = getSession(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", userId);
  await next();
});
