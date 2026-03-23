import {
  analyzedBean,
  equipmentProfile as defaultEquipmentProfile,
  seedBrews,
} from "./src/mock-data.js";
import {
  describePreference,
  formatPourPlan,
} from "./src/presentation.js";
import {
  BREW_STORAGE_KEY,
  buildBrewEntry,
  filterBrews,
  initializeBrews,
  removeBrewEntry,
  updateBrewEntry,
} from "./src/brew-store.js";
import {
  extractBeanDetailsFromText,
  inferBeanFromPhoto,
  inferPhotoLabel,
} from "./src/photo-analysis.js";
import { buildSuggestion } from "./src/recommendation.js";
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

const views = [...document.querySelectorAll("[data-view]")];
const navButtons = [...document.querySelectorAll("[data-view-target]")];
const brewForm = document.querySelector("#brew-form");
const brewDetail = document.querySelector("#brew-detail");
const saveFeedback = document.querySelector("#save-feedback");
const equipmentForm = document.querySelector("#equipment-form");
const equipmentFeedback = document.querySelector("#equipment-feedback");
const equipmentNameInput = document.querySelector("#equipment-name");
const beanInventoryForm = document.querySelector("#bean-inventory-form");
const beanInventoryFeedback = document.querySelector("#bean-inventory-feedback");
const beanInventoryList = document.querySelector("#bean-inventory-list");
const photoUpload = document.querySelector("#photo-upload");
const photoPreview = document.querySelector("#photo-preview");
const photoAssistPanel = document.querySelector("#photo-assist-panel");
const ocrStatus = document.querySelector("#ocr-status");
const equipmentProfileList = document.querySelector("#equipment-profile-list");
const brewBeanSelect = document.querySelector("#brew-bean-id");
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
  activeBean: analyzedBean,
  activeSuggestion: buildSuggestion({
    bean: analyzedBean,
    equipment: initializeEquipmentState(
      localStorage.getItem(EQUIPMENT_STORAGE_KEY),
      defaultEquipmentProfile
    ).profiles[0],
  }),
  hoveredBrewId: null,
  selectedBrewId: null,
  editingBrewId: null,
  previewUrl: "",
};

let ocrWorkerPromise;

function compactText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
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

  return `${nextValue.slice(0, maxLength - 1).trimEnd()}…`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function getOcrWorker() {
  if (!globalThis.Tesseract?.createWorker) {
    return null;
  }

  if (!ocrWorkerPromise) {
    ocrWorkerPromise = globalThis.Tesseract.createWorker("eng");
  }

  return ocrWorkerPromise;
}

async function recognizePhotoText(file) {
  const worker = await getOcrWorker();
  if (!worker) {
    return "";
  }

  const result = await worker.recognize(file);
  return result?.data?.text?.trim() || "";
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
    ) || getActiveEquipmentProfile()
  );
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
    ) || getActiveInventoryBean()
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
    roaster: bean.roaster || "Unknown Roaster",
    farm: bean.farm || "Unknown Farm",
    origin: bean.origin || "Unknown Origin",
    variety: bean.variety || "Unknown Variety",
    process: bean.process || "Washed",
    roastLevel: bean.roastLevel || "Light",
    flavorFocus: "clean sweetness",
    roastDate: bean.roastDate,
  };
}

function setView(nextView) {
  views.forEach((view) => {
    view.classList.toggle("is-visible", view.dataset.view === nextView);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewTarget === nextView);
  });
}

function renderEquipment() {
  const activeProfile = getActiveEquipmentProfile();

  document.querySelector("#hero-dripper").textContent = activeProfile.dripper;
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
}

