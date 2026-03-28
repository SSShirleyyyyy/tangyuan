import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("index ships an app shell with bottom tabs and manifest metadata", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.match(html, /rel="manifest"/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(html, /class="app-shell"/);
  assert.match(html, /class="tab-bar"/);
  assert.match(html, /data-nav-tab="true"/);
  assert.doesNotMatch(html, /<aside class="sidebar">/);
});

test("manifest is installable and app-like", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8")
  );

  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.background_color, "#f4efe6");
  assert.equal(manifest.theme_color, "#f4efe6");
  assert.ok(Array.isArray(manifest.icons));
  assert.ok(manifest.icons.length >= 1);
});

test("app registers a versioned service worker for installable behavior", async () => {
  const source = await readFile(
    new URL("../app.js", import.meta.url),
    "utf8"
  );

  assert.match(source, /serviceWorker/);
  assert.match(source, /service-worker\.js\?v=20260327-1/);
});
