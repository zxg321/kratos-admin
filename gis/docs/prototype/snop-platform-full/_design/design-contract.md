# Design Contract · SNOP 智慧能源运营管理一体化平台 全量产品原型 (snop-platform-full)

> 唯一口径：《04-SNOP功能说明书.md》（113 项功能 / 12 模块 / P0-P2 批次），决策基线《00-SNOP重构总纲.md》D1-D8。
> 取代关系：本目录是 `gis-platform-full`（旧 PRD GIS Intel Ops 口径）的 SNOP 全量升级版；旧目录保留作历史参考。
> Mock 数据 + stub API，无真实后端。

## Tech Stack & Delivery
- stack: **vanilla HTML + CSS + vanilla JS**（共享层 assets/{styles.css, icons.js, components.js, mock.js, api.js} + 各页内联脚本）
- delivery: **pure-static / offline-openable**（零外部依赖，图标/图表/地图全部内联 SVG 自绘，严禁引用 CDN/外链图片/外链字体）
- 地图：自绘 **SVG 管网示意图**（图层树、bbox 缩放、要素悬停、图例、分析高亮），UI 文案按 **AMap JS API 2.0** 口径呈现（缩放级指示器标注 18-20 级清晰度验收口径，D2）

## Style Tier & Aesthetic Direction
- style: **tech-dark（工业测控变体，非紫渐变）**，沿用 gis-platform-full 令牌体系
- aesthetic: **深海军蓝 + 青色主控台 + 橙红告警聚焦 + 介质色彩编码**，工业-测控，高信息密度
- tone keywords: professional / restrained / high information density / industrial-utilitarian

## Design Tokens（以 assets/styles.css 为唯一事实来源）
```
color.primary: #2FB8C9 (青)   bg:#0B1220 surface:#111A2C  text:#E6ECF7
success #22C55E / warn #F59E0B / danger #EF4444 / alert #FB923C
media colors 介质编码（D7：**介质 = 租户类别标识**，燃气/供水/热力分属不同租户，租户级配置驱动）:
  gas   燃气  #F59E0B (amber)
  water 供水  #2FB8C9 (cyan)
  heat  热力  #FB923C (orange)
  → CSS 变量 --media，组件 .media-chip / 图例联动
font.display DIN/Bahnschrift(.metric) / body PingFang SC / mono JetBrains Mono(.code)
radius 6/10/14; sidebar 232px; 主题切换 :root[data-theme=light]
```

## 四端信息架构（D4 一套登录贯通四端）
| 端 | 文件 | 说明 |
|---|---|---|
| 登录 | login.html | F-S01/S02/S03/S20：验证码、client_type 四端选择、MFA(TOTP)、会话策略 |
| 管理后台 | 15 页 Shell | 本契约 nav 体系（下方） |
| portal 工作台 | index.html | 运营工作台即 portal 端形态（F-V04 积木配置提示），多域指标卡片可配置 |
| 大屏 | bigscreen.html | F-V01/V02 生产调度大屏 + GIS 大屏模式（全屏，无 Shell） |
| 移动端 | mobile.html | F-V06/V07/V08 uni-app 作业 APP（手机壳，无 Shell） |

## App Shell + Canonical Nav（components.js `new Shell(pageKey).mount()`，**严禁页面自写导航**）
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{页名} · SNOP 智慧能源运营管理一体化平台</title>
<link rel="stylesheet" href="assets/styles.css">
</head>
<body data-page="{pageKey}">
  <aside class="app-nav" id="app-nav"></aside>
  <main class="app-content">
    <header class="topbar">
      <div class="crumb"><b>{页名}</b> / {模块路径}</div><div class="spacer"></div>
      <span class="media-chip" id="mediaChip"></span>
      <span class="tag p"><i></i>演示数据</span>
      <span class="tag s"><i></i>系统在线</span>
    </header>
    <!-- 本页内容 ONLY -->
  </main>
  <script src="assets/icons.js"></script>
  <script src="assets/components.js"></script>
  <script src="assets/mock.js"></script>
  <script src="assets/api.js"></script>
  <script>const shell = new Shell('{pageKey}'); shell.mount(); /* 主内容逻辑 */</script>
