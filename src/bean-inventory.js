export const BEAN_INVENTORY_STORAGE_KEY = "pourover-journal-bean-inventory";

function clampNumber(value, fallback) {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function withTrimmedFallback(value, fallback) {
  const trimmed = String(value ?? "").trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function buildBeanProfile(input) {
  const totalWeight = clampNumber(input.totalWeight, 250);
  const currentWeight = clampNumber(input.currentWeight, totalWeight);

  return {
    id: input.id,
    name: withTrimmedFallback(input.name, "未命名豆子"),
    roaster: withTrimmedFallback(input.roaster, ""),
    farm: withTrimmedFallback(input.farm, ""),
    origin: withTrimmedFallback(input.origin, ""),
    variety: withTrimmedFallback(input.variety, ""),
    process: withTrimmedFallback(input.process, ""),
    roastLevel: withTrimmedFallback(input.roastLevel, ""),
    roastDate: withTrimmedFallback(
      input.roastDate,
      new Date().toISOString().slice(0, 10)
    ),
    openedDate: withTrimmedFallback(input.openedDate, ""),
    restStartDay: clampNumber(input.restStartDay, 7),
    restEndDay: clampNumber(input.restEndDay, 21),
    totalWeight,
    currentWeight,
    lowStockThreshold: clampNumber(input.lowStockThreshold, 30),
  };
}

export function initializeBeanInventoryState(serializedValue) {
  if (!serializedValue) {
    return {
      activeBeanId: "",
      beans: [],
    };
  }

  try {
    const parsed = JSON.parse(serializedValue);

    if (Array.isArray(parsed.beans)) {
      const beans = parsed.beans.map((bean) => buildBeanProfile(bean));
      return {
        activeBeanId: parsed.activeBeanId || beans[0]?.id || "",
        beans,
      };
    }
  } catch {
    return {
      activeBeanId: "",
      beans: [],
    };
  }

  return {
    activeBeanId: "",
    beans: [],
  };
}

export function calculateRestDay(roastDate, now = new Date()) {
  const roast = new Date(`${roastDate}T00:00:00+08:00`);
  const current = new Date(now);
  const diff = current.getTime() - roast.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getBeanInventoryStatus(bean, now = new Date()) {
  const restDay = calculateRestDay(bean.roastDate, now);
  const readiness =
    restDay < bean.restStartDay
      ? "resting"
      : restDay <= bean.restEndDay
        ? "ready"
        : "past_peak";

  return {
    restDay,
    readiness,
    isLowStock: bean.currentWeight <= bean.lowStockThreshold,
  };
}

export function updateBeanProfile(state, nextBean) {
  const built = buildBeanProfile(nextBean);
  const exists = state.beans.some((bean) => bean.id === built.id);

  return {
    activeBeanId: state.activeBeanId || built.id,
    beans: exists
      ? state.beans.map((bean) => (bean.id === built.id ? built : bean))
      : [...state.beans, built],
  };
}

export function removeBeanProfile(state, beanId) {
  const beans = state.beans.filter((bean) => bean.id !== beanId);
  return {
    activeBeanId: state.activeBeanId === beanId ? beans[0]?.id || "" : state.activeBeanId,
    beans,
  };
}

export function setActiveBeanProfile(state, beanId) {
  return {
    ...state,
    activeBeanId: beanId,
  };
}

export function deductBeanStock(state, beanId, dose) {
  const nextDose = clampNumber(dose, 0);

  return {
    ...state,
    beans: state.beans.map((bean) =>
      bean.id === beanId
        ? {
            ...bean,
            currentWeight: Math.max(0, bean.currentWeight - nextDose),
          }
        : bean
    ),
  };
}

export function applyBrewInventoryChange(state, previousBrew, nextBrew) {
  let nextState = {
    ...state,
    beans: [...state.beans],
  };

  if (previousBrew?.beanId && previousBrew?.dose > 0) {
    nextState = {
      ...nextState,
      beans: nextState.beans.map((bean) =>
        bean.id === previousBrew.beanId
          ? {
              ...bean,
              currentWeight: bean.currentWeight + clampNumber(previousBrew.dose, 0),
            }
          : bean
      ),
    };
  }

  if (nextBrew?.beanId && nextBrew?.dose > 0) {
    nextState = deductBeanStock(nextState, nextBrew.beanId, nextBrew.dose);
  }

  return nextState;
}
