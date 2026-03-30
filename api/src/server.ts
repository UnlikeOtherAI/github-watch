import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { health } from "./routes/health";
import { auth } from "./routes/auth";
import { repos } from "./routes/repos";
import { workflows } from "./routes/workflows";

const app = new Hono();

app.use("*", logger());
app.use("/api/*", cors());

app.route("/api", health);
app.route("/api/auth", auth);
app.route("/api/repos", repos);
app.route("/api/workflows", workflows);

const port = parseInt(process.env.PORT || "3210");
console.log(`Server running on :${port}`);

export default {
  port,
  fetch: app.fetch,
};