</body>
</html>
```

nav 分组（**顺序冻结**，由 Shell.navGroups() 提供，页面不得增删改）：
```
总览    dashboard 运营工作台
GIS域   map 管网一张图 / layer 图层与要素 / analysis 空间分析 / dma DMA计量漏损 / report 统计报表
感知域  device 设备与采集 / iot IoT接入 / alarm 报警管理
作业域  patrol 巡检作业 / cnd 指挥调度
经营域  eam EAM资产
平台    system 平台底座 / geagent Geo-Agent / openapi 开放平台
```
侧栏底部固定：四端入口（大屏 bigscreen.html / 移动端 mobile.html，target=_blank）+ 六库状态（snop_system/gis/patrol/iot/cnd/asset）+ 主题切换。
topbar 含**租户类别（介质）切换器**（演示辅助：燃气=燃气公司 / 供水=江南水司 / 热力=热力集团，切换即切换演示租户，介质口径随之确定；同租户内不切换介质。写入 localStorage 并更新 `--media` 与 `.media-chip`「租户 · 介质」）。login.html 提供租户选择，选择写入同一存储；大屏/工作台 chip 与欢迎条租户名联动。

## 页面 ↔ 功能编号映射（04 说明书）
| 页面 | pageKey | 覆盖功能 | 要点 |
|---|---|---|---|
| login.html | —（无 Shell） | F-S01/S02/S03/S20 | 验证码、四端 client_type 选择、MFA、失败锁定提示 |
| index.html | dashboard | F-V03/V04 + 各域汇总 | KPI 驾驶舱、积木化卡片配置入口、待办/消息 |
| map.html | map | F-G01/G05/G06/G07/G08/G09/G10 | 租户类别（介质）切换、图层树显隐、绘制/量算/吸附工具条、缩放级指示器、要素悬停详情 |
| layer.html | layer | F-G02/G03/G04/G13 | 图层 CRUD/授权矩阵/12 类要素管理/标注管理 |
| analysis.html | analysis | F-A01~A10 | 关阀/连通/拓扑/开挖/图形/缓冲/叠加/测距测积 + 黄金用例对拍口径 + 结果导出 |
| dma.html | dma | F-M01~M06 | 分区树、产销统计、六步法向导、输差诊断、模拟、PDF 报告 |
| report.html | report | F-G15 | 12 类统计报表、ECharts 式 SVG 图表、Excel 导出 |
| device.html | device | F-D01~D10 | 12 类设备台账、定位纠偏、历史、采集导入、曲线对比、批量预警值 |
| iot.html | iot | F-I01~I09 | 厂商适配器（brt/cangnan/…）、MQTT 网关、时序粒度查询、离线判定、看板 |
| alarm.html | alarm | F-L01~L06 | 规则引擎配置、告警聚合、处理闭环、多维分析、视频告警位 |
| patrol.html | patrol | F-P01~P12 | 计划日历、工单状态机、轨迹回放、隐患闭环、开挖监测、绩效统计 |
| cnd.html | cnd | F-C01~C08 | 事故接报、抢险工单全流程、物资、值班排班、预案、评估报告 |
| eam.html | eam | F-E01~E06 | 台账、维保、采购入库、处置四流程、品牌供应商 |
| system.html | system | F-S04~S15/S17 | 用户/角色四层授权矩阵/菜单四型/租户/字典分域(D5)/文件/消息/审计/定时任务/备份 |
| geagent.html | geagent | F-S16 | Geo-Agent 会话、MCP 工具卡（五类分析+DMA）、调用过程可视化 |
| openapi.html | openapi | F-S18/S19 | 凭据签发、operation 白名单、IP 白名单、调用日志、SSO 适配器 |
| bigscreen.html | —（无 Shell） | F-V01/V02 | 三栏大屏、介质 KPI、事件流、下钻提示 |
| mobile.html | —（无 Shell） | F-V06/V07/V08 | 任务列表、打卡、取证拍照、抄表、扫码绑定、离线模式 |

## Component Spec（styles.css 已内置类名，直接使用）
- `.btn/.btn-primary/.btn-danger/.btn-warn/.btn-sm`；`.input/.select/.textarea/.field`；`.form-grid`
- `.panel` + `.card-head h3 .sub .tools` + `.card-body(.flush)`；`.grid .g-2/.g-3/.g-4/.g-5/.g-1-2/.g-2-1/.g-1-3/.g-3-2`
- `.tbl`（`.tbl-wrap` 包裹；`.num`；`.row-tools`）；`.tag .s/.w/.d/.a/.p/.g(.pulse)`
- `.kpi`；`.toolbar`；`.search`；`.empty`；`.timeline(.tl .warn/.danger/.done)`；`.progress(i/.w/.d/.s)`；`.legend(.li .sw)`
- `.media-chip` 介质徽标；`.agent-bubble/.agent-tool` Geo-Agent 会话样式；`.step-tabs` 向导步骤条
- Shell.openModal / Shell.openDrawer / Shell.toast / shell.ic(name) / Shell.esc / Shell.emptyHtml

## 数据与调用规约
- **D7 单租户口径铁律（2026-09-15 强化）**：介质 = 租户类别标识，一个租户只有一种介质。**同一视图中严禁同时出现多种介质的数据**：
  - KPI/统计一律取 `summary.mediaKpis[当前介质]`，禁止跨介质合计（禁止把 gas+water+heat 求和当"总量"）
  - 所有业务列表（图层/要素/设备/告警/规则/巡检/调度/EAM/IoT 实时/移动端）默认经 `api.js` 的 `sc()` 收口，只返回本租户介质数据（`x.media == null` 视为租户自有）
  - "介质筛选"控件收敛为只读指示（`shell.tenantMediaSelect()`），不作为筛选维度
  - 顶栏租户切换器为**折叠式下拉**（只显示本租户），展开后才出现其他演示租户；切换即整页按新租户口径重载
  - 例外：`system.html`（平台底座·跨租户管理）、`login.html`（租户选择）允许出现多租户/多介质文案
- 前端只调 `window.api`（Promise stub，见 api.js），**禁止直接读 window.MOCK**（bigscreen/mobile/login 三端页例外，可读 MOCK，但同样须按本租户介质过滤）
- api 兼容两种调用约定：`api('device.page',{...})` 与 `api.device.page({...})`（api.js 为延迟解析 Proxy，评审已验证）
- Mock schema 字段对齐 SNOP 表前缀（gis_/patrol_/iot_/cnd_/eam_/sys_），中文业务文案
- 图表：内联 SVG 自绘（spark/柱/环/进度），禁止 canvas 库/echarts CDN
- 数字用 `.metric` / `.code`

## 每页最低交互要求（原型级别）
1. 筛选/搜索至少 1 组真实过滤（api stub 传参后重渲染）
2. 至少 1 个模态或抽屉（Shell.openModal / openDrawer）
3. 至少 1 个 toast 反馈
4. 表格行悬停 `.row-tools`
5. KPI 区（4 枚左右）+ 主内容 + 次级面板，信息密度高（工业风）
6. 页面顶部 crumb 标注覆盖的 F- 编号（如 `覆盖 F-M01~M06`）
