import test from "node:test";
import assert from "node:assert/strict";

import {
  extractBeanDetailsFromText,
  inferBeanFromPhoto,
  inferPhotoLabel,
} from "../src/photo-analysis.js";

test("inferPhotoLabel prettifies uploaded file names", () => {
  assert.equal(
    inferPhotoLabel({ name: "ethiopia-gesha-bag.jpg" }),
    "ethiopia gesha bag"
  );
});

test("inferBeanFromPhoto detects washed gesha style names", () => {
  const bean = inferBeanFromPhoto({ name: "colombia-gesha-washed.jpg" });

  assert.equal(bean.process, "Washed");
  assert.equal(bean.roastLevel, "Light");
  assert.equal(bean.origin, "Huila, Colombia");
  assert.equal(bean.variety, "Gesha");
  assert.match(bean.name, /Gesha/i);
});

test("inferBeanFromPhoto falls back to a generic profile", () => {
  const bean = inferBeanFromPhoto({ name: "my-coffee.png" });

  assert.equal(bean.process, "Washed");
  assert.equal(bean.roastLevel, "Light");
  assert.equal(bean.farm, "Unknown Farm");
  assert.match(bean.flavorFocus, /floral|citrus|sweet/i);
});

test("extractBeanDetailsFromText pulls structured bean fields and flavor notes from OCR text", () => {
  const bean = extractBeanDetailsFromText(`
    Northbound Coffee
    Las Flores Gesha
    Huila, Colombia
    Producer: Las Flores
    Variety: Gesha
    Process: Washed
    Roast Date: 2026-03-18
    Notes: jasmine, citrus, honey
  `);

  assert.equal(bean.roaster, "Northbound Coffee");
  assert.equal(bean.farm, "Las Flores");
  assert.equal(bean.origin, "Huila, Colombia");
  assert.equal(bean.variety, "Gesha");
  assert.equal(bean.process, "Washed");
  assert.equal(bean.roastDate, "2026-03-18");
  assert.match(bean.flavorFocus, /jasmine/i);
  assert.match(bean.flavorFocus, /honey/i);
});
