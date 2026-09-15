# SNOP · 智慧能源运营管理一体化平台 · 全量产品原型

> 唯一口径：《04-SNOP功能说明书.md》（113 项功能 / 12 模块），决策基线《00-SNOP重构总纲.md》D1-D8。
> 覆盖全部 12 模块 + 四端（登录 / 管理后台 / portal 工作台 / 生产调度大屏 / 移动端 uni-app）。
> 纯 HTML/CSS/vanilla JS，零外部依赖，双击即可离线打开。
> 设计契约见 `_design/design-contract.md`；本目录为 `gis-platform-full`（旧 PRD 口径）的 SNOP 全量升级版。

## 页面清单（18 页）

| 文件 | pageKey | 端 | 覆盖功能 | 内容 |
|---|---|---|---|---|
| `login.html` | —（无 Shell） | 登录 | F-S01/S02/S03/S20 | 租户（介质类别）选择 / 验证码 / 四端 client_type / MFA / 会话策略 |
| `index.html` | dashboard | portal 工作台 | F-V03/V04 | 运营工作台：KPI / 模块宫格 / 待办 / 事件闭环 / 积木配置 |
| `map.html` | map | 管理后台 | F-G01/G05~G10 | 管网一张图：图层树 / 绘制量算吸附 / 缩放级指示器（AMap 18-20 级口径） |
| `layer.html` | layer | 管理后台 | F-G02/G03/G04/G13 | 图层 CRUD / 授权矩阵 / 12 类要素 / 标注 |
| `analysis.html` | analysis | 管理后台 | F-A01~A10 | 空间分析套件：关阀/连通/拓扑/开挖/图形/缓冲/叠加 + 黄金用例对拍 |
| `dma.html` | dma | 管理后台 | F-M01~M06 | DMA 分区 / 六步法向导 / 输差诊断 / 模拟 / PDF 报告 |
| `report.html` | report | 管理后台 | F-G15 | 12 类统计报表 / SVG 图表 / Excel 导出 |
| `device.html` | device | 管理后台 | F-D01~D10 | 设备台账 / 采集导入 / 粒度查询 / 批量预警值 |
| `iot.html` | iot | 管理后台 | F-I01~I09 | 8 厂商适配器 / MQTT 网关 / 实时数据 / 离线判定 |
| `alarm.html` | alarm | 管理后台 | F-L01~L06 | 规则引擎 / 告警闭环 / 多维分析 / 视频告警位 |
| `patrol.html` | patrol | 管理后台 | F-P01~P12 | 计划 / 工单状态机 / 隐患闭环 / 轨迹回放 / 绩效 |
| `cnd.html` | cnd | 管理后台 | F-C01~C08 | 事故接报 / 抢险工单 / 物资 / 值班 / 预案 RAG / 演练 / 评估报告 |
| `eam.html` | eam | 管理后台 | F-E01~E06 | 台账 / 维保 / 处置四流程 BPM / 采购 / 品牌 |
| `system.html` | system | 管理后台 | F-S04~S15/S17 | 用户 / 四层授权矩阵 / 四型菜单 / 租户 / 分域字典(D5) / 审计 / 任务 / 备份 |
| `geagent.html` | geagent | 管理后台 | F-S16 | Geo-Agent 会话 / MCP 工具卡 / 调用过程可视化 |
| `openapi.html` | openapi | 管理后台 | F-S18/S19 | 凭据 / operation 白名单 / IP 白名单 / 调用日志 / SSO |
| `bigscreen.html` | —（无 Shell） | 大屏 | F-V01/V02 | 生产调度大屏：三栏 / 介质 KPI / 事件流 / GIS 大屏模式 |
| `mobile.html` | —（无 Shell） | 移动端 | F-V06/V07/V08 | uni-app：任务 / 打卡取证 / 抄表 / 扫码 / 离线模式 |

> 数据迁移支撑（F-X01~X03）为一次性工程项，非运行功能，不出原型页。

## 共享层

| 文件 | 说明 |
|---|---|
| `assets/styles.css` | 设计令牌 + 组件样式（tech-dark 工业测控，light 主题切换，介质色彩编码） |
| `assets/icons.js` | 内联 Lucide 图标集（window.ICONS） |
| `assets/components.js` | SNOP App Shell（分组导航 15 项 / 租户类别（介质）切换器 / 六库状态 / 模态 / 抽屉 / toast） |
| `assets/mock.js` | 全量 Mock 数据（字段对齐 gis_/patrol_/iot_/cnd_/eam_/sys_ 实体） |
| `assets/api.js` | Promise stub API（页面唯一数据入口） |

## SNOP 关键决策在原型中的体现

| 决策 | 原型呈现 |
|---|---|
| D2 AMap 锁定 | map.html 缩放级指示器（Z18/Z19/Z20 矢量分级加载验收口径） |
| D4 一套登录贯通四端 | login.html 四端 client_type；system.html 四型菜单 |
| D5 字典分域 | system.html 数据字典按六库域切换 |
| D6 六库分库 | 侧栏底部六库连接状态 |
| D7 介质分型 | **介质 = 租户类别标识**：燃气/供水/热力分属不同租户（燃气公司/江南水司/热力集团）；**单租户口径**——同一视图内绝不出现多种介质数据，KPI/列表/图表/图层树/移动端均只呈现本租户介质；顶栏为折叠式租户选择器（演示用），切换即整页重载 |
| F-S16 Geo-Agent | geagent.html MCP 工具卡与调用过程可视化 |

## 演示路径建议

1. `login.html` 选租户（介质类别）+ 四端登录与 MFA → 2. `index.html` 看运营工作台 → 3. `map.html` 一张图 + 租户类别切换 → 4. `analysis.html` 关阀分析（黄金用例对拍）→ 5. `alarm.html` 认领/派单 → 6. `dma.html` 六步法向导 → 7. `geagent.html` 自然语言管网分析 → 8. `bigscreen.html` 大屏 → 9. `mobile.html` 外业闭环。
