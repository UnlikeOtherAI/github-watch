# GH-Watch Standards

## Architecture
- Three services: API (:3210), React dashboard (:3200), SSR landing page (:3100)
- PostgreSQL + Drizzle ORM
- GitHub OAuth (self-hosted, no third-party auth)

## Structure
```
api/          — Bun + Hono API server (:3210)
app/          — React CSR dashboard (:3200, Vite + Tailwind)
web/          — SSR landing page (:3100, Bun + Hono + Tailwind)
docs/         — Plans, infrastructure, deployment docs
```

## Critical Rules

### Root-Cause First
- Never band-aid a symptom. Find the actual cause before writing a fix.
- If a fix doesn't address the root cause, it's wrong — even if it makes the symptom go away.

### Simplification First
- Before adding code to handle a new case, check if the existing logic can be simplified to cover it naturally.
- The best fix often removes code rather than adding it.

### Determinism First
- No `setTimeout`/`setInterval` as synchronisation mechanisms.
- No `sleep` to wait for state changes — poll or use event-driven patterns.
- Ordering-sensitive logic must be explicitly ordered, never rely on timing.

### Documentation Alignment
- If code behaviour changes, update every doc/comment that references the old behaviour in the same commit.
- Stale docs are worse than no docs.

## Code Quality
- Package manager: pnpm
- Runtime: Bun
- 500-line file limit — when exceeded, split along cohesive responsibility seams, not arbitrarily
- Single-responsibility functions — if a method mixes concerns, split it before adding more logic
- No premature abstractions — use proven patterns, not speculative ones
- Small, frequent commits after each meaningful change
- Build + typecheck before closing any task
- Non-interactive command execution — all CLI commands must work without user interaction

## What Belongs in Repo
- Never commit: build output, node_modules, backups, temp files, .env files
- Source, config, docs, tests, and migrations only

## Design
- Match GitHub's design language — see [docs/github-design-reference.md](docs/github-design-reference.md)
- Icons: Font Awesome 6 (CDN or package)
- Dark theme matching GitHub's dark default

## Design Document Standards
When writing design docs for non-trivial features, include:
1. Problem statement (what's broken or missing)
2. Current behaviour vs desired behaviour
3. Technical design with file paths and code
4. Implementation order (dependency-aware)
5. Edge cases and error handling
6. Non-goals (what this deliberately doesn't solve)

## Dev
- `pnpm dev` — API server on :3210
- `pnpm dev:app` — React dashboard on :3200
- `pnpm dev:web` — Landing page on :3100
- `docker compose up -d db` — PostgreSQL on :5432

## Deployment
- Google Cloud Run (europe-west1, scale-to-zero) — see [docs/deployment.md](docs/deployment.md)
- Domain: watch.unlikeotherai.com — see [docs/infrastructure.md](docs/infrastructure.md)
