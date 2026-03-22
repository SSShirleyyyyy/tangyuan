# Pourover Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle and restructure the coffee journal demo into a calmer editorial interface with Japanese tool-catalog energy.

**Architecture:** Keep the current static HTML, CSS, and JavaScript setup, but introduce a tiny presentation helper module so display copy and brewed pour formatting are tested before wiring them into the refreshed layouts.

**Tech Stack:** HTML, CSS, vanilla JavaScript modules, Node `node:test`

---

### Task 1: Presentation Helpers

**Files:**
- Create: `src/presentation.js`
- Create: `tests/presentation.test.js`

- [ ] Step 1: Write failing tests for display helpers
- [ ] Step 2: Run `npm test` and confirm the helpers are missing
- [ ] Step 3: Implement minimal helpers
- [ ] Step 4: Run `npm test` and confirm green

### Task 2: Editorial Layout Refresh

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `app.js`

- [ ] Step 1: Restructure the page markup around editorial sections
- [ ] Step 2: Replace the current visual system with paper, serif, and calm accent styling
- [ ] Step 3: Reconnect the updated UI to existing mock data

### Task 3: Verification

**Files:**
- Modify: `package.json`

- [ ] Step 1: Run `npm test`
- [ ] Step 2: Serve the static app locally
- [ ] Step 3: Open the refreshed demo for review
