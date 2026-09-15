# GIS Intel Ops Platform · 全量产品原型

> 覆盖《PRD-管网智能运维平台》S1–S10 全部子系统的静态产品原型。
> 纯 HTML/CSS/vanilla JS，零外部依赖，双击即可离线打开。
> 设计契约见 `_design/design-contract.md`（所有页面共享同一 App Shell 与设计令牌）。

## 页面清单

| 文件 | pageKey | 子系统 | 内容 |
|---|---|---|---|
| `index.html` | dashboard | S8 缩略 | 运行总览工作台：KPI/趋势/AI 预测/告警流/巡检/事件闭环 |
| `bigscreen.html` | —（全屏） | S8 | 态势总览大屏·数字孪生（三栏大屏 + 中央管网 SVG + 事件流） |
| `map.html` | map | S1 | 管网一张图：图层树/SVG 管网/空间查询/关阀·开挖·连通·拓扑分析 |
| `overlay.html` | overlay | S1 | 覆盖物管理：12 类筛选/批量操作/详情抽屉 |
| `collect.html` | collect | S2 | 采集入库：批次/质检/拓扑问题/生成入库闭环 |
| `monitor.html` | monitor | S3 | 智能监测：设备总览/实时数据/阈值配置/批量下发/AI 预测 |
| `alarm.html` | alarm | S3 | 告警中心：筛选/详情抽屉/AI 研判/认领·派单·处理 |
| `patrol.html` | patrol | S4 | 巡检作业：工单/轨迹回放/隐患上报/标定/统计排行 |
| `emergency.html` | emergency | S5 | 应急指挥：接报→派单→处置/物资/值班/预案 RAG 问答/演练 |
| `asset.html` | asset | S6 | 资产生命周期：台账/BPM 审批流（调拨·改装·报废·变卖） |
| `system.html` | system | S7 | 系统管理：用户/租户隔离/字典/审计日志 |
| `openapi.html` | openapi | S10 | 政企对接：开放应用/密钥/对接日志/端点与签名鉴权 |
| `mobile.html` | —（手机壳） | S9 | 移动作业 APP：巡检打卡/隐患上报/抄表/离线模式 |

## 共享层

| 文件 | 说明 |
|---|---|
| `assets/styles.css` | 设计令牌 + 组件样式（tech-dark 工业测控，支持 light 主题切换） |
| `assets/icons.js` | 内联 Lucide 图标集（window.ICONS） |
| `assets/components.js` | App Shell（11 项导航注入/模态/抽屉/toast） |
| `assets/mock.js` | 全量 Mock 数据（字段对齐 gis_* / cnd_* / patrol_* 实体） |
| `assets/api.js` | Promise stub API（页面唯一数据入口） |

## 演示路径建议

1. `bigscreen.html` 看全局态势 → 2. `alarm.html` 处理告警并派单 → 3. `emergency.html` 接报研判派单 → 4. `patrol.html` 轨迹与隐患 → 5. `map.html` 关阀影响分析 → 6. `mobile.html` 外业打卡闭环。
