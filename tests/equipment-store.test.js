import test from "node:test";
import assert from "node:assert/strict";

import {
  EQUIPMENT_STORAGE_KEY,
  buildEquipmentProfile,
  initializeEquipmentState,
  removeEquipmentProfile,
  setActiveEquipmentProfile,
  updateEquipmentProfile,
} from "../src/equipment-store.js";

test("equipment storage key is stable", () => {
  assert.equal(EQUIPMENT_STORAGE_KEY, "pourover-journal-equipment-profiles");
});

test("initializeEquipmentState creates a default profile from defaults", () => {
  const state = initializeEquipmentState(null, {
    dripper: "HARIO V60 02",
    grinder: "Comandante C40",
    filters: "CAFEC Abaca 02",
  });

  assert.equal(state.activeProfileId, "profile-1");
  assert.equal(state.profiles.length, 1);
  assert.equal(state.profiles[0].name, "日常组合");
});

test("initializeEquipmentState migrates legacy single-profile storage", () => {
  const legacy = JSON.stringify({
    dripper: "Kalita Wave 185",
    grinder: "1Zpresso ZP6 Special",
    filters: "Kalita Wave 185 Filter",
    tastePreference: "clean_bright",
  });

  const state = initializeEquipmentState(legacy, {
    dripper: "HARIO V60 02",
    grinder: "Comandante C40",
    filters: "CAFEC Abaca 02",
  });

  assert.equal(state.profiles.length, 1);
  assert.equal(state.profiles[0].dripper, "Kalita Wave 185");
  assert.equal(state.activeProfileId, state.profiles[0].id);
});

test("buildEquipmentProfile trims editable values", () => {
  const profile = buildEquipmentProfile({
    id: "profile-2",
    name: "  比赛组合  ",
    dripper: " ORIGAMI Dripper M ",
    grinder: " Comandante C40 ",
    filters: " ORIGAMI Cone Filter ",
  });

  assert.deepEqual(profile, {
    id: "profile-2",
    name: "比赛组合",
    dripper: "ORIGAMI Dripper M",
    grinder: "Comandante C40",
    filters: "ORIGAMI Cone Filter",
  });
});

test("updateEquipmentProfile updates one saved profile", () => {
  const nextState = updateEquipmentProfile(
    {
      activeProfileId: "profile-1",
      profiles: [
        {
          id: "profile-1",
          name: "日常组合",
          dripper: "HARIO V60 02",
          grinder: "Comandante C40",
          filters: "CAFEC Abaca 02",
        },
      ],
    },
    {
      id: "profile-1",
      name: "Kalita 稳定流",
      dripper: "Kalita Wave 185",
      grinder: "1Zpresso ZP6 Special",
      filters: "Kalita Wave 185 Filter",
    }
  );

  assert.equal(nextState.profiles[0].name, "Kalita 稳定流");
  assert.equal(nextState.profiles[0].dripper, "Kalita Wave 185");
});

test("setActiveEquipmentProfile changes the default profile", () => {
  const state = setActiveEquipmentProfile(
    {
      activeProfileId: "profile-1",
      profiles: [
        { id: "profile-1", name: "A", dripper: "V60", grinder: "C40", filters: "CAFEC" },
        { id: "profile-2", name: "B", dripper: "Kalita", grinder: "ZP6", filters: "Wave" },
      ],
    },
    "profile-2"
  );

  assert.equal(state.activeProfileId, "profile-2");
});

test("removeEquipmentProfile keeps at least one profile and resets active id if needed", () => {
  const state = removeEquipmentProfile(
    {
      activeProfileId: "profile-2",
      profiles: [
        { id: "profile-1", name: "A", dripper: "V60", grinder: "C40", filters: "CAFEC" },
        { id: "profile-2", name: "B", dripper: "Kalita", grinder: "ZP6", filters: "Wave" },
      ],
    },
    "profile-2"
  );

  assert.equal(state.profiles.length, 1);
  assert.equal(state.activeProfileId, "profile-1");
});
