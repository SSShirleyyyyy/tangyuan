function compactText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDate(value) {
  const nextValue = compactText(value)
    .replace(/[年/.]/g, "-")
    .replace(/月/g, "-")
    .replace(/日/g, "");
  const match = nextValue.match(/(20\d{2})-(\d{1,2})-(\d{1,2})/);

  if (!match) {
    return "";
  }

  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function normalizeProcess(value) {
  const nextValue = compactText(value);
  if (!nextValue) {
    return "";
  }

  if (/washed|水洗/u.test(nextValue)) {
    return "Washed";
  }
  if (/natural|日晒/u.test(nextValue)) {
    return "Natural";
  }
  if (/honey|蜜处理/u.test(nextValue)) {
    return "Honey";
  }
  if (/anaerobic|厌氧/u.test(nextValue)) {
    return "Anaerobic";
  }

  return nextValue;
}

function normalizeRoastLevel(value) {
  const nextValue = compactText(value);
  if (!nextValue) {
    return "";
  }

  if (/light|浅焙|浅烘/u.test(nextValue)) {
    return "Light";
  }
  if (/medium|中焙|中烘/u.test(nextValue)) {
    return "Medium";
  }
  if (/dark|深焙|深烘/u.test(nextValue)) {
    return "Dark";
  }

  return nextValue;
}

export function buildBeanVisionPrompt(mode = "brew") {
  const scene =
    mode === "inventory"
      ? "这是一张豆袋照片，目标是给库存档案建档。"
      : "这是一张豆袋照片，目标是给这杯冲煮记录提取豆子信息。";

  return [
    scene,
    "请只根据图片中真实可见的文字或明确可判断的信息提取字段，不要猜测，不要补全看不清的内容。",
    "返回纯 JSON，不要加 markdown，不要加解释。",
    '字段固定为：name, roaster, farm, origin, variety, process, roastLevel, flavorFocus, roastDate。',
    "如果某个字段不确定，就返回空字符串。",
    "roastDate 尽量输出 YYYY-MM-DD。",
  ].join(" ");
}

export function extractJsonObject(text) {
  const source = String(text || "");
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return {};
  }

  try {
    return JSON.parse(source.slice(start, end + 1));
  } catch {
    return {};
  }
}

export function sanitizeModelBeanDetails(payload) {
  const data = payload || {};

  return {
    name: compactText(data.name),
    roaster: compactText(data.roaster),
    farm: compactText(data.farm),
    origin: compactText(data.origin),
    variety: compactText(data.variety),
    process: normalizeProcess(data.process),
    roastLevel: normalizeRoastLevel(data.roastLevel),
    flavorFocus: compactText(data.flavorFocus),
    roastDate: normalizeDate(data.roastDate),
  };
}
