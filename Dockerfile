FROM oven/bun:1 AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY api/package.json api/
COPY app/package.json app/
COPY web/package.json web/
RUN bun install

# Build React app
FROM deps AS build-app
WORKDIR /app
COPY app/ app/
ARG VITE_API_URL=https://api.ghwatch.live
ENV VITE_API_URL=$VITE_API_URL
RUN cd app && bun run build

# Production
FROM base AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY --from=deps /app/api/node_modules api/node_modules
COPY --from=deps /app/web/node_modules web/node_modules
COPY api/ api/
COPY web/ web/
COPY --from=build-app /app/app/dist app/dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "run", "api/src/server.ts"]
