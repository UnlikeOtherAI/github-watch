# Deployment

## GCloud Project
- **Project:** UnlikeOtherAI (`gen-lang-client-0561071620`)
- **Region:** europe-west1 (Belgium)
- **Artifact Registry:** `europe-west1-docker.pkg.dev/gen-lang-client-0561071620/uoa-docker`

## Build & Deploy

```bash
# Build and push container image
gcloud builds submit \
  --project gen-lang-client-0561071620 \
  --tag europe-west1-docker.pkg.dev/gen-lang-client-0561071620/uoa-docker/gh-watch-api:latest

# Deploy to Cloud Run (scale-to-zero)
gcloud run deploy gh-watch-api \
  --project gen-lang-client-0561071620 \
  --image europe-west1-docker.pkg.dev/gen-lang-client-0561071620/uoa-docker/gh-watch-api:latest \
  --region europe-west1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --set-env-vars "NODE_ENV=production,PUBLIC_URL=https://watch.unlikeotherai.com" \
  --set-secrets "DATABASE_URL=ghwatch-database-url:latest,SESSION_SECRET=ghwatch-session-secret:latest,GITHUB_CLIENT_ID=ghwatch-github-client-id:latest,GITHUB_CLIENT_SECRET=ghwatch-github-client-secret:latest" \
  --add-cloudsql-instances gen-lang-client-0561071620:europe-west1:uoa-auth-db \
  --set-env-vars "CLOUD_SQL_SOCKET=/cloudsql/gen-lang-client-0561071620:europe-west1:uoa-auth-db"
```

## Secrets (GCloud Secret Manager)

| Secret | Description |
|--------|-------------|
| `ghwatch-database-url` | `postgres://ghwatch:<pass>@localhost/ghwatch` (v3 — localhost, not socket URL) |
| `ghwatch-session-secret` | Cookie signing key |
| `ghwatch-db-password` | Raw DB password |
| `ghwatch-github-client-id` | GitHub OAuth App client ID |
| `ghwatch-github-client-secret` | GitHub OAuth App client secret |

```bash
# Create secret
echo -n "value" | gcloud secrets create SECRET_NAME \
  --project gen-lang-client-0561071620 --data-file=-

# Update secret
echo -n "new-value" | gcloud secrets versions add SECRET_NAME \
  --project gen-lang-client-0561071620 --data-file=-
```

## Database

- **Instance:** Cloud SQL PostgreSQL 16 — `uoa-auth-db` (shared instance)
- **Database:** `ghwatch`
- **User:** `ghwatch`
- **Connection:** Unix socket via Cloud SQL connector (not public IP)
- **Schema push:** Use cloud-sql-proxy locally, then `pnpm db:push`

```bash
# Start proxy on alternate port (5432 may be in use by local docker)
cloud-sql-proxy gen-lang-client-0561071620:europe-west1:uoa-auth-db --port 5433 &

# Push schema
DATABASE_URL="postgres://ghwatch:<pass>@localhost:5433/ghwatch" pnpm db:push
```

## Domain

- **Domain:** watch.unlikeotherai.com
- **Cloud Run domain mapping:** `gcloud beta run domain-mappings create --service gh-watch-api --domain watch.unlikeotherai.com --region europe-west1`
- **Cloudflare:** CNAME `watch` → `ghs.googlehosted.com` (DNS-only, not proxied)
- **SSL:** Managed by Google (auto-provisioned via domain mapping)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (from secret) |
| `CLOUD_SQL_SOCKET` | `/cloudsql/gen-lang-client-0561071620:europe-west1:uoa-auth-db` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID (from secret) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret (from secret) |
| `SESSION_SECRET` | Cookie signing key (from secret) |
| `PUBLIC_URL` | `https://watch.unlikeotherai.com` |
| `NODE_ENV` | `production` |
| `PORT` | Set automatically by Cloud Run (8080) |
