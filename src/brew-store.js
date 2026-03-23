export const BREW_STORAGE_KEY = "pourover-journal-brews-v2";

function formatBrewDate(date = new Date()) {
  const month = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "Asia/Shanghai",
  }).format(date);
  const day = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);

  return `${month} ${day}`;
}

export function initializeBrews(serializedValue, seedBrews) {
  if (!serializedValue) {
    return seedBrews;
  }

  try {
    return JSON.parse(serializedValue);
  } catch {
    return seedBrews;
  }
}

export function buildBrewEntry(formValues) {
  return {
    id: `brew-${Date.now()}`,
    createdAt: new Date().toISOString(),
    date: formatBrewDate(),
    bean: formValues.bean.trim(),
    beanId: formValues.beanId?.trim() || "",
    roaster: formValues.roaster?.trim() || "",
    farm: formValues.farm?.trim() || "",
    origin: formValues.origin?.trim() || "",
    variety: formValues.variety?.trim() || "",
    process: formValues.process?.trim() || "",
    roastLevel: formValues.roastLevel?.trim() || "",
    roastDate: formValues.roastDate?.trim() || "",
    dripper: formValues.dripper,
    grinder: formValues.grinder?.trim() || "",
    filters: formValues.filters?.trim() || "",
    dose: Number(formValues.dose) || 0,
    ratio: formValues.ratio.trim(),
    temp: formValues.temp?.trim() || "",
    grind: formValues.grind?.trim() || "",
    pours: formValues.pours?.trim() || "",
    note: formValues.notes?.trim() || "",
    rating: Number(formValues.rating),
    source: formValues.source || "manual",
  };
}

export function filterBrews(
  brews,
  { beanQuery = "", dripper = "all", minRating = 0 }
) {
  const query = beanQuery.trim().toLowerCase();

  return brews.filter((brew) => {
    const matchesBean =
      query.length === 0 || brew.bean.toLowerCase().includes(query);
    const matchesDripper = dripper === "all" || brew.dripper === dripper;
    const matchesRating = Number(brew.rating) >= Number(minRating);

    return matchesBean && matchesDripper && matchesRating;
  });
}

export function updateBrewEntry(brews, nextBrew) {
  return brews.map((brew) => (brew.id === nextBrew.id ? nextBrew : brew));
}

export function removeBrewEntry(brews, brewId) {
  return brews.filter((brew) => brew.id !== brewId);
}
