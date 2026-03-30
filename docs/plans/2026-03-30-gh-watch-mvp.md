# GH-Watch MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a self-hosted GitHub Actions monitoring dashboard with GitHub OAuth login, repo/workflow selection, and real-time action status display.

**Architecture:** Three services: API on :3210 (`api/`), React dashboard on :3200 (`app/`), SSR landing page on :3100 (`web/`). PostgreSQL via Drizzle ORM for persistence. GitHub App OAuth for authentication. Deployed to Cloud Run behind Cloudflare DNS at `watch.unlikeotherai.com`.

**Tech Stack:** Bun, Hono, React, Vite, Tailwind CSS v4, Drizzle ORM, PostgreSQL, Docker, Google Cloud Run, Cloudflare

**Design:** Replicate GitHub's design language as closely as possible — colors, corner radii, font styles, spacing, component patterns. Reference `docs/github-design-reference.md` for exact values. Use Font Awesome for all icons.

---

## Phase 1: Project Scaffolding

### Task 1.1: Initialize monorepo structure

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `CLAUDE.md`
- Create: `AGENTS.md`

**Step 1: Create root package.json**

```json
{
  "name": "gh-watch",
  "private": true,
  "packageManager": "pnpm@10.22.0",
  "scripts": {
    "dev": "pnpm --filter ./api dev",
    "dev:app": "pnpm --filter ./app dev",
    "dev:web": "pnpm --filter ./web dev",
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "db:push": "pnpm --filter ./api db:push",
    "db:studio": "pnpm --filter ./api db:studio"
  }
}
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - api
  - app
  - web
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.vite/
drizzle/meta/
.ninja/
.steroids/
```

**Step 4: Create .env.example**

```
DATABASE_URL=postgres://ghwatch:ghwatch@localhost:5432/ghwatch
GITHUB_APP_ID=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SESSION_SECRET=change-me-to-random-64-chars
PORT=3210
NODE_ENV=development
PUBLIC_URL=http://localhost:3210
```

**Step 5: Create CLAUDE.md**

```markdown
# GH-Watch

GitHub Actions monitoring dashboard.

All standards live in [@AGENTS.md](AGENTS.md).
```

**Step 6: Create AGENTS.md**

```markdown
# GH-Watch Standards

## Architecture
- Single Bun server: API (`/api`), SSR landing (`/`), React dashboard (`/app`)
- PostgreSQL + Drizzle ORM
- GitHub App OAuth (self-hosted, no third-party auth)

## Structure
```
api/          — Bun + Hono API server (:3210)
app/          — React CSR dashboard (:3200, Vite + Tailwind)
web/          — SSR landing page (:3100, Bun + Hono + Tailwind)
docs/         — Plans, infrastructure, deployment docs
```

## Rules
- Package manager: pnpm
- Runtime: Bun
- Code files: 500 lines max
- No premature abstractions
- Root cause first, no patches on patches
- Commit after each meaningful change
- Build + typecheck before closing

## Design
- Match GitHub's design language — see [docs/github-design-reference.md](docs/github-design-reference.md)
- Icons: Font Awesome 6 (CDN or package)
- Dark theme matching GitHub's dark default

## Dev
- `pnpm dev` — API server on :3210
- `pnpm dev:app` — React dashboard on :3200
- `pnpm dev:web` — Landing page on :3100
- `docker compose up -d db` — PostgreSQL on :5432

## Deployment
- Google Cloud Run — see [docs/deployment.md](docs/deployment.md)
- Domain: watch.unlikeotherai.com — see [docs/infrastructure.md](docs/infrastructure.md)
```

**Step 7: Commit**

```bash
git add -A && git commit -m "chore: scaffold monorepo structure"
```

---

### Task 1.2: Create GitHub repo

**Step 1: Create remote repo**

```bash
gh repo create rafiki270/gh-watch --private --source=. --push
```

---

## Phase 2: API Server Foundation

### Task 2.1: Initialize API package

**Files:**
- Create: `api/package.json`
- Create: `api/tsconfig.json`
- Create: `api/src/server.ts`
- Create: `api/src/routes/health.ts`

**Step 1: Create api/package.json**

```json
{
  "name": "@gh-watch/api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun --watch src/server.ts",
    "build": "bun build src/server.ts --outdir dist --target bun",
    "typecheck": "tsc --noEmit",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "hono": "^4",
    "drizzle-orm": "^0.38",
    "postgres": "^3",
    "@hono/node-server": "^1"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5",
    "drizzle-kit": "^0.30"
  }
}
```

**Step 2: Create api/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["bun-types"]
  },
  "include": ["src"]
}
```

**Step 3: Create api/src/routes/health.ts**

```typescript
import { Hono } from "hono";

const health = new Hono();

