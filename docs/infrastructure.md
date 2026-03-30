# Infrastructure

## Services
- **Cloud Run:** `gh-watch` in `europe-west1` (GCP project: `gh-watch-prod`)
- **Artifact Registry:** `europe-west1-docker.pkg.dev/gh-watch-prod/gh-watch`
- **Database:** PostgreSQL (Neon free tier for MVP)

## DNS
- **Domain:** `watch.unlikeotherai.com`
- **Provider:** Cloudflare (zone: `unlikeotherai.com`)
- **Record:** CNAME `watch` → Cloud Run service URL (proxied)
- **SSL:** Cloudflare Full (strict)

## GitHub OAuth App
- **Callback URLs:**
  - Dev: `http://localhost:3210/api/auth/callback`
  - Prod: `https://watch.unlikeotherai.com/api/auth/callback`
- **Scopes:** `repo`

## Ports (dev)
- API: `:3210`
- Dashboard: `:3200`
- Landing page: `:3100`
- PostgreSQL: `:5432`
