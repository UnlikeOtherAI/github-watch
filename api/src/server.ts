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

const app = new Hono();

app.use("*", logger());
app.use("/api/*", cors());

// Landing page at root
app.get("/", (c) => c.html(renderLanding()));

app.route("/api", health);
app.route("/api/auth", auth);
app.route("/api/repos", repos);
app.route("/api/workflows", workflows);

// Serve React dashboard static files
const appDistPath = join(import.meta.dir, "../../app/dist");

app.use(
  "/app/*",
  serveStatic({
    root: appDistPath,
    rewriteRequestPath: (path) => path.replace(/^\/app/, ""),
  })
);

// SPA fallback — serve index.html for any unmatched /app/* route
app.get("/app/*", async (c) => {
  const file = Bun.file(join(appDistPath, "index.html"));
  if (await file.exists()) {
    return c.html(await file.text());
  }
  return c.text("App not built. Run: pnpm --filter ./app build", 404);
});

await loadPlugins(app);

const port = parseInt(process.env.PORT || "3210");
console.log(`Server running on :${port}`);

export default {
  port,
  fetch: app.fetch,
};
