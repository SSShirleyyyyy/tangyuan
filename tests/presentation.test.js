import test from "node:test";
import assert from "node:assert/strict";

import {
  describePreference,
  formatPourPlan,
  summarizeBean,
} from "../src/presentation.js";

test("describePreference maps internal taste keys to editorial Chinese labels", () => {
  assert.equal(describePreference("clean_bright"), "明亮、干净");
  assert.equal(describePreference("sweet_round"), "甜感、圆润");
  assert.equal(describePreference("unknown"), "平衡、中性");
});

test("summarizeBean produces a compact editorial bean line", () => {
  assert.equal(
    summarizeBean({
      origin: "Huila, Colombia",
      process: "Washed",
      roastLevel: "Light",
    }),
    "Huila, Colombia / Washed / Light Roast"
  );
});

test("formatPourPlan turns pours into readable record-sheet text", () => {
  const output = formatPourPlan([
    { label: "Bloom", amount: "45g", time: "0:00-0:35" },
    { label: "Second Pour", amount: "120g", time: "0:35-1:05" },
  ]);

  assert.equal(
    output,
    "Bloom 45g 0:00-0:35\nSecond Pour 120g 0:35-1:05"
  );
});
