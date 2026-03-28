import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("render deployment config provisions a node web service with health checks", async () => {
  const source = await readFile(new URL("../render.yaml", import.meta.url), "utf8");

  assert.match(source, /type:\s+web/);
  assert.match(source, /runtime:\s+node/);
  assert.match(source, /buildCommand:\s+npm install && npm run build:bundle/);
  assert.match(source, /startCommand:\s+HOST=0\.0\.0\.0 npm run serve:local/);
  assert.match(source, /healthCheckPath:\s+\/health/);
  assert.match(source, /key:\s+OPENAI_API_KEY/);
});
