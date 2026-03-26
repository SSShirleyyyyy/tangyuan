import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("home page includes a local backup card with export and import controls", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.match(html, /本地备份/);
  assert.match(html, /id="export-backup"/);
  assert.match(html, /id="import-backup"/);
  assert.match(html, /id="backup-feedback"/);
});