health.get("/health", (c) => c.json({ status: "ok" }));

export { health };
```

**Step 4: Create api/src/server.ts**

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/middleware";
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
```

**Step 5: Install deps and verify**

```bash
cd api && pnpm install && bun run src/server.ts &
sleep 1 && curl http://localhost:3210/api/health
kill %1
```

**Step 6: Commit**

```bash
git add api/ pnpm-lock.yaml && git commit -m "feat: add API server with health endpoint"
```

---

### Task 2.2: Set up PostgreSQL + Drizzle

**Files:**
- Create: `docker-compose.yml`
- Create: `api/src/db/index.ts`
- Create: `api/src/db/schema.ts`
- Create: `api/drizzle.config.ts`

**Step 1: Create docker-compose.yml**

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ghwatch
      POSTGRES_PASSWORD: ghwatch
      POSTGRES_DB: ghwatch
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Step 2: Create api/src/db/schema.ts**

```typescript
import { pgTable, text, timestamp, boolean, integer, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  githubId: integer("github_id").notNull().unique(),
  login: text("login").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const watchedRepos = pgTable("watched_repos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  owner: text("owner").notNull(),
  repo: text("repo").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watchedWorkflows = pgTable("watched_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  watchedRepoId: uuid("watched_repo_id").notNull().references(() => watchedRepos.id, { onDelete: "cascade" }),
  workflowId: integer("workflow_id").notNull(),
  workflowName: text("workflow_name").notNull(),
  workflowPath: text("workflow_path").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Step 3: Create api/src/db/index.ts**

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

**Step 4: Create api/drizzle.config.ts**

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Step 5: Start DB and push schema**

```bash
docker compose up -d db
sleep 2
cd api && DATABASE_URL=postgres://ghwatch:ghwatch@localhost:5432/ghwatch pnpm db:push
```

**Step 6: Commit**

```bash
git add docker-compose.yml api/src/db/ api/drizzle.config.ts pnpm-lock.yaml
git commit -m "feat: add PostgreSQL schema with Drizzle ORM"
```

---

## Phase 3: GitHub App OAuth

### Task 3.1: Create GitHub App (manual + automation)

**Context:** We need a GitHub App for OAuth login and API access. The app needs:
- Callback URL: `http://localhost:3210/api/auth/callback` (dev) + `https://watch.unlikeotherai.com/api/auth/callback` (prod)
- Permissions: `actions:read`, `metadata:read`
- User authorization: enabled

**Step 1: Create GitHub App via API**

```bash
gh api -X POST /user/apps -f name="GH-Watch" \
  -f url="https://watch.unlikeotherai.com" \
  -f callback_url="http://localhost:3210/api/auth/callback" \
  -f public=false \
  --jq '{id: .id, client_id: .client_id, client_secret: .client_secret, slug: .slug}'
```

Note: If API creation fails, create manually at https://github.com/settings/apps/new with:
- App name: GH-Watch
- Homepage: https://watch.unlikeotherai.com
- Callback URL: http://localhost:3210/api/auth/callback
- Permissions: Actions (read), Metadata (read)
- Check "Request user authorization (OAuth) during installation"

**Step 2: Save credentials to .env**

```bash
cp .env.example .env
# Fill in GITHUB_APP_ID, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET from step 1
```

**Step 3: Commit (no .env!)**

```bash
git add .env.example && git commit -m "docs: add GitHub App setup instructions"
```

---

### Task 3.2: Implement OAuth flow

**Files:**
- Create: `api/src/routes/auth.ts`
- Create: `api/src/lib/session.ts`
- Modify: `api/src/server.ts`

**Step 1: Create api/src/lib/session.ts**

```typescript
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";

const SESSION_COOKIE = "gh_watch_session";
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export function createSession(userId: string): string {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  sessions.set(token, { userId, expiresAt });
  return token;
}

export function getSession(c: Context): string | null {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return session.userId;
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearSession(c: Context) {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) sessions.delete(token);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}
```

**Step 2: Create api/src/routes/auth.ts**

```typescript
import { Hono } from "hono";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { createSession, setSessionCookie, clearSession, getSession } from "../lib/session";

const auth = new Hono();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:3210";

auth.get("/login", (c) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${PUBLIC_URL}/api/auth/callback`,
    scope: "repo",
  });
  return c.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

