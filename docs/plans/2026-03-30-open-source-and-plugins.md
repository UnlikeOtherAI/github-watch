# Open Source, Plugin System & Payments Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make GH-Watch open source with a hosted tier ($2/mo) and a plugin system, starting with a payments plugin.

**Architecture:** Two repos — public `github-watch` (MIT, main app) and private `github-watch-payments` (Stripe subscription plugin). The API gets a plugin loader that discovers npm-installed plugins at startup. Each plugin exports a Hono sub-app for routes and optional metadata. The landing page gets a pricing section (hosted vs self-hosted). The login page uses the v2 logo. The nav uses the v1 logo at 48px.

**Tech Stack:** Bun, Hono, React, Drizzle, Stripe (payments plugin), GitHub OAuth

---

## Phase 1: Create Repos & Push Code

### Task 1.1: Create public repo `UnlikeOtherAI/github-watch`

```bash
gh repo create UnlikeOtherAI/github-watch --public --description "Monitor your GitHub Actions workflows in real-time"
```

### Task 1.2: Create private repo `UnlikeOtherAI/github-watch-payments`

```bash
gh repo create UnlikeOtherAI/github-watch-payments --private --description "Payments plugin for GH-Watch"
```

### Task 1.3: Push existing code to public repo

```bash
git remote add public git@github.com:UnlikeOtherAI/github-watch.git
git push public main
```

---

## Phase 2: Update Landing Page

### Task 2.1: Replace nav logo with v1-512.png at 48x48

Replace the Font Awesome GitHub icon in the nav with an `<img>` tag loading the v1-512 icon, rendered at 48x48 via HTML attributes for sharpness.

### Task 2.2: Add hosted vs self-hosted pricing section

Side-by-side cards:
- **Hosted** — $2/month, instant setup, managed infrastructure, auto-updates
- **Self-hosted** — Free forever, full control, deploy anywhere, MIT licensed

### Task 2.3: Update "Sign in with GitHub" links

Landing page sign-in buttons should point to `/app` (the login page) instead of directly to `/api/auth/login`.

---

## Phase 3: Update Login Page

### Task 3.1: Use v2 logo on login page

Update Login.tsx to use the v2-512 icon (currently uses logo.png). Show v2 logo above the card. Single "Login with GitHub" button in the card.

---

## Phase 4: Plugin System

### Task 4.1: Define plugin interface

```typescript
// api/src/plugins/types.ts
export interface GHWatchPlugin {
  name: string;
  version: string;
  routes?: (app: Hono) => void;
  onUserLogin?: (userId: string) => Promise<void>;
  onUserLogout?: (userId: string) => Promise<void>;
}
```

### Task 4.2: Plugin loader

```typescript
// api/src/plugins/loader.ts
// Discovers plugins from GHWATCH_PLUGINS env var (comma-separated package names)
// Imports each, validates interface, registers routes
```

### Task 4.3: Register plugins in server.ts

Wire up the plugin loader in the main server startup.

---

## Phase 5: Payments Plugin Scaffold

### Task 5.1: Scaffold github-watch-payments repo

Structure:
```
github-watch-payments/
├── src/
│   ├── index.ts          # Plugin entry (exports GHWatchPlugin)
│   ├── routes.ts         # Stripe webhook + billing endpoints
│   └── stripe.ts         # Stripe client setup
├── package.json
├── tsconfig.json
├── CLAUDE.md
├── AGENTS.md
├── LICENSE (MIT)
└── README.md
```

---

## Phase 6: Documentation

### Task 6.1: MIT LICENSE in public repo

### Task 6.2: Developer README with v2 icon centered

Structure: what it is, how to install, how to use, what it's for.

### Task 6.3: CLAUDE.md and AGENTS.md for both repos

Copy and adapt from current project. The payments repo gets its own tailored versions.

---

## Phase 7: Build & Deploy

### Task 7.1: Build and deploy updated app to Cloud Run

### Task 7.2: Commit and push all changes
