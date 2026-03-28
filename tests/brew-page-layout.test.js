import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("brew page no longer renders the right-side summary modules", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(html, /<aside class="brew-summary">/);
  assert.doesNotMatch(html, />冲煮建议</);
  assert.doesNotMatch(html, />风味鉴赏</);
});

test("brew page keeps only inline bean status helper and removes the current suggestion card", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.match(html, /id="brew-bean-status-card" class="inline-context-card compact-status-card full-span" hidden/);
  assert.match(html, /id="brew-bean-status-copy"/);
  assert.doesNotMatch(html, /<p class="card-kicker">库存状态<\/p>/);
  assert.doesNotMatch(html, /id="brew-suggestion-card"/);
  assert.doesNotMatch(html, /id="brew-suggestion-summary"/);
  assert.doesNotMatch(html, /id="apply-inline-suggestion"/);
});

test("brew page places dose and grind fields inside the recipe section", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.match(
    html,
    /<section class="sheet-block">[\s\S]*?<h3>冲煮参数<\/h3>[\s\S]*?id="brew-dose"[\s\S]*?id="brew-grind"/
  );
});

test("brew page no longer uses standalone section banners and keeps a bottom save dock", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(html, /<section class="section-banner">[\s\S]*?本次冲煮/);
  assert.doesNotMatch(html, /<section class="section-banner">[\s\S]*?豆子档案/);
  assert.match(html, /class="brew-save-dock"/);
  assert.doesNotMatch(html, /class="form-actions"/);
});

