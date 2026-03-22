import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBrewEntry,
  filterBrews,
  initializeBrews,
  removeBrewEntry,
  updateBrewEntry,
} from "../src/brew-store.js";

test("initializeBrews falls back to seed data when storage is empty", () => {
  const seeds = [{ bean: "Seed Brew" }];

  assert.deepEqual(initializeBrews(null, seeds), seeds);
  assert.deepEqual(initializeBrews("[]", seeds), []);
});

test("buildBrewEntry shapes form values into a saved brew record", () => {
  const brew = buildBrewEntry({
    bean: "Las Flores Gesha",
    roaster: "Northbound Coffee",
    farm: "Las Flores",
    origin: "Huila, Colombia",
    variety: "Gesha",
    process: "Washed",
    roastLevel: "Light",
    roastDate: "2026-03-18",
    dripper: "V60",
    grinder: "Comandante C40",
    filters: "CAFEC Abaca 02",
    ratio: "1:16",
    rating: "4.7",
    notes: "Jasmine and citrus",
  });

  assert.equal(brew.bean, "Las Flores Gesha");
  assert.equal(brew.roaster, "Northbound Coffee");
  assert.equal(brew.farm, "Las Flores");
  assert.equal(brew.origin, "Huila, Colombia");
  assert.equal(brew.variety, "Gesha");
  assert.equal(brew.process, "Washed");
  assert.equal(brew.roastLevel, "Light");
  assert.equal(brew.roastDate, "2026-03-18");
  assert.equal(brew.dripper, "V60");
  assert.equal(brew.grinder, "Comandante C40");
  assert.equal(brew.filters, "CAFEC Abaca 02");
  assert.equal(brew.rating, 4.7);
  assert.match(brew.date, /^[A-Z][a-z]{2} \d{2}$/);
});

test("filterBrews narrows history by bean, dripper, and minimum rating", () => {
  const brews = [
    { bean: "Gesha", dripper: "V60", rating: 4.8 },
    { bean: "Chelbesa", dripper: "Origami Air S", rating: 4.4 },
    { bean: "Natural", dripper: "Kalita Wave", rating: 4.1 },
  ];

  assert.equal(
    filterBrews(brews, { beanQuery: "ge", dripper: "all", minRating: 0 }).length,
    1
  );
  assert.equal(
    filterBrews(brews, {
      beanQuery: "",
      dripper: "Origami Air S",
      minRating: 4.3,
    }).length,
    1
  );
  assert.equal(
    filterBrews(brews, {
      beanQuery: "",
      dripper: "all",
      minRating: 4.5,
    }).length,
    1
  );
});

test("updateBrewEntry replaces a saved brew by id", () => {
  const brews = [
    { id: "brew-1", bean: "Old Bean", rating: 4.0 },
    { id: "brew-2", bean: "Other Bean", rating: 4.3 },
  ];

  const updated = updateBrewEntry(brews, {
    id: "brew-1",
    bean: "New Bean",
    rating: 4.8,
  });

  assert.equal(updated[0].bean, "New Bean");
  assert.equal(updated[0].rating, 4.8);
  assert.equal(updated[1].bean, "Other Bean");
});

test("removeBrewEntry deletes a saved brew by id", () => {
  const brews = [
    { id: "brew-1", bean: "A" },
    { id: "brew-2", bean: "B" },
  ];

  const remaining = removeBrewEntry(brews, "brew-1");

  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, "brew-2");
});
