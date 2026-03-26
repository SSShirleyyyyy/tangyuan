(() => {
  // src/recommendation.js
  var DRIPPER_PROFILES = {
    V60: {
      ratio: "1:16",
      waterTemp: "93C",
      grindBand: "medium-fine",
      pours: [
        { label: "Bloom", amount: "45g", time: "0:00-0:35" },
        { label: "Second Pour", amount: "120g", time: "0:35-1:05" },
        { label: "Final Pour", amount: "240g", time: "1:05-1:40" }
      ]
    },
    "Kalita Wave": {
      ratio: "1:15",
      waterTemp: "91C",
      grindBand: "medium",
      pours: [
        { label: "Bloom", amount: "50g", time: "0:00-0:35" },
        { label: "Main Pour", amount: "150g", time: "0:35-1:15" },
        { label: "Top Off", amount: "255g", time: "1:15-1:45" }
      ]
    }
  };
  var PREFERENCE_COPY = {
    clean_bright: {
      headline: "\u6E05\u6670\u660E\u4EAE\u7684\u8D77\u59CB\u65B9\u6848",
      notes: "\u6C34\u6E29\u53EF\u4EE5\u7565\u9AD8\u4E00\u70B9\uFF0C\u5C3E\u6BB5\u6536\u5F97\u66F4\u5FEB\uFF0C\u8BA9\u5C42\u6B21\u548C\u5E72\u51C0\u5EA6\u66F4\u7ACB\u8D77\u6765\u3002"
    },
    sweet_round: {
      headline: "\u751C\u611F\u5706\u6DA6\u7684\u8D77\u59CB\u65B9\u6848",
      notes: "\u7C89\u6C34\u6BD4\u53EF\u4EE5\u7A0D\u5FAE\u6536\u7D27\u4E00\u70B9\uFF0C\u8BA9\u751C\u611F\u548C\u53E3\u611F\u66F4\u96C6\u4E2D\u3002"
    }
  };
  var GRINDER_RANGES = {
    "Comandante C40": {
      "medium-fine": "22-24 clicks",
      medium: "24-26 clicks"
    },
    "1Zpresso ZP6": {
      "medium-fine": "4.3-4.7",
      medium: "4.8-5.2"
    }
  };
  function formatGrindGuidance(grinder, grindBand) {
    var _a;
    const mappedRange = (_a = GRINDER_RANGES[grinder]) == null ? void 0 : _a[grindBand];
    return mappedRange ? `${grinder}: ${mappedRange}` : `${grinder}: ${grindBand}`;
  }
  function buildSuggestion({ bean, equipment }) {
    const dripperProfile = DRIPPER_PROFILES[equipment.dripper] || DRIPPER_PROFILES.V60;
    const preference = PREFERENCE_COPY[equipment.tastePreference] || PREFERENCE_COPY.clean_bright;
    const flavorFocus = String(bean.flavorFocus || "").trim().replaceAll(/,\s*/g, "\u3001") || "\u5E72\u51C0\u751C\u611F";
    return {
      ratio: dripperProfile.ratio,
      waterTemp: dripperProfile.waterTemp,
      pours: dripperProfile.pours,
      headline: preference.headline,
      notes: `${preference.notes} \u8FD9\u4E00\u676F\u53EF\u4EE5\u5148\u671D\u7740${flavorFocus}\u7684\u65B9\u5411\u53BB\u51B2\u3002`,
      grindGuidance: formatGrindGuidance(
        equipment.grinder,
        dripperProfile.grindBand
      )
    };
  }

  // src/mock-data.js
  var equipmentProfile = {
    dripper: "HARIO V60 02",
    grinder: "Comandante C40",
    filters: "CAFEC Abaca 02",
    tastePreference: "clean_bright"
  };
  var analyzedBean = {
    name: "Las Flores Gesha",
    roaster: "Northbound Coffee",
    farm: "Las Flores",
    origin: "Huila, Colombia",
    variety: "Gesha",
    process: "Washed",
    roastLevel: "Light",
    flavorFocus: "Jasmine, citrus, honey",
    roastDate: "2026-03-18"
  };
  var suggestion = buildSuggestion({
    bean: analyzedBean,
    equipment: equipmentProfile
  });

  // src/presentation.js
  function formatPourPlan(pours) {
    return pours.map((pour) => `${pour.label} ${pour.amount} ${pour.time}`).join("\n");
  }
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
      return "\u5173\u8054\u5E93\u5B58\u8C46\u5B50\u540E\uFF0C\u4FDD\u5B58\u8FD9\u676F\u65F6\u4F1A\u6309\u7C89\u91CF\u81EA\u52A8\u6263\u51CF\u5E93\u5B58\u3002";
    }
    const nextDose = Number(dose) || 0;
    if (nextDose <= 0) {
      return `\u5DF2\u5173\u8054 ${beanName}\uFF0C\u4FDD\u5B58\u540E\u4F1A\u6309\u7C89\u91CF\u81EA\u52A8\u6263\u51CF\u5E93\u5B58\u3002`;
    }
    const remaining = Math.max(0, Number(currentWeight) - nextDose);
    return `\u5DF2\u5173\u8054 ${beanName}\uFF0C\u4FDD\u5B58\u540E\u4F1A\u6263\u51CF ${nextDose}g\uFF0C\u9884\u8BA1\u5269\u4F59 ${remaining}g\u3002`;
  }
  function getUnlinkedInventoryStateCopy() {
    return {
      title: "\u8FD8\u6CA1\u5173\u8054\u5E93\u5B58\u8C46\u5B50",
      meta: "\u60F3\u8BA9\u8FD9\u676F\u81EA\u52A8\u6263\u51CF\u5E93\u5B58\u7684\u8BDD\uFF0C\u5148\u4ECE\u4E0A\u9762\u9009\u4E00\u652F\u8C46\u5B50\u3002",
      copy: "\u4E0D\u5173\u8054\u4E5F\u53EF\u4EE5\u7167\u5E38\u8BB0\u5F55\uFF0C\u53EA\u662F\u8FD9\u676F\u4E0D\u4F1A\u8FDB\u5165\u5E93\u5B58\u4E0E\u517B\u8C46\u63D0\u9192\u3002",
      optionLabel: "\u5148\u4E0D\u5173\u8054\u5E93\u5B58"
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    return {
      id: `brew-${Date.now()}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      date: formatBrewDate(),
      bean: formValues.bean.trim(),
      beanId: ((_a = formValues.beanId) == null ? void 0 : _a.trim()) || "",
      roaster: ((_b = formValues.roaster) == null ? void 0 : _b.trim()) || "",
      farm: ((_c = formValues.farm) == null ? void 0 : _c.trim()) || "",
      origin: ((_d = formValues.origin) == null ? void 0 : _d.trim()) || "",
      variety: ((_e = formValues.variety) == null ? void 0 : _e.trim()) || "",
      process: ((_f = formValues.process) == null ? void 0 : _f.trim()) || "",
      roastLevel: ((_g = formValues.roastLevel) == null ? void 0 : _g.trim()) || "",
      roastDate: ((_h = formValues.roastDate) == null ? void 0 : _h.trim()) || "",
      dripper: formValues.dripper,
      grinder: ((_i = formValues.grinder) == null ? void 0 : _i.trim()) || "",
      filters: ((_j = formValues.filters) == null ? void 0 : _j.trim()) || "",
      dose: Number(formValues.dose) || 0,
      ratio: formValues.ratio.trim(),
      temp: ((_k = formValues.temp) == null ? void 0 : _k.trim()) || "",
      grind: ((_l = formValues.grind) == null ? void 0 : _l.trim()) || "",
      pours: ((_m = formValues.pours) == null ? void 0 : _m.trim()) || "",
      note: ((_n = formValues.notes) == null ? void 0 : _n.trim()) || "",
      rating: Number(formValues.rating),
      source: formValues.source || "manual"
    };
  }
  function resolveBrewBeanDetails({ linkedBean, fallbackBean }) {
    const source = linkedBean || fallbackBean || {};
    return {
      name: source.name || "",
      roaster: source.roaster || "",
      farm: source.farm || "",
      origin: source.origin || "",
      variety: source.variety || "",
      process: source.process || "",
      roastLevel: source.roastLevel || "",
      roastDate: source.roastDate || ""
    };
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
  function titleize(value) {
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
  }
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
    "stone fruit"
  ];
  function findLineValue(text, label) {
    const regex = new RegExp(`${label}\\s*[:\uFF1A]\\s*(.+)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  }
  function inferFlavorFocus(text) {
    const lower = text.toLowerCase();
    const matchedTerms = FLAVOR_TERMS.filter((term) => lower.includes(term));
    if (matchedTerms.length > 0) {
      return matchedTerms.join(", ");
    }
    return "";
  }
  function inferPhotoLabel(file) {
    return file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  }
  function extractBeanDetailsFromText(text) {
    const normalized = text.replace(/\r/g, "").trim();
    const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
    const roastDate = findLineValue(normalized, "Roast Date") || findLineValue(normalized, "Roasted On");
    const process = findLineValue(normalized, "Process") || "Washed";
    const variety = findLineValue(normalized, "Variety") || "Unknown Variety";
    const farm = findLineValue(normalized, "Producer") || findLineValue(normalized, "Farm") || "Unknown Farm";
    const origin = findLineValue(normalized, "Origin") || lines.find((line) => /colombia|ethiopia|kenya|panama|guatemala/i.test(line)) || "Producer Lot / Single Origin";
    const roaster = lines[0] || "Photo Inferred";
    const name = lines.find((line) => /gesha|geisha|sidra|bourbon|typica/i.test(line)) || lines[1] || "Single Origin Selection";
    const flavorFocus = findLineValue(normalized, "Notes") || findLineValue(normalized, "Tasting Notes") || inferFlavorFocus(normalized) || "Floral lift, citrus, clean sweetness";
    return {
      name: titleize(name),
      roaster: titleize(roaster),
      farm: titleize(farm),
      origin: titleize(origin),
      variety: titleize(variety),
      process: titleize(process),
      roastLevel: /medium/i.test(normalized) ? "Medium" : "Light",
      flavorFocus,
      roastDate: roastDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
    };
  }
  function inferBeanFromPhoto(file) {
    const label = inferPhotoLabel(file);
    const lower = label.toLowerCase();
    const process = lower.includes("natural") ? "Natural" : "Washed";
    const roastLevel = lower.includes("medium") ? "Medium" : "Light";
    const variety = lower.includes("gesha") ? "Gesha" : "Unknown Variety";
    const name = lower.includes("gesha") ? `${titleize(label.replace(/\bwashed\b|\bnatural\b|\bmedium\b|\blight\b/g, "").trim()) || "Reserve"} Gesha` : titleize(label) || "Single Origin Selection";
    const origin = lower.includes("colombia") ? "Huila, Colombia" : lower.includes("ethiopia") ? "Yirgacheffe, Ethiopia" : "Producer Lot / Single Origin";
    const farm = lower.includes("flores") ? "Las Flores" : "Unknown Farm";
    const flavorFocus = process === "Natural" ? "Berry sweetness, cacao, round finish" : "Floral lift, citrus, clean sweetness";
    return {
      name,
      roaster: "Photo Inferred",
      farm,
      origin,
      variety,
      process,
      roastLevel,
      flavorFocus,
      roastDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
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
  var navButtons = [...document.querySelectorAll("[data-view-target]")];
  var brewForm = document.querySelector("#brew-form");
  var brewDetail = document.querySelector("#brew-detail");
  var saveFeedback = document.querySelector("#save-feedback");
  var equipmentForm = document.querySelector("#equipment-form");
  var equipmentFeedback = document.querySelector("#equipment-feedback");
  var equipmentNameInput = document.querySelector("#equipment-name");
  var exportBackupButton = document.querySelector("#export-backup");
  var importBackupInput = document.querySelector("#import-backup");
  var backupFeedback = document.querySelector("#backup-feedback");
  var beanInventoryForm = document.querySelector("#bean-inventory-form");
  var beanInventoryFeedback = document.querySelector("#bean-inventory-feedback");
  var beanInventoryList = document.querySelector("#bean-inventory-list");
  var saveBeanButton = document.querySelector("#save-bean");
  var inventoryPhotoUpload = document.querySelector("#inventory-photo-upload");
  var inventoryPhotoPreview = document.querySelector("#inventory-photo-preview");
  var photoUpload = document.querySelector("#photo-upload");
  var photoPreview = document.querySelector("#photo-preview");
  var photoAssistPanel = document.querySelector("#photo-assist-panel");
  var ocrStatus = document.querySelector("#ocr-status");
  var equipmentProfileList = document.querySelector("#equipment-profile-list");
  var brewBeanSelect = document.querySelector("#brew-bean-id");
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
    activeBean: analyzedBean,
    activeSuggestion: buildSuggestion({
      bean: analyzedBean,
      equipment: initializeEquipmentState(
        localStorage.getItem(EQUIPMENT_STORAGE_KEY),
        equipmentProfile
      ).profiles[0]
    }),
    hoveredBrewId: null,
    selectedBrewId: null,
    editingBrewId: null,
    previewUrl: "",
    inventoryPreviewUrl: "",
    inventoryPhotoDataUrl: ""
  };
  var ocrWorkerPromise;
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
  function compactText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
  function displayText(value, fallback = "-") {
    const nextValue = compactText(value);
    return nextValue || fallback;
  }
  function truncateText(value, maxLength) {
    const nextValue = compactText(value);
    if (!nextValue) {
      return "";
    }
    if (nextValue.length <= maxLength) {
      return nextValue;
    }
    return `${nextValue.slice(0, maxLength - 1).trimEnd()}\u2026`;
  }
  function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  async function getOcrWorker() {
    var _a;
    if (!((_a = globalThis.Tesseract) == null ? void 0 : _a.createWorker)) {
      return null;
    }
    if (!ocrWorkerPromise) {
      ocrWorkerPromise = globalThis.Tesseract.createWorker("eng");
    }
    return ocrWorkerPromise;
  }
  async function recognizePhotoText(file) {
    var _a, _b;
    const worker = await getOcrWorker();
    if (!worker) {
      return "";
    }
    const result = await worker.recognize(file);
    return ((_b = (_a = result == null ? void 0 : result.data) == null ? void 0 : _a.text) == null ? void 0 : _b.trim()) || "";
  }
  function getActiveEquipmentProfile() {
    return state.equipmentState.profiles.find(
      (profile) => profile.id === state.equipmentState.activeProfileId
    ) || state.equipmentState.profiles[0];
  }
  function getSelectedEquipmentProfile() {
    return state.equipmentState.profiles.find(
      (profile) => profile.id === state.selectedEquipmentProfileId
    ) || getActiveEquipmentProfile();
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
    const targetId = beanId || state.beanInventoryState.activeBeanId;
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
  function renderBrewInlineExperience() {
    var _a;
    const linkedBean = state.beanInventoryState.beans.find(
      (bean) => bean.id === brewBeanSelect.value
    );
    const currentDose = Number((_a = document.querySelector("#brew-dose")) == null ? void 0 : _a.value) || 0;
    if (linkedBean) {
      const status = getBeanInventoryStatus(linkedBean);
      brewBeanStatusTitle.textContent = linkedBean.name;
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
      const unlinkedState = getUnlinkedInventoryStateCopy();
      brewBeanStatusTitle.textContent = unlinkedState.title;
      brewBeanStatusMeta.textContent = unlinkedState.meta;
      brewBeanStatusCopy.textContent = unlinkedState.copy;
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
    ].some((selector) => compactText(document.querySelector(selector).value));
  }
  function setView(nextView) {
    views.forEach((view) => {
      view.classList.toggle("is-visible", view.dataset.view === nextView);
    });
    navButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.viewTarget === nextView);
    });
    if (nextView === "inventory") {
      state.selectedInventoryBeanId = "";
      renderBeanInventoryProfiles();
      renderBeanInventoryEditor();
    }
    if (nextView === "brew" && !state.editingBrewId && isBrewFormPristine()) {
      prefillBrewForm();
    }
  }
  function renderEquipment() {
    const activeProfile = getActiveEquipmentProfile();
    document.querySelector("#hero-today-date").textContent = formatHeroDate(
      (/* @__PURE__ */ new Date()).toISOString()
    );
    document.querySelector("#hero-brew-count").textContent = String(state.brews.length);
    document.querySelector("#hero-bean-count").textContent = String(
      state.beanInventoryState.beans.length
    );
    document.querySelector("#equipment-profile-name").textContent = activeProfile.name;
    document.querySelector("#equipment-summary-dripper").textContent = activeProfile.dripper;
    document.querySelector("#equipment-summary-grinder").textContent = activeProfile.grinder;
    document.querySelector("#equipment-summary-filters").textContent = activeProfile.filters;
    const selectedProfile = getSelectedEquipmentProfile();
    equipmentNameInput.value = selectedProfile.name;
    equipmentFields.forEach((field) => {
      const select = document.querySelector(`#equipment-${field}`);
      const customInput = document.querySelector(`#equipment-${field}-custom`);
      const value = selectedProfile[field];
      const options = equipmentCatalog[field];
      const isPreset = options.includes(value);
      select.value = isPreset ? value : CUSTOM_OPTION;
      customInput.value = isPreset ? "" : value;
      customInput.classList.toggle("is-hidden", isPreset);
    });
    document.querySelector("#set-default-profile").disabled = selectedProfile.id === state.equipmentState.activeProfileId;
    document.querySelector("#delete-profile").disabled = state.equipmentState.profiles.length === 1;
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
                <span class="equipment-spec-label">${spec.label}</span>
                <strong>${spec.value}</strong>
              </span>
            </div>
          `
      ).join("");
      return `
        <button class="equipment-profile-item ${isSelected ? "is-selected" : ""}" data-profile-id="${profile.id}" type="button">
          <strong>${profile.name}</strong>
          <div class="equipment-spec-list">${specs}</div>
          <p class="supporting equipment-profile-status">${isDefault ? "\u9ED8\u8BA4\u7EC4\u5408" : "\u70B9\u6309\u7F16\u8F91"}</p>
        </button>
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
      summaryCopy.textContent = "\u8FD8\u6CA1\u6709\u5F55\u5165\u5E93\u5B58\u8C46\u5B50\uFF0C\u5148\u5728\u8C46\u5B50\u5E93\u5B58\u9875\u5EFA\u4E00\u652F\u5E38\u559D\u7684\u8C46\u3002";
      summaryStats.innerHTML = "";
      summaryList.innerHTML = "";
      return;
    }
    const readyCount = statuses.filter((status) => status.readiness === "ready").length;
    const restingCount = statuses.filter(
      (status) => status.readiness === "resting"
    ).length;
    const lowStockCount = statuses.filter((status) => status.isLowStock).length;
    summaryCopy.textContent = "\u7528\u517B\u8C46\u5929\u6570\u548C\u5269\u4F59\u514B\u6570\u4E00\u8D77\u5224\u65AD\u73B0\u5728\u8BE5\u51B2\u54EA\u652F\u3001\u54EA\u652F\u8BE5\u8865\u8D27\u3002";
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
        <p class="supporting">\u4ECE\u53F3\u4FA7\u62CD\u4E00\u5F20\u8C46\u888B\u7167\uFF0C\u6216\u8005\u5148\u624B\u52A8\u5F55\u5165\u4E00\u652F\u5E38\u559D\u7684\u8C46\u5B50\uFF0C\u5E93\u5B58\u548C\u517B\u8C46\u72B6\u6001\u5C31\u4F1A\u5F00\u59CB\u5DE5\u4F5C\u3002</p>
      </article>
    `;
      return;
    }
    beanInventoryList.innerHTML = state.beanInventoryState.beans.map((bean) => {
      const status = getBeanInventoryStatus(bean);
      const isSelected = bean.id === state.selectedInventoryBeanId;
      const isDefault = bean.id === state.beanInventoryState.activeBeanId;
      const metaParts = [bean.roaster, bean.process, bean.origin].filter(Boolean);
      const metaLine = metaParts.length ? metaParts.join(" \xB7 ") : "\u7B49\u5F85\u8865\u5145\u8FD9\u652F\u8C46\u5B50\u7684\u6765\u6E90\u4E0E\u5904\u7406\u4FE1\u606F";
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
    const photoLabel = document.querySelector("#inventory-photo-label");
    const photoCopy = document.querySelector("#inventory-photo-copy");
    const photoStatus = document.querySelector("#inventory-photo-status");
    const editorMode = document.querySelector("#inventory-editor-mode");
    const editorCaption = document.querySelector("#inventory-editor-caption");
    if (!selectedBean) {
      beanInventoryForm.reset();
      editorMode.textContent = "\u65B0\u5EFA\u8C46\u5B50";
      editorCaption.textContent = "\u5148\u653E\u4E00\u5F20\u8C46\u888B\u7167\u7247\uFF0C\u6216\u8005\u4ECE\u53F3\u4FA7\u76F4\u63A5\u5F55\u5165\u5B57\u6BB5\uFF0C\u6574\u7406\u6210\u4E00\u5F20\u5B8C\u6574\u7684\u8C46\u5B50\u5E93\u5B58\u5361\u3002";
      saveBeanButton.textContent = "\u4FDD\u5B58\u65B0\u8C46\u5B50";
      restCopy.textContent = "\u5148\u65B0\u5EFA\u4E00\u652F\u8C46\u5B50\uFF0C\u624D\u80FD\u5F00\u59CB\u8FFD\u8E2A\u517B\u8C46\u4E0E\u5E93\u5B58\u3002";
      stockCopy.textContent = "\u4FDD\u5B58\u540E\uFF0C\u8FD9\u652F\u8C46\u5B50\u5C31\u80FD\u5728\u8BB0\u5F55\u9875\u91CC\u81EA\u52A8\u5E26\u5165\u5E76\u6263\u51CF\u5E93\u5B58\u3002";
      inventoryPhotoPreview.classList.remove("has-image");
      inventoryPhotoPreview.removeAttribute("src");
      photoLabel.textContent = "\u8C46\u888B\u7167\u7247";
      photoCopy.textContent = "\u7167\u7247\u4F1A\u4F18\u5148\u7528\u4E8E\u8BC6\u522B\u8C46\u5B50\u57FA\u7840\u4FE1\u606F\uFF0C\u5E76\u4F5C\u4E3A\u5E93\u5B58\u8C46\u5B50\u7684\u5C01\u9762\u3002";
      photoStatus.textContent = "";
      document.querySelector("#set-default-bean").disabled = true;
      document.querySelector("#delete-bean").disabled = true;
      return;
    }
    editorMode.textContent = `\u7F16\u8F91\u8C46\u5B50 \xB7 ${selectedBean.name}`;
    editorCaption.textContent = "\u7EE7\u7EED\u8865\u9F50\u6765\u6E90\u3001\u5904\u7406\u65B9\u5F0F\u3001\u517B\u8C46\u7A97\u53E3\u4E0E\u5269\u4F59\u514B\u6570\uFF0C\u8FD9\u4E9B\u4FE1\u606F\u4F1A\u76F4\u63A5\u5F71\u54CD\u9996\u9875\u548C\u8BB0\u5F55\u9875\u7684\u5224\u65AD\u3002";
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
      inventoryPhotoPreview.classList.add("has-image");
    } else {
      inventoryPhotoPreview.classList.remove("has-image");
      inventoryPhotoPreview.removeAttribute("src");
    }
    photoLabel.textContent = selectedBean.name || "\u8C46\u888B\u7167\u7247";
    photoCopy.textContent = "\u8FD9\u5F20\u7167\u7247\u4F1A\u8DDF\u968F\u8C46\u5B50\u5E93\u5B58\u4E00\u8D77\u4FDD\u5B58\uFF0C\u65B9\u4FBF\u56DE\u770B\u548C\u5FEB\u901F\u8FA8\u8BA4\u3002";
    photoStatus.textContent = "";
    const status = getBeanInventoryStatus(selectedBean);
    restCopy.textContent = `\u5F53\u524D\u517B\u8C46\u7B2C ${status.restDay} \u5929 \xB7 \u5EFA\u8BAE\u5728\u7B2C ${selectedBean.restStartDay}-${selectedBean.restEndDay} \u5929\u51B2`;
    stockCopy.textContent = `${selectedBean.currentWeight}g / ${selectedBean.totalWeight}g\uFF0C${status.isLowStock ? "\u5DF2\u7ECF\u63A5\u8FD1\u8865\u8D27\u7EBF" : "\u5E93\u5B58\u8FD8\u6BD4\u8F83\u4ECE\u5BB9"}\u3002`;
    document.querySelector("#set-default-bean").disabled = selectedBean.id === state.beanInventoryState.activeBeanId;
    document.querySelector("#delete-bean").disabled = false;
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
    inventoryPhotoPreview.classList.add("has-image");
    document.querySelector("#inventory-photo-label").textContent = inferPhotoLabel(file);
    document.querySelector("#inventory-photo-status").textContent = "\u6B63\u5728\u8BC6\u522B\u5305\u88C5\u6587\u5B57\u2026";
    let nextBean = inferBeanFromPhoto(file);
    try {
      const extractedText = await recognizePhotoText(file);
      if (extractedText) {
        nextBean = {
          ...nextBean,
          ...extractBeanDetailsFromText(extractedText)
        };
        document.querySelector("#inventory-photo-copy").textContent = "\u5DF2\u4ECE\u8C46\u888B\u56FE\u7247\u91CC\u63D0\u53D6\u8C46\u5B50\u4FE1\u606F\uFF0C\u4E0B\u9762\u7684\u5E93\u5B58\u6863\u6848\u5B57\u6BB5\u5DF2\u7ECF\u56DE\u586B\u3002";
        document.querySelector("#inventory-photo-status").textContent = "OCR \u5DF2\u5B8C\u6210\uFF0C\u8BC6\u522B\u7ED3\u679C\u5DF2\u5E26\u5165\u5E93\u5B58\u8868\u5355\u3002";
      } else {
        document.querySelector("#inventory-photo-copy").textContent = "\u6CA1\u6709\u8BFB\u53D6\u5230\u8DB3\u591F\u6E05\u6670\u7684\u5305\u88C5\u6587\u5B57\uFF0C\u5DF2\u56DE\u9000\u5230\u6587\u4EF6\u540D\u548C\u672C\u5730\u89C4\u5219\u63A8\u65AD\u3002";
        document.querySelector("#inventory-photo-status").textContent = "OCR \u672A\u63D0\u53D6\u5230\u6709\u6548\u6587\u5B57\uFF0C\u5DF2\u56DE\u9000\u5230\u672C\u5730\u63A8\u65AD\u3002";
      }
    } catch {
      document.querySelector("#inventory-photo-copy").textContent = "OCR \u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u5DF2\u56DE\u9000\u5230\u6587\u4EF6\u540D\u548C\u672C\u5730\u89C4\u5219\u63A8\u65AD\u3002";
      document.querySelector("#inventory-photo-status").textContent = "OCR \u5F53\u524D\u4E0D\u53EF\u7528\uFF0C\u5DF2\u4F7F\u7528\u672C\u5730\u63A8\u65AD\u3002";
    }
    document.querySelector("#inventory-bean-name").value = nextBean.name || "";
    document.querySelector("#inventory-roaster").value = nextBean.roaster || "";
    document.querySelector("#inventory-farm").value = nextBean.farm || "";
    document.querySelector("#inventory-origin").value = nextBean.origin || "";
    document.querySelector("#inventory-variety").value = nextBean.variety || "";
    document.querySelector("#inventory-process").value = nextBean.process || "";
    document.querySelector("#inventory-roast-level").value = nextBean.roastLevel || "";
    document.querySelector("#inventory-roast-date").value = nextBean.roastDate || "";
  }
  function renderRecentBrews() {
    const container = document.querySelector("#recent-brews");
    const filteredBrews = filterBrews(state.brews, state.filters);
    if (filteredBrews.length === 0) {
      container.innerHTML = `
        <article class="brew-empty-state">
          <p class="card-kicker">\u8FD8\u6CA1\u6709\u8BB0\u5F55</p>
          <h4>\u5148\u8BB0\u4E0B\u4ECA\u5929\u8FD9\u676F</h4>
          <p class="supporting">\u4ECE\u4E00\u6761\u7B80\u5355\u7684\u51B2\u716E\u8BB0\u5F55\u5F00\u59CB\uFF0C\u6216\u8005\u5148\u6574\u7406\u5E93\u5B58\u8C46\u5B50\uFF0C\u540E\u9762\u7B5B\u9009\u548C\u56DE\u770B\u624D\u4F1A\u6162\u6162\u6709\u610F\u601D\u3002</p>
          <div class="brew-empty-actions">
            <button class="secondary-button" type="button" data-empty-target="brew">\u8BB0\u5F55\u7B2C\u4E00\u676F</button>
            <button class="secondary-button" type="button" data-empty-target="inventory">\u53BB\u5EFA\u5E93\u5B58\u8C46\u5B50</button>
          </div>
        </article>
      `;
      brewDetail.innerHTML = '<p class="supporting">\u628A\u9F20\u6807\u79FB\u5230\u67D0\u6761\u51B2\u716E\u8BB0\u5F55\u4E0A\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A\u5B83\u7684\u5B8C\u6574\u4FE1\u606F\u3002</p>';
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
              <strong title="${escapeHtml(preview.title)}">${escapeHtml(
          truncateText(preview.title, 56) || "-"
        )}</strong>
              <div class="brew-actions">
                <button class="icon-button" type="button" data-action="edit" data-brew-id="${brew.id}" aria-label="\u7F16\u8F91\u8BB0\u5F55">\u270D\uFE0F</button>
                <button class="icon-button" type="button" data-action="delete" data-brew-id="${brew.id}" aria-label="\u5220\u9664\u8BB0\u5F55">\u{1F5D1}\uFE0F</button>
              </div>
            </div>
            <p class="meta-line">${escapeHtml(preview.supplier)}</p>
          </div>
        </article>
      `;
      }
    ).join("");
    const activeDetailId = state.hoveredBrewId || state.selectedBrewId;
    const hoveredBrew = filteredBrews.find((brew) => brew.id === activeDetailId);
    if (!hoveredBrew) {
      brewDetail.innerHTML = '<p class="supporting">\u684C\u9762\u7AEF\u53EF\u60AC\u505C\u67E5\u770B\u8BE6\u60C5\uFF0C\u624B\u673A\u7AEF\u53EF\u70B9\u6309\u67D0\u6761\u8BB0\u5F55\u67E5\u770B\u8BE6\u60C5\u3002</p>';
      return;
    }
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
    document.querySelector("#suggestion-bean-name").textContent = state.activeBean.name;
    document.querySelector(
      "#suggestion-meta"
    ).textContent = `${state.activeBean.roaster} \xB7 ${state.activeBean.origin} \xB7 Roast ${state.activeBean.roastDate}`;
    document.querySelector("#suggestion-ratio").textContent = state.activeSuggestion.ratio;
    document.querySelector("#suggestion-temp").textContent = state.activeSuggestion.waterTemp;
    document.querySelector("#suggestion-grind").textContent = state.activeSuggestion.grindGuidance;
    document.querySelector("#suggestion-process").textContent = state.activeBean.process || "\u5F85\u8BC6\u522B";
    assistFields.name.value = state.activeBean.name || "";
    assistFields.roaster.value = state.activeBean.roaster || "";
    assistFields.farm.value = state.activeBean.farm || "";
    assistFields.origin.value = state.activeBean.origin || "";
    assistFields.variety.value = state.activeBean.variety || "";
    assistFields.process.value = state.activeBean.process || "";
    assistFields.roastDate.value = state.activeBean.roastDate || "";
    assistFields.flavorFocus.value = state.activeBean.flavorFocus || "";
  }
  function prefillBrewForm() {
    brewBeanSelect.value = state.beanInventoryState.activeBeanId || "";
    const linkedBean = getLinkedBeanForBrewForm();
    if (linkedBean) {
      state.activeBean = beanProfileToActiveBean(linkedBean);
    }
    applyBeanDetailsToBrewForm(
      resolveBrewBeanDetails({
        linkedBean,
        fallbackBean: state.activeBean
      })
    );
    document.querySelector("#brew-dripper").value = getActiveEquipmentProfile().dripper;
    document.querySelector("#brew-grinder").value = getActiveEquipmentProfile().grinder;
    document.querySelector("#brew-filters").value = getActiveEquipmentProfile().filters;
    document.querySelector("#brew-dose").value = "15";
    document.querySelector("#brew-grind").value = state.activeSuggestion.grindGuidance;
    document.querySelector("#brew-ratio").value = state.activeSuggestion.ratio;
    document.querySelector("#brew-temp").value = state.activeSuggestion.waterTemp;
    document.querySelector("#brew-pours").value = formatPourPlan(state.activeSuggestion.pours);
    document.querySelector("#brew-notes").value = "";
    document.querySelector("#brew-rating").value = "4.5";
    document.querySelector("#brew-rating-output").textContent = "4.5";
    renderBrewInlineExperience();
  }
  function loadBrewIntoForm(brew) {
    state.editingBrewId = brew.id;
    brewBeanSelect.value = brew.beanId || "";
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
  function populateBrewDripperOptions() {
    const brewDripperSelect = document.querySelector("#brew-dripper");
    const filterDripperSelect = document.querySelector("#filter-dripper");
    const currentBrewDripper = brewDripperSelect.value;
    const optionSet = /* @__PURE__ */ new Set([
      ...equipmentCatalog.dripper,
      ...legacyDripperOptions,
      ...state.equipmentState.profiles.map((profile) => profile.dripper),
      ...state.brews.map((brew) => brew.dripper).filter(Boolean)
    ]);
    const dripperOptions = [...optionSet];
    brewDripperSelect.innerHTML = dripperOptions.map((option) => `<option value="${option}">${option}</option>`).join("");
    brewDripperSelect.value = currentBrewDripper || getActiveEquipmentProfile().dripper;
    filterDripperSelect.innerHTML = [
      '<option value="all">\u5168\u90E8</option>',
      ...dripperOptions.map((option) => `<option value="${option}">${option}</option>`)
    ].join("");
    filterDripperSelect.value = state.filters.dripper;
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
    brewBeanSelect.value = currentBeanId || state.beanInventoryState.activeBeanId || "";
  }
  function readEquipmentField(field) {
    const select = document.querySelector(`#equipment-${field}`);
    const customInput = document.querySelector(`#equipment-${field}-custom`);
    return select.value === CUSTOM_OPTION ? customInput.value : select.value;
  }
  function refreshSuggestionForCurrentContext() {
    state.activeSuggestion = buildSuggestion({
      bean: state.activeBean,
      equipment: getActiveEquipmentProfile()
    });
  }
  function renderAll() {
    populateBrewDripperOptions();
    populateBrewBeanOptions();
    renderEquipment();
    renderEquipmentProfiles();
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
    photoPreview.classList.add("has-image");
    document.querySelector("#photo-label").textContent = inferPhotoLabel(file);
    ocrStatus.textContent = "\u6B63\u5728\u8BC6\u522B\u5305\u88C5\u6587\u5B57\u2026";
    let nextBean = inferBeanFromPhoto(file);
    try {
      const extractedText = await recognizePhotoText(file);
      if (extractedText) {
        nextBean = {
          ...nextBean,
          ...extractBeanDetailsFromText(extractedText)
        };
        document.querySelector("#photo-notes-copy").textContent = "\u5DF2\u4ECE\u56FE\u7247\u5305\u88C5\u6587\u5B57\u4E2D\u63D0\u53D6\u8C46\u5B50\u4FE1\u606F\uFF0C\u5E76\u751F\u6210\u5F53\u524D\u8BBE\u5907\u7EC4\u5408\u4E0B\u7684\u8D77\u59CB\u5EFA\u8BAE\u3002";
        ocrStatus.textContent = "OCR \u5DF2\u5B8C\u6210\uFF0C\u8BC6\u522B\u7ED3\u679C\u5DF2\u5E26\u5165\u6458\u8981\u3002";
      } else {
        document.querySelector("#photo-notes-copy").textContent = "\u6CA1\u6709\u8BFB\u53D6\u5230\u8DB3\u591F\u6E05\u6670\u7684\u5305\u88C5\u6587\u5B57\uFF0C\u5DF2\u56DE\u9000\u5230\u6587\u4EF6\u540D\u548C\u672C\u5730\u89C4\u5219\u63A8\u65AD\u3002";
        ocrStatus.textContent = "OCR \u672A\u63D0\u53D6\u5230\u6709\u6548\u6587\u5B57\uFF0C\u5DF2\u56DE\u9000\u5230\u672C\u5730\u63A8\u65AD\u3002";
      }
    } catch {
      document.querySelector("#photo-notes-copy").textContent = "OCR \u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u5DF2\u56DE\u9000\u5230\u6587\u4EF6\u540D\u548C\u672C\u5730\u89C4\u5219\u63A8\u65AD\u3002";
      ocrStatus.textContent = "OCR \u5F53\u524D\u4E0D\u53EF\u7528\uFF0C\u5DF2\u4F7F\u7528\u672C\u5730\u63A8\u65AD\u3002";
    }
    state.activeBean = nextBean;
    state.activeSuggestion = buildSuggestion({
      bean: state.activeBean,
      equipment: getActiveEquipmentProfile()
    });
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
    navButtons.forEach((button) => {
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
        source: document.querySelector("#brew-bean").value === state.activeBean.name ? "suggestion" : "manual"
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
      state.equipmentState = updateEquipmentProfile(
        state.equipmentState,
        buildEquipmentProfile({
          id: selectedProfile.id,
          name: equipmentNameInput.value,
          dripper: readEquipmentField("dripper"),
          grinder: readEquipmentField("grinder"),
          filters: readEquipmentField("filters")
        })
      );
      persistEquipment();
      refreshSuggestionForCurrentContext();
      renderAll();
      equipmentFeedback.textContent = "\u8BBE\u5907\u6863\u6848\u5DF2\u66F4\u65B0\uFF0C\u5E76\u5DF2\u540C\u6B65\u5230\u5EFA\u8BAE\u548C\u9ED8\u8BA4\u503C\u3002";
    });
    document.querySelector("#set-default-profile").addEventListener("click", () => {
      state.equipmentState = setActiveEquipmentProfile(
        state.equipmentState,
        state.selectedEquipmentProfileId
      );
      persistEquipment();
      refreshSuggestionForCurrentContext();
      renderAll();
      equipmentFeedback.textContent = "\u5F53\u524D\u7EC4\u5408\u5DF2\u8BBE\u4E3A\u9ED8\u8BA4\u8BBE\u5907\u6863\u6848\u3002";
    });
    document.querySelector("#new-profile").addEventListener("click", () => {
      const nextId = `profile-${Date.now()}`;
      const baseProfile = getActiveEquipmentProfile();
      const nextProfile = buildEquipmentProfile({
        id: nextId,
        name: "\u65B0\u8BBE\u5907\u7EC4\u5408",
        dripper: baseProfile.dripper,
        grinder: baseProfile.grinder,
        filters: baseProfile.filters
      });
      state.equipmentState = {
        ...state.equipmentState,
        profiles: [...state.equipmentState.profiles, nextProfile]
      };
      state.selectedEquipmentProfileId = nextId;
      persistEquipment();
      renderAll();
      equipmentFeedback.textContent = "\u5DF2\u65B0\u5EFA\u8BBE\u5907\u7EC4\u5408\u3002";
    });
    document.querySelector("#delete-profile").addEventListener("click", () => {
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
      refreshSuggestionForCurrentContext();
      renderAll();
      equipmentFeedback.textContent = "\u5F53\u524D\u8BBE\u5907\u7EC4\u5408\u5DF2\u5220\u9664\u3002";
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
        refreshSuggestionForCurrentContext();
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
      const button = event.target.closest("[data-profile-id]");
      if (!button) {
        return;
      }
      state.selectedEquipmentProfileId = button.dataset.profileId;
      renderEquipment();
      renderEquipmentProfiles();
    });
    beanInventoryList.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) {
        return;
      }
      const beanId = actionButton.dataset.beanId;
      if (!beanId) {
        return;
      }
      if (actionButton.dataset.action === "edit-bean") {
        state.selectedInventoryBeanId = beanId;
        renderBeanInventoryProfiles();
        renderBeanInventoryEditor();
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
        state.inventoryPhotoDataUrl = "";
        persistBeanInventory();
        renderAll();
        beanInventoryFeedback.textContent = "\u5F53\u524D\u8C46\u5B50\u5DF2\u4ECE\u5E93\u5B58\u91CC\u79FB\u9664\u3002";
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
      beanInventoryFeedback.textContent = isEditing ? "\u5F53\u524D\u8C46\u5B50\u5DF2\u66F4\u65B0\u3002" : "\u65B0\u8C46\u5B50\u5DF2\u52A0\u5165\u5E93\u5B58\u3002";
    });
    document.querySelector("#new-bean").addEventListener("click", () => {
      state.selectedInventoryBeanId = "";
      state.inventoryPhotoDataUrl = "";
      if (state.inventoryPreviewUrl) {
        URL.revokeObjectURL(state.inventoryPreviewUrl);
        state.inventoryPreviewUrl = "";
      }
      renderBeanInventoryProfiles();
      renderBeanInventoryEditor();
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
      state.inventoryPhotoDataUrl = "";
      persistBeanInventory();
      renderAll();
      beanInventoryFeedback.textContent = "\u5F53\u524D\u8C46\u5B50\u5DF2\u4ECE\u5E93\u5B58\u91CC\u79FB\u9664\u3002";
    });
    inventoryPhotoUpload.addEventListener("change", async (event) => {
      const [file] = event.target.files || [];
      await handleInventoryPhotoUpload(file);
    });
    brewBeanSelect.addEventListener("change", () => {
      const bean = getLinkedBeanForBrewForm(brewBeanSelect.value);
      if (!bean) {
        renderBrewInlineExperience();
        return;
      }
      state.activeBean = beanProfileToActiveBean(bean);
      refreshSuggestionForCurrentContext();
      applyBeanDetailsToBrewForm(
        resolveBrewBeanDetails({
          linkedBean: bean,
          fallbackBean: state.activeBean
        })
      );
      renderSuggestion();
      renderBrewInlineExperience();
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
      state.activeBean = {
        ...state.activeBean,
        name: assistFields.name.value.trim(),
        roaster: assistFields.roaster.value.trim(),
        farm: assistFields.farm.value.trim(),
        origin: assistFields.origin.value.trim(),
        variety: assistFields.variety.value.trim(),
        process: assistFields.process.value.trim(),
        roastDate: assistFields.roastDate.value.trim(),
        flavorFocus: assistFields.flavorFocus.value.trim()
      };
      refreshSuggestionForCurrentContext();
      renderSuggestion();
      prefillBrewForm();
      saveFeedback.textContent = "\u8BC6\u522B\u7ED3\u679C\u548C\u5EFA\u8BAE\u53C2\u6570\u5DF2\u7ECF\u5E26\u5165\u8BB0\u5F55\u9875\uFF0C\u53EF\u4EE5\u7EE7\u7EED\u8C03\u6574\u540E\u4FDD\u5B58\u3002";
      setView("brew");
    });
    populateEquipmentSelects();
    state.selectedEquipmentProfileId = state.equipmentState.activeProfileId;
    state.selectedInventoryBeanId = "";
    refreshSuggestionForCurrentContext();
    renderAll();
    bindRatingOutput();
    setView("home");
    window.__appBootError = null;
  } catch (error) {
    reportBootError(error, "boot");
  }
})();
