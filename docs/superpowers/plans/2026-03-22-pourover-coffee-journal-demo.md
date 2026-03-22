# Pourover Coffee Journal Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished static responsive web demo for a hand-pour coffee journal with a photo-assisted recipe suggestion flow.

**Architecture:** Use a dependency-light front-end built from static HTML, CSS, and modular JavaScript. Keep all data local with mock datasets, and isolate recommendation logic in a pure module covered by Node's built-in test runner.

**Tech Stack:** HTML, CSS, vanilla JavaScript modules, Node `node:test`

---

### File Structure

**Create:**
- `index.html`
- `styles.css`
- `app.js`
- `src/recommendation.js`
- `src/mock-data.js`
- `tests/recommendation.test.js`
- `package.json`

### Task 1: Recommendation Logic

**Files:**
- Create: `tests/recommendation.test.js`
- Create: `src/recommendation.js`

- [ ] Step 1: Write failing tests for recipe tuning behavior
- [ ] Step 2: Run `npm test` to verify failures are for missing logic
- [ ] Step 3: Implement minimal recommendation rules
- [ ] Step 4: Run `npm test` to verify passes

### Task 2: Mock Domain Data

**Files:**
- Create: `src/mock-data.js`
- Modify: `src/recommendation.js`

- [ ] Step 1: Add local bean, brew, and equipment records
- [ ] Step 2: Wire recommendation logic to realistic demo inputs

### Task 3: Responsive Demo UI

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`

- [ ] Step 1: Build page shell and screen regions
- [ ] Step 2: Style a distinctive coffee-focused interface for mobile and desktop
- [ ] Step 3: Implement view switching and prefill interactions

### Task 4: Verification

**Files:**
- Modify: `package.json`

- [ ] Step 1: Run `npm test`
- [ ] Step 2: Run a local smoke check with a static server
- [ ] Step 3: Review interactions and summarize results
