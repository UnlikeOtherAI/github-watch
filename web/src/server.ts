import { Hono } from "hono";
import { renderLanding } from "./views/landing";

const app = new Hono();

app.get("/", (c) => c.html(renderLanding()));

const port = parseInt(process.env.WEB_PORT || "3100");
console.log(`Landing page on :${port}`);

export default { port, fetch: app.fetch };
