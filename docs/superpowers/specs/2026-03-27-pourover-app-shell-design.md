# Pourover App Shell Design

## Goal

把当前偏网页的手冲日志重构成一个 `手机优先、跨设备可用、可安装` 的咖啡记录 app，同时保留原有的器物感和本地优先数据逻辑。

## Product Direction

- 形态：`可安装 PWA`
- 交互重心：`手机优先`
- 气质：`安静、器物感、纸本记录感`
- 目标：从“网页上的几块 panel”改成“有 app shell、底部导航、单列内容流的记录应用”

## Information Architecture

### Home

- 从大网页 hero 改成 `dashboard`
- 首屏只保留：
  - 今日日期
  - 冲煮总数 / 豆子总数
  - 两个主动作：`记录一杯`、`管理库存`
- 下方保留：
  - 最近冲煮
  - 默认器具组合
  - 库存概览
  - 本地备份

### Brew

- 作为主 tab
- 页面顺序：
  - 顶部 page header
  - 拍照辅助入口
  - 豆子档案
  - 本次冲煮：器具、参数、风味与评分
- 不再有网页式侧栏或右侧补充面板

### Inventory

- 改成 `列表 + 编辑`
- 手机上默认纵向堆叠
- 桌面端允许 `左列表 / 右编辑`
- 视觉上更像 app 的资源管理页，不像后台表单

### Equipment

- 同 Inventory，一页内保留：
  - 已保存组合
  - 当前编辑器
- 手机上优先单列

## App Shell

- 去掉左侧固定 sidebar
- 改成：
  - 顶部 app bar
  - 中部 scrollable content
  - 底部固定 tab bar
- Tab 为：
  - 首页
  - 记录
  - 库存
  - 设备
- 桌面端不再用另一套导航，只是把 app frame 放大

## Visual System

- 保留当前纸本 / 咖啡器物感
- 但把壳层改成更 app 化：
  - app frame
  - 安全区 padding
  - 更紧凑的 page header
  - 底部 tab 胶囊栏
  - 页面 section 更像 cell group，而不是网站 panel

## PWA Scope

- 新增 `manifest.webmanifest`
- 新增 `service-worker.js`
- 新增 app icon 资源
- `display: standalone`
- 支持添加到主屏幕

## Technical Approach

- 复用现有 `data-view` 多页面切换逻辑
- 调整导航按钮查询范围，让 active state 只作用于底部 tab
- 现有业务逻辑不重写，优先重组 HTML 壳层和 CSS 布局
- 本地 server 增加 `.webmanifest` 类型支持

## Validation

- 布局测试：
  - 不再包含旧 sidebar 导航
  - 包含 app shell / tab bar / manifest
- 行为测试：
  - 本地 server 可返回 manifest
  - 现有 view switching 继续工作
- 构建验证：
  - `npm test`
  - `npm run build:bundle`
