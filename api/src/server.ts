import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { health } from "./routes/health";
import { auth } from "./routes/auth";

const app = new Hono();

app.use("*", logger());
app.use("/api/*", cors());

app.route("/api", health);
app.route("/api/auth", auth);

const port = parseInt(process.env.PORT || "3210");
console.log(`Server running on :${port}`);

export default {
  port,
  fetch: app.fetch,
};
