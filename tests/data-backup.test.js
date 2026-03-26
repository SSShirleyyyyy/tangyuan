import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBackupFilename,
  buildBackupPayload,
  restoreBackupPayload,
} from "../src/data-backup.js";

test("buildBackupPayload wraps app state in a versioned backup envelope", () => {
  const payload = buildBackupPayload({
    createdAt: "2026-03-26T12:00:00.000Z",
    brews: [{ id: "brew-1", bean: "SL28" }],
    equipmentState: {
      activeProfileId: "profile-1",
      profiles: [{ id: "profile-1", name: "日常组合" }],
    },
    beanInventoryState: {
      activeBeanId: "bean-1",
      beans: [{ id: "bean-1", name: "SL28" }],
    },
  });

  assert.deepEqual(payload, {
    schema: "pourover-journal-backup",
    version: 1,
    createdAt: "2026-03-26T12:00:00.000Z",
    data: {
      brews: [{ id: "brew-1", bean: "SL28" }],
      equipmentState: {
        activeProfileId: "profile-1",
        profiles: [{ id: "profile-1", name: "日常组合" }],
      },
      beanInventoryState: {
        activeBeanId: "bean-1",
        beans: [{ id: "bean-1", name: "SL28" }],
      },
    },
  });
});

test("restoreBackupPayload sanitizes imported state through existing initializers", () => {
  const restored = restoreBackupPayload(
    JSON.stringify({
      schema: "pourover-journal-backup",
      version: 1,
      createdAt: "2026-03-26T12:00:00.000Z",
      data: {
        brews: [{ id: "brew-1", bean: " SL28 ", rating: 4.5 }],
        equipmentState: {
          activeProfileId: "profile-1",
          profiles: [
            {
              id: "profile-1",
              name: " 日常组合 ",
              dripper: " HARIO V60 02 ",
              grinder: " Comandante C40 ",
              filters: " CAFEC Abaca 02 ",
            },
          ],
        },
        beanInventoryState: {
          activeBeanId: "bean-1",
          beans: [
            {
              id: "bean-1",
              name: " SL28 ",
              roastDate: "2026-03-20",
              totalWeight: 250,
              currentWeight: 120,
              lowStockThreshold: 30,
            },
          ],
        },
      },
    })
  );

  assert.equal(restored.brews[0].bean, " SL28 ");
  assert.equal(restored.equipmentState.profiles[0].name, "日常组合");
  assert.equal(restored.equipmentState.profiles[0].dripper, "HARIO V60 02");
  assert.equal(restored.beanInventoryState.beans[0].name, "SL28");
});

test("restoreBackupPayload rejects files that are not valid journal backups", () => {
  assert.throws(
    () =>
      restoreBackupPayload(
        JSON.stringify({
          schema: "other-app-backup",
          data: {},
        })
      ),
    /invalid backup/i
  );
});

test("buildBackupFilename uses the backup date in a readable file name", () => {
  assert.equal(
    buildBackupFilename("2026-03-26T12:00:00.000Z"),
    "pourover-journal-backup-2026-03-26.json"
  );
});