test("recent brews detail no longer renders instructional placeholder copy", async () => {
  const source = await readFile(
    new URL("../app.js", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(source, /把鼠标移到某条冲煮记录上/);
  assert.doesNotMatch(source, /桌面端可悬停查看详情，手机端可点按某条记录查看详情/);
});

test("brew page links to equipment profiles and uses selects for gear inputs", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.match(html, /id="brew-equipment-profile"/);
  assert.match(
    html,
    /<select id="brew-grinder" name="grinder">[\s\S]*?<\/select>/
  );
  assert.match(
    html,
    /<input id="brew-roast-date" name="roastDate" type="date"/
  );
});

test("brew page clears gear inputs when equipment profile is unlinked", async () => {
  const source = await readFile(
    new URL("../app.js", import.meta.url),
    "utf8"
  );

  assert.match(
    source,
    /function clearBrewEquipmentForm\(\) \{[\s\S]*?document\.querySelector\("#brew-dripper"\)\.value = ""[\s\S]*?document\.querySelector\("#brew-grinder"\)\.value = ""[\s\S]*?document\.querySelector\("#brew-filters"\)\.value = ""/
  );
  assert.match(
    source,
    /function applyEquipmentProfileToBrewForm\(profile\) \{[\s\S]*?if \(!profile\) \{[\s\S]*?clearBrewEquipmentForm\(\);/
  );
  assert.doesNotMatch(
    source,
    /brewEquipmentProfileSelect\.addEventListener\("change", \(\) => \{[\s\S]*?if \(!profile\) \{\s*return;\s*\}/
  );
  assert.match(
    source,
    /function populateBrewDripperOptions\(\) \{[\s\S]*?buildOptionMarkup\(dripperOptions, \{ includeEmpty: true \}\)/
  );
  assert.match(
    source,
    /function populateBrewDripperOptions\(\) \{[\s\S]*?const isEquipmentLinked = Boolean\(brewEquipmentProfileSelect\.value\);[\s\S]*?brewDripperSelect\.value =[\s\S]*?currentBrewDripper[\s\S]*?isEquipmentLinked \? getActiveEquipmentProfile\(\)\.dripper : ""/
  );
  assert.match(
    source,
    /function populateBrewGrinderOptions\(\) \{[\s\S]*?buildOptionMarkup\(grinderOptions, \{ includeEmpty: true \}\)/
  );
  assert.match(
    source,
    /function populateBrewGrinderOptions\(\) \{[\s\S]*?const isEquipmentLinked = Boolean\(brewEquipmentProfileSelect\.value\);[\s\S]*?brewGrinderSelect\.value =[\s\S]*?currentGrinder[\s\S]*?isEquipmentLinked \? getActiveEquipmentProfile\(\)\.grinder \|\| "" : ""/
  );
});

test("blank brew form keeps recipe parameters empty by default", async () => {
  const source = await readFile(
    new URL("../app.js", import.meta.url),
    "utf8"
  );

  assert.match(
    source,
    /function prefillBrewForm\(\{ useFallbackBean = false, useActiveEquipment = false \} = \{\}\) \{/
  );
  assert.match(
    source,
    /brewEquipmentProfileSelect\.value = useActiveEquipment[\s\S]*?state\.equipmentState\.activeProfileId \|\| ""[\s\S]*?: ""/
  );
  assert.match(
    source,
    /document\.querySelector\("#brew-dose"\)\.value = ""/
  );
  assert.match(
    source,
    /document\.querySelector\("#brew-grind"\)\.value = ""/
  );
  assert.match(
    source,
    /document\.querySelector\("#brew-ratio"\)\.value = ""/
  );
  assert.match(
    source,
    /document\.querySelector\("#brew-temp"\)\.value = ""/
  );
  assert.match(
    source,
    /document\.querySelector\("#brew-pours"\)\.value = ""/
  );
  assert.match(source, /applyEquipmentProfileToBrewForm\(useActiveEquipment \? getBrewEquipmentProfile\(\) : null\)/);
  assert.doesNotMatch(source, /state\.activeSuggestion/);
});

test("static explainer copy is trimmed from app pages", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(html, /像在记录页上写下一次冲煮，而不是填写后台表单/);
  assert.doesNotMatch(html, /只记录这一杯发生了什么/);
  assert.doesNotMatch(html, /需要改参数时，再进入独立录入页慢慢整理/);
  assert.doesNotMatch(html, /这里只看具体库存豆；要录新豆或编辑某支豆子，再进入独立录入页/);
  assert.doesNotMatch(html, /照片识别、豆子档案、养豆与库存都放在这一页里，一次整理干净/);
  assert.doesNotMatch(html, /把滤杯、研磨器和滤纸整理成一套组合，记录页就能直接拿来用/);
});

test("photo upload controls are simplified to icon-based camera actions", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.match(html, /camera-upload-button/);
  assert.match(html, /camera-upload-icon/);
  assert.doesNotMatch(html, /拍照或导入豆袋照片/);
});

test("photo assist uses a compact app-like card layout", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.match(html, /class="assist-toolbar"/);
  assert.match(html, /class="assist-main"/);
  assert.match(html, /class="assist-status-card"/);
  assert.match(html, /class="assist-fields-card"/);
  assert.doesNotMatch(html, /class="compact-metrics"/);
  assert.doesNotMatch(html, /id="suggestion-ratio"/);
  assert.doesNotMatch(html, /id="suggestion-temp"/);
  assert.doesNotMatch(html, /id="suggestion-grind"/);
  assert.doesNotMatch(html, /id="suggestion-process"/);
});

test("photo previews no longer render redundant caption overlays", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(html, /class="photo-caption"/);
  assert.doesNotMatch(html, /class="photo-tag"/);
  assert.doesNotMatch(html, /id="photo-label"/);
  assert.doesNotMatch(html, /id="inventory-photo-label"/);
});

test("photo preview frames can collapse completely when no image is present", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );
  const source = await readFile(
    new URL("../app.js", import.meta.url),
    "utf8"
  );

  assert.match(html, /id="photo-preview-frame"/);
  assert.match(html, /id="inventory-photo-preview-frame"/);
  assert.match(source, /photo-preview-frame/);
  assert.match(source, /inventory-photo-preview-frame/);
  assert.match(source, /classList\.toggle\("is-empty"/);
});

test("recent brew cards keep bean name and supplier on one line", async () => {
  const source = await readFile(
    new URL("../app.js", import.meta.url),
    "utf8"
  );

  assert.match(source, /class="brew-title-line"/);
  assert.match(source, /class="brew-supplier-inline"/);
  assert.doesNotMatch(source, /<p class="meta-line">\$\{escapeHtml\(preview\.supplier\)\}<\/p>/);
});

test("photo assist no longer boots with seeded bean recognition data", async () => {
  const source = await readFile(
    new URL("../app.js", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(source, /activeBean:\s*analyzedBean/);
  assert.match(source, /assistBean:/);
  assert.match(source, /state\.assistBean/);
  assert.doesNotMatch(source, /assistSuggestion:/);
  assert.doesNotMatch(source, /state\.assistSuggestion/);
});

test("photo assist applies bean details without generating recommendation rules", async () => {
  const source = await readFile(
    new URL("../app.js", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(source, /import\s+\{\s*buildSuggestion\s*\}\s+from "\.\/src\/recommendation\.js"/);
  assert.match(source, /state\.assistBean = nextBean;/);
  assert.match(source, /applyBeanDetailsToBrewForm\(state\.activeBean\);/);
  assert.doesNotMatch(source, /识别结果和建议参数已经带入记录页/);
});