auth.get("/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.text("Missing code", 400);

  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData = await tokenRes.json() as { access_token?: string };
  if (!tokenData.access_token) return c.text("OAuth failed", 400);

  // Fetch GitHub user
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const ghUser = await userRes.json() as {
    id: number; login: string; name: string | null; avatar_url: string;
  };

  // Upsert user
  const existing = await db.query.users.findFirst({
    where: eq(users.githubId, ghUser.id),
  });

  let userId: string;
  if (existing) {
    await db.update(users).set({
      login: ghUser.login,
      name: ghUser.name,
      avatarUrl: ghUser.avatar_url,
      accessToken: tokenData.access_token,
      updatedAt: new Date(),
    }).where(eq(users.id, existing.id));
    userId = existing.id;
  } else {
    const [newUser] = await db.insert(users).values({
      githubId: ghUser.id,
      login: ghUser.login,
      name: ghUser.name,
      avatarUrl: ghUser.avatar_url,
      accessToken: tokenData.access_token,
    }).returning();
    userId = newUser.id;
  }

  const sessionToken = createSession(userId);
  setSessionCookie(c, sessionToken);
  return c.redirect("/app");
});

auth.get("/me", async (c) => {
  const userId = getSession(c);
  if (!userId) return c.json({ user: null }, 401);

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, login: true, name: true, avatarUrl: true },
  });
  return c.json({ user });
});

auth.post("/logout", (c) => {
  clearSession(c);
  return c.redirect("/");
});

export { auth };
```

**Step 3: Create auth middleware**

Create `api/src/middleware/auth.ts`:

```typescript
import { createMiddleware } from "hono/factory";
import { getSession } from "../lib/session";

export const requireAuth = createMiddleware(async (c, next) => {
  const userId = getSession(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", userId);
  await next();
});
```

**Step 4: Wire auth into server.ts**

Update `api/src/server.ts`:

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/middleware";
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
```

**Step 5: Test login flow manually**

```bash
cd api && bun run src/server.ts &
curl -v http://localhost:3210/api/auth/login 2>&1 | grep Location
kill %1
```

Expected: `Location: https://github.com/login/oauth/authorize?client_id=...`

**Step 6: Commit**

```bash
git add api/src/ && git commit -m "feat: add GitHub OAuth login flow"
```

---

## Phase 4: GitHub API Routes

### Task 4.1: Repos + Workflows API

**Files:**
- Create: `api/src/lib/github.ts`
- Create: `api/src/routes/repos.ts`
- Create: `api/src/routes/workflows.ts`
- Modify: `api/src/server.ts`

**Step 1: Create api/src/lib/github.ts**

```typescript
const GITHUB_API = "https://api.github.com";

export async function githubFetch(path: string, token: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`);
  return res.json();
}

export interface GHRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  private: boolean;
}

export interface GHWorkflow {
  id: number;
  name: string;
  path: string;
  state: string;
}

export interface GHWorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_number: number;
  workflow_id: number;
  head_commit: { message: string; author: { name: string } } | null;
}
```

**Step 2: Create api/src/routes/repos.ts**

```typescript
import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { db } from "../db";
import { users, watchedRepos, watchedWorkflows } from "../db/schema";
import { eq } from "drizzle-orm";
import { githubFetch, type GHRepo, type GHWorkflow } from "../lib/github";

const repos = new Hono();

// List user's GitHub repos
repos.get("/available", requireAuth, async (c) => {
  const userId = c.get("userId") as string;
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return c.json({ error: "User not found" }, 404);

  const data = await githubFetch("/user/repos?per_page=100&sort=updated", user.accessToken) as GHRepo[];
  return c.json({
    repos: data.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      name: r.name,
      owner: r.owner.login,
      private: r.private,
    })),
  });
});

// List workflows for a repo
repos.get("/:owner/:repo/workflows", requireAuth, async (c) => {
  const userId = c.get("userId") as string;
  const { owner, repo } = c.req.param();
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return c.json({ error: "User not found" }, 404);

  const data = await githubFetch(`/repos/${owner}/${repo}/actions/workflows`, user.accessToken) as {
    workflows: GHWorkflow[];
  };
  return c.json({ workflows: data.workflows });
});

// Get watched repos for current user
repos.get("/watched", requireAuth, async (c) => {
  const userId = c.get("userId") as string;
  const watched = await db.query.watchedRepos.findMany({
    where: eq(watchedRepos.userId, userId),
    with: { watchedWorkflows: true },
  });
  return c.json({ repos: watched });
});

// Add/update watched repo + workflows
repos.post("/watch", requireAuth, async (c) => {
  const userId = c.get("userId") as string;
  const body = await c.req.json() as {
    owner: string;
    repo: string;
    workflows: { workflowId: number; workflowName: string; workflowPath: string }[];
  };

  // Upsert watched repo
  let existing = await db.query.watchedRepos.findFirst({
    where: (wr, { and }) =>
      and(eq(wr.userId, userId), eq(wr.owner, body.owner), eq(wr.repo, body.repo)),
  });

  if (!existing) {
    const [created] = await db.insert(watchedRepos).values({
      userId,
      owner: body.owner,
      repo: body.repo,
    }).returning();
    existing = created;
  }

  // Replace workflows
  await db.delete(watchedWorkflows).where(eq(watchedWorkflows.watchedRepoId, existing.id));
  if (body.workflows.length > 0) {
    await db.insert(watchedWorkflows).values(
      body.workflows.map((w) => ({
        watchedRepoId: existing.id,
        workflowId: w.workflowId,
        workflowName: w.workflowName,
        workflowPath: w.workflowPath,
      }))
    );
  }

  return c.json({ ok: true });
});

