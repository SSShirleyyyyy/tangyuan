function titleize(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

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
];

function findLineValue(text, label) {
  const regex = new RegExp(`${label}\\s*[:：]\\s*(.+)`, "i");
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

export function inferPhotoLabel(file) {
  return file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

export function extractBeanDetailsFromText(text) {
  const normalized = text.replace(/\r/g, "").trim();
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const roastDate =
    findLineValue(normalized, "Roast Date") ||
    findLineValue(normalized, "Roasted On");
  const process = findLineValue(normalized, "Process") || "Washed";
  const variety = findLineValue(normalized, "Variety") || "Unknown Variety";
  const farm =
    findLineValue(normalized, "Producer") ||
    findLineValue(normalized, "Farm") ||
    "Unknown Farm";
  const origin =
    findLineValue(normalized, "Origin") ||
    lines.find((line) => /colombia|ethiopia|kenya|panama|guatemala/i.test(line)) ||
    "Producer Lot / Single Origin";
  const roaster =
    lines[0] || "Photo Inferred";
  const name =
    lines.find((line) => /gesha|geisha|sidra|bourbon|typica/i.test(line)) ||
    lines[1] ||
    "Single Origin Selection";
  const flavorFocus =
    findLineValue(normalized, "Notes") ||
    findLineValue(normalized, "Tasting Notes") ||
    inferFlavorFocus(normalized) ||
    "Floral lift, citrus, clean sweetness";

  return {
    name: titleize(name),
    roaster: titleize(roaster),
    farm: titleize(farm),
    origin: titleize(origin),
    variety: titleize(variety),
    process: titleize(process),
    roastLevel: /medium/i.test(normalized) ? "Medium" : "Light",
    flavorFocus,
    roastDate: roastDate || new Date().toISOString().slice(0, 10),
  };
}

export function inferBeanFromPhoto(file) {
  const label = inferPhotoLabel(file);
  const lower = label.toLowerCase();

  const process = lower.includes("natural") ? "Natural" : "Washed";
  const roastLevel = lower.includes("medium") ? "Medium" : "Light";
  const variety = lower.includes("gesha") ? "Gesha" : "Unknown Variety";
  const name = lower.includes("gesha")
    ? `${titleize(label.replace(/\bwashed\b|\bnatural\b|\bmedium\b|\blight\b/g, "").trim()) || "Reserve"} Gesha`
    : titleize(label) || "Single Origin Selection";

  const origin = lower.includes("colombia")
    ? "Huila, Colombia"
    : lower.includes("ethiopia")
      ? "Yirgacheffe, Ethiopia"
      : "Producer Lot / Single Origin";
  const farm = lower.includes("flores")
    ? "Las Flores"
    : "Unknown Farm";

  const flavorFocus = process === "Natural"
    ? "Berry sweetness, cacao, round finish"
    : "Floral lift, citrus, clean sweetness";

  return {
    name,
    roaster: "Photo Inferred",
    farm,
    origin,
    variety,
    process,
    roastLevel,
    flavorFocus,
    roastDate: new Date().toISOString().slice(0, 10),
  };
}
