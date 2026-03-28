(() => {
  // src/mock-data.js
  var equipmentProfile = {
    dripper: "HARIO V60 02",
    grinder: "Comandante C40",
    filters: "CAFEC Abaca 02",
    tastePreference: "clean_bright"
  };

  // src/presentation.js
  function formatFilterDisplay(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "fast") {
      return "\u5FEB\u6D41\u901F\u6EE4\u7EB8";
    }
    if (normalized === "medium") {
      return "\u6807\u51C6\u6D41\u901F\u6EE4\u7EB8";
    }
    if (normalized === "slow") {
      return "\u6162\u6D41\u901F\u6EE4\u7EB8";
    }
    return String(value || "").trim() || "\u5F85\u586B";
  }
  function getEquipmentProfileSpecs({ dripper, grinder, filters }) {
    return [
      { key: "dripper", label: "\u6EE4\u676F", value: dripper },
      { key: "grinder", label: "\u7814\u78E8\u5668", value: grinder },
      { key: "filters", label: "\u6EE4\u7EB8", value: formatFilterDisplay(filters) }
    ];
  }
  function formatHeroDate(isoLikeDate) {
    const date = new Date(isoLikeDate);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}.${day}`;
  }
  function formatBeanInventoryStatusLine({
    restDay,
    readiness,
    currentWeight,
    isLowStock
  }) {
    const statusCopy = readiness === "resting" ? "\u518D\u7B49\u7B49" : readiness === "ready" ? "\u73B0\u5728\u9002\u5408\u51B2" : "\u7A97\u53E3\u540E\u6BB5";
    const parts = [
      `\u7B2C ${restDay} \u5929`,
      statusCopy,
      `${currentWeight}g \u5269\u4F59`
    ];
    if (isLowStock) {
      parts.push("\u63A5\u8FD1\u8865\u8D27\u7EBF");
    }
    return parts.join(" \xB7 ");
  }
  function formatInventoryDeductionPreview({
    beanName,
    currentWeight,
    dose
  }) {
    if (!String(beanName || "").trim()) {
      return "\u672A\u5173\u8054\u5E93\u5B58\uFF0C\u4E0D\u4F1A\u6263\u51CF\u3002";
    }
    const nextDose = Number(dose) || 0;
    if (nextDose <= 0) {
      return `\u5DF2\u5173\u8054 ${beanName}\u3002`;
    }
    const remaining = Math.max(0, Number(currentWeight) - nextDose);
    return `\u5DF2\u5173\u8054 ${beanName}\uFF0C\u4FDD\u5B58\u540E\u4F1A\u6263\u51CF ${nextDose}g\uFF0C\u9884\u8BA1\u5269\u4F59 ${remaining}g\u3002`;
  }
  function getUnlinkedInventoryStateCopy() {
    return {
      title: "\u6682\u4E0D\u5173\u8054\u5E93\u5B58\u8C46\u5B50",
      meta: "\u8FD9\u676F\u4E0D\u4F1A\u6263\u51CF\u5E93\u5B58\u3002",
      copy: "\u53EF\u76F4\u63A5\u4FDD\u5B58\u8BB0\u5F55\u3002",
      optionLabel: "\u4E0D\u5173\u8054\u5E93\u5B58\u8C46\u5B50"
    };
  }
  function formatRecentBrewSupplierLine({ roaster }) {
    const supplier = String(roaster || "").trim();
    return supplier || "\u672A\u586B\u4F9B\u5E94\u5546";
  }
  function formatRecentBrewCardPreview({ bean, roaster }) {
    return {
      title: String(bean || "").trim() || "\u672A\u547D\u540D\u8C46\u5B50",
      supplier: formatRecentBrewSupplierLine({ roaster })
    };
  }

  // src/brew-store.js
  var BREW_STORAGE_KEY = "pourover-journal-brews-v2";
  var EMPTY_BREW_BEAN_DETAILS = {
    name: "",
    roaster: "",
    farm: "",
    origin: "",
    variety: "",
    process: "",
    roastLevel: "",
    roastDate: ""
  };
  function formatBrewDate(date = /* @__PURE__ */ new Date()) {
    const month = new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "Asia/Shanghai"
    }).format(date);
    const day = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      timeZone: "Asia/Shanghai"
    }).format(date);
    return `${month} ${day}`;
  }
  function initializeBrews(serializedValue, seedBrews2) {
    if (!serializedValue) {
      return seedBrews2;
    }
    try {
      return JSON.parse(serializedValue);
    } catch {
      return seedBrews2;
    }
  }
  function buildBrewEntry(formValues) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    return {
      id: `brew-${Date.now()}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      date: formatBrewDate(),
      bean: formValues.bean.trim(),
      beanId: ((_a = formValues.beanId) == null ? void 0 : _a.trim()) || "",
      equipmentProfileId: ((_b = formValues.equipmentProfileId) == null ? void 0 : _b.trim()) || "",
      roaster: ((_c = formValues.roaster) == null ? void 0 : _c.trim()) || "",
      farm: ((_d = formValues.farm) == null ? void 0 : _d.trim()) || "",
      origin: ((_e = formValues.origin) == null ? void 0 : _e.trim()) || "",
      variety: ((_f = formValues.variety) == null ? void 0 : _f.trim()) || "",
      process: ((_g = formValues.process) == null ? void 0 : _g.trim()) || "",
      roastLevel: ((_h = formValues.roastLevel) == null ? void 0 : _h.trim()) || "",
      roastDate: ((_i = formValues.roastDate) == null ? void 0 : _i.trim()) || "",
      dripper: formValues.dripper,
      grinder: ((_j = formValues.grinder) == null ? void 0 : _j.trim()) || "",
      filters: ((_k = formValues.filters) == null ? void 0 : _k.trim()) || "",
      dose: Number(formValues.dose) || 0,
      ratio: formValues.ratio.trim(),
      temp: ((_l = formValues.temp) == null ? void 0 : _l.trim()) || "",
      grind: ((_m = formValues.grind) == null ? void 0 : _m.trim()) || "",
      pours: ((_n = formValues.pours) == null ? void 0 : _n.trim()) || "",
      note: ((_o = formValues.notes) == null ? void 0 : _o.trim()) || "",
      rating: Number(formValues.rating),
      source: formValues.source || "manual"
    };
  }
  function resolveBrewBeanDetails({ linkedBean, fallbackBean }) {
    const source = linkedBean || fallbackBean || {};
    return {
      name: source.name || EMPTY_BREW_BEAN_DETAILS.name,
      roaster: source.roaster || EMPTY_BREW_BEAN_DETAILS.roaster,
      farm: source.farm || EMPTY_BREW_BEAN_DETAILS.farm,
      origin: source.origin || EMPTY_BREW_BEAN_DETAILS.origin,
      variety: source.variety || EMPTY_BREW_BEAN_DETAILS.variety,
      process: source.process || EMPTY_BREW_BEAN_DETAILS.process,
      roastLevel: source.roastLevel || EMPTY_BREW_BEAN_DETAILS.roastLevel,
      roastDate: source.roastDate || EMPTY_BREW_BEAN_DETAILS.roastDate
    };
  }
  function resolveInitialBrewBeanDetails({
    linkedBean,
    fallbackBean,
    useFallbackBean = false
  }) {
    if (linkedBean) {
      return resolveBrewBeanDetails({ linkedBean, fallbackBean: null });
    }
    if (useFallbackBean) {
      return resolveBrewBeanDetails({ linkedBean: null, fallbackBean });
    }
    return { ...EMPTY_BREW_BEAN_DETAILS };
  }
  function filterBrews(brews, { beanQuery = "", dripper = "all", minRating = 0 }) {
    const query = beanQuery.trim().toLowerCase();
    return brews.filter((brew) => {
      const matchesBean = query.length === 0 || brew.bean.toLowerCase().includes(query);
      const matchesDripper = dripper === "all" || brew.dripper === dripper;
      const matchesRating = Number(brew.rating) >= Number(minRating);
      return matchesBean && matchesDripper && matchesRating;
    });
  }
  function updateBrewEntry(brews, nextBrew) {
    return brews.map((brew) => brew.id === nextBrew.id ? nextBrew : brew);
  }
  function removeBrewEntry(brews, brewId) {
    return brews.filter((brew) => brew.id !== brewId);
  }

  // src/photo-analysis.js
  var FLAVOR_TERMS = [
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
    "\u8309\u8389\u82B1",
    "\u8309\u8389",
    "\u67D1\u6A58",
    "\u8702\u871C",
    "\u8393\u679C",
    "\u82B1\u9999",
    "\u6843\u5B50",
    "\u8336\u611F",
    "\u53EF\u53EF",
    "\u5DE7\u514B\u529B"
  ];
  var VARIETY_TOKENS = [
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
    "pink bourbon"
  ];
  var ORIGIN_TOKENS = [
    "colombia",
    "ethiopia",
    "kenya",
    "panama",
    "guatemala",
    "\u54E5\u4F26\u6BD4\u4E9A",
    "\u57C3\u585E\u4FC4\u6BD4\u4E9A",
    "\u80AF\u5C3C\u4E9A",
    "\u5DF4\u62FF\u9A6C",
    "\u5371\u5730\u9A6C\u62C9"
  ];
  var PROCESS_PATTERNS = [
    [/washed|水洗/u, "Washed"],
    [/natural|日晒/u, "Natural"],
    [/honey|蜜处理|蜜処理/u, "Honey"],
    [/anaerobic|厌氧/u, "Anaerobic"],
    [/co[\s-]?ferment|coferment|共发酵/u, "Co-ferment"]
  ];
  var ROAST_LEVEL_PATTERNS = [
    [/light|浅焙|浅烘/u, "Light"],
    [/medium|中焙|中烘/u, "Medium"],
    [/dark|深焙|深烘/u, "Dark"]
  ];
  var FIELD_LABELS = {
    name: ["bean name", "coffee name", "\u8C46\u5B50\u540D\u79F0", "\u8C46\u540D", "\u54C1\u540D"],
    roaster: ["roaster", "roastery", "roasted by", "\u70D8\u7119\u5546", "\u70D8\u8C46\u5546", "\u70D8\u7119\u5E97"],
    farm: ["producer", "farm", "estate", "\u5E84\u56ED", "\u5904\u7406\u7AD9", "\u751F\u4EA7\u8005"],
    origin: ["origin", "region", "\u4EA7\u533A", "\u56FD\u5BB6", "\u6765\u6E90"],
    variety: ["variety", "cultivar", "\u54C1\u79CD"],
    process: ["process", "processing", "\u5904\u7406\u65B9\u5F0F", "\u5904\u7406\u6CD5"],
    roastDate: ["roast date", "roasted on", "\u70D8\u7119\u65E5\u671F", "\u70D8\u7119\u65F6\u95F4"],
    roastLevel: ["roast level", "\u7119\u5EA6", "\u70D8\u7119\u5EA6"],
    flavorFocus: [
      "notes",
      "tasting notes",
      "flavor notes",
      "\u98CE\u5473",
      "\u98CE\u5473\u63CF\u8FF0",
      "\u98CE\u5473\u7B14\u8BB0"
    ]
  };
  var GENERIC_PHOTO_LABEL_PATTERNS = [
    /^image$/i,
    /^img[_ -]?\d+$/i,
    /^pxl[_ -]?\d+/i,
    /^photo$/i,
    /^scan$/i,
    /^wx_camera/i
  ];
  function compactText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function normalizeLine(line) {
    return compactText(
      String(line || "").replace(/[|｜]/g, "I").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[，]/g, ", ").replace(/[；]/g, "; ").replace(/[、]/g, "\u3001").replace(/\s*[:：]\s*/g, " : ")
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
    const normalized = nextValue.replace(/[年/.]/g, "-").replace(/月/g, "-").replace(/日/g, "").replace(/--+/g, "-");
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
    return normalizeDisplayValue((regionMatch == null ? void 0 : regionMatch[1]) || "");
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
    if (tokens.length >= 4 && singleCharacterTokenCount >= 3 && singleCharacterTokenCount >= Math.ceil(tokens.length / 2)) {
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
    return new RegExp(`^(?:${labels.map(escapeRegExp).join("|")})\\s*[:\uFF1A]\\s*(.+)$`, "i");
  }
  function findLineValue(lines, labels) {
    const regex = buildLabelRegex(labels);
    for (const line of lines) {
      const match = line.match(regex);
      if (match == null ? void 0 : match[1]) {
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
    return lines.find((line) => {
      if (!line) {
        return false;
      }
      return !excludePatterns.some((pattern) => pattern.test(line));
    }) || "";
  }
  function pickBeanName(lines) {
    const labeledName = findLineValue(lines, FIELD_LABELS.name) || findValueFromAdjacentLine(lines, FIELD_LABELS.name);
    if (labeledName) {
      return normalizeDisplayValue(labeledName);
    }
    const varietyLine = lines.find(
      (line) => VARIETY_TOKENS.some((token) => line.toLowerCase().includes(token))
    );
    if (varietyLine) {
      return normalizeDisplayValue(varietyLine);
    }
    return normalizeDisplayValue(
      findFirstMeaningfulLine(lines.slice(1), [
        buildLabelRegex(FIELD_LABELS.origin),
        buildLabelRegex(FIELD_LABELS.process),
        buildLabelRegex(FIELD_LABELS.variety),
        buildLabelRegex(FIELD_LABELS.roastDate)
      ])
    );
  }
  function pickRoaster(lines) {
    const labeledRoaster = findLineValue(lines, FIELD_LABELS.roaster) || findValueFromAdjacentLine(lines, FIELD_LABELS.roaster);
    if (labeledRoaster) {
      return normalizeDisplayValue(labeledRoaster);
    }
    return normalizeDisplayValue(lines[0] || "");
  }
  function pickOrigin(lines, normalizedText) {
    const labeledOrigin = findLineValue(lines, FIELD_LABELS.origin) || findValueFromAdjacentLine(lines, FIELD_LABELS.origin);
    if (labeledOrigin) {
      return normalizeDisplayValue(labeledOrigin);
    }
    const fallbackLine = lines.find(
      (line) => ORIGIN_TOKENS.some((token) => line.toLowerCase().includes(token.toLowerCase()))
    );
    if (fallbackLine) {
      return normalizeDisplayValue(fallbackLine);
    }
    const originMatch = normalizedText.match(
      /(Huila,\s*Colombia|Yirgacheffe,\s*Ethiopia|Panama|Colombia|Ethiopia|Kenya|Guatemala)/i
    );
    return normalizeDisplayValue((originMatch == null ? void 0 : originMatch[1]) || "");
  }
  function pickFlavorFocus(lines, normalizedText) {
    const labeledFlavor = findLineValue(lines, FIELD_LABELS.flavorFocus) || findValueFromAdjacentLine(lines, FIELD_LABELS.flavorFocus);
    if (labeledFlavor) {
      return compactText(labeledFlavor);
    }
    return inferFlavorFocus(normalizedText);
  }
  function normalizeOcrText(text) {
    const seen = /* @__PURE__ */ new Set();
    const lines = String(text || "").replace(/\r/g, "").split("\n").map(normalizeLine).filter(Boolean).filter((line) => {
      const key = line.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    return lines.join("\n");
  }
  function inferPhotoLabel(file) {
    return file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  }
  function classifyPhotoAnalysisFailure(message) {
    const nextMessage = compactText(message);
    if (!nextMessage) {
      return "unknown";
    }
    if (/OPENAI_API_KEY|未配置|大模型图片识别|无法使用大模型/u.test(nextMessage)) {
      return "model_unavailable";
    }
    return "unknown";
  }
  function mergeDetectedBean(base, override) {
    const nextBase = base || {};
    const nextOverride = override || {};
    return {
      name: compactText(nextOverride.name) || compactText(nextBase.name),
      roaster: compactText(nextOverride.roaster) || compactText(nextBase.roaster),
      farm: compactText(nextOverride.farm) || compactText(nextBase.farm),
      origin: compactText(nextOverride.origin) || compactText(nextBase.origin),
      variety: compactText(nextOverride.variety) || compactText(nextBase.variety),
      process: compactText(nextOverride.process) || compactText(nextBase.process),
      roastLevel: compactText(nextOverride.roastLevel) || compactText(nextBase.roastLevel),
      flavorFocus: compactText(nextOverride.flavorFocus) || compactText(nextBase.flavorFocus),
      roastDate: compactText(nextOverride.roastDate) || compactText(nextBase.roastDate)
    };
  }
  function extractBeanDetailsFromText(text) {
    const normalized = normalizeOcrText(text);
    const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
    return {
      name: sanitizeRecognizedField("name", pickBeanName(lines)),
      roaster: sanitizeRecognizedField("roaster", pickRoaster(lines)),
      farm: sanitizeRecognizedField(
        "farm",
        normalizeDisplayValue(
          findLineValue(lines, FIELD_LABELS.farm) || findValueFromAdjacentLine(lines, FIELD_LABELS.farm)
        )
      ),
      origin: sanitizeRecognizedField("origin", pickOrigin(lines, normalized)),
      variety: sanitizeRecognizedField(
        "variety",
        normalizeDisplayValue(
          findLineValue(lines, FIELD_LABELS.variety) || findValueFromAdjacentLine(lines, FIELD_LABELS.variety)
        )
      ),
      process: sanitizeRecognizedField(
        "process",
        normalizeProcess(
          findLineValue(lines, FIELD_LABELS.process) || findValueFromAdjacentLine(lines, FIELD_LABELS.process)
        )
      ),
      roastLevel: sanitizeRecognizedField(
        "roastLevel",
        normalizeRoastLevel(
          findLineValue(lines, FIELD_LABELS.roastLevel) || findValueFromAdjacentLine(lines, FIELD_LABELS.roastLevel) || normalized
        )
      ),
      flavorFocus: sanitizeRecognizedField(
        "flavorFocus",
        pickFlavorFocus(lines, normalized)
      ),
      roastDate: sanitizeRecognizedField(
        "roastDate",
        normalizeDate(
          findLineValue(lines, FIELD_LABELS.roastDate) || findValueFromAdjacentLine(lines, FIELD_LABELS.roastDate) || normalized
        )
      )
    };
  }
  function inferBeanFromPhoto(file) {
    const label = inferPhotoLabel(file);
    const lower = label.toLowerCase();
    const process = normalizeProcess(lower.includes("natural") ? "natural" : "washed");
    const roastLevel = normalizeRoastLevel(lower.includes("medium") ? "medium" : "light");
    const varietyToken = VARIETY_TOKENS.find((token) => lower.includes(token)) || "";
    const cleanedLabel = label.replace(/\bwashed\b|\bnatural\b|\bmedium\b|\blight\b/gi, "").trim();
    const hasGenericLabel = GENERIC_PHOTO_LABEL_PATTERNS.some(
      (pattern) => pattern.test(cleanedLabel || label)
    );
    const name = varietyToken ? normalizeDisplayValue(cleanedLabel || varietyToken) : hasGenericLabel ? "" : normalizeDisplayValue(cleanedLabel || label);
    const origin = lower.includes("colombia") ? "Huila, Colombia" : lower.includes("ethiopia") ? "Yirgacheffe, Ethiopia" : lower.includes("panama") ? "Panama" : "";
    const farm = lower.includes("flores") ? "Las Flores" : "";
    return {
      name,
      roaster: "",
      farm,
      origin,
      variety: varietyToken ? normalizeDisplayValue(varietyToken) : "",
      process,
      roastLevel,
      flavorFocus: process === "Natural" ? "Berry sweetness, cacao, round finish" : "Floral lift, citrus, clean sweetness",
      roastDate: ""
    };
  }

  // src/equipment-store.js
  var EQUIPMENT_STORAGE_KEY = "pourover-journal-equipment-profiles";
  function withTrimmedFallback(value, fallback) {
    const trimmed = value == null ? void 0 : value.trim();
    return trimmed && trimmed.length > 0 ? trimmed : fallback;
  }
  function buildEquipmentProfile(input) {
    return {
      id: input.id,
      name: withTrimmedFallback(input.name, "\u672A\u547D\u540D\u7EC4\u5408"),
      dripper: withTrimmedFallback(input.dripper, "HARIO V60 02"),
      grinder: withTrimmedFallback(input.grinder, "Comandante C40"),
      filters: withTrimmedFallback(input.filters, "CAFEC Abaca 02")
    };
  }
  function initializeEquipmentState(serializedValue, defaults) {
    const defaultProfile = buildEquipmentProfile({
      id: "profile-1",
      name: "\u65E5\u5E38\u7EC4\u5408",
      dripper: defaults.dripper,
      grinder: defaults.grinder,
      filters: defaults.filters
    });
    if (!serializedValue) {
      return {
        activeProfileId: defaultProfile.id,
        profiles: [defaultProfile]
      };
    }
    try {
      const parsed = JSON.parse(serializedValue);
      if (Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
        return {
          activeProfileId: parsed.activeProfileId || parsed.profiles[0].id,
          profiles: parsed.profiles.map((profile) => buildEquipmentProfile(profile))
        };
      }
      return {
        activeProfileId: defaultProfile.id,
        profiles: [
          buildEquipmentProfile({
            id: defaultProfile.id,
            name: "\u65E5\u5E38\u7EC4\u5408",
            dripper: parsed.dripper || defaults.dripper,
            grinder: parsed.grinder || defaults.grinder,
            filters: parsed.filters || defaults.filters
          })
        ]
      };
    } catch {
      return {
        activeProfileId: defaultProfile.id,
        profiles: [defaultProfile]
      };
    }
  }
  function updateEquipmentProfile(state2, nextProfile) {
    return {
      ...state2,
      profiles: state2.profiles.map(
        (profile) => profile.id === nextProfile.id ? buildEquipmentProfile(nextProfile) : profile
      )
    };
  }
  function setActiveEquipmentProfile(state2, profileId) {
    return {
      ...state2,
      activeProfileId: profileId
    };
  }
  function removeEquipmentProfile(state2, profileId) {
    const remainingProfiles = state2.profiles.filter(
      (profile) => profile.id !== profileId
    );
    if (remainingProfiles.length === 0) {
      return state2;
    }
    return {
      activeProfileId: state2.activeProfileId === profileId ? remainingProfiles[0].id : state2.activeProfileId,
      profiles: remainingProfiles
    };
  }

  // src/equipment-catalog.js
  var CUSTOM_OPTION = "__custom__";
  var equipmentCatalog = {
    dripper: [
      "HARIO V60 02",
      "Kalita Wave 185",
      "ORIGAMI Dripper M",
      "HARIO Mugen",
      "April Plastic Brewer",
      "Orea V3"
    ],
    grinder: [
      "Comandante C40",
      "1Zpresso ZP6 Special",
      "TIMEMORE Chestnut C3",
      "Lagom Mini",
      "Baratza Encore ESP",
      "Fellow Ode Gen 2"
    ],
    filters: [
      "HARIO V60 Paper Filter 02",
      "CAFEC Abaca 02",
      "CAFEC T-90 02",
      "Kalita Wave 185 Filter",
      "ORIGAMI Cone Filter",
      "April Flatbed Filter"
    ]
  };

  // src/bean-inventory.js
  var BEAN_INVENTORY_STORAGE_KEY = "pourover-journal-bean-inventory";
  function clampNumber(value, fallback) {
    if (value === "" || value === null || value === void 0) {
      return fallback;
    }
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : fallback;
  }
  function withTrimmedFallback2(value, fallback) {
    const trimmed = String(value != null ? value : "").trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  function buildBeanProfile(input) {
    const totalWeight = clampNumber(input.totalWeight, 250);
    const currentWeight = clampNumber(input.currentWeight, totalWeight);
    return {
      id: input.id,
      name: withTrimmedFallback2(input.name, "\u672A\u547D\u540D\u8C46\u5B50"),
      roaster: withTrimmedFallback2(input.roaster, ""),
      farm: withTrimmedFallback2(input.farm, ""),
      origin: withTrimmedFallback2(input.origin, ""),
      variety: withTrimmedFallback2(input.variety, ""),
      process: withTrimmedFallback2(input.process, ""),
      roastLevel: withTrimmedFallback2(input.roastLevel, ""),
      roastDate: withTrimmedFallback2(
        input.roastDate,
        (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
      ),
      openedDate: withTrimmedFallback2(input.openedDate, ""),
      restStartDay: clampNumber(input.restStartDay, 7),
      restEndDay: clampNumber(input.restEndDay, 21),
      totalWeight,
      currentWeight,
      lowStockThreshold: clampNumber(input.lowStockThreshold, 30),
      photoDataUrl: withTrimmedFallback2(input.photoDataUrl, "")
    };
  }
  function initializeBeanInventoryState(serializedValue) {
    var _a;
    if (!serializedValue) {
      return {
        activeBeanId: "",
        beans: []
      };
    }
    try {
      const parsed = JSON.parse(serializedValue);
      if (Array.isArray(parsed.beans)) {
        const beans = parsed.beans.map((bean) => buildBeanProfile(bean));
        return {
          activeBeanId: parsed.activeBeanId || ((_a = beans[0]) == null ? void 0 : _a.id) || "",
          beans
        };
      }
    } catch {
      return {
        activeBeanId: "",
        beans: []
      };
    }
    return {
      activeBeanId: "",
      beans: []
    };
  }
  function calculateRestDay(roastDate, now = /* @__PURE__ */ new Date()) {
    const roast = /* @__PURE__ */ new Date(`${roastDate}T00:00:00+08:00`);
    const current = new Date(now);
    const diff = current.getTime() - roast.getTime();
    return Math.max(0, Math.floor(diff / (1e3 * 60 * 60 * 24)));
  }
  function getBeanInventoryStatus(bean, now = /* @__PURE__ */ new Date()) {
    const restDay = calculateRestDay(bean.roastDate, now);
    const readiness = restDay < bean.restStartDay ? "resting" : restDay <= bean.restEndDay ? "ready" : "past_peak";
    return {
      restDay,
      readiness,
      isLowStock: bean.currentWeight <= bean.lowStockThreshold
    };
  }
  function updateBeanProfile(state2, nextBean) {
    const built = buildBeanProfile(nextBean);
    const exists = state2.beans.some((bean) => bean.id === built.id);
    return {
      activeBeanId: state2.activeBeanId || built.id,
      beans: exists ? state2.beans.map((bean) => bean.id === built.id ? built : bean) : [...state2.beans, built]
    };
  }
  function removeBeanProfile(state2, beanId) {
    var _a;
    const beans = state2.beans.filter((bean) => bean.id !== beanId);
    return {
      activeBeanId: state2.activeBeanId === beanId ? ((_a = beans[0]) == null ? void 0 : _a.id) || "" : state2.activeBeanId,
      beans
    };
  }
  function setActiveBeanProfile(state2, beanId) {
    return {
      ...state2,
      activeBeanId: beanId
    };
  }
  function deductBeanStock(state2, beanId, dose) {
    const nextDose = clampNumber(dose, 0);
    return {
      ...state2,
      beans: state2.beans.map(
        (bean) => bean.id === beanId ? {
          ...bean,
          currentWeight: Math.max(0, bean.currentWeight - nextDose)
        } : bean
      )
    };
  }
  function applyBrewInventoryChange(state2, previousBrew, nextBrew) {
    let nextState = {
      ...state2,
      beans: [...state2.beans]
    };
    if ((previousBrew == null ? void 0 : previousBrew.beanId) && (previousBrew == null ? void 0 : previousBrew.dose) > 0) {
      nextState = {
        ...nextState,
        beans: nextState.beans.map(
          (bean) => bean.id === previousBrew.beanId ? {
            ...bean,
            currentWeight: bean.currentWeight + clampNumber(previousBrew.dose, 0)
          } : bean
        )
      };
    }
    if ((nextBrew == null ? void 0 : nextBrew.beanId) && (nextBrew == null ? void 0 : nextBrew.dose) > 0) {
      nextState = deductBeanStock(nextState, nextBrew.beanId, nextBrew.dose);
    }
    return nextState;
  }

  // src/data-backup.js
  var BACKUP_SCHEMA = "pourover-journal-backup";
  var BACKUP_VERSION = 1;
  function buildBackupPayload({
    brews,
    equipmentState,
    beanInventoryState,
    createdAt = (/* @__PURE__ */ new Date()).toISOString()
  }) {
    return {
      schema: BACKUP_SCHEMA,
      version: BACKUP_VERSION,
      createdAt,
      data: {
        brews,
        equipmentState,
        beanInventoryState
      }
    };
  }
  function buildBackupFilename(isoLikeDate = (/* @__PURE__ */ new Date()).toISOString()) {
    const day = new Date(isoLikeDate).toISOString().slice(0, 10);
    return `pourover-journal-backup-${day}.json`;
  }
  function restoreBackupPayload(serializedValue) {
    let parsed;
    try {
      parsed = JSON.parse(serializedValue);
    } catch {
      throw new Error("Invalid backup: unable to parse JSON.");
    }
    if (!parsed || parsed.schema !== BACKUP_SCHEMA || !parsed.data || typeof parsed.data !== "object") {
      throw new Error("Invalid backup: unexpected backup format.");
    }
    return {
      brews: initializeBrews(JSON.stringify(parsed.data.brews || []), []),
      equipmentState: initializeEquipmentState(
        JSON.stringify(parsed.data.equipmentState || {}),
        equipmentProfile
      ),
      beanInventoryState: initializeBeanInventoryState(
        JSON.stringify(parsed.data.beanInventoryState || {})
      )
    };
  }

  // app.js
  var views = [...document.querySelectorAll("[data-view]")];
  var viewButtons = [...document.querySelectorAll("[data-view-target]")];
  var navButtons = [...document.querySelectorAll("[data-nav-tab='true']")];
  var brewForm = document.querySelector("#brew-form");
  var brewDetail = document.querySelector("#brew-detail");
  var saveFeedback = document.querySelector("#save-feedback");
  var equipmentForm = document.querySelector("#equipment-form");
  var equipmentFeedback = document.querySelector("#equipment-feedback");
  var equipmentListFeedback = document.querySelector("#equipment-list-feedback");
  var equipmentNameInput = document.querySelector("#equipment-name");
  var exportBackupButton = document.querySelector("#export-backup");
  var importBackupInput = document.querySelector("#import-backup");
  var backupFeedback = document.querySelector("#backup-feedback");
  var beanInventoryForm = document.querySelector("#bean-inventory-form");
  var beanInventoryFeedback = document.querySelector("#bean-inventory-feedback");
  var beanInventoryListFeedback = document.querySelector("#bean-inventory-list-feedback");
  var beanInventoryList = document.querySelector("#bean-inventory-list");
  var saveBeanButton = document.querySelector("#save-bean");
  var inventoryPhotoUpload = document.querySelector("#inventory-photo-upload");
  var inventoryPhotoPreview = document.querySelector("#inventory-photo-preview");
  var inventoryPhotoPreviewFrame = document.querySelector("#inventory-photo-preview-frame");
  var inventoryPhotoTitle = document.querySelector("#inventory-photo-title");
  var inventoryPhotoMeta = document.querySelector("#inventory-photo-meta");
  var photoUpload = document.querySelector("#photo-upload");
  var photoPreview = document.querySelector("#photo-preview");
  var photoPreviewFrame = document.querySelector("#photo-preview-frame");
  var photoAssistPanel = document.querySelector("#photo-assist-panel");
  var ocrStatus = document.querySelector("#ocr-status");
  var equipmentProfileList = document.querySelector("#equipment-profile-list");
  var brewBeanSelect = document.querySelector("#brew-bean-id");
  var brewEquipmentProfileSelect = document.querySelector("#brew-equipment-profile");
  var brewBeanStatusCard = document.querySelector("#brew-bean-status-card");
  var brewBeanStatusTitle = document.querySelector("#brew-bean-status-title");
  var brewBeanStatusMeta = document.querySelector("#brew-bean-status-meta");
  var brewBeanStatusCopy = document.querySelector("#brew-bean-status-copy");
  var assistFields = {
    name: document.querySelector("#assist-bean-name"),
    roaster: document.querySelector("#assist-roaster"),
    farm: document.querySelector("#assist-farm"),
    origin: document.querySelector("#assist-origin"),
    variety: document.querySelector("#assist-variety"),
    process: document.querySelector("#assist-process"),
    roastDate: document.querySelector("#assist-roast-date"),
    flavorFocus: document.querySelector("#assist-flavor-focus")
  };
  var inventoryAssistFields = {
    roaster: document.querySelector("#inventory-assist-roaster"),
    farm: document.querySelector("#inventory-assist-farm"),
    origin: document.querySelector("#inventory-assist-origin"),
    variety: document.querySelector("#inventory-assist-variety"),
    process: document.querySelector("#inventory-assist-process"),
    roastDate: document.querySelector("#inventory-assist-roast-date"),
    flavorFocus: document.querySelector("#inventory-assist-flavor-focus")
  };
  var equipmentFields = [
    "dripper",
    "grinder",
    "filters"
  ];
  var legacyDripperOptions = ["V60", "Kalita Wave", "Origami Air S"];
  var url = new URL(window.location.href);
  if (url.searchParams.get("reset-brews") === "1") {
    localStorage.setItem(BREW_STORAGE_KEY, "[]");
    url.searchParams.delete("reset-brews");
    window.history.replaceState({}, "", url.toString());
  }
  if (url.searchParams.get("reset-all") === "1") {
    localStorage.setItem(BREW_STORAGE_KEY, "[]");
    localStorage.removeItem(EQUIPMENT_STORAGE_KEY);
    localStorage.removeItem(BEAN_INVENTORY_STORAGE_KEY);
    url.searchParams.delete("reset-all");
    window.history.replaceState({}, "", url.toString());
  }
  var state = {
    brews: initializeBrews(localStorage.getItem(BREW_STORAGE_KEY), []),
    equipmentState: initializeEquipmentState(
      localStorage.getItem(EQUIPMENT_STORAGE_KEY),
      equipmentProfile
    ),
    beanInventoryState: initializeBeanInventoryState(
      localStorage.getItem(BEAN_INVENTORY_STORAGE_KEY)
    ),
    selectedEquipmentProfileId: "profile-1",
    selectedInventoryBeanId: "",
    filters: {
      beanQuery: "",
      dripper: "all",
      minRating: 0
    },
    activeBean: createEmptyBeanDetails(),
    assistBean: createEmptyBeanDetails(),
    hoveredBrewId: null,
    selectedBrewId: null,
    editingBrewId: null,
    previewUrl: "",
    inventoryPreviewUrl: "",
    inventoryPhotoDataUrl: ""
  };
  var ocrWorkerCache = /* @__PURE__ */ new Map();
  function reportBootError(error, stage = "unknown") {
    const message = error instanceof Error ? error.message : String(error);
    window.__appBootError = { stage, message };
    console.error("[app boot error]", stage, error);
    const banner = document.querySelector("#boot-error-banner");
    if (banner) {
      banner.hidden = false;
      banner.textContent = `\u9875\u9762\u542F\u52A8\u5931\u8D25\uFF1A${stage} \xB7 ${message}`;
    }
  }
  function compactText2(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
  function displayText(value, fallback = "-") {
    const nextValue = compactText2(value);
    return nextValue || fallback;
  }
  function createEmptyBeanDetails() {
    return {
      name: "",
      roaster: "",
      farm: "",
      origin: "",
      variety: "",
      process: "",
      roastLevel: "",
      flavorFocus: "",
      roastDate: ""
    };
  }
  function readInventoryBeanFormDetails() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return {
      name: ((_a = document.querySelector("#inventory-bean-name")) == null ? void 0 : _a.value) || "",
      roaster: ((_b = document.querySelector("#inventory-roaster")) == null ? void 0 : _b.value) || "",
      farm: ((_c = document.querySelector("#inventory-farm")) == null ? void 0 : _c.value) || "",
      origin: ((_d = document.querySelector("#inventory-origin")) == null ? void 0 : _d.value) || "",
      variety: ((_e = document.querySelector("#inventory-variety")) == null ? void 0 : _e.value) || "",
      process: ((_f = document.querySelector("#inventory-process")) == null ? void 0 : _f.value) || "",
      roastLevel: ((_g = document.querySelector("#inventory-roast-level")) == null ? void 0 : _g.value) || "",
      roastDate: ((_h = document.querySelector("#inventory-roast-date")) == null ? void 0 : _h.value) || "",
      flavorFocus: ""
    };
  }
  function renderInventoryPhotoSummary(details = createEmptyBeanDetails()) {
    inventoryPhotoTitle.textContent = compactText2(details.name) || "\u5F85\u8BC6\u522B";
    inventoryPhotoMeta.textContent = [
      compactText2(details.roaster),
      compactText2(details.origin),
      compactText2(details.roastDate) ? `\u70D8\u7119 ${compactText2(details.roastDate)}` : ""
    ].filter(Boolean).join(" \xB7 ");
    inventoryAssistFields.roaster.textContent = displayText(details.roaster, "\u2014");
    inventoryAssistFields.farm.textContent = displayText(details.farm, "\u2014");
    inventoryAssistFields.origin.textContent = displayText(details.origin, "\u2014");
    inventoryAssistFields.variety.textContent = displayText(details.variety, "\u2014");
    inventoryAssistFields.process.textContent = displayText(details.process, "\u2014");
    inventoryAssistFields.roastDate.textContent = displayText(details.roastDate, "\u2014");
    inventoryAssistFields.flavorFocus.textContent = displayText(
      details.flavorFocus,
      "\u2014"
    );
  }
  function setPhotoPreviewVisibility(previewElement, frameElement, hasImage) {
    previewElement.classList.toggle("has-image", hasImage);
    frameElement.classList.toggle("is-empty", !hasImage);
  }
  function truncateText(value, maxLength) {
    const nextValue = compactText2(value);
    if (!nextValue) {
      return "";
    }
    if (nextValue.length <= maxLength) {
      return nextValue;
    }
    return `${nextValue.slice(0, maxLength - 1).trimEnd()}\u2026`;
  }
  function setBrewDetailVisibility(isVisible) {
    var _a;
    brewDetail.classList.toggle("is-hidden", !isVisible);
    brewDetail.toggleAttribute("hidden", !isVisible);
    (_a = document.querySelector(".brews-shell")) == null ? void 0 : _a.classList.toggle("is-single-column", !isVisible);
  }
  function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  async function getOcrWorker(language) {
    var _a;
    if (!((_a = globalThis.Tesseract) == null ? void 0 : _a.createWorker)) {
      return null;
    }
    if (!ocrWorkerCache.has(language)) {
      ocrWorkerCache.set(language, globalThis.Tesseract.createWorker(language));
    }
    return ocrWorkerCache.get(language);
  }
  async function loadImageBitmapFromFile(file) {
    if (globalThis.createImageBitmap) {
      return await globalThis.createImageBitmap(file);
    }
    const dataUrl = await fileToDataUrl(file);
    const image = await new Promise((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = reject;
      nextImage.src = dataUrl;
    });
    return image;
  }
  async function preprocessImageForOcr(file) {
    const source = await loadImageBitmapFromFile(file);
    const maxWidth = 1800;
    const scale = source.width > maxWidth ? maxWidth / source.width : 1;
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", {
      willReadFrequently: true
    });
    if (!context) {
      return file;
    }
    canvas.width = width;
    canvas.height = height;
    context.drawImage(source, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let min = 255;
    let max = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const luminance = Math.round(
        pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114
      );
      min = Math.min(min, luminance);
      max = Math.max(max, luminance);
      pixels[index] = luminance;
      pixels[index + 1] = luminance;
      pixels[index + 2] = luminance;
    }
    const spread = Math.max(1, max - min);
    const threshold = min + spread * 0.62;
    for (let index = 0; index < pixels.length; index += 4) {
      const contrasted = (pixels[index] - min) / spread * 255;
      const nextValue = contrasted > threshold ? 255 : 0;
      pixels[index] = nextValue;
      pixels[index + 1] = nextValue;
      pixels[index + 2] = nextValue;
    }
    context.putImageData(imageData, 0, 0);
    return await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        "image/png",
        1
      );
    });
  }
  async function recognizePhotoText(file) {
    var _a, _b, _c;
    const [processedImage, englishWorker, chineseWorker] = await Promise.all([
      preprocessImageForOcr(file),
      getOcrWorker("eng"),
      getOcrWorker("chi_sim")
    ]);
    const textParts = [];
    if (englishWorker) {
      const originalResult = await englishWorker.recognize(file);
      const processedResult = await englishWorker.recognize(processedImage);
      textParts.push(((_a = originalResult == null ? void 0 : originalResult.data) == null ? void 0 : _a.text) || "", ((_b = processedResult == null ? void 0 : processedResult.data) == null ? void 0 : _b.text) || "");
    }
    if (chineseWorker) {
      const chineseResult = await chineseWorker.recognize(processedImage);
      textParts.push(((_c = chineseResult == null ? void 0 : chineseResult.data) == null ? void 0 : _c.text) || "");
    }
    return textParts.map((value) => String(value || "").trim()).filter(Boolean).join("\n");
  }
  async function analyzePhotoWithModel(file, mode) {
    const imageDataUrl = await fileToDataUrl(file);
    const response = await fetch("/api/photo-analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imageDataUrl,
        mode
      })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "\u6A21\u578B\u8BC6\u522B\u6682\u65F6\u4E0D\u53EF\u7528");
    }
    return await response.json();
  }
  function getActiveEquipmentProfile() {
    return state.equipmentState.profiles.find(
      (profile) => profile.id === state.equipmentState.activeProfileId
    ) || state.equipmentState.profiles[0];
  }
  function getSelectedEquipmentProfile() {
    return state.equipmentState.profiles.find(
      (profile) => profile.id === state.selectedEquipmentProfileId
    ) || null;
  }
  function getEquipmentProfileById(profileId) {
    return state.equipmentState.profiles.find((profile) => profile.id === profileId) || null;
  }
  function getBrewEquipmentProfile(profileId = brewEquipmentProfileSelect == null ? void 0 : brewEquipmentProfileSelect.value) {
    return getEquipmentProfileById(profileId);
  }
  function getActiveInventoryBean() {
    return state.beanInventoryState.beans.find(
      (bean) => bean.id === state.beanInventoryState.activeBeanId
    ) || state.beanInventoryState.beans[0] || null;
  }
  function getSelectedInventoryBean() {
    return state.beanInventoryState.beans.find(
      (bean) => bean.id === state.selectedInventoryBeanId
    ) || null;
  }
  function getInventoryStatusCopy(readiness) {
    if (readiness === "resting") {
      return "\u518D\u7B49\u7B49";
    }
    if (readiness === "ready") {
      return "\u73B0\u5728\u9002\u5408\u51B2";
    }
    return "\u7A97\u53E3\u540E\u6BB5";
  }
  function beanProfileToActiveBean(bean) {
    return {
      name: bean.name,
      roaster: bean.roaster || "",
      farm: bean.farm || "",
      origin: bean.origin || "",
      variety: bean.variety || "",
      process: bean.process || "Washed",
      roastLevel: bean.roastLevel || "Light",
      flavorFocus: "clean sweetness",
      roastDate: bean.roastDate
    };
  }
  function getLinkedBeanForBrewForm(beanId = brewBeanSelect.value) {
    const targetId = beanId || "";
    if (!targetId) {
      return null;
    }
    return state.beanInventoryState.beans.find((bean) => bean.id === targetId) || null;
  }
  function applyBeanDetailsToBrewForm(details) {
    document.querySelector("#brew-bean").value = details.name || "";
    document.querySelector("#brew-roaster").value = details.roaster || "";
    document.querySelector("#brew-farm").value = details.farm || "";
    document.querySelector("#brew-origin").value = details.origin || "";
    document.querySelector("#brew-variety").value = details.variety || "";
    document.querySelector("#brew-process").value = details.process || "";
    document.querySelector("#brew-roast-level").value = details.roastLevel || "";
    document.querySelector("#brew-roast-date").value = details.roastDate || "";
  }
  function clearBrewEquipmentForm() {
    document.querySelector("#brew-dripper").value = "";
    document.querySelector("#brew-grinder").value = "";
    document.querySelector("#brew-filters").value = "";
  }
  function applyEquipmentProfileToBrewForm(profile) {
    if (!profile) {
      clearBrewEquipmentForm();
      return;
    }
    document.querySelector("#brew-dripper").value = profile.dripper || "";
    document.querySelector("#brew-grinder").value = profile.grinder || "";
    document.querySelector("#brew-filters").value = profile.filters || "";
  }
  function renderBrewInlineExperience() {
    var _a;
    const linkedBean = state.beanInventoryState.beans.find(
      (bean) => bean.id === brewBeanSelect.value
    );
    const currentDose = Number((_a = document.querySelector("#brew-dose")) == null ? void 0 : _a.value) || 0;
    if (linkedBean) {
      brewBeanStatusCard.hidden = false;
      const status = getBeanInventoryStatus(linkedBean);
      brewBeanStatusTitle.textContent = `\u5DF2\u5173\u8054 ${linkedBean.name}`;
      brewBeanStatusMeta.textContent = formatBeanInventoryStatusLine({
        restDay: status.restDay,
        readiness: status.readiness,
        currentWeight: linkedBean.currentWeight,
        isLowStock: status.isLowStock
      });
      brewBeanStatusCopy.textContent = formatInventoryDeductionPreview({
        beanName: linkedBean.name,
        currentWeight: linkedBean.currentWeight,
        dose: currentDose
      });
    } else {
      brewBeanStatusCard.hidden = true;
      brewBeanStatusTitle.textContent = "";
      brewBeanStatusMeta.textContent = "";
      brewBeanStatusCopy.textContent = "";
    }
  }
  function isBrewFormPristine() {
    return ![
      "#brew-bean",
      "#brew-roaster",
      "#brew-farm",
      "#brew-origin",
      "#brew-variety",
      "#brew-process",
      "#brew-roast-level",
      "#brew-roast-date",
      "#brew-grinder",
      "#brew-filters",
      "#brew-grind",
      "#brew-ratio",
      "#brew-temp",
      "#brew-pours",
      "#brew-notes"
    ].some((selector) => compactText2(document.querySelector(selector).value));
  }
  function setView(nextView) {
    views.forEach((view) => {
      view.classList.toggle("is-visible", view.dataset.view === nextView);
    });
    navButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.viewTarget === nextView);
    });
    if (nextView === "brew" && !state.editingBrewId && isBrewFormPristine()) {
      prefillBrewForm();
    }
    if (nextView === "inventory") {
      renderBeanInventoryProfiles();
    }
    if (nextView === "bean-editor") {
      renderBeanInventoryEditor();
    }
    if (nextView === "equipment") {
      renderEquipmentProfiles();
    }
    if (nextView === "equipment-editor") {
      renderEquipmentEditor();
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
  function renderHomeDashboard() {
    document.querySelector("#hero-today-date").textContent = formatHeroDate(
      (/* @__PURE__ */ new Date()).toISOString()
    );
    document.querySelector("#hero-brew-count").textContent = String(state.brews.length);
    document.querySelector("#hero-bean-count").textContent = String(
      state.beanInventoryState.beans.length
    );
  }
  function renderEquipmentEditor() {
    const selectedProfile = getSelectedEquipmentProfile();
    const baseProfile = selectedProfile || getActiveEquipmentProfile();
    const isEditing = Boolean(selectedProfile);
    equipmentNameInput.value = (selectedProfile == null ? void 0 : selectedProfile.name) || "";
    equipmentFields.forEach((field) => {
      const select = document.querySelector(`#equipment-${field}`);
      const customInput = document.querySelector(`#equipment-${field}-custom`);
      const value = (selectedProfile == null ? void 0 : selectedProfile[field]) || baseProfile[field];
      const options = equipmentCatalog[field];
      const isPreset = options.includes(value);
      select.value = isPreset ? value : CUSTOM_OPTION;
      customInput.value = isPreset ? "" : value;
      customInput.classList.toggle("is-hidden", isPreset);
    });
    document.querySelector("#set-default-profile").disabled = !selectedProfile || selectedProfile.id === state.equipmentState.activeProfileId;
    document.querySelector("#delete-profile").disabled = !selectedProfile || state.equipmentState.profiles.length === 1;
    equipmentFeedback.textContent = isEditing ? "\u66F4\u65B0\u8FD9\u5957\u7EC4\u5408\u3002" : "\u4FDD\u5B58\u4E3A\u65B0\u7EC4\u5408\u3002";
    renderEquipmentEditorPreview();
  }
  function renderEquipmentEditorPreview() {
    const previewName = document.querySelector("#equipment-preview-name");
    const previewSpecs = document.querySelector("#equipment-preview-specs");
    const name = compactText2(equipmentNameInput.value) || "\u672A\u547D\u540D\u7EC4\u5408";
    const profile = {
      dripper: compactText2(readEquipmentField("dripper")) || "\u5F85\u9009\u6EE4\u676F",
      grinder: compactText2(readEquipmentField("grinder")) || "\u5F85\u9009\u7814\u78E8\u5668",
      filters: compactText2(readEquipmentField("filters")) || "\u5F85\u9009\u6EE4\u7EB8"
    };
    previewName.textContent = name;
    previewSpecs.innerHTML = getEquipmentProfileSpecs(profile).map(
      (spec) => `
        <div class="equipment-spec-row">
          <span class="equipment-spec-icon" aria-hidden="true">${renderEquipmentSpecIcon(
        spec.key
      )}</span>
          <span class="equipment-spec-copy">
            <span class="equipment-spec-label">${escapeHtml(spec.label)}</span>
            <strong>${escapeHtml(spec.value)}</strong>
          </span>
        </div>
      `
    ).join("");
  }
  function renderEquipmentProfiles() {
    equipmentProfileList.innerHTML = state.equipmentState.profiles.map((profile) => {
      const isSelected = profile.id === state.selectedEquipmentProfileId;
      const isDefault = profile.id === state.equipmentState.activeProfileId;
      const specs = getEquipmentProfileSpecs(profile).map(
        (spec) => `
            <div class="equipment-spec-row">
              <span class="equipment-spec-icon" aria-hidden="true">${renderEquipmentSpecIcon(
          spec.key
        )}</span>
              <span class="equipment-spec-copy">
                <span class="equipment-spec-label">${escapeHtml(spec.label)}</span>
                <strong>${escapeHtml(spec.value)}</strong>
              </span>
            </div>
          `
      ).join("");
      return `
        <article class="equipment-profile-item equipment-profile-card ${isSelected ? "is-selected" : ""}" data-profile-id="${profile.id}">
          <div class="inventory-bean-title-row">
            <div class="equipment-profile-copy">
              <strong>${escapeHtml(profile.name)}</strong>
              <p class="equipment-profile-meta">${escapeHtml(
        isDefault ? "\u9ED8\u8BA4\u7EC4\u5408" : "\u5DF2\u4FDD\u5B58\u7EC4\u5408"
      )}</p>
            </div>
            <div class="brew-actions inventory-card-actions">
              <button class="icon-button inventory-icon-button" type="button" data-action="edit-profile" data-profile-id="${profile.id}" aria-label="\u7F16\u8F91\u8BBE\u5907\u7EC4\u5408">\u270D\uFE0F</button>
              <button class="icon-button inventory-icon-button" type="button" data-action="delete-profile-inline" data-profile-id="${profile.id}" aria-label="\u5220\u9664\u8BBE\u5907\u7EC4\u5408">\u{1F5D1}\uFE0F</button>
            </div>
          </div>
          <div class="equipment-spec-list">${specs}</div>
          <div class="inventory-chip-row">
            ${isDefault ? '<span class="inventory-chip inventory-chip--default">\u9ED8\u8BA4\u7EC4\u5408</span>' : '<span class="inventory-chip">\u53EF\u7F16\u8F91</span>'}
          </div>
        </article>
      `;
    }).join("");
  }
  function renderEquipmentSpecIcon(kind) {
    if (kind === "dripper") {
      return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 7h12l-4 6H10z"></path>
        <path d="M10 13h4l1.5 6h-7z"></path>
      </svg>
    `;
    }
    if (kind === "grinder") {
      return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 4v4"></path>
        <path d="M8 8h8l2 4-2 8H8l-2-8z"></path>
        <circle cx="12" cy="12" r="1.5"></circle>
      </svg>
    `;
    }
    return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 5h10"></path>
      <path d="M8 5l2 14h4l2-14"></path>
      <path d="M9.5 9.5h5"></path>
    </svg>
  `;
  }
  function renderInventorySummary() {
    const summaryCopy = document.querySelector("#inventory-summary-copy");
    const summaryStats = document.querySelector("#inventory-summary-stats");
    const summaryList = document.querySelector("#inventory-summary-list");
    const statuses = state.beanInventoryState.beans.map((bean) => ({
      bean,
      ...getBeanInventoryStatus(bean)
    }));
    if (statuses.length === 0) {
      summaryCopy.textContent = "";
      summaryStats.innerHTML = "";
      summaryList.innerHTML = "";
      return;
    }
    const readyCount = statuses.filter((status) => status.readiness === "ready").length;
    const restingCount = statuses.filter(
      (status) => status.readiness === "resting"
    ).length;
    const lowStockCount = statuses.filter((status) => status.isLowStock).length;
    summaryCopy.textContent = "";
    summaryStats.innerHTML = `
    <div><span>\u9002\u5408\u51B2</span><strong>${readyCount}</strong></div>
    <div><span>\u517B\u8C46\u4E2D</span><strong>${restingCount}</strong></div>
    <div><span>\u4F4E\u5E93\u5B58</span><strong>${lowStockCount}</strong></div>
  `;
    summaryList.innerHTML = statuses.slice().sort((left, right) => {
      if (left.isLowStock !== right.isLowStock) {
        return left.isLowStock ? -1 : 1;
      }
      if (left.readiness !== right.readiness) {
        return left.readiness === "ready" ? -1 : 1;
      }
      return left.bean.currentWeight - right.bean.currentWeight;
    }).slice(0, 3).map(
      ({ bean, restDay, readiness, isLowStock }) => `
        <li>
          <span>${escapeHtml(bean.name)}</span>
          <strong>${escapeHtml(getInventoryStatusCopy(readiness))} \xB7 \u7B2C ${restDay} \u5929${isLowStock ? " \xB7 \u4F4E\u5E93\u5B58" : ""}</strong>
        </li>
      `
    ).join("");
  }
  function renderBeanInventoryProfiles() {
    if (!state.beanInventoryState.beans.length) {
      beanInventoryList.innerHTML = `
      <article class="inventory-empty-state">
        <p class="card-kicker">\u8FD8\u6CA1\u6709\u8C46\u5B50</p>
        <h4>\u5148\u5EFA\u7B2C\u4E00\u652F\u8C46\u5B50</h4>
      </article>
    `;
      return;
    }
    beanInventoryList.innerHTML = state.beanInventoryState.beans.map((bean) => {
      const status = getBeanInventoryStatus(bean);
      const isSelected = bean.id === state.selectedInventoryBeanId;
      const isDefault = bean.id === state.beanInventoryState.activeBeanId;
      const metaParts = [bean.roaster, bean.process, bean.origin].filter(Boolean);
      const metaLine = metaParts.length ? metaParts.join(" \xB7 ") : "\u5F85\u8865\u5145\u4FE1\u606F";
      return `
        <article class="equipment-profile-item inventory-profile-item ${isSelected ? "is-selected" : ""}" data-bean-id="${bean.id}">
          <div class="inventory-bean-card">
            <div class="inventory-bean-thumb">
              ${bean.photoDataUrl ? `<img src="${bean.photoDataUrl}" alt="${escapeHtml(bean.name)} cover" />` : "<span>bean</span>"}
            </div>
            <div class="inventory-bean-copy">
              <div class="inventory-bean-title-row">
                <strong class="inventory-bean-name">${escapeHtml(bean.name)}</strong>
                <div class="brew-actions inventory-card-actions">
                  <button class="icon-button inventory-icon-button" type="button" data-action="edit-bean" data-bean-id="${bean.id}" aria-label="\u7F16\u8F91\u8C46\u5B50">\u270D\uFE0F</button>
                  <button class="icon-button inventory-icon-button" type="button" data-action="delete-bean-inline" data-bean-id="${bean.id}" aria-label="\u5220\u9664\u8C46\u5B50">\u{1F5D1}\uFE0F</button>
                </div>
              </div>
              <p class="inventory-bean-meta">${escapeHtml(metaLine)}</p>
              <div class="inventory-chip-row">
                <span class="inventory-chip">\u7B2C ${status.restDay} \u5929</span>
                <span class="inventory-chip inventory-chip--status">${escapeHtml(getInventoryStatusCopy(status.readiness))}</span>
                <span class="inventory-chip">${bean.currentWeight}g \u5269\u4F59</span>
                ${isDefault ? '<span class="inventory-chip inventory-chip--default">\u9ED8\u8BA4\u8C46\u5B50</span>' : ""}
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }
  function renderBeanInventoryEditor() {
    const selectedBean = getSelectedInventoryBean();
    const restCopy = document.querySelector("#inventory-rest-copy");
    const stockCopy = document.querySelector("#inventory-stock-copy");
    const inventoryNote = document.querySelector("#inventory-note");
    const inventoryNoteChips = document.querySelector("#inventory-note-chips");
    const photoCopy = document.querySelector("#inventory-photo-copy");
    const photoStatus = document.querySelector("#inventory-photo-status");
    const editorMode = document.querySelector("#inventory-editor-mode");
    const editorCaption = document.querySelector("#inventory-editor-caption");
    if (!selectedBean) {
      beanInventoryForm.reset();
      editorMode.textContent = "\u65B0\u5EFA\u8C46\u5B50";
      editorCaption.textContent = "\u62CD\u7167\u6216\u76F4\u63A5\u5F55\u5165\u3002";
      saveBeanButton.textContent = "\u4FDD\u5B58\u65B0\u8C46\u5B50";
      inventoryNote.hidden = true;
      inventoryNoteChips.innerHTML = "";
      restCopy.textContent = "";
      stockCopy.textContent = "";
      setPhotoPreviewVisibility(inventoryPhotoPreview, inventoryPhotoPreviewFrame, false);
      inventoryPhotoPreview.removeAttribute("src");
      inventoryPhotoPreview.alt = "Inventory bean cover preview";
      renderInventoryPhotoSummary(createEmptyBeanDetails());
      photoCopy.textContent = "\u62CD\u7167\u540E\u81EA\u52A8\u56DE\u586B\u3002";
      photoStatus.textContent = "";
      document.querySelector("#set-default-bean").disabled = true;
      document.querySelector("#delete-bean").disabled = true;
      return;
    }
    editorMode.textContent = `\u7F16\u8F91\u8C46\u5B50 \xB7 ${selectedBean.name}`;
    editorCaption.textContent = "\u7EE7\u7EED\u8865\u9F50\u8FD9\u652F\u8C46\u5B50\u7684\u6863\u6848\u3002";
    saveBeanButton.textContent = "\u66F4\u65B0\u5F53\u524D\u8C46\u5B50";
    document.querySelector("#inventory-bean-name").value = selectedBean.name;
    document.querySelector("#inventory-roaster").value = selectedBean.roaster || "";
    document.querySelector("#inventory-farm").value = selectedBean.farm || "";
    document.querySelector("#inventory-origin").value = selectedBean.origin || "";
    document.querySelector("#inventory-variety").value = selectedBean.variety || "";
    document.querySelector("#inventory-process").value = selectedBean.process || "";
    document.querySelector("#inventory-roast-level").value = selectedBean.roastLevel || "";
    document.querySelector("#inventory-roast-date").value = selectedBean.roastDate || "";
    document.querySelector("#inventory-opened-date").value = selectedBean.openedDate || "";
    document.querySelector("#inventory-rest-start").value = selectedBean.restStartDay;
    document.querySelector("#inventory-rest-end").value = selectedBean.restEndDay;
    document.querySelector("#inventory-total-weight").value = selectedBean.totalWeight;
    document.querySelector("#inventory-current-weight").value = selectedBean.currentWeight;
    document.querySelector("#inventory-low-stock").value = selectedBean.lowStockThreshold;
    state.inventoryPhotoDataUrl = selectedBean.photoDataUrl || "";
    if (selectedBean.photoDataUrl) {
      inventoryPhotoPreview.src = selectedBean.photoDataUrl;
      setPhotoPreviewVisibility(inventoryPhotoPreview, inventoryPhotoPreviewFrame, true);
    } else {
      setPhotoPreviewVisibility(inventoryPhotoPreview, inventoryPhotoPreviewFrame, false);
      inventoryPhotoPreview.removeAttribute("src");
    }
    inventoryPhotoPreview.alt = selectedBean.name ? `${selectedBean.name} cover` : "Inventory bean cover preview";
    renderInventoryPhotoSummary({
      name: selectedBean.name,
      roaster: selectedBean.roaster || "",
      farm: selectedBean.farm || "",
      origin: selectedBean.origin || "",
      variety: selectedBean.variety || "",
      process: selectedBean.process || "",
      roastDate: selectedBean.roastDate || "",
      flavorFocus: ""
    });
    photoCopy.textContent = "\u4F1A\u66F4\u65B0\u5C01\u9762\u548C\u8BC6\u522B\u5B57\u6BB5\u3002";
    photoStatus.textContent = "";
    const status = getBeanInventoryStatus(selectedBean);
    inventoryNote.hidden = false;
    inventoryNoteChips.innerHTML = [
      `<span class="inventory-chip">\u7B2C ${status.restDay} \u5929</span>`,
      `<span class="inventory-chip inventory-chip--status">${escapeHtml(
        getInventoryStatusCopy(status.readiness)
      )}</span>`,
      `<span class="inventory-chip">${selectedBean.currentWeight}g \u5269\u4F59</span>`,
      status.isLowStock ? '<span class="inventory-chip inventory-chip--default">\u63A5\u8FD1\u8865\u8D27\u7EBF</span>' : ""
    ].filter(Boolean).join("");
    restCopy.textContent = `\u5EFA\u8BAE\u5728\u7B2C ${selectedBean.restStartDay}-${selectedBean.restEndDay} \u5929\u51B2\u3002`;
    stockCopy.textContent = `${selectedBean.currentWeight}g / ${selectedBean.totalWeight}g\u3002`;
    document.querySelector("#set-default-bean").disabled = selectedBean.id === state.beanInventoryState.activeBeanId;
    document.querySelector("#delete-bean").disabled = false;
  }
  function clearInventoryPhotoPreview() {
    state.inventoryPhotoDataUrl = "";
    if (state.inventoryPreviewUrl) {
      URL.revokeObjectURL(state.inventoryPreviewUrl);
      state.inventoryPreviewUrl = "";
    }
  }
  function openBeanEditor(beanId = "") {
    state.selectedInventoryBeanId = beanId;
    if (!beanId) {
      clearInventoryPhotoPreview();
    }
    renderBeanInventoryProfiles();
    renderBeanInventoryEditor();
    setView("bean-editor");
  }
  function openEquipmentEditor(profileId = "") {
    state.selectedEquipmentProfileId = profileId;
    renderEquipmentProfiles();
    renderEquipmentEditor();
    setView("equipment-editor");
  }
  async function fileToDataUrl(file) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  function downloadBackup() {
    const payload = buildBackupPayload({
      brews: state.brews,
      equipmentState: state.equipmentState,
      beanInventoryState: state.beanInventoryState
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url2 = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url2;
    link.download = buildBackupFilename(payload.createdAt);
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url2);
  }
  async function handleInventoryPhotoUpload(file) {
    if (!file) {
      return;
    }
    if (state.inventoryPreviewUrl) {
      URL.revokeObjectURL(state.inventoryPreviewUrl);
    }
    state.inventoryPreviewUrl = URL.createObjectURL(file);
    state.inventoryPhotoDataUrl = await fileToDataUrl(file);
    inventoryPhotoPreview.src = state.inventoryPreviewUrl;
    setPhotoPreviewVisibility(inventoryPhotoPreview, inventoryPhotoPreviewFrame, true);
    inventoryPhotoPreview.alt = inferPhotoLabel(file);
    document.querySelector("#inventory-photo-status").textContent = "\u6B63\u5728\u8BC6\u522B\u8C46\u888B\u4FE1\u606F\u2026";
    let nextBean = inferBeanFromPhoto(file);
    try {
      const modelResult = await analyzePhotoWithModel(file, "inventory");
      nextBean = mergeDetectedBean(nextBean, modelResult.bean);
      document.querySelector("#inventory-photo-copy").textContent = "\u5DF2\u8BC6\u522B\u5E76\u56DE\u586B\u3002";
      document.querySelector("#inventory-photo-status").textContent = "\u8BC6\u522B\u5B8C\u6210";
    } catch (error) {
      const failureKind = classifyPhotoAnalysisFailure(
        error instanceof Error ? error.message : String(error)
      );
      try {
        const extractedText = await recognizePhotoText(file);
        if (extractedText) {
          nextBean = mergeDetectedBean(nextBean, extractBeanDetailsFromText(extractedText));
          document.querySelector("#inventory-photo-copy").textContent = "\u5DF2\u8BC6\u522B\u5E76\u56DE\u586B\u3002";
          document.querySelector("#inventory-photo-status").textContent = failureKind === "model_unavailable" ? "\u5F53\u524D\u4F7F\u7528\u672C\u5730\u8BC6\u522B" : "\u8BC6\u522B\u5B8C\u6210";
        } else {
          document.querySelector("#inventory-photo-copy").textContent = "\u672A\u8BC6\u522B\u5230\u53EF\u9760\u5B57\u6BB5\u3002";
          document.querySelector("#inventory-photo-status").textContent = "\u672A\u63D0\u53D6\u5230\u53EF\u9760\u5B57\u6BB5\u3002";
        }
      } catch {
        document.querySelector("#inventory-photo-copy").textContent = "\u5F53\u524D\u65E0\u6CD5\u81EA\u52A8\u8BC6\u522B\u3002";
        document.querySelector("#inventory-photo-status").textContent = "\u6682\u65F6\u65E0\u6CD5\u8BC6\u522B\u3002";
      }
    }
    document.querySelector("#inventory-bean-name").value = nextBean.name || "";
    document.querySelector("#inventory-roaster").value = nextBean.roaster || "";
    document.querySelector("#inventory-farm").value = nextBean.farm || "";
    document.querySelector("#inventory-origin").value = nextBean.origin || "";
    document.querySelector("#inventory-variety").value = nextBean.variety || "";
    document.querySelector("#inventory-process").value = nextBean.process || "";
    document.querySelector("#inventory-roast-level").value = nextBean.roastLevel || "";
    document.querySelector("#inventory-roast-date").value = nextBean.roastDate || "";
    renderInventoryPhotoSummary(nextBean);
  }
  function renderRecentBrews() {
    const container = document.querySelector("#recent-brews");
    const filteredBrews = filterBrews(state.brews, state.filters);
    if (filteredBrews.length === 0) {
      container.innerHTML = `
        <article class="brew-empty-state">
          <p class="card-kicker">\u8FD8\u6CA1\u6709\u8BB0\u5F55</p>
          <h4>\u5148\u8BB0\u4E0B\u4ECA\u5929\u8FD9\u676F</h4>
          <div class="brew-empty-actions">
            <button class="secondary-button" type="button" data-empty-target="brew">\u8BB0\u5F55\u7B2C\u4E00\u676F</button>
            <button class="secondary-button" type="button" data-empty-target="inventory">\u53BB\u5EFA\u5E93\u5B58\u8C46\u5B50</button>
          </div>
        </article>
      `;
      brewDetail.innerHTML = "";
      setBrewDetailVisibility(false);
      return;
    }
    container.innerHTML = filteredBrews.slice().sort((left, right) => left.createdAt < right.createdAt ? 1 : -1).map(
      (brew) => {
        const preview = formatRecentBrewCardPreview({
          bean: brew.bean,
          roaster: brew.roaster
        });
        const isActive = brew.id === state.hoveredBrewId || brew.id === state.selectedBrewId;
        return `
        <article class="brew-card ${isActive ? "is-active" : ""}" data-brew-id="${brew.id}">
          <div class="brew-date">${brew.date}</div>
          <div class="brew-main">
            <div class="brew-title-row">
              <p class="brew-title-line">
                <strong title="${escapeHtml(preview.title)}">${escapeHtml(
          truncateText(preview.title, 40) || "-"
        )}</strong>
                <span class="brew-supplier-inline">${escapeHtml(
          truncateText(preview.supplier, 32)
        )}</span>
              </p>
              <div class="brew-actions">
                <button class="icon-button" type="button" data-action="edit" data-brew-id="${brew.id}" aria-label="\u7F16\u8F91\u8BB0\u5F55">\u270D\uFE0F</button>
                <button class="icon-button" type="button" data-action="delete" data-brew-id="${brew.id}" aria-label="\u5220\u9664\u8BB0\u5F55">\u{1F5D1}\uFE0F</button>
              </div>
            </div>
          </div>
        </article>
      `;
      }
    ).join("");
    const activeDetailId = state.hoveredBrewId || state.selectedBrewId;
    const hoveredBrew = filteredBrews.find((brew) => brew.id === activeDetailId);
    if (!hoveredBrew) {
      brewDetail.innerHTML = "";
      setBrewDetailVisibility(false);
      return;
    }
    setBrewDetailVisibility(true);
    brewDetail.innerHTML = `
    <p class="card-kicker">Brew Detail</p>
    <h3 class="detail-title">${escapeHtml(displayText(hoveredBrew.bean))}</h3>
    <p class="supporting">${escapeHtml(displayText(hoveredBrew.roaster, "\u672A\u586B\u70D8\u7119\u5546"))} \xB7 ${escapeHtml(displayText(hoveredBrew.origin, "\u672A\u586B\u4EA7\u533A"))}</p>

    <div class="detail-block">
      <p><strong>\u5E84\u56ED / \u5904\u7406\u7AD9</strong></p>
      <p class="supporting">${escapeHtml(displayText(hoveredBrew.farm, "\u672A\u586B\u5E84\u56ED / \u5904\u7406\u7AD9"))}</p>
    </div>

    <div class="detail-block">
      <p><strong>\u5904\u7406\u65B9\u5F0F / \u54C1\u79CD</strong></p>
      <p class="supporting">${escapeHtml(displayText(hoveredBrew.process))} \xB7 ${escapeHtml(displayText(hoveredBrew.variety))}</p>
    </div>

    <div class="detail-block">
      <p><strong>\u672C\u6B21\u51B2\u716E</strong></p>
      <p class="supporting">${escapeHtml(displayText(hoveredBrew.dripper))} \xB7 ${escapeHtml(displayText(hoveredBrew.grinder))} \xB7 ${escapeHtml(displayText(hoveredBrew.filters))} \xB7 ${escapeHtml(displayText(hoveredBrew.dose ? `${hoveredBrew.dose}g` : ""))} \xB7 ${escapeHtml(displayText(hoveredBrew.ratio))} \xB7 ${escapeHtml(displayText(hoveredBrew.temp))}</p>
    </div>

    <div class="detail-block">
      <p><strong>\u98CE\u5473\u4E0E\u8BC4\u5206</strong></p>
      <p class="supporting">${escapeHtml(displayText(hoveredBrew.note, "\u6682\u65E0\u98CE\u5473\u8BB0\u5F55"))} \xB7 ${Number(hoveredBrew.rating).toFixed(1)} / 5</p>
    </div>
  `;
  }
  function renderSuggestion() {
    const assistMeta = [
      state.assistBean.roaster,
      state.assistBean.origin,
      state.assistBean.roastDate ? `Roast ${state.assistBean.roastDate}` : ""
    ].filter(Boolean).join(" \xB7 ");
    document.querySelector("#suggestion-bean-name").textContent = state.assistBean.name || "";
    document.querySelector("#suggestion-meta").textContent = assistMeta;
    assistFields.name.value = state.assistBean.name || "";
    assistFields.roaster.value = state.assistBean.roaster || "";
    assistFields.farm.value = state.assistBean.farm || "";
    assistFields.origin.value = state.assistBean.origin || "";
    assistFields.variety.value = state.assistBean.variety || "";
    assistFields.process.value = state.assistBean.process || "";
    assistFields.roastDate.value = state.assistBean.roastDate || "";
    assistFields.flavorFocus.value = state.assistBean.flavorFocus || "";
  }
  function prefillBrewForm({ useFallbackBean = false, useActiveEquipment = false } = {}) {
    brewBeanSelect.value = "";
    brewEquipmentProfileSelect.value = useActiveEquipment ? state.equipmentState.activeProfileId || "" : "";
    applyBeanDetailsToBrewForm(
      resolveInitialBrewBeanDetails({
        linkedBean: null,
        fallbackBean: state.activeBean,
        useFallbackBean
      })
    );
    applyEquipmentProfileToBrewForm(useActiveEquipment ? getBrewEquipmentProfile() : null);
    document.querySelector("#brew-dose").value = "";
    document.querySelector("#brew-grind").value = "";
    document.querySelector("#brew-ratio").value = "";
    document.querySelector("#brew-temp").value = "";
    document.querySelector("#brew-pours").value = "";
    document.querySelector("#brew-notes").value = "";
    document.querySelector("#brew-rating").value = "4.5";
    document.querySelector("#brew-rating-output").textContent = "4.5";
    renderBrewInlineExperience();
  }
  function loadBrewIntoForm(brew) {
    state.editingBrewId = brew.id;
    brewBeanSelect.value = brew.beanId || "";
    brewEquipmentProfileSelect.value = brew.equipmentProfileId || "";
    document.querySelector("#brew-bean").value = brew.bean || "";
    document.querySelector("#brew-roaster").value = brew.roaster || "";
    document.querySelector("#brew-farm").value = brew.farm || "";
    document.querySelector("#brew-origin").value = brew.origin || "";
    document.querySelector("#brew-variety").value = brew.variety || "";
    document.querySelector("#brew-process").value = brew.process || "";
    document.querySelector("#brew-roast-level").value = brew.roastLevel || "";
    document.querySelector("#brew-roast-date").value = brew.roastDate || "";
    document.querySelector("#brew-dripper").value = brew.dripper || "";
    document.querySelector("#brew-grinder").value = brew.grinder || "";
    document.querySelector("#brew-filters").value = brew.filters || "";
    document.querySelector("#brew-dose").value = brew.dose || "";
    document.querySelector("#brew-grind").value = brew.grind || "";
    document.querySelector("#brew-ratio").value = brew.ratio || "";
    document.querySelector("#brew-temp").value = brew.temp || "";
    document.querySelector("#brew-pours").value = brew.pours || "";
    document.querySelector("#brew-notes").value = brew.note || "";
    document.querySelector("#brew-rating").value = brew.rating || 4.5;
    document.querySelector("#brew-rating-output").textContent = Number(
      brew.rating || 4.5
    ).toFixed(1);
    renderBrewInlineExperience();
  }
  function persistBrews() {
    localStorage.setItem(BREW_STORAGE_KEY, JSON.stringify(state.brews));
  }
  function persistEquipment() {
    localStorage.setItem(
      EQUIPMENT_STORAGE_KEY,
      JSON.stringify(state.equipmentState)
    );
  }
  function persistBeanInventory() {
    localStorage.setItem(
      BEAN_INVENTORY_STORAGE_KEY,
      JSON.stringify(state.beanInventoryState)
    );
  }
  function populateEquipmentSelects() {
    equipmentFields.forEach((field) => {
      const select = document.querySelector(`#equipment-${field}`);
      select.innerHTML = [
        ...equipmentCatalog[field].map(
          (option) => `<option value="${option}">${option}</option>`
        ),
        `<option value="${CUSTOM_OPTION}">\u81EA\u5B9A\u4E49\u2026</option>`
      ].join("");
    });
  }
  function buildOptionMarkup(options, { placeholder = "", includeEmpty = false } = {}) {
    const uniqueOptions = [...new Set(options.filter(Boolean))];
    return [
      includeEmpty || placeholder !== "" ? `<option value="">${placeholder}</option>` : "",
      ...uniqueOptions.map((option) => `<option value="${option}">${option}</option>`)
    ].filter(Boolean).join("");
  }
  function populateBrewDripperOptions() {
    const brewDripperSelect = document.querySelector("#brew-dripper");
    const filterDripperSelect = document.querySelector("#filter-dripper");
    const currentBrewDripper = brewDripperSelect.value;
    const isEquipmentLinked = Boolean(brewEquipmentProfileSelect.value);
    const optionSet = /* @__PURE__ */ new Set([
      ...equipmentCatalog.dripper,
      ...legacyDripperOptions,
      ...state.equipmentState.profiles.map((profile) => profile.dripper),
      ...state.brews.map((brew) => brew.dripper).filter(Boolean)
    ]);
    const dripperOptions = [...optionSet];
    brewDripperSelect.innerHTML = buildOptionMarkup(dripperOptions, { includeEmpty: true });
    brewDripperSelect.value = currentBrewDripper || (isEquipmentLinked ? getActiveEquipmentProfile().dripper : "");
    filterDripperSelect.innerHTML = [
      '<option value="all">\u5168\u90E8</option>',
      ...dripperOptions.map((option) => `<option value="${option}">${option}</option>`)
    ].join("");
    filterDripperSelect.value = state.filters.dripper;
  }
  function populateBrewEquipmentProfileOptions() {
    const currentProfileId = brewEquipmentProfileSelect.value;
    const hasCurrentProfile = state.equipmentState.profiles.some(
      (profile) => profile.id === currentProfileId
    );
    brewEquipmentProfileSelect.innerHTML = [
      '<option value="">\u4E0D\u5173\u8054\u8BBE\u5907\u5E93</option>',
      ...state.equipmentState.profiles.map(
        (profile) => `<option value="${profile.id}">${profile.name}</option>`
      )
    ].join("");
    brewEquipmentProfileSelect.value = currentProfileId === "" ? "" : hasCurrentProfile ? currentProfileId : state.equipmentState.activeProfileId || "";
  }
  function populateBrewGrinderOptions() {
    const brewGrinderSelect = document.querySelector("#brew-grinder");
    const currentGrinder = brewGrinderSelect.value;
    const isEquipmentLinked = Boolean(brewEquipmentProfileSelect.value);
    const grinderOptions = [
      ...equipmentCatalog.grinder,
      ...state.equipmentState.profiles.map((profile) => profile.grinder),
      ...state.brews.map((brew) => brew.grinder).filter(Boolean)
    ];
    brewGrinderSelect.innerHTML = buildOptionMarkup(grinderOptions, { includeEmpty: true });
    brewGrinderSelect.value = currentGrinder || (isEquipmentLinked ? getActiveEquipmentProfile().grinder || "" : "");
  }
  function populateBrewBeanOptions() {
    const currentBeanId = brewBeanSelect.value;
    const unlinkedState = getUnlinkedInventoryStateCopy();
    brewBeanSelect.innerHTML = [
      `<option value="">${unlinkedState.optionLabel}</option>`,
      ...state.beanInventoryState.beans.map(
        (bean) => `<option value="${bean.id}">${bean.name}</option>`
      )
    ].join("");
    brewBeanSelect.value = currentBeanId || "";
  }
  function readEquipmentField(field) {
    const select = document.querySelector(`#equipment-${field}`);
    const customInput = document.querySelector(`#equipment-${field}-custom`);
    return select.value === CUSTOM_OPTION ? customInput.value : select.value;
  }
  function renderAll() {
    populateBrewEquipmentProfileOptions();
    populateBrewDripperOptions();
    populateBrewGrinderOptions();
    populateBrewBeanOptions();
    renderHomeDashboard();
    renderEquipmentProfiles();
    renderEquipmentEditor();
    renderInventorySummary();
    renderBeanInventoryProfiles();
    renderBeanInventoryEditor();
    renderRecentBrews();
    renderSuggestion();
    renderBrewInlineExperience();
  }
  function syncFiltersFromInputs() {
    state.filters.beanQuery = document.querySelector("#filter-bean").value;
    state.filters.dripper = document.querySelector("#filter-dripper").value;
    state.filters.minRating = Number(document.querySelector("#filter-rating").value);
    renderRecentBrews();
  }
  async function handlePhotoUpload(file) {
    if (!file) {
      return;
    }
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    state.previewUrl = URL.createObjectURL(file);
    photoPreview.src = state.previewUrl;
    setPhotoPreviewVisibility(photoPreview, photoPreviewFrame, true);
    photoPreview.alt = inferPhotoLabel(file);
    ocrStatus.textContent = "\u6B63\u5728\u8C03\u7528\u89C6\u89C9\u6A21\u578B\u8BC6\u522B\u8C46\u888B\u4FE1\u606F\u2026";
    let nextBean = inferBeanFromPhoto(file);
    try {
      const modelResult = await analyzePhotoWithModel(file, "brew");
      nextBean = mergeDetectedBean(nextBean, modelResult.bean);
      document.querySelector("#photo-notes-copy").textContent = "\u5DF2\u5B8C\u6210\u6A21\u578B\u8BC6\u522B\u3002";
      ocrStatus.textContent = `\u6A21\u578B\u8BC6\u522B\u5DF2\u5B8C\u6210${modelResult.model ? ` \xB7 ${modelResult.model}` : ""}`;
    } catch (error) {
      const failureKind = classifyPhotoAnalysisFailure(
        error instanceof Error ? error.message : String(error)
      );
      try {
        const extractedText = await recognizePhotoText(file);
        if (extractedText) {
          nextBean = mergeDetectedBean(nextBean, extractBeanDetailsFromText(extractedText));
          document.querySelector("#photo-notes-copy").textContent = "\u5F53\u524D\u4F7F\u7528\u672C\u5730\u8BC6\u522B\u3002";
          ocrStatus.textContent = failureKind === "model_unavailable" ? "\u672A\u542F\u7528\u5927\u6A21\u578B \xB7 \u672C\u5730 OCR" : "\u672C\u5730 OCR \u5DF2\u5B8C\u6210";
        } else {
          document.querySelector("#photo-notes-copy").textContent = "\u672A\u8BC6\u522B\u5230\u53EF\u9760\u5B57\u6BB5\u3002";
          ocrStatus.textContent = "\u672A\u63D0\u53D6\u5230\u53EF\u9760\u5B57\u6BB5\u3002";
        }
      } catch {
        document.querySelector("#photo-notes-copy").textContent = "\u5F53\u524D\u65E0\u6CD5\u81EA\u52A8\u8BC6\u522B\u3002";
        ocrStatus.textContent = "\u6A21\u578B\u548C OCR \u5F53\u524D\u90FD\u4E0D\u53EF\u7528\u3002";
      }
    }
    state.assistBean = nextBean;
    renderAll();
  }
  function bindRatingOutput() {
    const ratingInput = document.querySelector("#brew-rating");
    const ratingOutput = document.querySelector("#brew-rating-output");
    const sync = () => {
      ratingOutput.textContent = Number(ratingInput.value).toFixed(1);
    };
    ratingInput.addEventListener("input", sync);
    sync();
  }
  try {
    viewButtons.forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.viewTarget));
    });
    document.querySelectorAll("#filter-bean, #filter-dripper, #filter-rating").forEach((input) => {
      input.addEventListener("input", syncFiltersFromInputs);
      input.addEventListener("change", syncFiltersFromInputs);
    });
    brewForm.addEventListener("input", () => {
      renderBrewInlineExperience();
    });
    brewForm.addEventListener("change", () => {
      renderBrewInlineExperience();
    });
    brewForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(brewForm);
      const brew = buildBrewEntry({
        bean: formData.get("bean"),
        beanId: formData.get("beanId"),
        equipmentProfileId: formData.get("equipmentProfileId"),
        roaster: formData.get("roaster"),
        farm: formData.get("farm"),
        origin: formData.get("origin"),
        variety: formData.get("variety"),
        process: formData.get("process"),
        roastLevel: formData.get("roastLevel"),
        roastDate: formData.get("roastDate"),
        dripper: formData.get("dripper"),
        grinder: formData.get("grinder"),
        filters: formData.get("filters"),
        dose: formData.get("dose"),
        grind: formData.get("grind"),
        ratio: formData.get("ratio"),
        temp: formData.get("temp"),
        pours: formData.get("pours"),
        notes: formData.get("notes"),
        rating: formData.get("rating"),
        source: formData.get("beanId") ? "inventory" : "manual"
      });
      const finalBrew = state.editingBrewId ? { ...brew, id: state.editingBrewId } : brew;
      const previousBrew = state.editingBrewId ? state.brews.find((entry) => entry.id === state.editingBrewId) || null : null;
      state.brews = state.editingBrewId ? updateBrewEntry(state.brews, finalBrew) : [finalBrew, ...state.brews];
      if ((previousBrew == null ? void 0 : previousBrew.beanId) || finalBrew.beanId && finalBrew.dose > 0) {
        state.beanInventoryState = applyBrewInventoryChange(
          state.beanInventoryState,
          previousBrew,
          finalBrew
        );
        persistBeanInventory();
      }
      state.editingBrewId = null;
      persistBrews();
      renderAll();
      saveFeedback.textContent = finalBrew.beanId && finalBrew.dose > 0 ? `\u5DF2\u4FDD\u5B58 ${finalBrew.bean}\uFF0C\u5E76\u81EA\u52A8\u6263\u51CF ${finalBrew.dose}g \u5E93\u5B58\u3002` : `\u5DF2\u4FDD\u5B58 ${finalBrew.bean} \u8FD9\u676F\u8BB0\u5F55\u3002`;
      setView("home");
    });
    equipmentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const selectedProfile = getSelectedEquipmentProfile();
      const nextProfile = buildEquipmentProfile({
        id: (selectedProfile == null ? void 0 : selectedProfile.id) || `profile-${Date.now()}`,
        name: equipmentNameInput.value,
        dripper: readEquipmentField("dripper"),
        grinder: readEquipmentField("grinder"),
        filters: readEquipmentField("filters")
      });
      state.equipmentState = selectedProfile ? updateEquipmentProfile(state.equipmentState, nextProfile) : {
        ...state.equipmentState,
        profiles: [...state.equipmentState.profiles, nextProfile]
      };
      state.selectedEquipmentProfileId = nextProfile.id;
      persistEquipment();
      renderAll();
      equipmentListFeedback.textContent = selectedProfile ? "\u8BBE\u5907\u7EC4\u5408\u5DF2\u66F4\u65B0\u3002" : "\u65B0\u8BBE\u5907\u7EC4\u5408\u5DF2\u52A0\u5165\u5217\u8868\u3002";
      setView("equipment");
    });
    document.querySelector("#set-default-profile").addEventListener("click", () => {
      if (!state.selectedEquipmentProfileId) {
        equipmentFeedback.textContent = "\u5148\u4FDD\u5B58\u8FD9\u5957\u7EC4\u5408\uFF0C\u518D\u8BBE\u4E3A\u9ED8\u8BA4\u3002";
        return;
      }
      state.equipmentState = setActiveEquipmentProfile(
        state.equipmentState,
        state.selectedEquipmentProfileId
      );
      persistEquipment();
      renderAll();
      equipmentFeedback.textContent = "\u5F53\u524D\u7EC4\u5408\u5DF2\u8BBE\u4E3A\u9ED8\u8BA4\u8BBE\u5907\u6863\u6848\u3002";
      equipmentListFeedback.textContent = "\u9ED8\u8BA4\u8BBE\u5907\u7EC4\u5408\u5DF2\u66F4\u65B0\u3002";
    });
    document.querySelector("#delete-profile").addEventListener("click", () => {
      if (!state.selectedEquipmentProfileId) {
        equipmentFeedback.textContent = "\u5148\u6253\u5F00\u4E00\u5957\u5DF2\u4FDD\u5B58\u7684\u7EC4\u5408\uFF0C\u518D\u5220\u9664\u3002";
        return;
      }
      if (state.equipmentState.profiles.length === 1) {
        equipmentFeedback.textContent = "\u81F3\u5C11\u9700\u8981\u4FDD\u7559\u4E00\u5957\u8BBE\u5907\u7EC4\u5408\u3002";
        return;
      }
      state.equipmentState = removeEquipmentProfile(
        state.equipmentState,
        state.selectedEquipmentProfileId
      );
      state.selectedEquipmentProfileId = state.equipmentState.activeProfileId;
      persistEquipment();
      renderAll();
      equipmentListFeedback.textContent = "\u5F53\u524D\u8BBE\u5907\u7EC4\u5408\u5DF2\u5220\u9664\u3002";
      setView("equipment");
    });
    equipmentFields.forEach((field) => {
      const select = document.querySelector(`#equipment-${field}`);
      const customInput = document.querySelector(`#equipment-${field}-custom`);
      select.addEventListener("change", () => {
        const isCustom = select.value === CUSTOM_OPTION;
        customInput.classList.toggle("is-hidden", !isCustom);
        if (isCustom) {
          customInput.focus();
        }
      });
    });
    document.querySelector("#new-equipment-profile").addEventListener("click", () => {
      openEquipmentEditor("");
      equipmentFeedback.textContent = "\u6B63\u5728\u65B0\u5EFA\u8BBE\u5907\u7EC4\u5408\u3002";
    });
    exportBackupButton.addEventListener("click", () => {
      downloadBackup();
      backupFeedback.textContent = "\u5DF2\u5BFC\u51FA\u5F53\u524D\u6D4F\u89C8\u5668\u91CC\u7684\u5168\u90E8\u8BB0\u5F55\u3001\u8BBE\u5907\u6863\u6848\u548C\u8C46\u5B50\u5E93\u5B58\u3002";
    });
    importBackupInput.addEventListener("change", async (event) => {
      const [file] = event.target.files || [];
      if (!file) {
        return;
      }
      try {
        const contents = await file.text();
        const restored = restoreBackupPayload(contents);
        state.brews = restored.brews;
        state.equipmentState = restored.equipmentState;
        state.beanInventoryState = restored.beanInventoryState;
        state.selectedEquipmentProfileId = state.equipmentState.activeProfileId;
        state.selectedInventoryBeanId = "";
        const activeBean = getActiveInventoryBean();
        if (activeBean) {
          state.activeBean = beanProfileToActiveBean(activeBean);
        }
        persistBrews();
        persistEquipment();
        persistBeanInventory();
        renderAll();
        if (!state.editingBrewId && isBrewFormPristine()) {
          prefillBrewForm();
        }
        backupFeedback.textContent = "\u5907\u4EFD\u5DF2\u6062\u590D\u5230\u5F53\u524D\u6D4F\u89C8\u5668\u3002";
      } catch (error) {
        backupFeedback.textContent = error instanceof Error ? error.message : "\u5BFC\u5165\u5931\u8D25\uFF0C\u8BF7\u786E\u8BA4\u5907\u4EFD\u6587\u4EF6\u662F\u5426\u5B8C\u6574\u3002";
      } finally {
        importBackupInput.value = "";
      }
    });
    photoUpload.addEventListener("change", async (event) => {
      const [file] = event.target.files || [];
      await handlePhotoUpload(file);
    });
    document.querySelector("#toggle-photo-assist").addEventListener("click", () => {
      photoAssistPanel.classList.toggle("is-open");
    });
    equipmentProfileList.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      const card = event.target.closest("[data-profile-id]");
      if (!actionButton && !card) {
        return;
      }
      const profileId = (actionButton == null ? void 0 : actionButton.dataset.profileId) || (card == null ? void 0 : card.dataset.profileId);
      if (!profileId) {
        return;
      }
      if ((actionButton == null ? void 0 : actionButton.dataset.action) === "delete-profile-inline") {
        if (state.equipmentState.profiles.length === 1) {
          equipmentListFeedback.textContent = "\u81F3\u5C11\u9700\u8981\u4FDD\u7559\u4E00\u5957\u8BBE\u5907\u7EC4\u5408\u3002";
          return;
        }
        state.equipmentState = removeEquipmentProfile(state.equipmentState, profileId);
        if (state.selectedEquipmentProfileId === profileId) {
          state.selectedEquipmentProfileId = state.equipmentState.activeProfileId;
        }
        persistEquipment();
        renderAll();
        equipmentListFeedback.textContent = "\u5F53\u524D\u8BBE\u5907\u7EC4\u5408\u5DF2\u5220\u9664\u3002";
        return;
      }
      openEquipmentEditor(profileId);
      equipmentFeedback.textContent = "\u6B63\u5728\u7F16\u8F91\u8FD9\u5957\u8BBE\u5907\u7EC4\u5408\u3002";
    });
    beanInventoryList.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      const card = event.target.closest("[data-bean-id]");
      if (!actionButton) {
        if (!(card == null ? void 0 : card.dataset.beanId)) {
          return;
        }
        openBeanEditor(card.dataset.beanId);
        beanInventoryFeedback.textContent = "\u6B63\u5728\u7F16\u8F91\u8FD9\u652F\u5E93\u5B58\u8C46\u5B50\u3002";
        return;
      }
      const beanId = actionButton.dataset.beanId;
      if (!beanId) {
        return;
      }
      if (actionButton.dataset.action === "edit-bean") {
        openBeanEditor(beanId);
        beanInventoryFeedback.textContent = "\u6B63\u5728\u7F16\u8F91\u8FD9\u652F\u5E93\u5B58\u8C46\u5B50\u3002";
        return;
      }
      if (actionButton.dataset.action === "delete-bean-inline") {
        state.beanInventoryState = removeBeanProfile(
          state.beanInventoryState,
          beanId
        );
        if (state.selectedInventoryBeanId === beanId) {
          state.selectedInventoryBeanId = "";
        }
        clearInventoryPhotoPreview();
        persistBeanInventory();
        renderAll();
        beanInventoryListFeedback.textContent = "\u5F53\u524D\u8C46\u5B50\u5DF2\u4ECE\u5E93\u5B58\u91CC\u79FB\u9664\u3002";
      }
    });
    beanInventoryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(beanInventoryForm);
      const isEditing = Boolean(state.selectedInventoryBeanId);
      const nextId = state.selectedInventoryBeanId || `bean-${Date.now()}`;
      state.beanInventoryState = updateBeanProfile(
        state.beanInventoryState,
        buildBeanProfile({
          id: nextId,
          name: formData.get("name"),
          roaster: formData.get("roaster"),
          farm: formData.get("farm"),
          origin: formData.get("origin"),
          variety: formData.get("variety"),
          process: formData.get("process"),
          roastLevel: formData.get("roastLevel"),
          roastDate: formData.get("roastDate"),
          openedDate: formData.get("openedDate"),
          restStartDay: formData.get("restStartDay"),
          restEndDay: formData.get("restEndDay"),
          totalWeight: formData.get("totalWeight"),
          currentWeight: formData.get("currentWeight"),
          lowStockThreshold: formData.get("lowStockThreshold"),
          photoDataUrl: state.inventoryPhotoDataUrl
        })
      );
      state.selectedInventoryBeanId = nextId;
      if (!state.beanInventoryState.activeBeanId) {
        state.beanInventoryState = setActiveBeanProfile(state.beanInventoryState, nextId);
      }
      persistBeanInventory();
      renderAll();
      beanInventoryListFeedback.textContent = isEditing ? "\u5F53\u524D\u8C46\u5B50\u5DF2\u66F4\u65B0\u3002" : "\u65B0\u8C46\u5B50\u5DF2\u52A0\u5165\u5E93\u5B58\u3002";
      setView("inventory");
    });
    document.querySelector("#new-bean-listing").addEventListener("click", () => {
      openBeanEditor("");
      beanInventoryFeedback.textContent = "\u6B63\u5728\u65B0\u5EFA\u4E00\u652F\u5E93\u5B58\u8C46\u5B50\u3002";
    });
    document.querySelector("#save-bean-as-new").addEventListener("click", () => {
      state.selectedInventoryBeanId = "";
      renderBeanInventoryProfiles();
      renderBeanInventoryEditor();
      beanInventoryFeedback.textContent = "\u5F53\u524D\u8868\u5355\u5C06\u4F5C\u4E3A\u65B0\u8C46\u5B50\u4FDD\u5B58\uFF0C\u4E0D\u4F1A\u8986\u76D6\u539F\u6765\u7684\u5E93\u5B58\u8C46\u5B50\u3002";
    });
    document.querySelector("#set-default-bean").addEventListener("click", () => {
      if (!state.selectedInventoryBeanId) {
        beanInventoryFeedback.textContent = "\u5148\u9009\u62E9\u4E00\u652F\u8C46\u5B50\uFF0C\u518D\u8BBE\u4E3A\u9ED8\u8BA4\u3002";
        return;
      }
      state.beanInventoryState = setActiveBeanProfile(
        state.beanInventoryState,
        state.selectedInventoryBeanId
      );
      persistBeanInventory();
      renderAll();
      beanInventoryFeedback.textContent = "\u5F53\u524D\u8C46\u5B50\u5DF2\u8BBE\u4E3A\u9ED8\u8BA4\u3002";
      beanInventoryListFeedback.textContent = "\u9ED8\u8BA4\u8C46\u5B50\u5DF2\u66F4\u65B0\u3002";
    });
    document.querySelector("#delete-bean").addEventListener("click", () => {
      if (!state.selectedInventoryBeanId) {
        beanInventoryFeedback.textContent = "\u5148\u9009\u62E9\u4E00\u652F\u8C46\u5B50\uFF0C\u518D\u5220\u9664\u3002";
        return;
      }
      state.beanInventoryState = removeBeanProfile(
        state.beanInventoryState,
        state.selectedInventoryBeanId
      );
      state.selectedInventoryBeanId = "";
      clearInventoryPhotoPreview();
      persistBeanInventory();
      renderAll();
      beanInventoryListFeedback.textContent = "\u5F53\u524D\u8C46\u5B50\u5DF2\u4ECE\u5E93\u5B58\u91CC\u79FB\u9664\u3002";
      setView("inventory");
    });
    inventoryPhotoUpload.addEventListener("change", async (event) => {
      const [file] = event.target.files || [];
      await handleInventoryPhotoUpload(file);
    });
    beanInventoryForm.addEventListener("input", (event) => {
      if (event.target === inventoryPhotoUpload) {
        return;
      }
      renderInventoryPhotoSummary(readInventoryBeanFormDetails());
    });
    brewBeanSelect.addEventListener("change", () => {
      const bean = getLinkedBeanForBrewForm(brewBeanSelect.value);
      if (!bean) {
        applyBeanDetailsToBrewForm(
          resolveInitialBrewBeanDetails({
            linkedBean: null,
            fallbackBean: null,
            useFallbackBean: false
          })
        );
        renderBrewInlineExperience();
        return;
      }
      state.activeBean = beanProfileToActiveBean(bean);
      applyBeanDetailsToBrewForm(
        resolveBrewBeanDetails({
          linkedBean: bean,
          fallbackBean: state.activeBean
        })
      );
      renderSuggestion();
      renderBrewInlineExperience();
    });
    brewEquipmentProfileSelect.addEventListener("change", () => {
      const profile = getBrewEquipmentProfile(brewEquipmentProfileSelect.value);
      applyEquipmentProfileToBrewForm(profile);
    });
    document.querySelector("#recent-brews").addEventListener("pointermove", (event) => {
      if (!window.matchMedia("(hover: hover)").matches) {
        return;
      }
      const card = event.target.closest("[data-brew-id]");
      const nextHoveredId = (card == null ? void 0 : card.dataset.brewId) || null;
      if (state.hoveredBrewId === nextHoveredId) {
        return;
      }
      state.hoveredBrewId = nextHoveredId;
      renderRecentBrews();
    });
    document.querySelector("#recent-brews").addEventListener("pointerleave", () => {
      if (!window.matchMedia("(hover: hover)").matches) {
        return;
      }
      if (state.hoveredBrewId === null) {
        return;
      }
      state.hoveredBrewId = null;
      renderRecentBrews();
    });
    document.querySelector("#recent-brews").addEventListener("click", (event) => {
      const emptyActionButton = event.target.closest("[data-empty-target]");
      if (emptyActionButton) {
        setView(emptyActionButton.dataset.emptyTarget);
        return;
      }
      const actionButton = event.target.closest("[data-action]");
      const brewCard = event.target.closest("[data-brew-id]");
      if (!actionButton && brewCard) {
        state.selectedBrewId = state.selectedBrewId === brewCard.dataset.brewId ? null : brewCard.dataset.brewId;
        renderRecentBrews();
        return;
      }
      if (!actionButton) {
        return;
      }
      const brewId = actionButton.dataset.brewId;
      const brew = state.brews.find((entry) => entry.id === brewId);
      if (!brew) {
        return;
      }
      if (actionButton.dataset.action === "edit") {
        loadBrewIntoForm(brew);
        state.selectedBrewId = brewId;
        setView("brew");
        saveFeedback.textContent = "\u5DF2\u5C06\u8FD9\u6761\u8BB0\u5F55\u5E26\u5165\u7F16\u8F91\u8868\u5355\u3002";
        return;
      }
      if (actionButton.dataset.action === "delete") {
        state.brews = removeBrewEntry(state.brews, brewId);
        persistBrews();
        state.hoveredBrewId = null;
        state.selectedBrewId = null;
        renderRecentBrews();
      }
    });
    document.querySelector("#apply-suggestion").addEventListener("click", () => {
      state.assistBean = {
        ...state.assistBean,
        name: assistFields.name.value.trim(),
        roaster: assistFields.roaster.value.trim(),
        farm: assistFields.farm.value.trim(),
        origin: assistFields.origin.value.trim(),
        variety: assistFields.variety.value.trim(),
        process: assistFields.process.value.trim(),
        roastDate: assistFields.roastDate.value.trim(),
        flavorFocus: assistFields.flavorFocus.value.trim()
      };
      state.activeBean = {
        ...state.assistBean
      };
      renderSuggestion();
      brewBeanSelect.value = "";
      applyBeanDetailsToBrewForm(state.activeBean);
      renderBrewInlineExperience();
      saveFeedback.textContent = "\u8BC6\u522B\u5B57\u6BB5\u5DF2\u5E26\u5165\u5F53\u524D\u8BB0\u5F55\u3002";
      setView("brew");
    });
    populateEquipmentSelects();
    state.selectedEquipmentProfileId = state.equipmentState.activeProfileId;
    state.selectedInventoryBeanId = "";
    renderAll();
    if ("serviceWorker" in navigator) {
      window.addEventListener(
        "load",
        () => {
          navigator.serviceWorker.register("./service-worker.js?v=20260327-1").catch((error) => console.warn("[service worker]", error));
        },
        { once: true }
      );
    }
    bindRatingOutput();
    setView("home");
    window.__appBootError = null;
  } catch (error) {
    reportBootError(error, "boot");
  }
})();