// Remove watched repo
repos.delete("/watch/:owner/:repo", requireAuth, async (c) => {
  const userId = c.get("userId") as string;
  const { owner, repo } = c.req.param();
  await db.delete(watchedRepos).where(
    (wr) => and(eq(wr.userId, userId), eq(wr.owner, owner), eq(wr.repo, repo))
  );
  return c.json({ ok: true });
});

export { repos };
```

Note: The delete route has a bug with the `where` clause — fix during implementation to use proper `and` + `eq` from drizzle-orm.

**Step 3: Create api/src/routes/workflows.ts**

```typescript
import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { db } from "../db";
import { users, watchedRepos, watchedWorkflows } from "../db/schema";
import { eq } from "drizzle-orm";
import { githubFetch, type GHWorkflowRun } from "../lib/github";

const workflows = new Hono();

// Get recent runs for all watched workflows
workflows.get("/runs", requireAuth, async (c) => {
  const userId = c.get("userId") as string;
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return c.json({ error: "User not found" }, 404);

  const watched = await db.query.watchedRepos.findMany({
    where: eq(watchedRepos.userId, userId),
    with: { watchedWorkflows: true },
  });

  const runs: Array<GHWorkflowRun & { repoFullName: string }> = [];

  for (const repo of watched) {
    try {
      const data = await githubFetch(
        `/repos/${repo.owner}/${repo.repo}/actions/runs?per_page=20`,
        user.accessToken
      ) as { workflow_runs: GHWorkflowRun[] };

      const watchedIds = new Set(repo.watchedWorkflows.map((w) => w.workflowId));
      const filtered = data.workflow_runs.filter((r) => watchedIds.has(r.workflow_id));
      runs.push(...filtered.map((r) => ({ ...r, repoFullName: `${repo.owner}/${repo.repo}` })));
    } catch (e) {
      console.error(`Failed to fetch runs for ${repo.owner}/${repo.repo}:`, e);
    }
  }

  runs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return c.json({ runs });
});

export { workflows };
```

**Step 4: Update server.ts to include new routes**

```typescript
// Add to server.ts imports and routes:
import { repos } from "./routes/repos";
import { workflows } from "./routes/workflows";

app.route("/api/repos", repos);
app.route("/api/workflows", workflows);
```

**Step 5: Commit**

```bash
git add api/src/ && git commit -m "feat: add repos and workflows API routes"
```

---

## Phase 5: Landing Page (`web/`)

### Task 5.1: Create web package with full landing page

**Files:**
- Create: `web/package.json`
- Create: `web/tsconfig.json`
- Create: `web/src/server.ts`
- Create: `web/src/views/landing.ts`

The landing page is a separate Bun + Hono SSR service on :3100. Full-fledged marketing page matching GitHub's design language (dark theme, system font stack, GitHub color tokens). Uses Tailwind CSS v4 via CDN for SSR pages, Font Awesome for icons.

**Step 1: Create web/package.json**

```json
{
  "name": "@gh-watch/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun --watch src/server.ts",
    "build": "bun build src/server.ts --outdir dist --target bun",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5"
  }
}
```

**Step 2: Create web/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["bun-types"]
  },
  "include": ["src"]
}
```

**Step 3: Create web/src/views/landing.ts**

Build a full-fledged marketing landing page with these sections:
- **Nav:** Logo + "Sign in with GitHub" button (top-right)
- **Hero:** Bold headline, subtitle, CTA button, animated mock dashboard screenshot/illustration
- **Features:** 3-column grid with Font Awesome icons — real-time monitoring, repo/workflow selection, self-hosted
- **How it works:** 3-step flow — connect GitHub, select workflows, monitor
- **Footer:** Copyright, links

Design must follow `docs/github-design-reference.md` dark theme tokens:
- Background: `#0d1117` (GitHub dark default)
- Surface: `#161b22` (cards/sections)
- Border: `#30363d`
- Text primary: `#e6edf3`
- Text muted: `#8b949e`
- Accent: `#58a6ff` (links, CTA)
- Success green: `#3fb950`
- Font: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif`
- Border radius: 6px

Use Tailwind CDN + Font Awesome CDN. SSR rendered as a single HTML string.

**Step 4: Create web/src/server.ts**

```typescript
import { Hono } from "hono";
import { renderLanding } from "./views/landing";

