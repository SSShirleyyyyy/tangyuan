import test from "node:test";
import assert from "node:assert/strict";

import {
  formatAdviceContextMeta,
  formatBeanInventoryStatusLine,
  describePreference,
  formatBrewParameterSummary,
  getUnlinkedInventoryStateCopy,
  formatInventoryDeductionPreview,
  formatEquipmentProfileMeta,
  getEquipmentProfileSpecs,
  formatFilterDisplay,
  formatRecentBrewCardPreview,
  formatRecentBrewSupplierLine,
  formatSummaryGrindDetail,
  formatSuggestionSummary,
  formatBrewCueMeta,
  formatHeroDate,
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

test("formatBrewCueMeta prefers current form values over recommendation defaults", () => {
  assert.equal(
    formatBrewCueMeta({
      dripper: "HARIO V60 02",
      ratio: "1:15",
      temp: "95",
      fallbackRatio: "1:16",
      fallbackTemp: "93C",
    }),
    "HARIO V60 02 · 1:15 · 95"
  );

  assert.equal(
    formatBrewCueMeta({
      dripper: "HARIO V60 02",
      ratio: "",
      temp: "",
      fallbackRatio: "1:16",
      fallbackTemp: "93C",
    }),
    "HARIO V60 02 · 1:16 · 93C"
  );
});

test("formatBrewParameterSummary condenses ratio and temp for the summary card", () => {
  assert.equal(
    formatBrewParameterSummary({
      ratio: "1:15",
      temp: "95",
    }),
    "1:15 · 95"
  );

  assert.equal(
    formatBrewParameterSummary({
      ratio: "",
      temp: "",
    }),
    "待填参数"
  );
});

test("formatSummaryGrindDetail removes duplicated grinder names and keeps the note compact", () => {
  assert.equal(
    formatSummaryGrindDetail({
      grind: "Comandante C40: 22-24 clicks",
      grinder: "Comandante C40",
    }),
    "22-24 clicks 研磨"
  );

  assert.equal(
    formatSummaryGrindDetail({
      grind: "中细",
      grinder: "Comandante C40",
    }),
    "中细研磨"
  );

  assert.equal(
    formatSummaryGrindDetail({
      grind: "",
      grinder: "Comandante C40",
    }),
    "研磨待定"
  );
});

test("formatAdviceContextMeta keeps the advice header focused on the gear context", () => {
  assert.equal(
    formatAdviceContextMeta({
      dripper: "HARIO V60 02",
      grinder: "Comandante C40",
    }),
    "适配 HARIO V60 02 · Comandante C40"
  );
});

test("formatFilterDisplay maps raw flow labels into readable copy", () => {
  assert.equal(formatFilterDisplay("fast"), "快流速滤纸");
  assert.equal(formatFilterDisplay("medium"), "标准流速滤纸");
  assert.equal(formatFilterDisplay("CAFEC Abaca 02"), "CAFEC Abaca 02");
});

test("formatEquipmentProfileMeta includes dripper, grinder, and filters", () => {
  assert.equal(
    formatEquipmentProfileMeta({
      dripper: "HARIO V60 02",
      grinder: "Comandante C40",
      filters: "CAFEC Abaca 02",
    }),
    "HARIO V60 02 · Comandante C40 · CAFEC Abaca 02"
  );

  assert.equal(
    formatEquipmentProfileMeta({
      dripper: "HARIO V60 02",
      grinder: "Comandante C40",
      filters: "fast",
    }),
    "HARIO V60 02 · Comandante C40 · 快流速滤纸"
  );
});

test("getEquipmentProfileSpecs returns labeled rows for dripper, grinder, and filters", () => {
  assert.deepEqual(
    getEquipmentProfileSpecs({
      dripper: "HARIO V60 02",
      grinder: "Comandante C40",
      filters: "fast",
    }),
    [
      { key: "dripper", label: "滤杯", value: "HARIO V60 02" },
      { key: "grinder", label: "研磨器", value: "Comandante C40" },
      { key: "filters", label: "滤纸", value: "快流速滤纸" },
    ]
  );
});

test("formatHeroDate formats ISO date for masthead badge", () => {
  assert.equal(formatHeroDate("2026-03-26T10:20:30.000Z"), "03.26");
});

test("formatBeanInventoryStatusLine summarizes readiness, age, and stock in one compact line", () => {
  assert.equal(
    formatBeanInventoryStatusLine({
      restDay: 12,
      readiness: "ready",
      currentWeight: 132,
      isLowStock: false,
    }),
    "第 12 天 · 现在适合冲 · 132g 剩余"
  );

  assert.equal(
    formatBeanInventoryStatusLine({
      restDay: 24,
      readiness: "past_peak",
      currentWeight: 18,
      isLowStock: true,
    }),
    "第 24 天 · 窗口后段 · 18g 剩余 · 接近补货线"
  );
});

test("formatInventoryDeductionPreview tells the user how stock will change after saving a brew", () => {
  assert.equal(
    formatInventoryDeductionPreview({
      beanName: "Las Flores Gesha",
      currentWeight: 132,
      dose: 15,
    }),
    "已关联 Las Flores Gesha，保存后会扣减 15g，预计剩余 117g。"
  );

  assert.equal(
    formatInventoryDeductionPreview({
      beanName: "",
      currentWeight: 0,
      dose: 15,
    }),
    "未关联库存，不会扣减。"
  );
});

test("formatSuggestionSummary keeps the inline brew recommendation concise", () => {
  assert.equal(
    formatSuggestionSummary({
      ratio: "1:16",
      waterTemp: "93C",
      grindGuidance: "Comandante C40: 22-24 clicks",
    }),
    "1:16 · 93C · 22-24 clicks 研磨"
  );

  assert.equal(
    formatSuggestionSummary({
      ratio: "",
      waterTemp: "",
      grindGuidance: "",
    }),
    "待生成建议参数"
  );
});

test("getUnlinkedInventoryStateCopy keeps the unlinked bean status calm and readable", () => {
  assert.deepEqual(getUnlinkedInventoryStateCopy(), {
    title: "暂不关联库存豆子",
    meta: "这杯不会扣减库存。",
    copy: "可直接保存记录。",
    optionLabel: "不关联库存豆子",
  });
});

test("formatRecentBrewSupplierLine prefers supplier name for the recent brew card", () => {
  assert.equal(
    formatRecentBrewSupplierLine({
      roaster: "Northbound Coffee",
    }),
    "Northbound Coffee"
  );

  assert.equal(
    formatRecentBrewSupplierLine({
      roaster: "",
    }),
    "未填供应商"
  );
});

test("formatRecentBrewCardPreview keeps recent brew cards to name and supplier only", () => {
  assert.deepEqual(
    formatRecentBrewCardPreview({
      bean: "SL28",
      roaster: "奶嘴",
    }),
    {
      title: "SL28",
      supplier: "奶嘴",
    }
  );
});
