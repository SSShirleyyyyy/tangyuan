import test from "node:test";
import assert from "node:assert/strict";

import {
  applyBrewInventoryChange,
  BEAN_INVENTORY_STORAGE_KEY,
  buildBeanProfile,
  calculateRestDay,
  getBeanInventoryStatus,
  initializeBeanInventoryState,
  deductBeanStock,
} from "../src/bean-inventory.js";

test("bean inventory storage key is stable", () => {
  assert.equal(BEAN_INVENTORY_STORAGE_KEY, "pourover-journal-bean-inventory");
});

test("initializeBeanInventoryState builds a default bean profile from serialized data", () => {
  const state = initializeBeanInventoryState(
    JSON.stringify({
      activeBeanId: "bean-1",
      beans: [
        {
          id: "bean-1",
          name: "Las Flores Gesha",
          roastDate: "2026-03-15",
          openedDate: "2026-03-20",
          restStartDay: 7,
          restEndDay: 21,
          totalWeight: 200,
          currentWeight: 160,
          lowStockThreshold: 30,
        },
      ],
    })
  );

  assert.equal(state.activeBeanId, "bean-1");
  assert.equal(state.beans[0].name, "Las Flores Gesha");
  assert.equal(state.beans[0].currentWeight, 160);
  assert.equal(state.beans[0].lowStockThreshold, 30);
});

test("buildBeanProfile trims values and applies stock defaults", () => {
  const bean = buildBeanProfile({
    id: "bean-1",
    name: " Las Flores Gesha ",
    roastDate: "2026-03-15",
    openedDate: "",
    restStartDay: "7",
    restEndDay: "21",
    totalWeight: "200",
    currentWeight: "",
    lowStockThreshold: "",
  });

  assert.equal(bean.name, "Las Flores Gesha");
  assert.equal(bean.restStartDay, 7);
  assert.equal(bean.restEndDay, 21);
  assert.equal(bean.totalWeight, 200);
  assert.equal(bean.currentWeight, 200);
  assert.equal(bean.lowStockThreshold, 30);
});

test("calculateRestDay measures roast age in whole days", () => {
  assert.equal(
    calculateRestDay("2026-03-15", new Date("2026-03-23T12:00:00+08:00")),
    8
  );
});

test("getBeanInventoryStatus marks beans as resting, ready, and low stock", () => {
  const restingBean = buildBeanProfile({
    id: "bean-1",
    name: "Chelbesa",
    roastDate: "2026-03-20",
    restStartDay: 7,
    restEndDay: 21,
    totalWeight: 200,
    currentWeight: 180,
    lowStockThreshold: 30,
  });

  const readyLowBean = buildBeanProfile({
    id: "bean-2",
    name: "Las Flores Gesha",
    roastDate: "2026-03-10",
    restStartDay: 7,
    restEndDay: 21,
    totalWeight: 200,
    currentWeight: 24,
    lowStockThreshold: 30,
  });

  const restingStatus = getBeanInventoryStatus(
    restingBean,
    new Date("2026-03-23T12:00:00+08:00")
  );
  const readyStatus = getBeanInventoryStatus(
    readyLowBean,
    new Date("2026-03-23T12:00:00+08:00")
  );

  assert.equal(restingStatus.restDay, 3);
  assert.equal(restingStatus.readiness, "resting");
  assert.equal(readyStatus.readiness, "ready");
  assert.equal(readyStatus.isLowStock, true);
});

test("deductBeanStock subtracts dose grams from the linked bean", () => {
  const state = initializeBeanInventoryState(
    JSON.stringify({
      activeBeanId: "bean-1",
      beans: [
        {
          id: "bean-1",
          name: "Las Flores Gesha",
          roastDate: "2026-03-15",
          openedDate: "2026-03-20",
          restStartDay: 7,
          restEndDay: 21,
          totalWeight: 200,
          currentWeight: 160,
          lowStockThreshold: 30,
        },
      ],
    })
  );

  const nextState = deductBeanStock(state, "bean-1", 15);

  assert.equal(nextState.beans[0].currentWeight, 145);
});

test("applyBrewInventoryChange avoids double deduction when editing a brew", () => {
  const state = initializeBeanInventoryState(
    JSON.stringify({
      activeBeanId: "bean-1",
      beans: [
        {
          id: "bean-1",
          name: "Las Flores Gesha",
          roastDate: "2026-03-15",
          restStartDay: 7,
          restEndDay: 21,
          totalWeight: 200,
          currentWeight: 145,
          lowStockThreshold: 30,
        },
      ],
    })
  );

  const nextState = applyBrewInventoryChange(
    state,
    { beanId: "bean-1", dose: 15 },
    { beanId: "bean-1", dose: 18 }
  );

  assert.equal(nextState.beans[0].currentWeight, 142);
});
