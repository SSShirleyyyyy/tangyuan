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
