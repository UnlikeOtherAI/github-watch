import type { Hono } from "hono";

export interface GHWatchPlugin {
  name: string;
  version: string;
  routes?: (app: Hono) => void;
}
