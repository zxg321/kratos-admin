# Design Contract · 管网运维智能管理平台 (PipeOps Portal)

> 原型项目，Mock 数据 + stub API，无真实后端。结合本项目 kratos-admin 技术栈语义（覆盖物/管线/采集/告警/设备档案）与 2026 前沿交互优化。

## Tech Stack & Delivery
- stack: **vanilla HTML + CSS + vanilla JS**（共享层 components.js/mock.js/api.js + 各页内联脚本）
- delivery: **pure-static / offline-openable**（零外部依赖，图标/图表/地图全部内联 SVG 自绘）
- 地图：自绘 **SVG 管网示意图**（含覆盖物节点、管线连接、bbox 缩放、拉动视野、要素悬停弹窗、图例）——不引 CDN，保证离线

## Style Tier & Aesthetic Direction
- style: **tech-dark（工业测控变体，非紫渐变）**
- aesthetic: **深海军蓝 + 青色主控台 + 橙红告警聚焦** —— 亲水务仪表化，工业-测控，高信息密度
- tone keywords: professional / restrained / high information density / industrial-utilitarian

## Design Tokens
```
color.primary:       #2FB8C9 (青)      primary-hover: #3ecfe0
color.bg:            #0B1220 (深海军蓝) surface: #111A2C   surface-2: #0F1626
color.border:        #1E2A44           text: #E6ECF7      text-sub: #8FA3BF
color.success/warn/danger: #22C55E / #F59E0B / #EF4444
color.alert:         #FB923C (橙, 告警焦点)
font.display: "DIN Alternate","Bahnschrift","Avenir Next Condensed",system-ui  (度量/标题/数字)
font.body:   "PingFang SC","Microsoft YaHei","Noto Sans SC",system-ui, -apple-system, "Segoe UI"   (正文)
font.mono:   "JetBrains Mono","Cascadia Code","SF Mono",Consolas,monospace   (编号/坐标/代码)
font.scale:  12 / 13 / 14 / 16 / 20 / 24 / 32
radius:      sm6 / md10 / lg14
shadow:      sm 0 1px 2px rgba(0,0,0,.3); md 0 6px 24px rgba(0,0,0,.35); lg 0 16px 48px rgba(0,0,0,.5)
spacing:     4 / 8 / 12 / 16 / 24 / 32 / 48
layout:      sidebar 232px fixed; content margin-left 232px; max-content-width 1600px
icon.lib:    lucide (内联 SVG, stroke 1.7, size 16/18/20, color currentColor)
motion:      页面载入 stagger(6 项, delay 0/60/120/180/240/300ms, translateY 10→0, fade)；
           hover/active transition 150ms ease；模态 200ms scale/fade；告警呼吸灯 2s
bg-texture:  深蓝底 + 极细点阵网格(radial-gradient dots) + 顶部青蓝微光带(低透明层叠)
theme:       dark 为主；顶部提供 light 切换按钮（:root[data-theme=light] override 变量）
```

## Component Spec
- **button**: base  主态(填青)/次态(透明描边)/ghost；hover 提亮、active 下压；disabled 降透明
- **input/select**: surface 底 + border；focus border→primary + ring glow
- **card**: surface 底 + 1px border + 柔和 md shadow；标题区 caption + 右上操作位
- **table**: thead text-sub 12px；行 hover surface-2；状态列 tag；白位数右侧对齐
- **tag**: 状态胶囊(在运行/备用/停用/告警/正常)，小圆点+文字，语义色
- **modal**: 居中浮层 + 遮罩(blur)；标题栏 + 关闭；footer 主/次按钮
- **nav-sidebar**: fixed 232px；logo 区 + 7 项导航；active 左侧青条 + 文字高亮；底部环境信息
- **topbar**: 页面标题 + 面包屑 + 全局搜索 + 主题切换 + 用户
- **empty-state**: 图标 + 引导文案 + 主按钮
- **kpi-card**: 大号 metric 字(DIN) + 标题 + 趋势箭头 + 迷你 spark

## App Shell + Canonical Nav（复用 components.js renderShell 注入，严禁子代理自写导航）
```html
<body data-page="{pageKey}">
  <aside class="app-nav js-nav" id="app-nav"></aside>
  <main class="app-content"> <!-- 本页内容 ONLY --> </main>
  <script src="../assets/components.js"></script>  <!-- 其余页面相对路径自调 -->
  <script>new Shell('{pageKey}').mount(); /* 主内容逻辑 */</script>
</body>
```
nav items（顺序冻结）：`dashboard 运行监控大屏 / map 管网GIS / overlay 覆盖物 / collect 采集管理 / alarm 告警中心 / archive 设备档案 / settings 系统设置`
nav 定位：`position:fixed; inset:0 auto 0 0; width:var(--sidebar-w)`；`main` margin-left var(--sidebar-w)。页面不得增删改 nav。
active 规则：`Shell(pageKey).mount()` 在 `a[data-nav=pageKey]` 加 `.active`。

## Page List（全部 admin 桌面面，共享 shell）
1. **dashboard 运行监控大屏**：管网健康 KPI + 实时告警流 + 分区水压/流量趋势 + AI 研判 + 巡检任务 → map/alarm/archive
2. **map 管网 GIS 图**：SVG 管网示意 + 图层开关 + bbox 缩放 + 要素详情弹窗 + 关阀影响范围演示 + 图例
3. **overlay 覆盖物管理**：统一覆盖物表格 + 类型/状态筛选 + 批量删除 + 新增/编辑模态 + 类型多标签
4. **collect 采集管理**：采集批次列表 + 点位明细 + 批次→覆盖物生成演示 + 导入上传框
5. **alarm 告警中心**：告警信息表 + 类型/时间筛选 + 详情抽屉 + AI 研判面板 + 标记处理
6. **archive 设备档案**：设备/管网资产台账 + 生命周期状态 + 维保到期 + 工单对接入口
7. **settings 系统设置**：系统参数/通知/权限最小化展示（可选，简化）

## Mock Schema（mock.js，字段对齐 gis 表/协议；api.js 提供 Promise stub，前端只调 api，不触 model）
- overlay: id/type/overlay_number/device_number/name/lat/lng/usage_state/ground_elevation/spec/collect_worker/updated_at
- pipe: id/pipe_number/category/spec/usage_state/…（nodes: [{code,x,y,z}] 供 SVG 绘制）
- collectBatch: id/identifier/building_date/import_way/pipe_number/point_number/status
- collectPoint: id/batch_id/position/code/lat/lng/elevation/spec/area
- alarmInfo: id/overlay_number/alarm_type/alarm_value/alarm_info/collect_time/is_report/level
- archiveAsset: id/asset_no/name/category/status/install_date/warranty_end/last_case

## Icon Set（内联 Lucide SVG 名）
家柜：layout-dashboard map map-pin database bell folder-cog search plus trash-2 pencil x chevron-down filter upload
status: check-circle alert-triangle info clock refresh-cw activity layers shield alert-octagon
chart: trending-up trending-down gauge radio wifi cpu zap droplet wrench settings users file-text arrow-up-right