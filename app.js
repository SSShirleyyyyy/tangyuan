import {
  equipmentProfile as defaultEquipmentProfile,
  seedBrews,
} from "./src/mock-data.js";
import {
  describePreference,
  formatBeanInventoryStatusLine,
  formatHeroDate,
  formatInventoryDeductionPreview,
  getEquipmentProfileSpecs,
  formatPourPlan,
  formatRecentBrewCardPreview,
  formatRecentBrewSupplierLine,
  getUnlinkedInventoryStateCopy,
} from "./src/presentation.js";
import {
  BREW_STORAGE_KEY,
  buildBrewEntry,
  filterBrews,
  initializeBrews,
  removeBrewEntry,
  resolveInitialBrewBeanDetails,
  resolveBrewBeanDetails,
  updateBrewEntry,
} from "./src/brew-store.js";
import {
  classifyPhotoAnalysisFailure,
  extractBeanDetailsFromText,
  inferBeanFromPhoto,
  inferPhotoLabel,
  mergeDetectedBean,
} from "./src/photo-analysis.js";
import {
  EQUIPMENT_STORAGE_KEY,
  buildEquipmentProfile,
  initializeEquipmentState,
  removeEquipmentProfile,
  setActiveEquipmentProfile,
  updateEquipmentProfile,
} from "./src/equipment-store.js";
import {
  CUSTOM_OPTION,
  equipmentCatalog,
} from "./src/equipment-catalog.js";
import {
  applyBrewInventoryChange,
  BEAN_INVENTORY_STORAGE_KEY,
  buildBeanProfile,
  getBeanInventoryStatus,
  initializeBeanInventoryState,
  removeBeanProfile,
  setActiveBeanProfile,
  updateBeanProfile,
} from "./src/bean-inventory.js";
import {
  buildBackupFilename,
  buildBackupPayload,
  restoreBackupPayload,
} from "./src/data-backup.js";

const views = [...document.querySelectorAll("[data-view]")];
const viewButtons = [...document.querySelectorAll("[data-view-target]")];
const navButtons = [...document.querySelectorAll("[data-nav-tab='true']")];
const brewForm = document.querySelector("#brew-form");
const brewDetail = document.querySelector("#brew-detail");
const saveFeedback = document.querySelector("#save-feedback");
const equipmentForm = document.querySelector("#equipment-form");
const equipmentFeedback = document.querySelector("#equipment-feedback");
const equipmentListFeedback = document.querySelector("#equipment-list-feedback");
const equipmentNameInput = document.querySelector("#equipment-name");
const exportBackupButton = document.querySelector("#export-backup");
const importBackupInput = document.querySelector("#import-backup");
const backupFeedback = document.querySelector("#backup-feedback");
const beanInventoryForm = document.querySelector("#bean-inventory-form");
const beanInventoryFeedback = document.querySelector("#bean-inventory-feedback");
const beanInventoryListFeedback = document.querySelector("#bean-inventory-list-feedback");
const beanInventoryList = document.querySelector("#bean-inventory-list");
const saveBeanButton = document.querySelector("#save-bean");
const inventoryPhotoUpload = document.querySelector("#inventory-photo-upload");
const inventoryPhotoPreview = document.querySelector("#inventory-photo-preview");
const inventoryPhotoPreviewFrame = document.querySelector("#inventory-photo-preview-frame");
const inventoryPhotoTitle = document.querySelector("#inventory-photo-title");
const inventoryPhotoMeta = document.querySelector("#inventory-photo-meta");
const photoUpload = document.querySelector("#photo-upload");
const photoPreview = document.querySelector("#photo-preview");
const photoPreviewFrame = document.querySelector("#photo-preview-frame");
const photoAssistPanel = document.querySelector("#photo-assist-panel");
const ocrStatus = document.querySelector("#ocr-status");
const equipmentProfileList = document.querySelector("#equipment-profile-list");
const brewBeanSelect = document.querySelector("#brew-bean-id");
const brewEquipmentProfileSelect = document.querySelector("#brew-equipment-profile");
const brewBeanStatusCard = document.querySelector("#brew-bean-status-card");
const brewBeanStatusTitle = document.querySelector("#brew-bean-status-title");
const brewBeanStatusMeta = document.querySelector("#brew-bean-status-meta");
const brewBeanStatusCopy = document.querySelector("#brew-bean-status-copy");
const assistFields = {
  name: document.querySelector("#assist-bean-name"),
  roaster: document.querySelector("#assist-roaster"),
  farm: document.querySelector("#assist-farm"),
  origin: document.querySelector("#assist-origin"),
  variety: document.querySelector("#assist-variety"),
  process: document.querySelector("#assist-process"),
  roastDate: document.querySelector("#assist-roast-date"),
  flavorFocus: document.querySelector("#assist-flavor-focus"),
};
const inventoryAssistFields = {
  roaster: document.querySelector("#inventory-assist-roaster"),
  farm: document.querySelector("#inventory-assist-farm"),
  origin: document.querySelector("#inventory-assist-origin"),
  variety: document.querySelector("#inventory-assist-variety"),
  process: document.querySelector("#inventory-assist-process"),
  roastDate: document.querySelector("#inventory-assist-roast-date"),
  flavorFocus: document.querySelector("#inventory-assist-flavor-focus"),
};
const equipmentFields = [
  "dripper",
  "grinder",
  "filters",
];
const legacyDripperOptions = ["V60", "Kalita Wave", "Origami Air S"];

