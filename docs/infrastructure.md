# Infrastructure

## GCloud
- **Project:** UnlikeOtherAI (`gen-lang-client-0561071620`)
- **Region:** europe-west1 (Belgium)
- **Cloud Run:** `gh-watch-api` — scale-to-zero (min 0, max 2 instances)
- **Artifact Registry:** `europe-west1-docker.pkg.dev/gen-lang-client-0561071620/uoa-docker`
- **Cloud SQL:** PostgreSQL 16 — shared instance `uoa-auth-db`, database `ghwatch`
- **Secret Manager:** ghwatch-database-url, ghwatch-session-secret, ghwatch-db-password, ghwatch-github-client-id, ghwatch-github-client-secret

## DNS
- **Domain:** `watch.unlikeotherai.com`
- **Provider:** Cloudflare (zone: `6c7593165ded0ef08d5cd4ca52279407`)
- **Record:** CNAME `watch` → `ghs.googlehosted.com` (DNS-only, not proxied)
- **SSL:** Managed by Google via Cloud Run domain mapping

## GitHub OAuth App
- **Create at:** https://github.com/settings/developers
- **Callback URLs:**
  - Dev: `http://localhost:3210/api/auth/callback`
  - Prod: `https://watch.unlikeotherai.com/api/auth/callback`
- **Scopes:** `repo`

## Ports (dev)
- API: `:3210`
- Dashboard: `:3200`
- Landing page: `:3100`
- PostgreSQL: `:5432`