function renderEquipmentProfiles() {
  equipmentProfileList.innerHTML = state.equipmentState.profiles
    .map((profile) => {
      const isSelected = profile.id === state.selectedEquipmentProfileId;
      const isDefault = profile.id === state.equipmentState.activeProfileId;

      return `
        <button class="equipment-profile-item ${isSelected ? "is-selected" : ""}" data-profile-id="${profile.id}" type="button">
          <strong>${profile.name}</strong>
          <p class="supporting">${profile.dripper} · ${profile.grinder}</p>
          <p class="supporting">${isDefault ? "默认组合" : "点按编辑"}</p>
        </button>
      `;
    })
    .join("");
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
    summaryCopy.textContent = "还没有录入库存豆子，先在豆子库存页建一支常喝的豆。";
    summaryStats.innerHTML = "";
    summaryList.innerHTML = "";
    return;
  }

  const readyCount = statuses.filter((status) => status.readiness === "ready").length;
  const restingCount = statuses.filter(
    (status) => status.readiness === "resting"
  ).length;
  const lowStockCount = statuses.filter((status) => status.isLowStock).length;

  summaryCopy.textContent =
    "用养豆天数和剩余克数一起判断现在该冲哪支、哪支该补货。";
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
  beanInventoryList.innerHTML = state.beanInventoryState.beans
    .map((bean) => {
      const status = getBeanInventoryStatus(bean);
      const isSelected = bean.id === state.selectedInventoryBeanId;
      const isDefault = bean.id === state.beanInventoryState.activeBeanId;

      return `
        <button class="equipment-profile-item ${isSelected ? "is-selected" : ""}" data-bean-id="${bean.id}" type="button">
          <strong>${escapeHtml(bean.name)}</strong>
          <p class="supporting">第 ${status.restDay} 天 · ${escapeHtml(getInventoryStatusCopy(status.readiness))}</p>
          <p class="supporting">${bean.currentWeight}g 剩余${isDefault ? " · 默认豆子" : ""}</p>
        </button>
      `;
    })
    .join("");
}

function renderBeanInventoryEditor() {
  const selectedBean = getSelectedInventoryBean();
  const restCopy = document.querySelector("#inventory-rest-copy");
  const stockCopy = document.querySelector("#inventory-stock-copy");

  if (!selectedBean) {
    beanInventoryForm.reset();
    restCopy.textContent = "先新建一支豆子，才能开始追踪养豆与库存。";
    stockCopy.textContent = "保存后，这支豆子就能在记录页里自动带入并扣减库存。";
    return;
  }

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

  const status = getBeanInventoryStatus(selectedBean);
  restCopy.textContent = `当前养豆第 ${status.restDay} 天 · 建议在第 ${selectedBean.restStartDay}-${selectedBean.restEndDay} 天冲`;
  stockCopy.textContent = `${selectedBean.currentWeight}g / ${selectedBean.totalWeight}g，${
    status.isLowStock ? "已经接近补货线" : "库存还比较从容"
  }。`;
}

