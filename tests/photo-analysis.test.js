import test from "node:test";
import assert from "node:assert/strict";

import {
  classifyPhotoAnalysisFailure,
  extractBeanDetailsFromText,
  mergeDetectedBean,
  normalizeOcrText,
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
  assert.equal(bean.farm, "");
  assert.match(bean.flavorFocus, /floral|citrus|sweet/i);
});

test("inferBeanFromPhoto does not treat generic mobile camera filenames as bean names", () => {
  const bean = inferBeanFromPhoto({ name: "image.jpg" });

  assert.equal(bean.name, "");
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

test("normalizeOcrText collapses noisy OCR lines and keeps distinct content", () => {
  const normalized = normalizeOcrText(`
    Roast Date : 2026/03/18

    Roast Date : 2026/03/18
    Tasting Notes： jasmine 、 citrus 、 honey
  `);

  assert.equal(
    normalized,
    "Roast Date : 2026/03/18\nTasting Notes : jasmine 、 citrus 、 honey"
  );
});

test("extractBeanDetailsFromText understands Chinese field labels and normalizes the roast date", () => {
  const bean = extractBeanDetailsFromText(`
    北向咖啡
    SL28
    庄园：Las Flores
    产区：Huila, Colombia
    品种：SL28
    处理方式：水洗
    烘焙日期：2026/03/18
    风味：茉莉花、柑橘、蜂蜜
    烘焙度：浅焙
  `);

  assert.equal(bean.roaster, "北向咖啡");
  assert.equal(bean.name, "SL28");
  assert.equal(bean.farm, "Las Flores");
  assert.equal(bean.origin, "Huila, Colombia");
  assert.equal(bean.variety, "SL28");
  assert.equal(bean.process, "Washed");
  assert.equal(bean.roastLevel, "Light");
  assert.equal(bean.roastDate, "2026-03-18");
  assert.match(bean.flavorFocus, /茉莉花/);
  assert.match(bean.flavorFocus, /蜂蜜/);
});

test("extractBeanDetailsFromText drops punctuation-heavy garbled OCR values instead of filling nonsense", () => {
  const bean = extractBeanDetailsFromText(`
    P Ka A : [>2 I - Pan.: \\ F12 \\
    He —— Pa Pe) Pen A Of <Q I <M)
    2 Panama Specialty Cojico 44 3
    Process: Washed
  `);

  assert.equal(bean.name, "");
  assert.equal(bean.roaster, "");
  assert.equal(bean.process, "Washed");
  assert.equal(bean.origin, "Panama");
});

test("classifyPhotoAnalysisFailure identifies missing model configuration", () => {
  assert.equal(
    classifyPhotoAnalysisFailure("OPENAI_API_KEY 未配置，当前无法使用大模型图片识别。"),
    "model_unavailable"
  );

  assert.equal(
    classifyPhotoAnalysisFailure("模型和 OCR 当前都不可用"),
    "unknown"
  );
});

test("mergeDetectedBean prefers recognized fields without letting blanks overwrite fallback values", () => {
  const merged = mergeDetectedBean(
    {
      name: "Las Flores Gesha",
      roaster: "Photo Inferred",
      farm: "",
      origin: "Huila, Colombia",
      variety: "Gesha",
      process: "Washed",
      roastLevel: "Light",
      flavorFocus: "Floral lift, citrus, clean sweetness",
      roastDate: "2026-03-26",
    },
    {
      name: "Las Flores Gesha",
      roaster: "Northbound Coffee",
      farm: "",
      origin: "",
      variety: "",
      process: "Washed",
      roastLevel: "",
      flavorFocus: "jasmine, citrus, honey",
      roastDate: "2026-03-18",
    }
  );

  assert.equal(merged.roaster, "Northbound Coffee");
  assert.equal(merged.origin, "Huila, Colombia");
  assert.equal(merged.roastLevel, "Light");
  assert.equal(merged.roastDate, "2026-03-18");
  assert.equal(merged.flavorFocus, "jasmine, citrus, honey");
});
