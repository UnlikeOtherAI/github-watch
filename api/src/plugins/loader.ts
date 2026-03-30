import type { Hono } from "hono";
import type { GHWatchPlugin } from "./types";

const plugins: GHWatchPlugin[] = [];

export async function loadPlugins(app: Hono): Promise<void> {
  const pluginList = process.env.GHWATCH_PLUGINS?.split(",").filter(Boolean);
  if (!pluginList?.length) return;

  for (const pkg of pluginList) {
    try {
      const mod = await import(pkg.trim());
      const plugin: GHWatchPlugin = mod.default ?? mod;

      if (!plugin.name || !plugin.version) {
        console.error(`Plugin ${pkg}: missing name or version, skipping`);
        continue;
      }

      if (plugin.routes) {
        plugin.routes(app);
      }

      plugins.push(plugin);
      console.log(`Plugin loaded: ${plugin.name}@${plugin.version}`);
    } catch (err) {
      console.error(`Plugin ${pkg} failed to load:`, err);
    }
  }
}

export function getPlugins(): readonly GHWatchPlugin[] {
  return plugins;
}