const app = new Hono();

app.get("/", (c) => c.html(renderLanding()));

const port = parseInt(process.env.WEB_PORT || "3100");
console.log(`Landing page on :${port}`);

export default { port, fetch: app.fetch };
```

**Step 5: Install deps and verify**

```bash
cd web && pnpm install && bun run src/server.ts &
sleep 1 && curl http://localhost:3100/ | head -10
kill %1
```

**Step 6: Commit**

```bash
git add web/ pnpm-lock.yaml && git commit -m "feat: add full landing page"
```

---

## Phase 6: React Dashboard App

### Task 6.1: Scaffold React app with Vite + Tailwind

**Files:**
- Create: `app/package.json`
- Create: `app/tsconfig.json`
- Create: `app/tsconfig.node.json`
- Create: `app/vite.config.ts`
- Create: `app/index.html`
- Create: `app/src/main.tsx`
- Create: `app/src/App.tsx`
- Create: `app/src/index.css`

**Step 1: Create app/package.json**

```json
{
  "name": "@gh-watch/app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3200",
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "react-router-dom": "^7"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4",
    "typescript": "^5",
    "vite": "^6",
    "@tailwindcss/vite": "^4",
    "tailwindcss": "^4"
  }
}
```

**Step 2: Create app/vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/app/",
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      "/api": "http://localhost:3210",
    },
  },
});
```

**Step 3: Create app/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GH-Watch Dashboard</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

**Step 4: Create app/src/index.css**

```css
@import "tailwindcss";
```

**Step 5: Create app/src/main.tsx**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/app">
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

**Step 6: Create app/src/App.tsx**

```tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Setup } from "./pages/Setup";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="setup" element={<Setup />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

**Step 7: Create app/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

**Step 8: Install deps**

```bash
cd app && pnpm install
```

**Step 9: Commit**

```bash
git add app/ pnpm-lock.yaml && git commit -m "feat: scaffold React dashboard app"
```

---

### Task 6.2: Layout component (sidebar + topbar)

**Files:**
- Create: `app/src/components/Layout.tsx`
- Create: `app/src/hooks/useUser.ts`
- Create: `app/src/lib/api.ts`

**Step 1: Create app/src/lib/api.ts**

```tsx
const BASE = "/api";

