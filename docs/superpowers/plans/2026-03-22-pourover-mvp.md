# Pourover MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the coffee journal demo into a locally usable MVP with saved brew logs, upload-driven suggestions, and basic history filtering.

**Architecture:** Keep the static app architecture, but split the new behavior into small pure modules for persistence and photo analysis so they can be tested independently from the DOM layer. `app.js` will orchestrate view state, rendering, and browser APIs like `localStorage` and file previews.

**Tech Stack:** HTML, CSS, vanilla JavaScript modules, Node `node:test`, browser `localStorage`

---

### Task 1: Brew Persistence Helpers

**Files:**
- Create: `src/brew-store.js`
- Create: `tests/brew-store.test.js`

- [ ] Step 1: Write failing tests for seed loading, brew creation, and filtering
- [ ] Step 2: Run `npm test` and confirm failures
- [ ] Step 3: Implement the minimal persistence helpers
- [ ] Step 4: Run `npm test` and confirm green

### Task 2: Local Photo Analysis Helpers

**Files:**
- Create: `src/photo-analysis.js`
- Create: `tests/photo-analysis.test.js`

- [ ] Step 1: Write failing tests for filename-based bean inference
- [ ] Step 2: Run `npm test` and confirm failures
- [ ] Step 3: Implement the minimal local analysis helpers
- [ ] Step 4: Run `npm test` and confirm green

### Task 3: MVP UI Wiring

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `app.js`
- Modify: `src/mock-data.js`

- [ ] Step 1: Add history filters and save action UI
- [ ] Step 2: Add photo upload and preview UI
- [ ] Step 3: Connect saved brews and generated suggestions to the live screens

### Task 4: Verification

**Files:**
- Modify: `package.json`

- [ ] Step 1: Run `npm test`
- [ ] Step 2: Open the local app
- [ ] Step 3: Smoke-check save, filter, and upload flows
