# Bean Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bean inventory, resting-window tracking, and automatic stock deduction from brew records.

**Architecture:** Introduce a dedicated bean inventory store alongside existing brew and equipment stores. Keep inventory as bean profiles with stock and roast-window metadata, then wire brew records to an optional bean profile plus dose grams so saving a brew can deduct stock and surface ready/resting/low-stock summaries on the home page.

**Tech Stack:** Static HTML, vanilla JS modules, localStorage, Node test runner

---

### Task 1: Add bean inventory domain tests

**Files:**
- Create: `tests/bean-inventory.test.js`
- Modify: `tests/brew-store.test.js`
- Test: `tests/bean-inventory.test.js`

- [ ] **Step 1: Write failing inventory store tests**
- [ ] **Step 2: Run `npm test` and confirm the new tests fail for missing behavior**
- [ ] **Step 3: Extend brew entry tests for `beanId` and `dose` persistence**
- [ ] **Step 4: Run `npm test` and confirm failures are specific to the new inventory behavior**

### Task 2: Implement bean inventory store and calculations

**Files:**
- Create: `src/bean-inventory.js`
- Modify: `src/mock-data.js`
- Test: `tests/bean-inventory.test.js`

- [ ] **Step 1: Add localStorage key and bean profile builder**
- [ ] **Step 2: Add readiness, resting-day, and low-stock calculation helpers**
- [ ] **Step 3: Add inventory state update, remove, and deduction helpers**
- [ ] **Step 4: Run `npm test` and confirm inventory tests pass**

### Task 3: Wire bean inventory into the brew record flow

**Files:**
- Modify: `src/brew-store.js`
- Modify: `app.js`
- Modify: `index.html`
- Test: `tests/brew-store.test.js`

- [ ] **Step 1: Persist `beanId` and `dose` in brew records**
- [ ] **Step 2: Add a bean selector and dose field to the brew form**
- [ ] **Step 3: Prefill brew bean fields from selected inventory bean**
- [ ] **Step 4: Deduct stock on save when a bean profile is linked**
- [ ] **Step 5: Run `npm test` and confirm brew storage tests stay green**

### Task 4: Add inventory management and home summaries

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `styles.css`
- Test: `tests/bean-inventory.test.js`

- [ ] **Step 1: Add a `豆子库存` page with bean profile list and editor**
- [ ] **Step 2: Add home-page inventory summary cards for ready, resting, and low-stock beans**
- [ ] **Step 3: Surface current resting day and recommended window in inventory UI**
- [ ] **Step 4: Run `npm test` and visually verify the new UI locally**

### Task 5: Final verification and publish

**Files:**
- Modify: `README.md` (only if usage instructions need updates)

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Manually verify local UI for inventory creation, deduction, and home summaries**
- [ ] **Step 3: Commit with a focused message**
- [ ] **Step 4: Push to GitHub**
- [ ] **Step 5: Confirm remote files and GitHub Pages reflect the new inventory feature**
