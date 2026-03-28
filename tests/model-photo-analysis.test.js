import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBeanVisionPrompt,
  extractJsonObject,
  sanitizeModelBeanDetails,
} from "../src/model-photo-analysis.js";

test("buildBeanVisionPrompt asks the model to avoid guessing and return compact JSON", () => {
  const prompt = buildBeanVisionPrompt("brew");

  assert.match(prompt, /不要猜测|不要臆测/);
  assert.match(prompt, /JSON/);
  assert.match(prompt, /name/);
  assert.match(prompt, /roaster/);
});

test("extractJsonObject recovers the first JSON object from model text", () => {
  const payload = extractJsonObject(`
    好的，以下是识别结果：
    {"name":"SL28","roaster":"Northbound Coffee"}
  `);

  assert.deepEqual(payload, {
    name: "SL28",
    roaster: "Northbound Coffee",
  });
});

test("sanitizeModelBeanDetails trims values and normalizes process roast level and date", () => {
  const bean = sanitizeModelBeanDetails({
    name: "  SL28  ",
    roaster: " 北向咖啡 ",
    farm: " Las Flores ",
    origin: " Huila, Colombia ",
    variety: " SL28 ",
    process: "水洗处理",
    roastLevel: "浅焙",
    flavorFocus: "茉莉花、柑橘、蜂蜜",
    roastDate: "2026/03/18",
  });

  assert.deepEqual(bean, {
    name: "SL28",
    roaster: "北向咖啡",
    farm: "Las Flores",
    origin: "Huila, Colombia",
    variety: "SL28",
    process: "Washed",
    roastLevel: "Light",
    flavorFocus: "茉莉花、柑橘、蜂蜜",
    roastDate: "2026-03-18",
  });
});
