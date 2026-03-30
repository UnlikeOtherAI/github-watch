import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { users, watchedRepos, watchedWorkflows } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { githubFetch, type GHRepo, type GHWorkflow } from "../lib/github";
import type { AppEnv } from "../types";

const repos = new Hono<AppEnv>();
repos.use("*", requireAuth);

async function getAccessToken(userId: string): Promise<string> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { accessToken: true },
  });
  if (!user) throw new Error("User not found");
  return user.accessToken;
}

// List user's GitHub repos
repos.get("/available", async (c) => {
  const userId = c.get("userId");
  const token = await getAccessToken(userId);
  const ghRepos = (await githubFetch(
    "/user/repos?per_page=100&sort=updated",
    token,
  )) as GHRepo[];
  return c.json({
    repos: ghRepos.map((r) => ({
      id: r.id,
      full_name: r.full_name,
      name: r.name,
      owner: r.owner.login,
      private: r.private,
    })),
  });
});

// List workflows for a repo
repos.get("/:owner/:repo/workflows", async (c) => {
  const userId = c.get("userId");
  const { owner, repo } = c.req.param();
  const token = await getAccessToken(userId);
  const data = (await githubFetch(
    `/repos/${owner}/${repo}/actions/workflows`,
    token,
  )) as { workflows: GHWorkflow[] };
  return c.json({
    workflows: data.workflows.map((w) => ({
      id: w.id,
      name: w.name,
      path: w.path,
      state: w.state,
    })),
  });
});

// Get user's watched repos with workflows
repos.get("/watched", async (c) => {
  const userId = c.get("userId");
  const watched = await db.query.watchedRepos.findMany({
    where: eq(watchedRepos.userId, userId),
    with: { watchedWorkflows: true },
  });
  return c.json({ repos: watched });
});

// Add/update watched repo + workflows
repos.post("/watch", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<{
    owner: string;
    repo: string;
    workflows: { id: number; name: string; path: string }[];
  }>();

  // Upsert the watched repo
  let existing = await db.query.watchedRepos.findFirst({
    where: and(
      eq(watchedRepos.userId, userId),
      eq(watchedRepos.owner, body.owner),
      eq(watchedRepos.repo, body.repo),
    ),
  });

  let repoId: string;
  if (existing) {
    repoId = existing.id;
    // Remove old workflows and replace
    await db
      .delete(watchedWorkflows)
      .where(eq(watchedWorkflows.watchedRepoId, repoId));
  } else {
    const [newRepo] = await db
      .insert(watchedRepos)
      .values({ userId, owner: body.owner, repo: body.repo })
      .returning();
    repoId = newRepo.id;
  }

  // Insert new workflows
  if (body.workflows.length > 0) {
    await db.insert(watchedWorkflows).values(
      body.workflows.map((w) => ({
        watchedRepoId: repoId,
        workflowId: w.id,
        workflowName: w.name,
        workflowPath: w.path,
      })),
    );
  }

  // Return updated repo with workflows
  const updated = await db.query.watchedRepos.findFirst({
    where: eq(watchedRepos.id, repoId),
    with: { watchedWorkflows: true },
  });
  return c.json({ repo: updated });
});

// Remove watched repo
repos.delete("/watch/:owner/:repo", async (c) => {
  const userId = c.get("userId");
  const { owner, repo } = c.req.param();
  await db
    .delete(watchedRepos)
    .where(
      and(
        eq(watchedRepos.userId, userId),
        eq(watchedRepos.owner, owner),
        eq(watchedRepos.repo, repo),
      ),
    );
  return c.json({ ok: true });
});

export { repos };