const url = new URL(window.location.href);
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

const state = {
  brews: initializeBrews(localStorage.getItem(BREW_STORAGE_KEY), []),
  equipmentState: initializeEquipmentState(
    localStorage.getItem(EQUIPMENT_STORAGE_KEY),
    defaultEquipmentProfile
  ),
  beanInventoryState: initializeBeanInventoryState(
    localStorage.getItem(BEAN_INVENTORY_STORAGE_KEY)
  ),
  selectedEquipmentProfileId: "profile-1",
  selectedInventoryBeanId: "",
  filters: {
    beanQuery: "",
    dripper: "all",
    minRating: 0,
  },
  activeBean: createEmptyBeanDetails(),
  assistBean: createEmptyBeanDetails(),
  hoveredBrewId: null,
  selectedBrewId: null,
  editingBrewId: null,
  previewUrl: "",
  inventoryPreviewUrl: "",
  inventoryPhotoDataUrl: "",
};

const ocrWorkerCache = new Map();

function reportBootError(error, stage = "unknown") {
  const message = error instanceof Error ? error.message : String(error);
  window.__appBootError = { stage, message };
  console.error("[app boot error]", stage, error);
  const banner = document.querySelector("#boot-error-banner");
  if (banner) {
    banner.hidden = false;
    banner.textContent = `页面启动失败：${stage} · ${message}`;
  }
}

function compactText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function displayText(value, fallback = "-") {
  const nextValue = compactText(value);
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
    roastDate: "",
  };
}

function readInventoryBeanFormDetails() {
  return {
    name: document.querySelector("#inventory-bean-name")?.value || "",
    roaster: document.querySelector("#inventory-roaster")?.value || "",
    farm: document.querySelector("#inventory-farm")?.value || "",
    origin: document.querySelector("#inventory-origin")?.value || "",
    variety: document.querySelector("#inventory-variety")?.value || "",
    process: document.querySelector("#inventory-process")?.value || "",
    roastLevel: document.querySelector("#inventory-roast-level")?.value || "",
    roastDate: document.querySelector("#inventory-roast-date")?.value || "",
    flavorFocus: "",
  };
}

