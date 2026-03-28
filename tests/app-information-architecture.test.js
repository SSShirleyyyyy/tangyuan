import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

function getViewMarkup(html, viewName) {
  const startToken = `data-view="${viewName}"`;
  const startIndex = html.indexOf(startToken);

  assert.notEqual(startIndex, -1, `${viewName} section should exist`);

  const endIndex = html.indexOf(
    '<section class="view app-page" data-view="',
    startIndex + startToken.length
  );
  return html.slice(startIndex, endIndex === -1 ? undefined : endIndex);
}

test("home keeps only recent brews and inventory overview cards", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  const homeSection = getViewMarkup(html, "home");
  assert.match(homeSection, /class="panel home-overview-strip"/);
  assert.doesNotMatch(homeSection, /class="panel app-hero-card"/);
  assert.match(homeSection, />最近冲煮札记</);
  assert.match(homeSection, />库存概览</);
  assert.doesNotMatch(homeSection, />默认器具组合</);
  assert.doesNotMatch(homeSection, />导出或恢复数据</);
  assert.doesNotMatch(homeSection, /首页只保留最近冲煮和库存概览/);
});

test("inventory page is now a list page with a create action and no inline editor form", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  const inventorySection = getViewMarkup(html, "inventory");
  assert.match(inventorySection, /class="list-page-header"/);
  assert.match(inventorySection, /id="bean-inventory-list"/);
  assert.match(inventorySection, /id="new-bean-listing"/);
  assert.doesNotMatch(inventorySection, /id="bean-inventory-form"/);
  assert.doesNotMatch(inventorySection, /class="page-toolbar"/);
});

test("bean editor lives on its own page", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  const beanEditorSection = getViewMarkup(html, "bean-editor");
  assert.match(beanEditorSection, /id="bean-inventory-form"/);
  assert.match(beanEditorSection, /id="back-to-inventory"/);
  assert.match(beanEditorSection, /class="assist-toolbar inventory-assist-toolbar"/);
  assert.match(beanEditorSection, /class="assist-main inventory-assist-main"/);
  assert.match(beanEditorSection, /id="inventory-photo-title"/);
  assert.match(beanEditorSection, /id="inventory-assist-roaster"/);
  assert.match(beanEditorSection, /class="form-subhead">豆子档案</);
  assert.match(beanEditorSection, /class="form-subhead">养豆与库存</);
  assert.match(beanEditorSection, /id="inventory-note"/);
  assert.doesNotMatch(beanEditorSection, /class="section-banner inventory-form-banner"/);
});

test("equipment page is now a list page with a create action and no inline editor form", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  const equipmentSection = getViewMarkup(html, "equipment");
  assert.match(equipmentSection, /class="list-page-header"/);
  assert.match(equipmentSection, /id="equipment-profile-list"/);
  assert.match(equipmentSection, /id="new-equipment-profile"/);
  assert.doesNotMatch(equipmentSection, /id="equipment-form"/);
  assert.doesNotMatch(equipmentSection, /class="page-toolbar"/);
});

test("equipment editor lives on its own page and carries backup actions", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8"
  );

  const equipmentEditorSection = getViewMarkup(html, "equipment-editor");
  assert.match(equipmentEditorSection, /id="equipment-form"/);
  assert.match(equipmentEditorSection, /id="back-to-equipment"/);
  assert.match(equipmentEditorSection, /id="equipment-preview-name"/);
  assert.match(equipmentEditorSection, /id="equipment-preview-specs"/);
  assert.match(equipmentEditorSection, />导出或恢复数据</);
});
