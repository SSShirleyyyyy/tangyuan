import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSuggestion,
  formatGrindGuidance,
} from "../src/recommendation.js";

test("buildSuggestion tunes recipe for bright washed beans on V60", () => {
  const suggestion = buildSuggestion({
    bean: {
      process: "Washed",
      roastLevel: "Light",
      flavorFocus: "Citrus floral clarity",
    },
    equipment: {
      dripper: "V60",
      grinder: "Comandante C40",
      tastePreference: "clean_bright",
    },
  });

  assert.equal(suggestion.ratio, "1:16");
  assert.equal(suggestion.waterTemp, "93C");
  assert.equal(suggestion.pours.length, 3);
  assert.match(suggestion.headline, /起始方案/);
});

test("buildSuggestion shifts fuller for flat-bottom drippers and sweet preference", () => {
  const suggestion = buildSuggestion({
    bean: {
      process: "Natural",
      roastLevel: "Medium",
      flavorFocus: "Berry sweetness",
    },
    equipment: {
      dripper: "Kalita Wave",
      grinder: "1Zpresso ZP6",
      tastePreference: "sweet_round",
    },
  });

  assert.equal(suggestion.ratio, "1:15");
  assert.equal(suggestion.waterTemp, "91C");
  assert.match(suggestion.headline, /起始方案/);
  assert.match(suggestion.notes, /甜感|口感/);
});

test("buildSuggestion tolerates missing bean descriptors", () => {
  const suggestion = buildSuggestion({
    bean: {
      process: "",
      roastLevel: "",
      flavorFocus: "",
    },
    equipment: {
      dripper: "V60",
      grinder: "Comandante C40",
      tastePreference: "clean_bright",
    },
  });

  assert.equal(suggestion.ratio, "1:16");
  assert.equal(suggestion.waterTemp, "93C");
  assert.match(suggestion.headline, /起始方案/);
  assert.match(suggestion.notes, /风味|方向/);
});

test("formatGrindGuidance maps grinder scales to friendly guidance", () => {
  assert.equal(
    formatGrindGuidance("Comandante C40", "medium-fine"),
    "Comandante C40: 22-24 clicks"
  );
  assert.equal(
    formatGrindGuidance("1Zpresso ZP6", "medium"),
    "1Zpresso ZP6: 4.8-5.2"
  );
  assert.equal(
    formatGrindGuidance("Unknown Grinder", "medium"),
    "Unknown Grinder: medium"
  );
});
