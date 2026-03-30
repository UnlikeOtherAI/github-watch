# Deployment

## Build & Deploy

```bash
# Build and push container image
gcloud builds submit --tag europe-west1-docker.pkg.dev/gh-watch-prod/gh-watch/api:latest

# Deploy to Cloud Run
gcloud run deploy gh-watch \
  --image europe-west1-docker.pkg.dev/gh-watch-prod/gh-watch/api:latest \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PUBLIC_URL=https://watch.unlikeotherai.com"
```

## Secrets

Managed via GCloud Secret Manager:
```bash
echo -n "value" | gcloud secrets create SECRET_NAME --data-file=-
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-
```

## Environment

- `DATABASE_URL` — PostgreSQL connection string
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub OAuth App
- `SESSION_SECRET` — Cookie signing key
- `PUBLIC_URL` — `https://watch.unlikeotherai.com`
