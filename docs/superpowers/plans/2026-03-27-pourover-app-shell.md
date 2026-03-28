# Pourover App Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the coffee journal into a mobile-first, installable PWA with an app-style shell and bottom navigation while preserving current local-first workflows.

**Architecture:** Keep the existing single-page state model and `data-view` routing, but replace the page chrome, restructure the major views, and add PWA assets. Business logic stays in place; shell, layout, and installability get rebuilt around it.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, local dev server, Node test runner, PWA manifest, service worker

---

### Task 1: Lock the new app shell contract with tests

**Files:**
- Modify: `tests/home-layout.test.js`
- Modify: `tests/brew-page-layout.test.js`
- Create: `tests/pwa-shell.test.js`

- [ ] **Step 1: Write failing tests for app shell structure**
- [ ] **Step 2: Run targeted tests and confirm they fail**
- [ ] **Step 3: Add assertions for bottom tab bar, manifest link, and app shell wrappers**
- [ ] **Step 4: Re-run targeted tests and confirm failures are the expected ones**

### Task 2: Rebuild HTML shell around app navigation

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace sidebar-first shell with app frame, top app bar, and bottom tab bar**
- [ ] **Step 2: Reorganize home, brew, inventory, and equipment sections into app-style pages**
- [ ] **Step 3: Keep existing ids/hooks stable where possible to avoid breaking business logic**
- [ ] **Step 4: Run targeted layout tests**

### Task 3: Rework CSS into a mobile-first app layout

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add app frame, app bar, page, tab bar, and safe-area primitives**
- [ ] **Step 2: Convert old web dashboard layout into app-style stacked sections**
- [ ] **Step 3: Make inventory/equipment pages single-column on mobile and split on wider screens**
- [ ] **Step 4: Remove obsolete sidebar/hero assumptions and verify with tests/build**

### Task 4: Update navigation logic for app tabs

**Files:**
- Modify: `app.js`
- Modify: `index.html`

- [ ] **Step 1: Separate tab activation from generic view-target buttons**
- [ ] **Step 2: Keep content buttons able to switch views without receiving nav active styles**
- [ ] **Step 3: Update inline boot fallback script to match the new shell**
- [ ] **Step 4: Run relevant tests and local smoke checks**

### Task 5: Add installable PWA support

**Files:**
- Create: `manifest.webmanifest`
- Create: `service-worker.js`
- Create: `assets/app-icon.svg`
- Modify: `index.html`
- Modify: `scripts/local-server.mjs`
- Modify: `tests/local-server.test.js`
- Create: `tests/pwa-shell.test.js`

- [ ] **Step 1: Add failing tests for manifest and manifest serving**
- [ ] **Step 2: Add manifest metadata and icon assets**
- [ ] **Step 3: Add service worker registration and offline shell caching**
- [ ] **Step 4: Update local server content types and verify manifest fetch**

### Task 6: Verify and refresh local app

**Files:**
- Modify: `app.bundle.js`

- [ ] **Step 1: Run `npm test` and confirm all tests pass**
- [ ] **Step 2: Run `npm run build:bundle`**
- [ ] **Step 3: Check syntax with `node --check` on touched JS files**
- [ ] **Step 4: Smoke test `index.html`, `manifest.webmanifest`, and open the local app**
