import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { health } from "./routes/health";

const app = new Hono();

app.use("*", logger());
app.use("/api/*", cors());

app.route("/api", health);

const port = parseInt(process.env.PORT || "3210");
console.log(`Server running on :${port}`);

export default {
  port,
  fetch: app.fetch,
};
