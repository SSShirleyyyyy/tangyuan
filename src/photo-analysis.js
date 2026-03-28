const FLAVOR_TERMS = [
  "jasmine",
  "citrus",
  "honey",
  "berry",
  "floral",
  "peach",
  "tea",
  "chocolate",
  "cacao",
  "stone fruit",
  "茉莉花",
  "茉莉",
  "柑橘",
  "蜂蜜",
  "莓果",
  "花香",
  "桃子",
  "茶感",
  "可可",
  "巧克力",
];

const VARIETY_TOKENS = [
  "gesha",
  "geisha",
  "sidra",
  "sl28",
  "sl34",
  "bourbon",
  "typica",
  "caturra",
  "catuai",
  "java",
  "heirloom",
  "pink bourbon",
];

const ORIGIN_TOKENS = [
  "colombia",
  "ethiopia",
  "kenya",
  "panama",
  "guatemala",
  "哥伦比亚",
  "埃塞俄比亚",
  "肯尼亚",
  "巴拿马",
  "危地马拉",
];

const PROCESS_PATTERNS = [
  [/washed|水洗/u, "Washed"],
  [/natural|日晒/u, "Natural"],
  [/honey|蜜处理|蜜処理/u, "Honey"],
  [/anaerobic|厌氧/u, "Anaerobic"],
  [/co[\s-]?ferment|coferment|共发酵/u, "Co-ferment"],
];

const ROAST_LEVEL_PATTERNS = [
  [/light|浅焙|浅烘/u, "Light"],
  [/medium|中焙|中烘/u, "Medium"],
  [/dark|深焙|深烘/u, "Dark"],
];

const FIELD_LABELS = {
  name: ["bean name", "coffee name", "豆子名称", "豆名", "品名"],
  roaster: ["roaster", "roastery", "roasted by", "烘焙商", "烘豆商", "烘焙店"],
  farm: ["producer", "farm", "estate", "庄园", "处理站", "生产者"],
  origin: ["origin", "region", "产区", "国家", "来源"],
  variety: ["variety", "cultivar", "品种"],
  process: ["process", "processing", "处理方式", "处理法"],
  roastDate: ["roast date", "roasted on", "烘焙日期", "烘焙时间"],
  roastLevel: ["roast level", "焙度", "烘焙度"],
  flavorFocus: [
    "notes",
    "tasting notes",
    "flavor notes",
    "风味",
    "风味描述",
    "风味笔记",
  ],
};

const GENERIC_PHOTO_LABEL_PATTERNS = [
  /^image$/i,
  /^img[_ -]?\d+$/i,
  /^pxl[_ -]?\d+/i,
  /^photo$/i,
  /^scan$/i,
  /^wx_camera/i,
];

function compactText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeLine(line) {
  return compactText(
    String(line || "")
      .replace(/[|｜]/g, "I")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[，]/g, ", ")
      .replace(/[；]/g, "; ")
      .replace(/[、]/g, "、")
      .replace(/\s*[:：]\s*/g, " : ")
  );
}

