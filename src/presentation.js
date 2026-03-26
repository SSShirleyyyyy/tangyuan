export function describePreference(preference) {
  if (preference === "clean_bright") {
    return "明亮、干净";
  }

  if (preference === "sweet_round") {
    return "甜感、圆润";
  }

  return "平衡、中性";
}

export function summarizeBean(bean) {
  return `${bean.origin} / ${bean.process} / ${bean.roastLevel} Roast`;
}

export function formatPourPlan(pours) {
  return pours.map((pour) => `${pour.label} ${pour.amount} ${pour.time}`).join("\n");
}

export function formatBrewCueMeta({
  dripper,
  ratio,
  temp,
  fallbackRatio,
  fallbackTemp,
}) {
  return `${dripper} · ${ratio || fallbackRatio} · ${temp || fallbackTemp}`;
}

export function formatAdviceContextMeta({ dripper, grinder }) {
  return `适配 ${dripper} · ${grinder}`;
}

export function formatBrewParameterSummary({ ratio, temp }) {
  const parts = [ratio, temp].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "待填参数";
}

export function formatFilterDisplay(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "fast") {
    return "快流速滤纸";
  }

  if (normalized === "medium") {
    return "标准流速滤纸";
  }

  if (normalized === "slow") {
    return "慢流速滤纸";
  }

  return String(value || "").trim() || "待填";
}

export function formatEquipmentProfileMeta({ dripper, grinder, filters }) {
  return [dripper, grinder, formatFilterDisplay(filters)].filter(Boolean).join(" · ");
}

export function getEquipmentProfileSpecs({ dripper, grinder, filters }) {
  return [
    { key: "dripper", label: "滤杯", value: dripper },
    { key: "grinder", label: "研磨器", value: grinder },
    { key: "filters", label: "滤纸", value: formatFilterDisplay(filters) },
  ];
}

export function formatSummaryGrindDetail({ grind, grinder }) {
  const compactGrind = String(grind || "").trim();
  const compactGrinder = String(grinder || "").trim();

  if (!compactGrind) {
    return "研磨待定";
  }

  if (compactGrinder && compactGrind.startsWith(`${compactGrinder}:`)) {
    const detail = compactGrind.slice(compactGrinder.length + 1).trim();
    return detail ? `${detail} 研磨` : "研磨待定";
  }

  return compactGrind.endsWith("研磨") ? compactGrind : `${compactGrind}研磨`;
}

export function formatHeroDate(isoLikeDate) {
  const date = new Date(isoLikeDate);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

export function formatBeanInventoryStatusLine({
  restDay,
  readiness,
  currentWeight,
  isLowStock,
}) {
  const statusCopy =
    readiness === "resting"
      ? "再等等"
      : readiness === "ready"
        ? "现在适合冲"
        : "窗口后段";

  const parts = [
    `第 ${restDay} 天`,
    statusCopy,
    `${currentWeight}g 剩余`,
  ];

  if (isLowStock) {
    parts.push("接近补货线");
  }

  return parts.join(" · ");
}

export function formatInventoryDeductionPreview({
  beanName,
  currentWeight,
  dose,
}) {
  if (!String(beanName || "").trim()) {
    return "关联库存豆子后，保存这杯时会按粉量自动扣减库存。";
  }

  const nextDose = Number(dose) || 0;
  if (nextDose <= 0) {
    return `已关联 ${beanName}，保存后会按粉量自动扣减库存。`;
  }

  const remaining = Math.max(0, Number(currentWeight) - nextDose);
  return `已关联 ${beanName}，保存后会扣减 ${nextDose}g，预计剩余 ${remaining}g。`;
}

export function formatSuggestionSummary({
  ratio,
  waterTemp,
  grindGuidance,
}) {
  const trimmedGrind = String(grindGuidance || "").trim();
  const compactGrind = trimmedGrind.includes(":")
    ? trimmedGrind.slice(trimmedGrind.indexOf(":") + 1).trim()
    : trimmedGrind;
  const grindCopy = compactGrind
    ? compactGrind.endsWith("研磨")
      ? compactGrind
      : `${compactGrind} 研磨`
    : "";
  const parts = [ratio, waterTemp, grindCopy].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "待生成建议参数";
}

export function getUnlinkedInventoryStateCopy() {
  return {
    title: "还没关联库存豆子",
    meta: "想让这杯自动扣减库存的话，先从上面选一支豆子。",
    copy: "不关联也可以照常记录，只是这杯不会进入库存与养豆提醒。",
    optionLabel: "先不关联库存",
  };
}

export function formatRecentBrewSupplierLine({ roaster }) {
  const supplier = String(roaster || "").trim();
  return supplier || "未填供应商";
}

export function formatRecentBrewCardPreview({ bean, roaster }) {
  return {
    title: String(bean || "").trim() || "未命名豆子",
    supplier: formatRecentBrewSupplierLine({ roaster }),
  };
}