function renderInventoryPhotoSummary(details = createEmptyBeanDetails()) {
  inventoryPhotoTitle.textContent = compactText(details.name) || "待识别";
  inventoryPhotoMeta.textContent = [
    compactText(details.roaster),
    compactText(details.origin),
    compactText(details.roastDate) ? `烘焙 ${compactText(details.roastDate)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  inventoryAssistFields.roaster.textContent = displayText(details.roaster, "—");
  inventoryAssistFields.farm.textContent = displayText(details.farm, "—");
  inventoryAssistFields.origin.textContent = displayText(details.origin, "—");
  inventoryAssistFields.variety.textContent = displayText(details.variety, "—");
  inventoryAssistFields.process.textContent = displayText(details.process, "—");
  inventoryAssistFields.roastDate.textContent = displayText(details.roastDate, "—");
  inventoryAssistFields.flavorFocus.textContent = displayText(
    details.flavorFocus,
    "—"
  );
}

function setPhotoPreviewVisibility(previewElement, frameElement, hasImage) {
  previewElement.classList.toggle("has-image", hasImage);
  frameElement.classList.toggle("is-empty", !hasImage);
}

function truncateText(value, maxLength) {
  const nextValue = compactText(value);
  if (!nextValue) {
    return "";
  }

  if (nextValue.length <= maxLength) {
    return nextValue;
  }

  return `${nextValue.slice(0, maxLength - 1).trimEnd()}…`;
}

function setBrewDetailVisibility(isVisible) {
  brewDetail.classList.toggle("is-hidden", !isVisible);
  brewDetail.toggleAttribute("hidden", !isVisible);
  document
    .querySelector(".brews-shell")
    ?.classList.toggle("is-single-column", !isVisible);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function getOcrWorker(language) {
  if (!globalThis.Tesseract?.createWorker) {
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
    willReadFrequently: true,
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
      pixels[index] * 0.299 +
        pixels[index + 1] * 0.587 +
        pixels[index + 2] * 0.114
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
    const contrasted = ((pixels[index] - min) / spread) * 255;
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
  const [processedImage, englishWorker, chineseWorker] = await Promise.all([
    preprocessImageForOcr(file),
    getOcrWorker("eng"),
    getOcrWorker("chi_sim"),
  ]);

  const textParts = [];

  if (englishWorker) {
    const originalResult = await englishWorker.recognize(file);
    const processedResult = await englishWorker.recognize(processedImage);
    textParts.push(originalResult?.data?.text || "", processedResult?.data?.text || "");
  }

  if (chineseWorker) {
    const chineseResult = await chineseWorker.recognize(processedImage);
    textParts.push(chineseResult?.data?.text || "");
  }

  return textParts
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join("\n");
}

async function analyzePhotoWithModel(file, mode) {
  const imageDataUrl = await fileToDataUrl(file);
  const response = await fetch("/api/photo-analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageDataUrl,
      mode,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "模型识别暂时不可用");
  }

  return await response.json();
}

function getActiveEquipmentProfile() {
  return (
    state.equipmentState.profiles.find(
      (profile) => profile.id === state.equipmentState.activeProfileId
    ) || state.equipmentState.profiles[0]
  );
}

function getSelectedEquipmentProfile() {
  return (
    state.equipmentState.profiles.find(
      (profile) => profile.id === state.selectedEquipmentProfileId
    ) || null
  );
}

function getEquipmentProfileById(profileId) {
  return (
    state.equipmentState.profiles.find((profile) => profile.id === profileId) || null
  );
}

function getBrewEquipmentProfile(profileId = brewEquipmentProfileSelect?.value) {
  return getEquipmentProfileById(profileId);
}

function getActiveInventoryBean() {
  return (
    state.beanInventoryState.beans.find(
      (bean) => bean.id === state.beanInventoryState.activeBeanId
    ) || state.beanInventoryState.beans[0] || null
  );
}

function getSelectedInventoryBean() {
  return (
    state.beanInventoryState.beans.find(
      (bean) => bean.id === state.selectedInventoryBeanId
    ) || null
  );
}

function getInventoryStatusCopy(readiness) {
  if (readiness === "resting") {
    return "再等等";
  }

  if (readiness === "ready") {
    return "现在适合冲";
  }

  return "窗口后段";
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
    roastDate: bean.roastDate,
  };
}

function getLinkedBeanForBrewForm(beanId = brewBeanSelect.value) {
  const targetId = beanId || "";
  if (!targetId) {
    return null;
  }

  return (
    state.beanInventoryState.beans.find((bean) => bean.id === targetId) || null
  );
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
  const linkedBean = state.beanInventoryState.beans.find(
    (bean) => bean.id === brewBeanSelect.value
  );
  const currentDose = Number(document.querySelector("#brew-dose")?.value) || 0;

  if (linkedBean) {
    brewBeanStatusCard.hidden = false;
    const status = getBeanInventoryStatus(linkedBean);
    brewBeanStatusTitle.textContent = `已关联 ${linkedBean.name}`;
    brewBeanStatusMeta.textContent = formatBeanInventoryStatusLine({
      restDay: status.restDay,
      readiness: status.readiness,
      currentWeight: linkedBean.currentWeight,
      isLowStock: status.isLowStock,
    });
    brewBeanStatusCopy.textContent = formatInventoryDeductionPreview({
      beanName: linkedBean.name,
      currentWeight: linkedBean.currentWeight,
      dose: currentDose,
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
    "#brew-notes",
  ].some((selector) => compactText(document.querySelector(selector).value));
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
    new Date().toISOString()
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

  equipmentNameInput.value = selectedProfile?.name || "";
  equipmentFields.forEach((field) => {
    const select = document.querySelector(`#equipment-${field}`);
    const customInput = document.querySelector(`#equipment-${field}-custom`);
    const value = selectedProfile?.[field] || baseProfile[field];
    const options = equipmentCatalog[field];
    const isPreset = options.includes(value);

    select.value = isPreset ? value : CUSTOM_OPTION;
    customInput.value = isPreset ? "" : value;
    customInput.classList.toggle("is-hidden", isPreset);
  });

  document.querySelector("#set-default-profile").disabled =
    !selectedProfile || selectedProfile.id === state.equipmentState.activeProfileId;
  document.querySelector("#delete-profile").disabled =
    !selectedProfile || state.equipmentState.profiles.length === 1;
  equipmentFeedback.textContent = isEditing
    ? "更新这套组合。"
    : "保存为新组合。";
  renderEquipmentEditorPreview();
}

function renderEquipmentEditorPreview() {
  const previewName = document.querySelector("#equipment-preview-name");
  const previewSpecs = document.querySelector("#equipment-preview-specs");
  const name = compactText(equipmentNameInput.value) || "未命名组合";
  const profile = {
    dripper: compactText(readEquipmentField("dripper")) || "待选滤杯",
    grinder: compactText(readEquipmentField("grinder")) || "待选研磨器",
    filters: compactText(readEquipmentField("filters")) || "待选滤纸",
  };

  previewName.textContent = name;
  previewSpecs.innerHTML = getEquipmentProfileSpecs(profile)
    .map(
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
    )
    .join("");
}