function renderRecentBrews() {
  const container = document.querySelector("#recent-brews");
  const filteredBrews = filterBrews(state.brews, state.filters);

  if (filteredBrews.length === 0) {
    container.innerHTML =
      '<p class="supporting">还没有符合筛选条件的记录，可以先保存一杯新的手冲。</p>';
    brewDetail.innerHTML =
      '<p class="supporting">把鼠标移到某条冲煮记录上，这里会显示它的完整信息。</p>';
    return;
  }

  container.innerHTML = filteredBrews
    .slice()
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
    .map(
      (brew) => {
        const title = displayText(brew.bean);
        const note = displayText(brew.note, "暂无风味记录");
        const meta = `${displayText(brew.dripper)} · ${displayText(brew.ratio)} · ${Number(
          brew.rating
        ).toFixed(1)} / 5`;
        const isActive =
          brew.id === state.hoveredBrewId || brew.id === state.selectedBrewId;

        return `
        <article class="brew-card ${isActive ? "is-active" : ""}" data-brew-id="${brew.id}">
          <div class="brew-date">${brew.date}</div>
          <div class="brew-main">
            <div class="brew-title-row">
              <strong title="${escapeHtml(title)}">${escapeHtml(truncateText(brew.bean, 56) || "-")}</strong>
              <div class="brew-actions">
                <button class="icon-button" type="button" data-action="edit" data-brew-id="${brew.id}" aria-label="编辑记录">✍️</button>
                <button class="icon-button" type="button" data-action="delete" data-brew-id="${brew.id}" aria-label="删除记录">🗑️</button>
              </div>
            </div>
            <p class="meta-line">${escapeHtml(meta)}</p>
            <p class="supporting" title="${escapeHtml(note)}">${escapeHtml(truncateText(brew.note, 96) || "暂无风味记录")}</p>
          </div>
        </article>
      `;
      }
    )
    .join("");

  const activeDetailId = state.hoveredBrewId || state.selectedBrewId;
  const hoveredBrew = filteredBrews.find((brew) => brew.id === activeDetailId);

  if (!hoveredBrew) {
    brewDetail.innerHTML =
      '<p class="supporting">桌面端可悬停查看详情，手机端可点按某条记录查看详情。</p>';
    return;
  }

  brewDetail.innerHTML = `
    <p class="card-kicker">Brew Detail</p>
    <h3 class="detail-title">${escapeHtml(displayText(hoveredBrew.bean))}</h3>
    <p class="supporting">${escapeHtml(displayText(hoveredBrew.roaster, "Unknown Roaster"))} · ${escapeHtml(displayText(hoveredBrew.origin, "Unknown Origin"))}</p>

    <div class="detail-block">
      <p><strong>庄园 / 处理站</strong></p>
      <p class="supporting">${escapeHtml(displayText(hoveredBrew.farm, "Unknown Farm"))}</p>
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
  document.querySelector("#suggestion-bean-name").textContent = state.activeBean.name;
  document.querySelector(
    "#suggestion-meta"
  ).textContent = `${state.activeBean.roaster} · ${state.activeBean.origin} · Roast ${state.activeBean.roastDate}`;
  document.querySelector("#suggestion-ratio").textContent = state.activeSuggestion.ratio;
  document.querySelector("#suggestion-temp").textContent = state.activeSuggestion.waterTemp;
  document.querySelector("#suggestion-grind").textContent =
    state.activeSuggestion.grindGuidance;
  document.querySelector("#suggestion-process").textContent =
    state.activeBean.process || "Unknown";

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
  document.querySelector("#brew-bean").value = state.activeBean.name;
  document.querySelector("#brew-roaster").value = state.activeBean.roaster || "";
  document.querySelector("#brew-farm").value = state.activeBean.farm || "";
  document.querySelector("#brew-origin").value = state.activeBean.origin || "";
  document.querySelector("#brew-variety").value = state.activeBean.variety || "";
  document.querySelector("#brew-process").value = state.activeBean.process || "";
  document.querySelector("#brew-roast-level").value = state.activeBean.roastLevel || "";
  document.querySelector("#brew-roast-date").value = state.activeBean.roastDate || "";
  document.querySelector("#brew-dripper").value = getActiveEquipmentProfile().dripper;
  document.querySelector("#brew-grinder").value = getActiveEquipmentProfile().grinder;
  document.querySelector("#brew-filters").value = getActiveEquipmentProfile().filters;
  document.querySelector("#brew-dose").value = "15";
  document.querySelector("#brew-grind").value = state.activeSuggestion.grindGuidance;
  document.querySelector("#brew-ratio").value = state.activeSuggestion.ratio;
  document.querySelector("#brew-temp").value = state.activeSuggestion.waterTemp;
  document.querySelector("#brew-pours").value = formatPourPlan(state.activeSuggestion.pours);
  document.querySelector("#brew-notes").value =
    `${state.activeBean.flavorFocus}\n${state.activeSuggestion.notes}`;
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
}

function renderBrewSummary() {
  document.querySelector("#brew-summary-headline").textContent =
    state.activeSuggestion.headline;
  document.querySelector(
    "#brew-summary-meta"
  ).textContent = `${getActiveEquipmentProfile().dripper} · ${state.activeSuggestion.ratio} · ${state.activeSuggestion.waterTemp}`;
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

function populateBrewDripperOptions() {
  const brewDripperSelect = document.querySelector("#brew-dripper");
  const filterDripperSelect = document.querySelector("#filter-dripper");
  const currentBrewDripper = brewDripperSelect.value;
  const optionSet = new Set([
    ...equipmentCatalog.dripper,
    ...legacyDripperOptions,
    ...state.equipmentState.profiles.map((profile) => profile.dripper),
    ...state.brews.map((brew) => brew.dripper).filter(Boolean),
  ]);
  const dripperOptions = [...optionSet];

  brewDripperSelect.innerHTML = dripperOptions
    .map((option) => `<option value="${option}">${option}</option>`)
    .join("");
  brewDripperSelect.value = currentBrewDripper || getActiveEquipmentProfile().dripper;

  filterDripperSelect.innerHTML = [
    '<option value="all">全部</option>',
    ...dripperOptions.map((option) => `<option value="${option}">${option}</option>`),
  ].join("");

  filterDripperSelect.value = state.filters.dripper;
}

function populateBrewBeanOptions() {
  const currentBeanId = brewBeanSelect.value;
  brewBeanSelect.innerHTML = [
    '<option value="">暂不关联库存豆子</option>',
    ...state.beanInventoryState.beans.map(
      (bean) => `<option value="${bean.id}">${bean.name}</option>`
    ),
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
    equipment: getActiveEquipmentProfile(),
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
  renderBrewSummary();
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
  ocrStatus.textContent = "正在识别包装文字…";

  let nextBean = inferBeanFromPhoto(file);

  try {
    const extractedText = await recognizePhotoText(file);
    if (extractedText) {
      nextBean = {
        ...nextBean,
        ...extractBeanDetailsFromText(extractedText),
      };
      document.querySelector("#photo-notes-copy").textContent =
        "已从图片包装文字中提取豆子信息，并生成当前设备组合下的起始建议。";
      ocrStatus.textContent = "OCR 已完成，识别结果已带入摘要。";
    } else {
      document.querySelector("#photo-notes-copy").textContent =
        "没有读取到足够清晰的包装文字，已回退到文件名和本地规则推断。";
      ocrStatus.textContent = "OCR 未提取到有效文字，已回退到本地推断。";
    }
  } catch {
    document.querySelector("#photo-notes-copy").textContent =
      "OCR 暂时不可用，已回退到文件名和本地规则推断。";
    ocrStatus.textContent = "OCR 当前不可用，已使用本地推断。";
  }

  state.activeBean = nextBean;
  state.activeSuggestion = buildSuggestion({
    bean: state.activeBean,
    equipment: getActiveEquipmentProfile(),
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

navButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.viewTarget));
});

document
  .querySelectorAll("#filter-bean, #filter-dripper, #filter-rating")
  .forEach((input) => {
    input.addEventListener("input", syncFiltersFromInputs);
    input.addEventListener("change", syncFiltersFromInputs);
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
    source: document.querySelector("#brew-bean").value === state.activeBean.name
      ? "suggestion"
      : "manual",
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
  state.equipmentState = updateEquipmentProfile(
    state.equipmentState,
    buildEquipmentProfile({
      id: selectedProfile.id,
      name: equipmentNameInput.value,
      dripper: readEquipmentField("dripper"),
      grinder: readEquipmentField("grinder"),
      filters: readEquipmentField("filters"),
    })
  );
  persistEquipment();
  refreshSuggestionForCurrentContext();
  renderAll();
  equipmentFeedback.textContent = "设备档案已更新，并已同步到建议和默认值。";
});

document.querySelector("#set-default-profile").addEventListener("click", () => {
  state.equipmentState = setActiveEquipmentProfile(
    state.equipmentState,
    state.selectedEquipmentProfileId
  );
  persistEquipment();
  refreshSuggestionForCurrentContext();
  renderAll();
  equipmentFeedback.textContent = "当前组合已设为默认设备档案。";
});

document.querySelector("#new-profile").addEventListener("click", () => {
  const nextId = `profile-${Date.now()}`;
  const baseProfile = getActiveEquipmentProfile();
  const nextProfile = buildEquipmentProfile({
    id: nextId,
    name: "新设备组合",
    dripper: baseProfile.dripper,
    grinder: baseProfile.grinder,
    filters: baseProfile.filters,
  });

  state.equipmentState = {
    ...state.equipmentState,
    profiles: [...state.equipmentState.profiles, nextProfile],
  };
  state.selectedEquipmentProfileId = nextId;
  persistEquipment();
  renderAll();
  equipmentFeedback.textContent = "已新建设备组合。";
});

document.querySelector("#delete-profile").addEventListener("click", () => {
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
  refreshSuggestionForCurrentContext();
  renderAll();
  equipmentFeedback.textContent = "当前设备组合已删除。";
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
  const button = event.target.closest("[data-bean-id]");
  if (!button) {
    return;
  }

  state.selectedInventoryBeanId = button.dataset.beanId;
  renderBeanInventoryProfiles();
  renderBeanInventoryEditor();
});

beanInventoryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(beanInventoryForm);
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
    })
  );
  state.selectedInventoryBeanId = nextId;
  if (!state.beanInventoryState.activeBeanId) {
    state.beanInventoryState = setActiveBeanProfile(state.beanInventoryState, nextId);
  }
  persistBeanInventory();
  renderAll();
  beanInventoryFeedback.textContent = "豆子库存已保存。";
});

document.querySelector("#new-bean").addEventListener("click", () => {
  state.selectedInventoryBeanId = "";
  renderBeanInventoryProfiles();
  renderBeanInventoryEditor();
  beanInventoryFeedback.textContent = "正在新建一支库存豆子。";
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
  state.selectedInventoryBeanId = state.beanInventoryState.activeBeanId || "";
  persistBeanInventory();
  renderAll();
  beanInventoryFeedback.textContent = "当前豆子已从库存里移除。";
});

brewBeanSelect.addEventListener("change", () => {
  const bean = state.beanInventoryState.beans.find(
    (entry) => entry.id === brewBeanSelect.value
  );

  if (!bean) {
    return;
  }

  state.activeBean = beanProfileToActiveBean(bean);
  refreshSuggestionForCurrentContext();
  document.querySelector("#brew-bean").value = bean.name;
  document.querySelector("#brew-roaster").value = bean.roaster || "";
  document.querySelector("#brew-farm").value = bean.farm || "";
  document.querySelector("#brew-origin").value = bean.origin || "";
  document.querySelector("#brew-variety").value = bean.variety || "";
  document.querySelector("#brew-process").value = bean.process || "";
  document.querySelector("#brew-roast-level").value = bean.roastLevel || "";
  document.querySelector("#brew-roast-date").value = bean.roastDate || "";
  renderSuggestion();
  renderBrewSummary();
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
    state.activeBean = {
      ...state.activeBean,
      name: assistFields.name.value.trim(),
      roaster: assistFields.roaster.value.trim(),
      farm: assistFields.farm.value.trim(),
      origin: assistFields.origin.value.trim(),
      variety: assistFields.variety.value.trim(),
      process: assistFields.process.value.trim(),
      roastDate: assistFields.roastDate.value.trim(),
      flavorFocus: assistFields.flavorFocus.value.trim(),
    };
    refreshSuggestionForCurrentContext();
    renderSuggestion();
    prefillBrewForm();
    saveFeedback.textContent = "识别结果和建议参数已经带入记录页，可以继续调整后保存。";
    setView("brew");
  });

populateEquipmentSelects();
state.selectedEquipmentProfileId = state.equipmentState.activeProfileId;
state.selectedInventoryBeanId = state.beanInventoryState.activeBeanId;
refreshSuggestionForCurrentContext();
renderAll();
bindRatingOutput();
setView("home");