export async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...opts,
    headers: { "Content-Type": "application/json", ...opts?.headers },
  });
  if (res.status === 401) {
    window.location.href = "/api/auth/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
```

**Step 2: Create app/src/hooks/useUser.ts**

```tsx
import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

interface User {
  id: string;
  login: string;
  name: string | null;
  avatarUrl: string | null;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ user: User }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
```

**Step 3: Create app/src/components/Layout.tsx**

```tsx
import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export function Layout() {
  const { user, loading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/auth/login";
    return null;
  }

  const navItems = [
    { to: "/", label: "Dashboard", icon: "◻" },
    { to: "/setup", label: "Setup", icon: "⚙" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="text-lg font-bold tracking-tight">GH-Watch</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800/50 hover:text-white transition"
            >
              <span>↪</span>
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            {user.avatarUrl && (
              <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
            )}
            <span className="text-sm text-gray-300">{user.login}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add app/src/ && git commit -m "feat: add layout with sidebar navigation"
```

---

### Task 6.3: Dashboard page

**Files:**
- Create: `app/src/pages/Dashboard.tsx`

**Step 1: Create app/src/pages/Dashboard.tsx**

```tsx
import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

interface WorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_number: number;
  repoFullName: string;
  head_commit: { message: string; author: { name: string } } | null;
}

function statusColor(status: string, conclusion: string | null): string {
  if (status === "in_progress" || status === "queued") return "text-yellow-400";
  if (conclusion === "success") return "text-green-400";
  if (conclusion === "failure") return "text-red-400";
  if (conclusion === "cancelled") return "text-gray-500";
  return "text-gray-400";
}

function statusDot(status: string, conclusion: string | null): string {
  if (status === "in_progress") return "bg-yellow-400 animate-pulse";
  if (status === "queued") return "bg-yellow-600";
  if (conclusion === "success") return "bg-green-400";
  if (conclusion === "failure") return "bg-red-400";
  return "bg-gray-500";
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function Dashboard() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = () => {
    apiFetch<{ runs: WorkflowRun[] }>("/workflows/runs")
      .then((data) => setRuns(data.runs))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading runs...</div>;
  }

  if (runs.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-300 mb-2">No workflow runs yet</h2>
        <p className="text-gray-500 mb-6">Set up repos and workflows to start watching.</p>
        <a href="/app/setup" className="text-indigo-400 hover:text-indigo-300">
          Go to Setup →
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button
          onClick={fetchRuns}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-2">
        {runs.map((run) => (
          <a
            key={run.id}
            href={run.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition"
          >
            <div className="flex items-start gap-3">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${statusDot(run.status, run.conclusion)}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium truncate">{run.name}</span>
                  <span className="text-xs text-gray-500">#{run.run_number}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-mono">{run.repoFullName}</span>
                  <span>·</span>
                  <span>{run.head_branch}</span>
                  <span>·</span>
                  <span>{timeAgo(run.created_at)}</span>
                </div>
                {run.head_commit && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {run.head_commit.message}
                  </p>
                )}
              </div>
              <span className={`text-xs font-medium shrink-0 ${statusColor(run.status, run.conclusion)}`}>
                {run.status === "completed" ? run.conclusion : run.status}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/src/pages/ && git commit -m "feat: add dashboard page with workflow runs"
```

---

### Task 6.4: Setup page

**Files:**
- Create: `app/src/pages/Setup.tsx`

**Step 1: Create app/src/pages/Setup.tsx**

```tsx
import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

interface Repo {
  id: number;
  fullName: string;
  name: string;
  owner: string;
  private: boolean;
}

interface Workflow {
  id: number;
  name: string;
  path: string;
  state: string;
}

interface WatchedRepo {
  id: string;
  owner: string;
  repo: string;
  watchedWorkflows: { workflowId: number; workflowName: string; workflowPath: string }[];
}

export function Setup() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [watched, setWatched] = useState<WatchedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<Record<string, Workflow[]>>({});
  const [selected, setSelected] = useState<Record<string, Set<number>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ repos: Repo[] }>("/repos/available"),
      apiFetch<{ repos: WatchedRepo[] }>("/repos/watched"),
    ]).then(([repoData, watchedData]) => {
      setRepos(repoData.repos);
      setWatched(watchedData.repos);

      // Pre-populate selected state from watched data
      const sel: Record<string, Set<number>> = {};
      for (const w of watchedData.repos) {
        sel[`${w.owner}/${w.repo}`] = new Set(w.watchedWorkflows.map((wf) => wf.workflowId));
      }
      setSelected(sel);
    }).finally(() => setLoading(false));
  }, []);

  const toggleRepo = async (repo: Repo) => {
    const key = repo.fullName;
    if (expandedRepo === key) {
      setExpandedRepo(null);
      return;
    }
    setExpandedRepo(key);
    if (!workflows[key]) {
      const data = await apiFetch<{ workflows: Workflow[] }>(
        `/repos/${repo.owner}/${repo.name}/workflows`
      );
      setWorkflows((prev) => ({ ...prev, [key]: data.workflows }));
    }
  };

  const toggleWorkflow = (repoKey: string, workflowId: number) => {
    setSelected((prev) => {
      const current = new Set(prev[repoKey] || []);
      if (current.has(workflowId)) current.delete(workflowId);
      else current.add(workflowId);
      return { ...prev, [repoKey]: current };
    });
  };

  const selectAll = (repoKey: string) => {
    const wfs = workflows[repoKey] || [];
    setSelected((prev) => ({
      ...prev,
      [repoKey]: new Set(wfs.map((w) => w.id)),
    }));
  };

  const deselectAll = (repoKey: string) => {
    setSelected((prev) => ({ ...prev, [repoKey]: new Set() }));
  };

  const saveRepo = async (repo: Repo) => {
    const key = repo.fullName;
    const selectedIds = selected[key] || new Set();
    const wfs = (workflows[key] || []).filter((w) => selectedIds.has(w.id));

    setSaving(key);
    await apiFetch("/repos/watch", {
      method: "POST",
      body: JSON.stringify({
        owner: repo.owner,
        repo: repo.name,
        workflows: wfs.map((w) => ({
          workflowId: w.id,
          workflowName: w.name,
          workflowPath: w.path,
        })),
      }),
    });
    setSaving(null);
  };

  if (loading) return <div className="text-gray-400">Loading repos...</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Setup Watched Repos</h1>
      <div className="space-y-2">
        {repos.map((repo) => {
          const key = repo.fullName;
          const isExpanded = expandedRepo === key;
          const repoWorkflows = workflows[key] || [];
          const selectedIds = selected[key] || new Set();
          const isWatched = selectedIds.size > 0;

          return (
            <div key={repo.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleRepo(repo)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition"
              >
                <div className="flex items-center gap-3">
                  {isWatched && (
                    <span className="w-2 h-2 bg-indigo-400 rounded-full shrink-0" />
                  )}
                  <span className="text-sm font-medium">{repo.fullName}</span>
                  {repo.private && (
                    <span className="text-xs text-gray-500 border border-gray-700 rounded px-1.5 py-0.5">
                      private
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-800 p-4">
                  {repoWorkflows.length === 0 ? (
                    <div className="text-sm text-gray-500">Loading workflows...</div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <button
                          onClick={() => selectAll(key)}
                          className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          Select all
                        </button>
                        <span className="text-gray-600">·</span>
                        <button
                          onClick={() => deselectAll(key)}
                          className="text-xs text-gray-400 hover:text-gray-300"
                        >
                          Deselect all
                        </button>
                      </div>
                      <div className="space-y-2">
                        {repoWorkflows.map((wf) => (
                          <label
                            key={wf.id}
                            className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-800/50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.has(wf.id)}
                              onChange={() => toggleWorkflow(key, wf.id)}
                              className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm">{wf.name}</div>
                              <div className="text-xs text-gray-500 font-mono truncate">{wf.path}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-800">
                        <button
                          onClick={() => saveRepo(repo)}
                          disabled={saving === key}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition"
                        >
                          {saving === key ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/src/pages/Setup.tsx && git commit -m "feat: add setup page for repo/workflow selection"
```

---

## Phase 7: Static File Serving + Build

### Task 7.1: Serve React app from API server

**Files:**
- Modify: `api/src/server.ts`
- Modify: `api/package.json`

**Step 1: Update server.ts to serve React build**

Add static file serving after all API routes in `api/src/server.ts`:

```typescript
import { serveStatic } from "hono/bun";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Serve React app static files
const appDistPath = join(import.meta.dir, "../../app/dist");

app.use("/app/*", serveStatic({ root: appDistPath, rewriteRequestPath: (path) => path.replace(/^\/app/, "") }));

// SPA fallback — serve index.html for any /app/* route not matched by static files
app.get("/app/*", (c) => {
  const indexPath = join(appDistPath, "index.html");
  if (existsSync(indexPath)) {
    return c.html(readFileSync(indexPath, "utf-8"));
  }
  return c.text("App not built. Run: pnpm --filter ./app build", 404);
});
```

Note: The exact Hono static serving API may differ — adjust during implementation based on Hono docs for Bun.

**Step 2: Add build script**

Root package.json already has `"build": "pnpm -r build"`. Verify both `api` and `app` packages have build scripts.

**Step 3: Build and test**

```bash
pnpm --filter ./app build
cd api && bun run src/server.ts &
curl http://localhost:3210/app/ | head -5
kill %1
```

**Step 4: Commit**

```bash
git add api/src/server.ts && git commit -m "feat: serve React app from API server"
```

---

## Phase 8: Drizzle Relations

### Task 8.1: Add Drizzle relations for queries

**Files:**
- Modify: `api/src/db/schema.ts`

**Step 1: Add relations**

Append to `api/src/db/schema.ts`:

```typescript
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  watchedRepos: many(watchedRepos),
}));

export const watchedReposRelations = relations(watchedRepos, ({ one, many }) => ({
  user: one(users, { fields: [watchedRepos.userId], references: [users.id] }),
  watchedWorkflows: many(watchedWorkflows),
}));

export const watchedWorkflowsRelations = relations(watchedWorkflows, ({ one }) => ({
  watchedRepo: one(watchedRepos, { fields: [watchedWorkflows.watchedRepoId], references: [watchedRepos.id] }),
}));
```

**Step 2: Commit**

```bash
git add api/src/db/schema.ts && git commit -m "feat: add Drizzle ORM relations"
```

---

## Phase 9: Infrastructure & Deployment

### Task 9.1: Create GCloud project + Cloud Run

**Step 1: Create GCloud project**

```bash
gcloud projects create gh-watch-prod --name="GH-Watch" 2>/dev/null || echo "Project may already exist"
gcloud config set project gh-watch-prod
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com
```

**Step 2: Create Cloud SQL PostgreSQL instance** (or use Cloud Run with a sidecar/external DB)

For MVP, use Cloud Run with a managed PostgreSQL. Options:
- Cloud SQL (managed, $$$)
- Neon/Supabase free tier (simpler for MVP)
- Run postgres as a sidecar (not recommended for production)

Recommended: Use Neon free tier for MVP. Set `DATABASE_URL` in Cloud Run env.

**Step 3: Create Artifact Registry repo**

```bash
gcloud artifacts repositories create gh-watch --repository-format=docker --location=europe-west1
```

---

### Task 9.2: Dockerfile

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

**Step 1: Create Dockerfile**

```dockerfile
FROM oven/bun:1 AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY api/package.json api/
COPY app/package.json app/
RUN bun install

# Build React app
FROM deps AS build-app
WORKDIR /app
COPY app/ app/
RUN cd app && bun run build

# Production
FROM base AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY --from=deps /app/api/node_modules api/node_modules
COPY api/ api/
COPY --from=build-app /app/app/dist app/dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "run", "api/src/server.ts"]
```

**Step 2: Create .dockerignore**

```
node_modules
dist
.env
.env.local
.git
*.log
.DS_Store
.ninja
.steroids
docs
```

**Step 3: Build and test locally**

```bash
docker build -t gh-watch .
docker run --rm -p 8080:8080 --env-file .env gh-watch
```

**Step 4: Commit**

```bash
git add Dockerfile .dockerignore && git commit -m "feat: add Dockerfile for Cloud Run deployment"
```

---

### Task 9.3: Deploy to Cloud Run

**Step 1: Build and push image**

```bash
gcloud builds submit --tag europe-west1-docker.pkg.dev/gh-watch-prod/gh-watch/api:latest
```

**Step 2: Deploy**

```bash
gcloud run deploy gh-watch \
  --image europe-west1-docker.pkg.dev/gh-watch-prod/gh-watch/api:latest \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PUBLIC_URL=https://watch.unlikeotherai.com" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,GITHUB_CLIENT_ID=GITHUB_CLIENT_ID:latest,GITHUB_CLIENT_SECRET=GITHUB_CLIENT_SECRET:latest,SESSION_SECRET=SESSION_SECRET:latest"
```

Note: Secrets should be created in Secret Manager first:
```bash
echo -n "value" | gcloud secrets create SECRET_NAME --data-file=-
gcloud secrets add-iam-policy-binding SECRET_NAME --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

---

### Task 9.4: Cloudflare DNS

**Step 1: Get Cloud Run URL**

```bash
CLOUD_RUN_URL=$(gcloud run services describe gh-watch --region=europe-west1 --format='value(status.url)' | sed 's|https://||')
echo $CLOUD_RUN_URL
```

**Step 2: Create DNS record**

```bash
ZONE_ID="6c7593165ded0ef08d5cd4ca52279407"
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"type\":\"CNAME\",\"name\":\"watch\",\"content\":\"${CLOUD_RUN_URL}\",\"proxied\":true}"
```

**Step 3: Map custom domain in Cloud Run**

```bash
gcloud run domain-mappings create --service=gh-watch --domain=watch.unlikeotherai.com --region=europe-west1
```

Note: Cloud Run custom domain mapping with Cloudflare proxy requires specific SSL settings. Set Cloudflare SSL mode to "Full (strict)" and ensure Cloud Run has the managed certificate.

**Step 4: Update GitHub App callback URL**

Update the GitHub App settings to include `https://watch.unlikeotherai.com/api/auth/callback` as a callback URL.

---

### Task 9.5: Create deployment docs

**Files:**
- Create: `docs/deployment.md`
- Create: `docs/infrastructure.md`

**Step 1: Create docs/deployment.md**

```markdown
# Deployment

## Build & Deploy

```bash
gcloud builds submit --tag europe-west1-docker.pkg.dev/gh-watch-prod/gh-watch/api:latest
gcloud run deploy gh-watch \
  --image europe-west1-docker.pkg.dev/gh-watch-prod/gh-watch/api:latest \
  --region europe-west1 \
  --allow-unauthenticated
```

## Secrets

Managed via GCloud Secret Manager. Update with:
```bash
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-
```

## Environment

- `DATABASE_URL` — PostgreSQL connection string
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub App OAuth
- `SESSION_SECRET` — Cookie signing key
- `PUBLIC_URL` — `https://watch.unlikeotherai.com`
```

**Step 2: Create docs/infrastructure.md**

```markdown
# Infrastructure

## Services
- **Cloud Run:** `gh-watch` in `europe-west1`
- **Artifact Registry:** `europe-west1-docker.pkg.dev/gh-watch-prod/gh-watch`
- **Database:** Neon PostgreSQL (free tier for MVP)

## DNS
- **Domain:** `watch.unlikeotherai.com`
- **Provider:** Cloudflare (zone: `unlikeotherai.com`)
- **Record:** CNAME `watch` → Cloud Run service URL (proxied)
- **SSL:** Cloudflare Full (strict)

## GitHub App
- **Name:** GH-Watch
- **Callback:** `https://watch.unlikeotherai.com/api/auth/callback`
- **Permissions:** Actions (read), Metadata (read)
```

**Step 3: Commit**

```bash
git add docs/ && git commit -m "docs: add deployment and infrastructure documentation"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| 1 | 1.1–1.2 | Monorepo scaffold, git repo |
| 2 | 2.1–2.2 | API server + PostgreSQL |
| 3 | 3.1–3.2 | GitHub OAuth login |
| 4 | 4.1 | Repos + workflows API |
| 5 | 5.1 | SSR landing page |
| 6 | 6.1–6.4 | React dashboard + setup pages |
| 7 | 7.1 | Static serving integration |
| 8 | 8.1 | Drizzle relations |
| 9 | 9.1–9.5 | GCloud + Cloudflare deployment |
