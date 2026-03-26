import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, writeFile } from "node:fs/promises";
import { once } from "node:events";

import {
  createLocalDevServer,
  resolveRequestPath,
} from "../scripts/local-server.mjs";

test("resolveRequestPath maps root requests to index.html and blocks traversal", () => {
  const rootDir = "/tmp/pourover";

  assert.equal(
    resolveRequestPath(rootDir, "/")?.endsWith(path.join("tmp", "pourover", "index.html")),
    true
  );
  assert.equal(
    resolveRequestPath(rootDir, "/index.html?fresh=1")?.endsWith(
      path.join("tmp", "pourover", "index.html")
    ),
    true
  );
  assert.equal(resolveRequestPath(rootDir, "/../secret.txt"), null);
});

test("local dev server serves latest files with no-cache headers", async (t) => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "pourover-local-server-"));
  await writeFile(path.join(rootDir, "index.html"), "<!doctype html><title>Fresh</title>");

  const server = createLocalDevServer({ rootDir });
  t.after(async () => {
    server.close();
    await once(server, "close");
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  const response = await fetch(
    `http://127.0.0.1:${address.port}/index.html?fresh=20260326`
  );
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("cache-control"),
    "no-store, no-cache, must-revalidate, max-age=0"
  );
  assert.equal(response.headers.get("pragma"), "no-cache");
  assert.equal(response.headers.get("expires"), "0");
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(body, /Fresh/);
});
