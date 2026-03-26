import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("brew page no longer renders the right-side summary modules", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(html, /<aside class="brew-summary">/);
  assert.doesNotMatch(html, />冲煮建议</);
  assert.doesNotMatch(html, />风味鉴赏</);
});

test("brew page keeps only inline bean status helper and removes the current suggestion card", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.match(html, /id="brew-bean-status-card"/);
  assert.match(html, /id="brew-bean-status-copy"/);
  assert.doesNotMatch(html, /id="brew-suggestion-card"/);
  assert.doesNotMatch(html, /id="brew-suggestion-summary"/);
  assert.doesNotMatch(html, /id="apply-inline-suggestion"/);
});

test("brew page places dose and grind fields inside the recipe section", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.match(
    html,
    /<section class="sheet-block">[\s\S]*?<h3>冲煮参数<\/h3>[\s\S]*?id="brew-dose"[\s\S]*?id="brew-grind"/
  );
});
