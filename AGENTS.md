# GH-Watch Standards

## Architecture
- Three services: API (:3210), React dashboard (:3200), SSR landing page (:3100)
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
