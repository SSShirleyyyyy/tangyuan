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

test("local dev server serves web manifests with the correct content type", async (t) => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "pourover-local-server-"));
  await writeFile(
    path.join(rootDir, "manifest.webmanifest"),
    JSON.stringify({ name: "Fresh" })
  );

  const server = createLocalDevServer({ rootDir });
  t.after(async () => {
    server.close();
    await once(server, "close");
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  const response = await fetch(
    `http://127.0.0.1:${address.port}/manifest.webmanifest`
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") || "",
    /application\/manifest\+json/
  );
});

test("local dev server exposes a health endpoint for hosted deployments", async (t) => {
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
  const response = await fetch(`http://127.0.0.1:${address.port}/health`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.service, "pourover-journal");
  assert.equal(payload.photoAnalysis, false);
});

test("local dev server exposes a photo analysis API when an analyzer is provided", async (t) => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "pourover-local-server-"));
  await writeFile(path.join(rootDir, "index.html"), "<!doctype html><title>Fresh</title>");

  const server = createLocalDevServer({
    rootDir,
    analyzePhoto: async ({ imageDataUrl, mode }) => ({
      model: "gpt-5",
      mode,
      bean: {
        name: "SL28",
        roaster: "Northbound Coffee",
        farm: "Las Flores",
        origin: "Huila, Colombia",
        variety: "SL28",
        process: "Washed",
        roastLevel: "Light",
        flavorFocus: "茉莉花、柑橘、蜂蜜",
        roastDate: "2026-03-18",
      },
      raw: `received:${imageDataUrl.slice(0, 18)}`,
    }),
  });

  t.after(async () => {
    server.close();
    await once(server, "close");
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  const response = await fetch(
    `http://127.0.0.1:${address.port}/api/photo-analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageDataUrl: "data:image/jpeg;base64,abc123",
        mode: "brew",
      }),
    }
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.bean.name, "SL28");
  assert.equal(payload.bean.roaster, "Northbound Coffee");
  assert.equal(payload.mode, "brew");
});

test("photo analysis API returns 503 when model analysis is unavailable", async (t) => {
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
    `http://127.0.0.1:${address.port}/api/photo-analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageDataUrl: "data:image/jpeg;base64,abc123",
        mode: "inventory",
      }),
    }
  );
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.match(payload.error, /OPENAI_API_KEY|不可用/);
});
