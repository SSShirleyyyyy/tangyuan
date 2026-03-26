import { initializeBeanInventoryState } from "./bean-inventory.js";
import { initializeBrews } from "./brew-store.js";
import { initializeEquipmentState } from "./equipment-store.js";
import { equipmentProfile as defaultEquipmentProfile } from "./mock-data.js";

const BACKUP_SCHEMA = "pourover-journal-backup";
const BACKUP_VERSION = 1;

export function buildBackupPayload({
  brews,
  equipmentState,
  beanInventoryState,
  createdAt = new Date().toISOString(),
}) {
  return {
    schema: BACKUP_SCHEMA,
    version: BACKUP_VERSION,
    createdAt,
    data: {
      brews,
      equipmentState,
      beanInventoryState,
    },
  };
}

export function buildBackupFilename(isoLikeDate = new Date().toISOString()) {
  const day = new Date(isoLikeDate).toISOString().slice(0, 10);
  return `pourover-journal-backup-${day}.json`;
}

export function restoreBackupPayload(serializedValue) {
  let parsed;

  try {
    parsed = JSON.parse(serializedValue);
  } catch {
    throw new Error("Invalid backup: unable to parse JSON.");
  }

  if (
    !parsed ||
    parsed.schema !== BACKUP_SCHEMA ||
    !parsed.data ||
    typeof parsed.data !== "object"
  ) {
    throw new Error("Invalid backup: unexpected backup format.");
  }

  return {
    brews: initializeBrews(JSON.stringify(parsed.data.brews || []), []),
    equipmentState: initializeEquipmentState(
      JSON.stringify(parsed.data.equipmentState || {}),
      defaultEquipmentProfile
    ),
    beanInventoryState: initializeBeanInventoryState(
      JSON.stringify(parsed.data.beanInventoryState || {})
    ),
  };
}
