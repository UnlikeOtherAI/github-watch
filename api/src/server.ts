import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { join } from "node:path";
import { health } from "./routes/health";
import { auth } from "./routes/auth";
import { repos } from "./routes/repos";
import { workflows } from "./routes/workflows";
import { renderLanding } from "./views/landing";
import { loadPlugins } from "./plugins/loader";

const BASE_DOMAIN = process.env.BASE_DOMAIN || "localhost:3210";

const app = new Hono();
app.use("*", logger());

// --- API app (api.ghwatch.live or /api) ---
const apiApp = new Hono();
apiApp.use(
  "*",
  cors({
    origin: (origin) => origin, // reflect origin for credentialed requests
    credentials: true,
  }),
);
apiApp.route("/", health);
apiApp.route("/auth", auth);
apiApp.route("/repos", repos);
apiApp.route("/workflows", workflows);

// --- Dashboard app (app.ghwatch.live or /app) ---
const dashApp = new Hono();
const appDistPath = join(import.meta.dir, "../../app/dist");

dashApp.use(
  "/*",
  serveStatic({ root: appDistPath }),
);

dashApp.get("/*", async (c) => {
  const file = Bun.file(join(appDistPath, "index.html"));
  if (await file.exists()) {
    return c.html(await file.text());
  }
  return c.text("App not built. Run: pnpm --filter ./app build", 404);
});

// --- Host-based routing ---
app.use("*", async (c, next) => {
  const host = c.req.header("host")?.replace(/:\d+$/, "") || "";

  if (host === `api.${BASE_DOMAIN}`) {
    return apiApp.fetch(c.req.raw, c.env);
  }

  if (host === `app.${BASE_DOMAIN}`) {
    return dashApp.fetch(c.req.raw, c.env);
  }

  // Root domain or unknown host — fall through to path-based routes
  return next();
});

// --- Static assets for landing page ---
app.use(
  "/static/*",
  serveStatic({
    root: appDistPath,
    rewriteRequestPath: (path) => path.replace(/^\/static/, ""),
  }),
);

// --- Path-based fallback (single-domain / local dev) ---
app.get("/", (c) => c.html(renderLanding()));
app.route("/api", apiApp);

app.use(
  "/app/*",
  serveStatic({
    root: appDistPath,
    rewriteRequestPath: (path) => path.replace(/^\/app/, ""),
  }),
);
app.get("/app/*", async (c) => {
  const file = Bun.file(join(appDistPath, "index.html"));
  if (await file.exists()) {
    return c.html(await file.text());
  }
  return c.text("App not built. Run: pnpm --filter ./app build", 404);
});

// Landing page for root domain host-based routing
app.get("*", (c) => {
  const host = c.req.header("host")?.replace(/:\d+$/, "") || "";
  if (host === BASE_DOMAIN || host === `www.${BASE_DOMAIN}`) {
    return c.html(renderLanding());
  }
  return c.text("Not found", 404);
});

await loadPlugins(app);

const port = parseInt(process.env.PORT || "3210");
console.log(`Server running on :${port}`);

export default {
  port,
  fetch: app.fetch,
};