function renderEquipmentProfiles() {
  equipmentProfileList.innerHTML = state.equipmentState.profiles
    .map((profile) => {
      const isSelected = profile.id === state.selectedEquipmentProfileId;
      const isDefault = profile.id === state.equipmentState.activeProfileId;
      const specs = getEquipmentProfileSpecs(profile)
        .map(
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
        )
        .join("");

      return `
        <article class="equipment-profile-item equipment-profile-card ${isSelected ? "is-selected" : ""}" data-profile-id="${profile.id}">
          <div class="inventory-bean-title-row">
            <div class="equipment-profile-copy">
              <strong>${escapeHtml(profile.name)}</strong>
              <p class="equipment-profile-meta">${escapeHtml(
                isDefault ? "默认组合" : "已保存组合"
              )}</p>
            </div>
            <div class="brew-actions inventory-card-actions">
              <button class="icon-button inventory-icon-button" type="button" data-action="edit-profile" data-profile-id="${profile.id}" aria-label="编辑设备组合">✍️</button>
              <button class="icon-button inventory-icon-button" type="button" data-action="delete-profile-inline" data-profile-id="${profile.id}" aria-label="删除设备组合">🗑️</button>
            </div>
          </div>
          <div class="equipment-spec-list">${specs}</div>
          <div class="inventory-chip-row">
            ${isDefault ? '<span class="inventory-chip inventory-chip--default">默认组合</span>' : '<span class="inventory-chip">可编辑</span>'}
          </div>
        </article>
      `;
    })
    .join("");
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
    ...getBeanInventoryStatus(bean),
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
    <div><span>适合冲</span><strong>${readyCount}</strong></div>
    <div><span>养豆中</span><strong>${restingCount}</strong></div>
    <div><span>低库存</span><strong>${lowStockCount}</strong></div>
  `;

  summaryList.innerHTML = statuses
    .slice()
    .sort((left, right) => {
      if (left.isLowStock !== right.isLowStock) {
        return left.isLowStock ? -1 : 1;
      }

      if (left.readiness !== right.readiness) {
        return left.readiness === "ready" ? -1 : 1;
      }

      return left.bean.currentWeight - right.bean.currentWeight;
    })
    .slice(0, 3)
    .map(
      ({ bean, restDay, readiness, isLowStock }) => `
        <li>
          <span>${escapeHtml(bean.name)}</span>
          <strong>${escapeHtml(getInventoryStatusCopy(readiness))} · 第 ${restDay} 天${
            isLowStock ? " · 低库存" : ""
          }</strong>
        </li>
      `
    )
    .join("");
}

function renderBeanInventoryProfiles() {
  if (!state.beanInventoryState.beans.length) {
    beanInventoryList.innerHTML = `
      <article class="inventory-empty-state">
        <p class="card-kicker">还没有豆子</p>
        <h4>先建第一支豆子</h4>
      </article>
    `;
    return;
  }

  beanInventoryList.innerHTML = state.beanInventoryState.beans
    .map((bean) => {
      const status = getBeanInventoryStatus(bean);
      const isSelected = bean.id === state.selectedInventoryBeanId;
      const isDefault = bean.id === state.beanInventoryState.activeBeanId;
      const metaParts = [bean.roaster, bean.process, bean.origin].filter(Boolean);
      const metaLine = metaParts.length ? metaParts.join(" · ") : "待补充信息";

      return `
        <article class="equipment-profile-item inventory-profile-item ${isSelected ? "is-selected" : ""}" data-bean-id="${bean.id}">
          <div class="inventory-bean-card">
            <div class="inventory-bean-thumb">
              ${
                bean.photoDataUrl
                  ? `<img src="${bean.photoDataUrl}" alt="${escapeHtml(bean.name)} cover" />`
                  : "<span>bean</span>"
              }
            </div>
            <div class="inventory-bean-copy">
              <div class="inventory-bean-title-row">
                <strong class="inventory-bean-name">${escapeHtml(bean.name)}</strong>
                <div class="brew-actions inventory-card-actions">
                  <button class="icon-button inventory-icon-button" type="button" data-action="edit-bean" data-bean-id="${bean.id}" aria-label="编辑豆子">✍️</button>
                  <button class="icon-button inventory-icon-button" type="button" data-action="delete-bean-inline" data-bean-id="${bean.id}" aria-label="删除豆子">🗑️</button>
                </div>
              </div>
              <p class="inventory-bean-meta">${escapeHtml(metaLine)}</p>
              <div class="inventory-chip-row">
                <span class="inventory-chip">第 ${status.restDay} 天</span>
                <span class="inventory-chip inventory-chip--status">${escapeHtml(getInventoryStatusCopy(status.readiness))}</span>
                <span class="inventory-chip">${bean.currentWeight}g 剩余</span>
                ${isDefault ? '<span class="inventory-chip inventory-chip--default">默认豆子</span>' : ""}
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
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
    editorMode.textContent = "新建豆子";
    editorCaption.textContent = "拍照或直接录入。";
    saveBeanButton.textContent = "保存新豆子";
    inventoryNote.hidden = true;
    inventoryNoteChips.innerHTML = "";
    restCopy.textContent = "";
    stockCopy.textContent = "";
    setPhotoPreviewVisibility(inventoryPhotoPreview, inventoryPhotoPreviewFrame, false);
    inventoryPhotoPreview.removeAttribute("src");
    inventoryPhotoPreview.alt = "Inventory bean cover preview";
    renderInventoryPhotoSummary(createEmptyBeanDetails());
    photoCopy.textContent = "拍照后自动回填。";
    photoStatus.textContent = "";
    document.querySelector("#set-default-bean").disabled = true;
    document.querySelector("#delete-bean").disabled = true;
    return;
  }

  editorMode.textContent = `编辑豆子 · ${selectedBean.name}`;
  editorCaption.textContent = "继续补齐这支豆子的档案。";
  saveBeanButton.textContent = "更新当前豆子";
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
  inventoryPhotoPreview.alt = selectedBean.name
    ? `${selectedBean.name} cover`
    : "Inventory bean cover preview";
  renderInventoryPhotoSummary({
    name: selectedBean.name,
    roaster: selectedBean.roaster || "",
    farm: selectedBean.farm || "",
    origin: selectedBean.origin || "",
    variety: selectedBean.variety || "",
    process: selectedBean.process || "",
    roastDate: selectedBean.roastDate || "",
    flavorFocus: "",
  });
  photoCopy.textContent = "会更新封面和识别字段。";
  photoStatus.textContent = "";

  const status = getBeanInventoryStatus(selectedBean);
  inventoryNote.hidden = false;
  inventoryNoteChips.innerHTML = [
    `<span class="inventory-chip">第 ${status.restDay} 天</span>`,
    `<span class="inventory-chip inventory-chip--status">${escapeHtml(
      getInventoryStatusCopy(status.readiness)
    )}</span>`,
    `<span class="inventory-chip">${selectedBean.currentWeight}g 剩余</span>`,
    status.isLowStock
      ? '<span class="inventory-chip inventory-chip--default">接近补货线</span>'
      : "",
  ]
    .filter(Boolean)
    .join("");
  restCopy.textContent = `建议在第 ${selectedBean.restStartDay}-${selectedBean.restEndDay} 天冲。`;
  stockCopy.textContent = `${selectedBean.currentWeight}g / ${selectedBean.totalWeight}g。`;
  document.querySelector("#set-default-bean").disabled =
    selectedBean.id === state.beanInventoryState.activeBeanId;
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
    beanInventoryState: state.beanInventoryState,
  });
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildBackupFilename(payload.createdAt);
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
  document.querySelector("#inventory-photo-status").textContent = "正在识别豆袋信息…";

  let nextBean = inferBeanFromPhoto(file);

  try {
    const modelResult = await analyzePhotoWithModel(file, "inventory");
    nextBean = mergeDetectedBean(nextBean, modelResult.bean);
    document.querySelector("#inventory-photo-copy").textContent = "已识别并回填。";
    document.querySelector("#inventory-photo-status").textContent =
      "识别完成";
  } catch (error) {
    const failureKind = classifyPhotoAnalysisFailure(
      error instanceof Error ? error.message : String(error)
    );
    try {
      const extractedText = await recognizePhotoText(file);
      if (extractedText) {
        nextBean = mergeDetectedBean(nextBean, extractBeanDetailsFromText(extractedText));
        document.querySelector("#inventory-photo-copy").textContent = "已识别并回填。";
        document.querySelector("#inventory-photo-status").textContent =
          failureKind === "model_unavailable" ? "当前使用本地识别" : "识别完成";
      } else {
        document.querySelector("#inventory-photo-copy").textContent = "未识别到可靠字段。";
        document.querySelector("#inventory-photo-status").textContent = "未提取到可靠字段。";
      }
    } catch {
      document.querySelector("#inventory-photo-copy").textContent = "当前无法自动识别。";
      document.querySelector("#inventory-photo-status").textContent = "暂时无法识别。";
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
    container.innerHTML =
      `
        <article class="brew-empty-state">
          <p class="card-kicker">还没有记录</p>
          <h4>先记下今天这杯</h4>
          <div class="brew-empty-actions">
            <button class="secondary-button" type="button" data-empty-target="brew">记录第一杯</button>
            <button class="secondary-button" type="button" data-empty-target="inventory">去建库存豆子</button>
          </div>
        </article>
      `;
    brewDetail.innerHTML = "";
    setBrewDetailVisibility(false);
    return;
  }

  container.innerHTML = filteredBrews
    .slice()
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
    .map(
      (brew) => {
        const preview = formatRecentBrewCardPreview({
          bean: brew.bean,
          roaster: brew.roaster,
        });
        const isActive =
          brew.id === state.hoveredBrewId || brew.id === state.selectedBrewId;

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
                <button class="icon-button" type="button" data-action="edit" data-brew-id="${brew.id}" aria-label="编辑记录">✍️</button>
                <button class="icon-button" type="button" data-action="delete" data-brew-id="${brew.id}" aria-label="删除记录">🗑️</button>
              </div>
            </div>
          </div>
        </article>
      `;
      }
    )
    .join("");

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
    <p class="supporting">${escapeHtml(displayText(hoveredBrew.roaster, "未填烘焙商"))} · ${escapeHtml(displayText(hoveredBrew.origin, "未填产区"))}</p>

    <div class="detail-block">
      <p><strong>庄园 / 处理站</strong></p>
      <p class="supporting">${escapeHtml(displayText(hoveredBrew.farm, "未填庄园 / 处理站"))}</p>
    </div>

    <div class="detail-block">
      <p><strong>处理方式 / 品种</strong></p>
      <p class="supporting">${escapeHtml(displayText(hoveredBrew.process))} · ${escapeHtml(displayText(hoveredBrew.variety))}</p>
    </div>

    <div class="detail-block">
      <p><strong>本次冲煮</strong></p>
      <p class="supporting">${escapeHtml(displayText(hoveredBrew.dripper))} · ${escapeHtml(displayText(hoveredBrew.grinder))} · ${escapeHtml(displayText(hoveredBrew.filters))} · ${escapeHtml(displayText(hoveredBrew.dose ? `${hoveredBrew.dose}g` : ""))} · ${escapeHtml(displayText(hoveredBrew.ratio))} · ${escapeHtml(displayText(hoveredBrew.temp))}</p>
    </div>

    <div class="detail-block">
      <p><strong>风味与评分</strong></p>
      <p class="supporting">${escapeHtml(displayText(hoveredBrew.note, "暂无风味记录"))} · ${Number(hoveredBrew.rating).toFixed(1)} / 5</p>
    </div>
  `;
}

function renderSuggestion() {
  const assistMeta = [
    state.assistBean.roaster,
    state.assistBean.origin,
    state.assistBean.roastDate ? `Roast ${state.assistBean.roastDate}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

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
  brewEquipmentProfileSelect.value = useActiveEquipment
    ? state.equipmentState.activeProfileId || ""
    : "";
  applyBeanDetailsToBrewForm(
    resolveInitialBrewBeanDetails({
      linkedBean: null,
      fallbackBean: state.activeBean,
      useFallbackBean,
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
      `<option value="${CUSTOM_OPTION}">自定义…</option>`,
    ].join("");
  });
}

function buildOptionMarkup(options, { placeholder = "", includeEmpty = false } = {}) {
  const uniqueOptions = [...new Set(options.filter(Boolean))];
  return [
    includeEmpty || placeholder !== ""
      ? `<option value="">${placeholder}</option>`
      : "",
    ...uniqueOptions.map((option) => `<option value="${option}">${option}</option>`),
  ]
    .filter(Boolean)
    .join("");
}

function populateBrewDripperOptions() {
  const brewDripperSelect = document.querySelector("#brew-dripper");
  const filterDripperSelect = document.querySelector("#filter-dripper");
  const currentBrewDripper = brewDripperSelect.value;
  const isEquipmentLinked = Boolean(brewEquipmentProfileSelect.value);
  const optionSet = new Set([
    ...equipmentCatalog.dripper,
    ...legacyDripperOptions,
    ...state.equipmentState.profiles.map((profile) => profile.dripper),
    ...state.brews.map((brew) => brew.dripper).filter(Boolean),
  ]);
  const dripperOptions = [...optionSet];

  brewDripperSelect.innerHTML = buildOptionMarkup(dripperOptions, { includeEmpty: true });
  brewDripperSelect.value =
    currentBrewDripper || (isEquipmentLinked ? getActiveEquipmentProfile().dripper : "");

  filterDripperSelect.innerHTML = [
    '<option value="all">全部</option>',
    ...dripperOptions.map((option) => `<option value="${option}">${option}</option>`),
  ].join("");

  filterDripperSelect.value = state.filters.dripper;
}

function populateBrewEquipmentProfileOptions() {
  const currentProfileId = brewEquipmentProfileSelect.value;
  const hasCurrentProfile = state.equipmentState.profiles.some(
    (profile) => profile.id === currentProfileId
  );
  brewEquipmentProfileSelect.innerHTML = [
    '<option value="">不关联设备库</option>',
    ...state.equipmentState.profiles.map(
      (profile) => `<option value="${profile.id}">${profile.name}</option>`
    ),
  ].join("");
  brewEquipmentProfileSelect.value =
    currentProfileId === ""
      ? ""
      : hasCurrentProfile
        ? currentProfileId
        : state.equipmentState.activeProfileId || "";
}

function populateBrewGrinderOptions() {
  const brewGrinderSelect = document.querySelector("#brew-grinder");
  const currentGrinder = brewGrinderSelect.value;
  const isEquipmentLinked = Boolean(brewEquipmentProfileSelect.value);
  const grinderOptions = [
    ...equipmentCatalog.grinder,
    ...state.equipmentState.profiles.map((profile) => profile.grinder),
    ...state.brews.map((brew) => brew.grinder).filter(Boolean),
  ];

  brewGrinderSelect.innerHTML = buildOptionMarkup(grinderOptions, { includeEmpty: true });
  brewGrinderSelect.value =
    currentGrinder || (isEquipmentLinked ? getActiveEquipmentProfile().grinder || "" : "");
}

function populateBrewBeanOptions() {
  const currentBeanId = brewBeanSelect.value;
  const unlinkedState = getUnlinkedInventoryStateCopy();
  brewBeanSelect.innerHTML = [
    `<option value="">${unlinkedState.optionLabel}</option>`,
    ...state.beanInventoryState.beans.map(
      (bean) => `<option value="${bean.id}">${bean.name}</option>`
    ),
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
  ocrStatus.textContent = "正在调用视觉模型识别豆袋信息…";

  let nextBean = inferBeanFromPhoto(file);

  try {
    const modelResult = await analyzePhotoWithModel(file, "brew");
    nextBean = mergeDetectedBean(nextBean, modelResult.bean);
    document.querySelector("#photo-notes-copy").textContent = "已完成模型识别。";
    ocrStatus.textContent = `模型识别已完成${modelResult.model ? ` · ${modelResult.model}` : ""}`;
  } catch (error) {
    const failureKind = classifyPhotoAnalysisFailure(
      error instanceof Error ? error.message : String(error)
    );
    try {
      const extractedText = await recognizePhotoText(file);
      if (extractedText) {
        nextBean = mergeDetectedBean(nextBean, extractBeanDetailsFromText(extractedText));
        document.querySelector("#photo-notes-copy").textContent = "当前使用本地识别。";
        ocrStatus.textContent =
          failureKind === "model_unavailable"
            ? "未启用大模型 · 本地 OCR"
            : "本地 OCR 已完成";
      } else {
        document.querySelector("#photo-notes-copy").textContent = "未识别到可靠字段。";
        ocrStatus.textContent = "未提取到可靠字段。";
      }
    } catch {
      document.querySelector("#photo-notes-copy").textContent =
        "当前无法自动识别。";
      ocrStatus.textContent = "模型和 OCR 当前都不可用。";
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

document
  .querySelectorAll("#filter-bean, #filter-dripper, #filter-rating")
  .forEach((input) => {
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
    source: formData.get("beanId") ? "inventory" : "manual",
  });

  const finalBrew = state.editingBrewId
    ? { ...brew, id: state.editingBrewId }
    : brew;
  const previousBrew = state.editingBrewId
    ? state.brews.find((entry) => entry.id === state.editingBrewId) || null
    : null;

  state.brews = state.editingBrewId
    ? updateBrewEntry(state.brews, finalBrew)
    : [finalBrew, ...state.brews];
  if (
    previousBrew?.beanId ||
    (finalBrew.beanId && finalBrew.dose > 0)
  ) {
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
  saveFeedback.textContent = finalBrew.beanId && finalBrew.dose > 0
    ? `已保存 ${finalBrew.bean}，并自动扣减 ${finalBrew.dose}g 库存。`
    : `已保存 ${finalBrew.bean} 这杯记录。`;
  setView("home");
});

equipmentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedProfile = getSelectedEquipmentProfile();
  const nextProfile = buildEquipmentProfile({
    id: selectedProfile?.id || `profile-${Date.now()}`,
    name: equipmentNameInput.value,
    dripper: readEquipmentField("dripper"),
    grinder: readEquipmentField("grinder"),
    filters: readEquipmentField("filters"),
  });

  state.equipmentState = selectedProfile
    ? updateEquipmentProfile(state.equipmentState, nextProfile)
    : {
        ...state.equipmentState,
        profiles: [...state.equipmentState.profiles, nextProfile],
      };
  state.selectedEquipmentProfileId = nextProfile.id;
  persistEquipment();
  renderAll();
  equipmentListFeedback.textContent = selectedProfile
    ? "设备组合已更新。"
    : "新设备组合已加入列表。";
  setView("equipment");
});

document.querySelector("#set-default-profile").addEventListener("click", () => {
  if (!state.selectedEquipmentProfileId) {
    equipmentFeedback.textContent = "先保存这套组合，再设为默认。";
    return;
  }

  state.equipmentState = setActiveEquipmentProfile(
    state.equipmentState,
    state.selectedEquipmentProfileId
  );
  persistEquipment();
  renderAll();
  equipmentFeedback.textContent = "当前组合已设为默认设备档案。";
  equipmentListFeedback.textContent = "默认设备组合已更新。";
});

document.querySelector("#delete-profile").addEventListener("click", () => {
  if (!state.selectedEquipmentProfileId) {
    equipmentFeedback.textContent = "先打开一套已保存的组合，再删除。";
    return;
  }

  if (state.equipmentState.profiles.length === 1) {
    equipmentFeedback.textContent = "至少需要保留一套设备组合。";
    return;
  }

  state.equipmentState = removeEquipmentProfile(
    state.equipmentState,
    state.selectedEquipmentProfileId
  );
  state.selectedEquipmentProfileId = state.equipmentState.activeProfileId;
  persistEquipment();
  renderAll();
  equipmentListFeedback.textContent = "当前设备组合已删除。";
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
  equipmentFeedback.textContent = "正在新建设备组合。";
});

exportBackupButton.addEventListener("click", () => {
  downloadBackup();
  backupFeedback.textContent = "已导出当前浏览器里的全部记录、设备档案和豆子库存。";
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
    backupFeedback.textContent = "备份已恢复到当前浏览器。";
  } catch (error) {
    backupFeedback.textContent =
      error instanceof Error ? error.message : "导入失败，请确认备份文件是否完整。";
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

  const profileId = actionButton?.dataset.profileId || card?.dataset.profileId;
  if (!profileId) {
    return;
  }

  if (actionButton?.dataset.action === "delete-profile-inline") {
    if (state.equipmentState.profiles.length === 1) {
      equipmentListFeedback.textContent = "至少需要保留一套设备组合。";
      return;
    }

    state.equipmentState = removeEquipmentProfile(state.equipmentState, profileId);
    if (state.selectedEquipmentProfileId === profileId) {
      state.selectedEquipmentProfileId = state.equipmentState.activeProfileId;
    }
    persistEquipment();
    renderAll();
    equipmentListFeedback.textContent = "当前设备组合已删除。";
    return;
  }

  openEquipmentEditor(profileId);
  equipmentFeedback.textContent = "正在编辑这套设备组合。";
});

beanInventoryList.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  const card = event.target.closest("[data-bean-id]");
  if (!actionButton) {
    if (!card?.dataset.beanId) {
      return;
    }

    openBeanEditor(card.dataset.beanId);
    beanInventoryFeedback.textContent = "正在编辑这支库存豆子。";
    return;
  }

  const beanId = actionButton.dataset.beanId;
  if (!beanId) {
    return;
  }

  if (actionButton.dataset.action === "edit-bean") {
    openBeanEditor(beanId);
    beanInventoryFeedback.textContent = "正在编辑这支库存豆子。";
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
    beanInventoryListFeedback.textContent = "当前豆子已从库存里移除。";
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
      photoDataUrl: state.inventoryPhotoDataUrl,
    })
  );
  state.selectedInventoryBeanId = nextId;
  if (!state.beanInventoryState.activeBeanId) {
    state.beanInventoryState = setActiveBeanProfile(state.beanInventoryState, nextId);
  }
  persistBeanInventory();
  renderAll();
  beanInventoryListFeedback.textContent = isEditing
    ? "当前豆子已更新。"
    : "新豆子已加入库存。";
  setView("inventory");
});

document.querySelector("#new-bean-listing").addEventListener("click", () => {
  openBeanEditor("");
  beanInventoryFeedback.textContent = "正在新建一支库存豆子。";
});

document.querySelector("#save-bean-as-new").addEventListener("click", () => {
  state.selectedInventoryBeanId = "";
  renderBeanInventoryProfiles();
  renderBeanInventoryEditor();
  beanInventoryFeedback.textContent = "当前表单将作为新豆子保存，不会覆盖原来的库存豆子。";
});

document.querySelector("#set-default-bean").addEventListener("click", () => {
  if (!state.selectedInventoryBeanId) {
    beanInventoryFeedback.textContent = "先选择一支豆子，再设为默认。";
    return;
  }

  state.beanInventoryState = setActiveBeanProfile(
    state.beanInventoryState,
    state.selectedInventoryBeanId
  );
  persistBeanInventory();
  renderAll();
  beanInventoryFeedback.textContent = "当前豆子已设为默认。";
  beanInventoryListFeedback.textContent = "默认豆子已更新。";
});

document.querySelector("#delete-bean").addEventListener("click", () => {
  if (!state.selectedInventoryBeanId) {
    beanInventoryFeedback.textContent = "先选择一支豆子，再删除。";
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
  beanInventoryListFeedback.textContent = "当前豆子已从库存里移除。";
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
        useFallbackBean: false,
      })
    );
    renderBrewInlineExperience();
    return;
  }

  state.activeBean = beanProfileToActiveBean(bean);
  applyBeanDetailsToBrewForm(
    resolveBrewBeanDetails({
      linkedBean: bean,
      fallbackBean: state.activeBean,
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
  const nextHoveredId = card?.dataset.brewId || null;

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
    state.selectedBrewId =
      state.selectedBrewId === brewCard.dataset.brewId ? null : brewCard.dataset.brewId;
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
    saveFeedback.textContent = "已将这条记录带入编辑表单。";
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

document
  .querySelector("#apply-suggestion")
  .addEventListener("click", () => {
    state.assistBean = {
      ...state.assistBean,
      name: assistFields.name.value.trim(),
      roaster: assistFields.roaster.value.trim(),
      farm: assistFields.farm.value.trim(),
      origin: assistFields.origin.value.trim(),
      variety: assistFields.variety.value.trim(),
      process: assistFields.process.value.trim(),
      roastDate: assistFields.roastDate.value.trim(),
      flavorFocus: assistFields.flavorFocus.value.trim(),
    };
    state.activeBean = {
      ...state.assistBean,
    };
    renderSuggestion();
    brewBeanSelect.value = "";
    applyBeanDetailsToBrewForm(state.activeBean);
    renderBrewInlineExperience();
    saveFeedback.textContent = "识别字段已带入当前记录。";
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
      navigator.serviceWorker
        .register("./service-worker.js?v=20260327-1")
        .catch((error) => console.warn("[service worker]", error));
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
