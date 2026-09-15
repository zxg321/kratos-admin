# Design Contract · 管网智能运维一体化平台 全量原型 (GIS Intel Ops Platform · Full)

> 覆盖 PRD S1–S10 全部子系统的产品原型。Mock 数据 + stub API，无真实后端。
> 本目录是 `pipe-ops-portal`（7 页）与 `gis-intel-ops`（简版 SPA）的**全量升级版**：10 大子系统全覆盖。

## Tech Stack & Delivery
- stack: **vanilla HTML + CSS + vanilla JS**（共享层 assets/{styles.css, icons.js, components.js, mock.js, api.js} + 各页内联脚本）
- delivery: **pure-static / offline-openable**（零外部依赖，图标/图表/地图全部内联 SVG 自绘，严禁引用 CDN/外链图片/外链字体）
- 地图：自绘 **SVG 管网示意图**（图层树、bbox 缩放、拉动视野、要素悬停详情、图例、空间分析高亮）

## Style Tier & Aesthetic Direction
- style: **tech-dark（工业测控变体，非紫渐变）**
- aesthetic: **深海军蓝 + 青色主控台 + 橙红告警聚焦** —— 亲水务仪表化，工业-测控，高信息密度
- tone keywords: professional / restrained / high information density / industrial-utilitarian

## Design Tokens（以 assets/styles.css 为唯一事实来源）
```
color.primary:       #2FB8C9 (青)      primary-hover: #3ecfe0
color.bg:            #0B1220 (深海军蓝) surface: #111A2C   surface-2: #0F1626   surface-3: #16233b
color.border:        #1E2A44  strong: #2A3A5C
text: #E6ECF7  text-sub: #8FA3BF  text-faint: #5c6f92
success #22C55E / warn #F59E0B / danger #EF4444 / alert #FB923C (告警焦点)
font.display: "DIN Alternate","Bahnschrift","Avenir Next Condensed",system-ui  (度量/标题/数字 → .metric)
font.body:   "PingFang SC","Microsoft YaHei","Noto Sans SC",system-ui  (正文)
font.mono:   "JetBrains Mono","Cascadia Code","SF Mono",Consolas,monospace  (编号/坐标/代码 → .code)
radius sm6/md10/lg14;  shadow sm/md/lg;  spacing 4/8/12/16/24/32/48
layout: sidebar 232px fixed; main margin-left 232px
icon.lib: lucide 内联 SVG (stroke 1.7, currentColor)，来自 assets/icons.js window.ICONS
motion: 页面载入 stagger(.reveal 0-300ms)；hover/active 150ms；modal 200ms；告警呼吸灯 2s
theme: dark 为主，侧栏底部「主题切换」按钮切换 :root[data-theme=light]
bg-texture: 深蓝底细点阵 + 顶部青色微光带（styles.css body::before/::after 已实现，页面不要重复绘制）
```

## App Shell + Canonical Nav（复用 components.js 的 `new Shell(pageKey).mount()` 注入，**严禁页面自写导航**）
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{页名} · 管网智能运维一体化平台</title>
<link rel="stylesheet" href="assets/styles.css">
</head>
<body data-page="{pageKey}">
  <aside class="app-nav" id="app-nav"></aside>
  <main class="app-content">
    <header class="topbar">
      <div class="crumb"><b>{页名}</b> / {模块路径说明}</div><div class="spacer"></div>
      <span class="tag p"><i></i>演示数据</span>
      <span class="tag s"><i></i>系统在线</span>
    </header>
    <!-- 本页内容 ONLY -->
  </main>
  <script src="assets/icons.js"></script>
  <script src="assets/components.js"></script>
  <script src="assets/mock.js"></script>
  <script src="assets/api.js"></script>
  <script>new Shell('{pageKey}').mount(); /* 主内容逻辑 */</script>
</body>
</html>
```

nav items（**顺序冻结**，由 Shell.navItems() 提供，页面不得增删改）：
`dashboard 运行总览 / map 管网一张图 / overlay 覆盖物 / collect 采集入库 / monitor 智能监测 / alarm 告警中心 / patrol 巡检作业 / emergency 应急指挥 / asset 资产生命周期 / system 系统管理 / openapi 政企对接`

页面与子系统映射：
| 页面 | pageKey | 子系统 |
|---|---|---|
| index.html | dashboard | S8 缩略版工作台（下钻入口） |
| bigscreen.html | （无 shell，全屏大屏） | S8 态势总览大屏·数字孪生 |
| map.html | map | S1 GIS 管网一张图 |
| overlay.html | overlay | S1 覆盖物管理 |
| collect.html | collect | S2 采集作业与成果入库 |
| monitor.html | monitor | S3 智能监测（设备总览/实时数据/阈值配置/AI 预测） |
| alarm.html | alarm | S3 告警中心（聚合/认领/派单） |
| patrol.html | patrol | S4 巡检作业 |
| emergency.html | emergency | S5 应急指挥调度 |
| asset.html | asset | S6 设备资产全生命周期 |
| system.html | system | S7 系统管理与租户 |
| openapi.html | openapi | S10 公众服务与政企对接 |
| mobile.html | （无 shell，手机壳） | S9 移动作业 APP |

bigscreen.html 与 mobile.html **不加载 Shell**（全屏体验），直接用 icons.js + 自有布局，但共享 styles.css 的令牌。

## Component Spec（styles.css 已内置类名，直接使用）
- `.btn` / `.btn-primary` / `.btn-danger` / `.btn-sm`；`.input/.select/.textarea`；`.field`（label+input）
- `.panel`（面板容器）；`.card-head h3 + .sub + .tools` + `.card-body`（手工拼 panel+card-head 结构）
- `.tbl`（表格：`.tbl-wrap` 包裹；`.num` 右对齐白位；`.row-tools` 行悬停操作位）
- `.tag`（状态胶囊 `.s/.w/.d/.a/.p/.g`）
- `.kpi`（大数 metric + .lab + .val + .sub.up/.down + .spark）
- Shell.openModal({title,size,bodyHtml,okText,onOk}) / Shell.toast(msg,type)
- `.grid .g-2/.g-3/.g-4/.g-1-2/.g-2-1` 布局；`.toolbar`（筛选区）；`.empty`（空态）
- `.reveal` 页面载入 stagger；`.divider`；`.muted/.faint`

## 数据与调用规约
- 前端只调 `window.api.xxx()`（Promise stub，见 api.js），**禁止直接读 window.MOCK**
- Mock schema 字段对齐 PRD 数据实体（gis_* / cnd_* / patrol_* / bpm_*），中文业务文案
- 图表：内联 SVG 自绘（spark 线、柱状、饼环、进度环），禁止 canvas 库/echarts CDN
- 所有数字使用 `.metric` / `.code` 类呈现，保证 DIN/等宽风格

## 每页最低交互要求（原型级别）
1. 筛选/搜索至少 1 组真实过滤（对 api stub 传参后重渲染表格）
2. 至少 1 个模态（新增/编辑/详情，用 Shell.openModal）
3. 至少 1 个 toast 反馈（操作确认）
4. 表格行悬停显示 `.row-tools` 操作位
5. 有 KPI 区（4 枚左右）+ 主内容区 + 次级面板，信息密度要高（工业风）
