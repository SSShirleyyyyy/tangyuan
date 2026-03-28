import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("index imports simplified Chinese serif and sans font families", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.match(html, /Noto\+Sans\+SC/);
  assert.match(html, /Noto\+Serif\+SC/);
  assert.doesNotMatch(html, /Noto\+Sans\+JP/);
  assert.doesNotMatch(html, /Noto\+Serif\+JP/);
});

test("styles define a shared typography system with serif titles and sans body", async () => {
  const css = await readFile(
    new URL("../styles.css", import.meta.url),
    "utf8"
  );

  assert.match(css, /--font-sans:\s*"Noto Sans SC"/);
  assert.match(css, /--font-serif:\s*"Noto Serif SC"/);
  assert.match(css, /body\s*\{[\s\S]*font-family:\s*var\(--font-sans\);/);
});

test("major titles use the serif token while ui values stay sans", async () => {
  const css = await readFile(
    new URL("../styles.css", import.meta.url),
    "utf8"
  );

  assert.match(
    css,
    /\.inventory-bean-name\s*\{[\s\S]*font-family:\s*var\(--font-serif\);/
  );
  assert.match(
    css,
    /\.brew-main strong\s*\{[\s\S]*font-family:\s*var\(--font-serif\);/
  );
  assert.match(
    css,
    /\.detail-list strong\s*\{[\s\S]*font-family:\s*var\(--font-sans\);/
  );
  assert.match(
    css,
    /\.equipment-spec-copy strong\s*\{[\s\S]*font-family:\s*var\(--font-sans\);/
  );
});
