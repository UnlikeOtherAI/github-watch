<p align="center"><img src="assets/icon-v2.png" width="128" height="128" alt="GH-Watch"></p>

<h1 align="center">GH-Watch</h1>

<p align="center">Monitor your GitHub Actions workflows in real-time</p>

---

## What it is

GH-Watch is an open-source GitHub Actions monitoring dashboard. See what's running, failing, and queued across all your repos in one place.

- Self-hosted with Docker or use the hosted version at [watch.unlikeotherai.com](https://watch.unlikeotherai.com)
- Dark theme matching GitHub's design language

## Features

- Real-time workflow run monitoring
- Select specific repos and workflows to watch
- GitHub OAuth -- no separate accounts needed
- Single Docker image deployment
- MIT licensed

## Quick Start

**Prerequisites:** Docker, a [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

```bash
# Clone
git clone https://github.com/UnlikeOtherAI/github-watch.git
cd github-watch

# Start PostgreSQL
docker compose up -d db

# Install dependencies
pnpm install

# Configure
cp .env.example .env
# Edit .env with your GitHub OAuth credentials

# Push database schema
pnpm db:push

# Start dev server
pnpm dev        # API on :3210
pnpm dev:app    # Dashboard on :3200
```

## Production

```bash
# Build Docker image
docker build -t gh-watch .

# Run
docker run -p 8080:8080 \
  -e DATABASE_URL=postgres://... \
  -e GITHUB_CLIENT_ID=... \
  -e GITHUB_CLIENT_SECRET=... \
  -e SESSION_SECRET=... \
  -e PUBLIC_URL=https://your-domain.com \
  gh-watch
```

## Architecture

Three services behind a single deployment:

- **API** (Bun + Hono) -- REST API serving workflow data
- **Dashboard** (React + Vite + Tailwind) -- client-side monitoring UI
- **Landing page** (Bun + Hono + Tailwind) -- SSR marketing/login page

Data layer: PostgreSQL with Drizzle ORM. Authentication via GitHub OAuth (self-hosted, no third-party auth providers).

## Tech Stack

Bun, Hono, React 19, Vite, Tailwind CSS 4, Drizzle ORM, PostgreSQL

## License

MIT -- see [LICENSE](LICENSE).