function titleizeAscii(value) {
  return value.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function normalizeDisplayValue(value) {
  const nextValue = compactText(value);
  if (!nextValue) {
    return "";
  }

  if (/[一-龥]/u.test(nextValue)) {
    return nextValue;
  }

  if (/^[A-Z0-9\s/-]+$/.test(nextValue)) {
    return nextValue;
  }

  return titleizeAscii(nextValue.toLowerCase());
}

function normalizeDate(value) {
  const nextValue = compactText(value);
  if (!nextValue) {
    return "";
  }

  const normalized = nextValue
    .replace(/[年/.]/g, "-")
    .replace(/月/g, "-")
    .replace(/日/g, "")
    .replace(/--+/g, "-");
  const match = normalized.match(/(20\d{2})-(\d{1,2})-(\d{1,2})/);

  if (!match) {
    return "";
  }

  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function countMatches(value, pattern) {
  return (String(value || "").match(pattern) || []).length;
}

function extractOriginFragment(value) {
  const nextValue = compactText(value);
  if (!nextValue) {
    return "";
  }

  const regionMatch = nextValue.match(
    /(Huila,\s*Colombia|Yirgacheffe,\s*Ethiopia|Panama|Colombia|Ethiopia|Kenya|Guatemala|哥伦比亚|埃塞俄比亚|肯尼亚|巴拿马|危地马拉)/i
  );

  return normalizeDisplayValue(regionMatch?.[1] || "");
}

function isLikelyGarbledValue(value) {
  const nextValue = compactText(value);
  if (!nextValue) {
    return false;
  }

  if (/[一-龥]/u.test(nextValue)) {
    return false;
  }

  const suspiciousSymbolCount = countMatches(nextValue, /[<>{}\[\]\\]/g);
  if (suspiciousSymbolCount >= 1) {
    return true;
  }

  const weirdPunctuationCount = countMatches(
    nextValue,
    /[^A-Za-z0-9\s,./&()\-]/g
  );
  if (weirdPunctuationCount >= 4) {
    return true;
  }

  const tokens = nextValue.split(/\s+/).filter(Boolean);
  const singleCharacterTokenCount = tokens.filter((token) => {
    const normalized = token.replace(/[^A-Za-z0-9]/g, "");
    return normalized.length === 1;
  }).length;

  if (
    tokens.length >= 4 &&
    singleCharacterTokenCount >= 3 &&
    singleCharacterTokenCount >= Math.ceil(tokens.length / 2)
  ) {
    return true;
  }

  return false;
}

function sanitizeRecognizedField(field, value) {
  const nextValue = compactText(value);
  if (!nextValue) {
    return "";
  }

  if (field === "origin") {
    const extractedOrigin = extractOriginFragment(nextValue);
    if (extractedOrigin) {
      return extractedOrigin;
    }
  }

  if (isLikelyGarbledValue(nextValue)) {
    return "";
  }

  return nextValue;
}

function normalizeProcess(value) {
  const nextValue = compactText(value);
  if (!nextValue) {
    return "";
  }

  for (const [pattern, normalized] of PROCESS_PATTERNS) {
    if (pattern.test(nextValue)) {
      return normalized;
    }
  }

  return normalizeDisplayValue(nextValue);
}

function normalizeRoastLevel(value) {
  const nextValue = compactText(value);
  if (!nextValue) {
    return "";
  }

  for (const [pattern, normalized] of ROAST_LEVEL_PATTERNS) {
    if (pattern.test(nextValue)) {
      return normalized;
    }
  }

  if (/[:：\n]/u.test(nextValue)) {
    return "";
  }

  return normalizeDisplayValue(nextValue);
}

function inferFlavorFocus(text) {
  const lower = text.toLowerCase();
  const matchedTerms = [];

  FLAVOR_TERMS.forEach((term) => {
    const normalizedTerm = term.toLowerCase();
    if (lower.includes(normalizedTerm) && !matchedTerms.includes(term)) {
      matchedTerms.push(term);
    }
  });

  return matchedTerms.join(", ");
}

function buildLabelRegex(labels) {
  return new RegExp(`^(?:${labels.map(escapeRegExp).join("|")})\\s*[:：]\\s*(.+)$`, "i");
}

function findLineValue(lines, labels) {
  const regex = buildLabelRegex(labels);

  for (const line of lines) {
    const match = line.match(regex);
    if (match?.[1]) {
      return compactText(match[1]);
    }
  }

  return "";
}

function findValueFromAdjacentLine(lines, labels) {
  const labelSet = new Set(labels.map((label) => label.toLowerCase()));

  for (let index = 0; index < lines.length - 1; index += 1) {
    if (labelSet.has(lines[index].toLowerCase())) {
      return compactText(lines[index + 1]);
    }
  }

  return "";
}

function findFirstMeaningfulLine(lines, excludePatterns = []) {
  return (
    lines.find((line) => {
      if (!line) {
        return false;
      }

      return !excludePatterns.some((pattern) => pattern.test(line));
    }) || ""
  );
}

function pickBeanName(lines) {
  const labeledName =
    findLineValue(lines, FIELD_LABELS.name) ||
    findValueFromAdjacentLine(lines, FIELD_LABELS.name);
  if (labeledName) {
    return normalizeDisplayValue(labeledName);
  }

  const varietyLine = lines.find((line) =>
    VARIETY_TOKENS.some((token) => line.toLowerCase().includes(token))
  );
  if (varietyLine) {
    return normalizeDisplayValue(varietyLine);
  }

  return normalizeDisplayValue(
    findFirstMeaningfulLine(lines.slice(1), [
      buildLabelRegex(FIELD_LABELS.origin),
      buildLabelRegex(FIELD_LABELS.process),
      buildLabelRegex(FIELD_LABELS.variety),
      buildLabelRegex(FIELD_LABELS.roastDate),
    ])
  );
}

function pickRoaster(lines) {
  const labeledRoaster =
    findLineValue(lines, FIELD_LABELS.roaster) ||
    findValueFromAdjacentLine(lines, FIELD_LABELS.roaster);
  if (labeledRoaster) {
    return normalizeDisplayValue(labeledRoaster);
  }

  return normalizeDisplayValue(lines[0] || "");
}

function pickOrigin(lines, normalizedText) {
  const labeledOrigin =
    findLineValue(lines, FIELD_LABELS.origin) ||
    findValueFromAdjacentLine(lines, FIELD_LABELS.origin);
  if (labeledOrigin) {
    return normalizeDisplayValue(labeledOrigin);
  }

  const fallbackLine = lines.find((line) =>
    ORIGIN_TOKENS.some((token) => line.toLowerCase().includes(token.toLowerCase()))
  );
  if (fallbackLine) {
    return normalizeDisplayValue(fallbackLine);
  }

  const originMatch = normalizedText.match(
    /(Huila,\s*Colombia|Yirgacheffe,\s*Ethiopia|Panama|Colombia|Ethiopia|Kenya|Guatemala)/i
  );
  return normalizeDisplayValue(originMatch?.[1] || "");
}

function pickFlavorFocus(lines, normalizedText) {
  const labeledFlavor =
    findLineValue(lines, FIELD_LABELS.flavorFocus) ||
    findValueFromAdjacentLine(lines, FIELD_LABELS.flavorFocus);
  if (labeledFlavor) {
    return compactText(labeledFlavor);
  }

  return inferFlavorFocus(normalizedText);
}

export function normalizeOcrText(text) {
  const seen = new Set();
  const lines = String(text || "")
    .replace(/\r/g, "")
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean)
    .filter((line) => {
      const key = line.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

  return lines.join("\n");
}

export function inferPhotoLabel(file) {
  return file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

export function classifyPhotoAnalysisFailure(message) {
  const nextMessage = compactText(message);
  if (!nextMessage) {
    return "unknown";
  }

  if (
    /OPENAI_API_KEY|未配置|大模型图片识别|无法使用大模型/u.test(nextMessage)
  ) {
    return "model_unavailable";
  }

  return "unknown";
}

export function mergeDetectedBean(base, override) {
  const nextBase = base || {};
  const nextOverride = override || {};

  return {
    name: compactText(nextOverride.name) || compactText(nextBase.name),
    roaster: compactText(nextOverride.roaster) || compactText(nextBase.roaster),
    farm: compactText(nextOverride.farm) || compactText(nextBase.farm),
    origin: compactText(nextOverride.origin) || compactText(nextBase.origin),
    variety: compactText(nextOverride.variety) || compactText(nextBase.variety),
    process: compactText(nextOverride.process) || compactText(nextBase.process),
    roastLevel:
      compactText(nextOverride.roastLevel) || compactText(nextBase.roastLevel),
    flavorFocus:
      compactText(nextOverride.flavorFocus) || compactText(nextBase.flavorFocus),
    roastDate: compactText(nextOverride.roastDate) || compactText(nextBase.roastDate),
  };
}

export function extractBeanDetailsFromText(text) {
  const normalized = normalizeOcrText(text);
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);

  return {
    name: sanitizeRecognizedField("name", pickBeanName(lines)),
    roaster: sanitizeRecognizedField("roaster", pickRoaster(lines)),
    farm: sanitizeRecognizedField(
      "farm",
      normalizeDisplayValue(
      findLineValue(lines, FIELD_LABELS.farm) ||
        findValueFromAdjacentLine(lines, FIELD_LABELS.farm)
      )
    ),
    origin: sanitizeRecognizedField("origin", pickOrigin(lines, normalized)),
    variety: sanitizeRecognizedField(
      "variety",
      normalizeDisplayValue(
      findLineValue(lines, FIELD_LABELS.variety) ||
        findValueFromAdjacentLine(lines, FIELD_LABELS.variety)
      )
    ),
    process: sanitizeRecognizedField(
      "process",
      normalizeProcess(
      findLineValue(lines, FIELD_LABELS.process) ||
        findValueFromAdjacentLine(lines, FIELD_LABELS.process)
      )
    ),
    roastLevel: sanitizeRecognizedField(
      "roastLevel",
      normalizeRoastLevel(
      findLineValue(lines, FIELD_LABELS.roastLevel) ||
        findValueFromAdjacentLine(lines, FIELD_LABELS.roastLevel) ||
        normalized
      )
    ),
    flavorFocus: sanitizeRecognizedField(
      "flavorFocus",
      pickFlavorFocus(lines, normalized)
    ),
    roastDate: sanitizeRecognizedField(
      "roastDate",
      normalizeDate(
      findLineValue(lines, FIELD_LABELS.roastDate) ||
        findValueFromAdjacentLine(lines, FIELD_LABELS.roastDate) ||
        normalized
      )
    ),
  };
}

export function inferBeanFromPhoto(file) {
  const label = inferPhotoLabel(file);
  const lower = label.toLowerCase();
  const process = normalizeProcess(lower.includes("natural") ? "natural" : "washed");
  const roastLevel = normalizeRoastLevel(lower.includes("medium") ? "medium" : "light");
  const varietyToken =
    VARIETY_TOKENS.find((token) => lower.includes(token)) || "";
  const cleanedLabel = label
    .replace(/\bwashed\b|\bnatural\b|\bmedium\b|\blight\b/gi, "")
    .trim();
  const hasGenericLabel = GENERIC_PHOTO_LABEL_PATTERNS.some((pattern) =>
    pattern.test(cleanedLabel || label)
  );

  const name = varietyToken
    ? normalizeDisplayValue(cleanedLabel || varietyToken)
    : hasGenericLabel
      ? ""
      : normalizeDisplayValue(cleanedLabel || label);

  const origin = lower.includes("colombia")
    ? "Huila, Colombia"
    : lower.includes("ethiopia")
      ? "Yirgacheffe, Ethiopia"
      : lower.includes("panama")
        ? "Panama"
        : "";
  const farm = lower.includes("flores") ? "Las Flores" : "";

  return {
    name,
    roaster: "",
    farm,
    origin,
    variety: varietyToken ? normalizeDisplayValue(varietyToken) : "",
    process,
    roastLevel,
    flavorFocus:
      process === "Natural"
        ? "Berry sweetness, cacao, round finish"
        : "Floral lift, citrus, clean sweetness",
    roastDate: "",
  };
}
