import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, watchedRepos } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { githubFetch, type GHWorkflowRun } from "../lib/github";
import type { AppEnv } from "../types";

const workflows = new Hono<AppEnv>();
workflows.use("*", requireAuth);

// Get recent runs for all watched workflows
workflows.get("/runs", async (c) => {
  const userId = c.get("userId");

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { accessToken: true },
  });
  if (!user) return c.json({ error: "User not found" }, 404);

  const watched = await db.query.watchedRepos.findMany({
    where: eq(watchedRepos.userId, userId),
    with: { watchedWorkflows: true },
  });

  const allRuns: (GHWorkflowRun & { repoFullName: string })[] = [];

  await Promise.all(
    watched.map(async (repo) => {
      const watchedIds = new Set(
        repo.watchedWorkflows.map((w) => w.workflowId),
      );
      if (watchedIds.size === 0) return;

      try {
        const data = (await githubFetch(
          `/repos/${repo.owner}/${repo.repo}/actions/runs?per_page=50`,
          user.accessToken,
        )) as { workflow_runs: GHWorkflowRun[] };

        const filtered = data.workflow_runs
          .filter((run) => watchedIds.has(run.workflow_id))
          .map((run) => ({
            ...run,
            repoFullName: `${repo.owner}/${repo.repo}`,
          }));

        allRuns.push(...filtered);
      } catch {
        // Skip repos that fail (e.g. deleted, permissions revoked)
      }
    }),
  );

  allRuns.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return c.json({ runs: allRuns });
});

export { workflows };
