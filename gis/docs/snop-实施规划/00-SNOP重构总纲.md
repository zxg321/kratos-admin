# SNOP 平台重建总纲（智慧能源运营管理一体化平台）

> SNOP 实施规划 · 00（总纲，自包含，无需跳转即读）
> 日期：2026-09-14
> 项目：**智慧能源运营管理一体化平台，代号 SNOP**（GIS 为首批子模块）
> 输入：D:\www\GIS1.0、D:\www\GIS2.0、kratos-admin（当前仓库）三项目全量分析（详见 07/08/10 号文档）+ 2026 GIS 趋势调研
> 决策：ADR-12 **D1-D8 全部锁定**（见 §1），本文所有建议已按决策收敛
> 状态：总纲；决策表（§1 D1-D8）为全套文档唯一决策权威。

---

## 1. 已锁定决策（不再讨论，直接执行）

| # | 决策 | 关键约束 |
|---|---|---|
| D1 | 前端 **Vue3** | pnpm+turbo monorepo，不引入 micro-app |
| D2 | 地图引擎锁定 **AMap**（同 GIS1.0/2.0） | **MapLibre 选择全部移除**（方案/文档/依赖一律剔除）；**18-20 缩放级及以下必须清晰**（矢量分级加载、自建瓦片金字塔覆盖至 20 级、高缩放不掉帧）；库内 WGS84、展示 GCJ02（gcoord 入库即转换）；key 走配置不入库 |
| D3 | 暂不考虑 3D CesiumJS | 数据模型预留 z 值/高程；确有 3D 孪生订单再评估 CesiumJS 或 AMap Loca 3D |
| D4 | **一套登录贯通四端**（管理后台/portal/移动端/大屏） | 用户/角色/菜单/权限**全部重新设置，不复用 admin 系统**；独立 auth/acl 域自建（可借鉴 kratos-kit authn 实现，数据模型全新）；JWT claims：user_id/tenant_id/roles[]/client_type |
| D5 | **数据字典每个子系统相互独立** | snop_system/gis/patrol/iot/cnd/asset 各自 dict 表，同构模板生成，不集中收敛 |
| D6 | **每个子系统独立一个库** | snop_system / snop_gis(PostGIS) / snop_patrol(PostGIS) / snop_iot(TimescaleDB) / snop_cnd / snop_asset；经 data.databases 命名数据源 + 迁移目录落地；**禁止跨库 JOIN**，跨域只存 ID+契约取数 |
| D7 | 平台定名 **SNOP**，GIS 为子模块 | 库名 snop_ 前缀；表前缀按子模块（gis_/patrol_/iot_…）；介质分型扩至能源全域（燃气/水务/热力，租户级配置） |
| D8 | 商业演进 | 方案 D SaaS 产品化（云端订阅+私有化双轨）为 C 落地后的商业演进路线（详见同目录 03-SaaS产品化演进方案.md） |

---

## 2. 三项目所有功能详细清单（合并视图）

> 列说明：GIS1.0（Jeecg 单体）/ GIS2.0（Spring Cloud 微服务）现状，SNOP 重建落点与批次。✅有 🟡部分/残缺 ❌无 ⚙️仅表/契约。

### 2.1 平台公共服务底座（snop_system）

| 功能 | GIS1.0 | GIS2.0 | SNOP 处置 |
|---|---|---|---|
| 登录（密码+验证码） | ✅ Shiro+JWT | ✅ Gateway+auth | ✅ 自建 AuthService（P0） |
| 多端一套登录 | ❌ 端间割裂 | ❌ admin/业务端割裂 | ✅ 同源 JWT + client_type 四型（P0） |
| 用户/角色/菜单/按钮权限 | ✅ Jeecg sys_permission | 🟡 资源/角色 | ✅ 全新自建 sys_user/role/menu/api（P0） |
| 企业多租户 | ✅ 企业字段 | ✅ admin/ep 双后台 | ✅ sys_tenant，租户=企业，强隔离（P0） |
| 数据字典 | ✅ sys_dict | 🟡 多库重复 | ✅ **各域独立字典**，同构模板（P0，D5） |
| 系统配置/表单配置 | ✅ onl_cgform+配置 | 🟡 GisSet | ✅ config 域（P1） |
| 文件存储 | 🟡 阿里云 OSS | 🟡 MinIO | ✅ 多适配+上传安全（P0） |
| 消息/待办/公告 | ✅ message 域 | ✅ gis_public | ✅ 消息中心（P1） |
| 实时推送 | 🟡 WebSocket | 🟡 WS×3 处 | ✅ SSE 统一（P1） |
| 审计日志 | 🟡 简单日志 | 🟡 logging | ✅ 异步落库+保留清理（P1） |
| 登录日志/会话管理 | ❌ | ❌ | ✅ 自建（P1） |
| 备份/归档/恢复 | ❌ 手工 | ❌ 手工 | ✅ 六库独立备份任务（P1） |
| 定时任务 | ✅ Quartz | 🟡 各服务自带 | ✅ task 域 + Redis 锁（P0） |
| Geo-Agent（AI 会话+MCP 工具） | ❌ | ❌（仅 PRD） | ✅ MCP 注册五类分析+DMA（P0） |
| API 文档/调试台 | 🟡 Swagger2 | ❌ | ✅ OpenAPI 多语言（P1） |
| 代码生成器 | ❌ | ❌ | ✅ cnd/asset 快速起步杠杆（P0） |
| 对外开放接口/CAS | ✅ foreign/cas | 🟡 海云汇 | 🟡 OAuth 适配器（P2） |
| 在线表单/打印模板 | ✅ | ❌ | 🟡 高频场景已部分承接为 04 F-S09（表单 schema 配置化） |
| 国际化 | ❌ | ❌ | 🟡 按需（P2） |

### 2.2 GIS 子模块（snop_gis，首批实施）

| 功能 | GIS1.0 | GIS2.0 | SNOP 处置 |
|---|---|---|---|
| 管网一张图 | ✅ AMap | ✅ AMap GISMap | ✅ AMap + 18-20 级清晰验收（P0） |
| 图层管理+授权 | 🟡 overlay | ✅ 图层设置 | ✅ layer 服务+Grant 接线（P0） |
| 要素管理（12 类覆盖物） | 🟡 JSON 坐标 | ✅ overlayType 泛化 | ✅ feature 服务，geometry+GiST（P0） |
| 绘制/量算/吸附 | ✅ AMap 插件 | ✅ GISMap 插件 | ✅ GISMap 包直接演进（P0） |
| 基础空间分析（测距/测积/缓冲/叠加） | 🟡 turf 前端 | 🟡 部分 | ✅ analysis 服务已有（P0） |
| **关阀分析** | ❌ | ✅ ValveTurnoff | ✅ Go 内存图+PostGIS 混合重写（P0） |
| **连通性分析** | ❌ | ✅ PipeConnectivity | ✅ 同上（P0） |
| **拓扑分析** | 🟡 流程雏形 | ✅ TopologyAssay | ✅ 接口注册聚合（P0） |
| **开挖分析** | ❌ | ✅ ExcavationAssay | ✅ 埋深/高程/周边统计（P0） |
| **图形分析** | 🟡 框选 | ✅ GraphicAssay | ✅ 矩形/多边形/圆分发（P0） |
| 管线/管点台账 | ✅ ep_dev_piperoad | ✅ gis_pipe(+point) | ✅ pipe 域（P0） |
| 设备台账（12 类） | ✅ ep_dev_* | ✅ 每类 CRUD+History | ✅ equipment 域（P0） |
| 采集数据+变更追踪 | 🟡 collect | ✅ 12 条 ChangeCal 链 | ✅ collect 域（P1） |
| GIS 告警（配置/信息） | ✅ alarm | ✅ AlarmConfig/Info | ✅ alarm 域+批量预警值（P1） |
| DMA 分区/产销统计 | ✅ 画区+统计 | ❌ | ✅ dma 域（P1） |
| **漏损六步法/输差/模拟** | ✅ 两套复制实现 | ❌ | ✅ **1.0 算法黄金用例→Go 重写**（P1） |
| 统计报表（管线长度/增长） | 🟡 | ✅ 12 个 Excel 转换器 | ✅ stat 域（P1） |
| 多底图源切换 | ✅ 天地图/高德 | ✅ | ✅ LayerRegistry（P1） |
| 多介质分型 | ✅ use_type 菜单分叉 | 🟡 | ✅ 租户配置实现（P1） |
| CAD 底图 | ✅ ep_map_cad | ❌ | 🟡 CAD→瓦片金字塔至 20 级（P2） |
| 二维码设备绑定 | ✅ | ❌ | 🟡（P2） |
| BIM 接入 | ❌ | ⚙️ push_zy_pipe_bim | 🟡 预留（P2） |
| 3D 管线渲染 | 🟡 babylon 尝试 | ❌ | 🟡 AMap Loca/3D；CesiumJS 订单触发（P2） |
| 无人机巡检接口 | ❌ | ❌ | 🟡 媒体/航线接口位（P2） |

### 2.3 巡检（snop_patrol，P1）｜2.4 IoT（snop_iot，P1）

| 巡检功能 | GIS1.0 | GIS2.0 | SNOP | | IoT 功能 | GIS1.0 | GIS2.0 | SNOP |
|---|---|---|---|---|---|---|---|---|
| 巡检计划/区域 | ✅ | ✅ Planning* | ✅ | | 设备档案/驱动/事件 | ✅ ep_dev_* | ✅ EpDataDev | ✅ |
| 计划工单/跟踪 | ✅ | ✅ | ✅ | | MQTT 接入网关 | 🟡 drive/BRT | ✅ 3 broker | ✅ 事件总线 |
| 逐实体记录（标定/审核/绑定） | ✅ | ✅ 36 表 | ✅ | | **8 厂商适配器** | 🟡 | ✅ | ✅ 重写 |
| 工单全生命周期 | ✅ ep_work | ✅+EventBus | ✅ | | HTTP 轮询兜底 | ❌ | ✅ BRT | ✅ 保留 |
| 处置工单 | ❌ | ✅ | ✅ | | 时序存储 | ✅ MySQL 日表 | ✅ TDengine | ✅ TimescaleDB |
| 隐患闭环 | ✅ | ✅ | ✅ | | 粒度查询链（实/时/日/月） | ✅ | ✅ | ✅ |
| 轨迹采集回放 | ✅ trail | ✅ StaffTrack | ✅ | | 离线判定/告警引擎 | 🟡 | ✅ | ✅ |
| 抄表 | 🟡 | ✅ | ✅ | | 实时推送 | ✅ WS | ✅ WS | ✅ SSE |
| 在线上传/视频取证 | ✅ | ✅ | ✅ | | 设备看板 | 🟡 | ✅ | ✅ |
| 开挖监测 | ❌ | ✅ | ✅ | | GIS 打点联动 | ✅ | ✅ useDeviceMarker | ✅ |
| 巡检统计（绩效/工时） | 🟡 | ✅ | ✅ | | 批量预警值 | ✅ | ✅ | ✅ |

### 2.5 指挥调度（snop_cnd，P2）｜2.6 资产（snop_asset，P2）｜2.7 移动端与大屏

| 指挥调度（cnd） | GIS1.0 | GIS2.0 | SNOP | | 资产（asset） | GIS1.0 | GIS2.0 | SNOP |
|---|---|---|---|---|---|---|---|---|
| 事故接报/抢险工单 | 🟡 prod 域 | ⚙️ 24 表无码 | ✅ code_gen | | 资产台账/维保 | ✅ eam | 🟡 反向对接 | ✅ |
| 应急预案/组织/目标 | 🟡 | ⚙️ | ✅ | | 采购入库/验收 | ✅ purc | ❌ | ✅ |
| 物资仓库（收发退） | ✅ | ⚙️ | ✅ | | 处置（调拨/改装/报废/变卖） | ✅ | ❌ | ✅ |
| 值班排班/评估报告 | ✅ | ⚙️ | ✅ | | 品牌/供应商 | ✅ | ❌ | ✅ |
| 监控设备台账 | ✅ | ⚙️ | ✅ | | 与 GIS 设备关联 | ✅ AssetGis2 | 🟡 | ✅ |

| 移动端/大屏 | GIS1.0 | GIS2.0 | SNOP |
|---|---|---|---|
| 移动巡检作业（任务/打卡/取证） | ✅ APP | ❌ 无独立移动前端 | ✅ uni-app（P1） |
| 移动消息/待办/设备查看 | 🟡 | ❌ | ✅（P1） |
| 生产调度大屏 | ✅ datav | ✅ visualization | ✅ dashboard（P1） |
| 数据驾驶舱 | ❌ | ✅ | ✅（P2） |
| AI 助手入口 | ❌ | ❌ | ✅ 各端（P0） |

> 全量统计：底座 19 + GIS 24 + 巡检/IoT 22 + cnd/asset 9 + 移动大屏 5 = **约 79 项功能**（早期盘点口径，已被 04 号 113 项 F- 编号权威清单取代，保留作三系统现状对照）；其中约 30% 直接复用设计/实现，25% 建议废弃（Jeecg/RuoYi/重复实现），需重写约 20 项。

---

## 3. 2026 最新趋势 → SNOP 升级建议（已按 D2/D3 过滤）

| 趋势（2026） | SNOP 对应动作 | 级别 |
|---|---|---|
| 空间智能体 Geo-Agent（SuperMap AgentX、MCP+A2A 多智能体） | **五类管网分析+DMA 注册 MCP 工具**（buf 生成链现成，近零成本）→ 自然语言管网分析 Copilot | **P0** |
| 云原生空间数据库（PostGIS 3.6：GeoParquet/Arrow） | 分析算法下沉 PostGIS（内存图+bbox 预筛混合），物化 gis_pipe 供图遍历 | **P0** |
| 时空大数据实时化（时序 GIS 标配） | snop_iot TimescaleDB hypertable；轨迹回放时序窗口查询；预留动态协议接口 | P1 |
| 云原生 + 信创（K8s、国产芯片适配） | compose→K8s/Helm；多架构镜像（amd64/arm64）已具备；瓦片走 MinIO 对象存储 | P1 |
| BIM+GIS+CIM / 数字孪生（3DGS、glTF 2.1、MVT→3D Tiles） | **按 D3 暂缓**；数据模型预留 z/高程；3D 需求先用 AMap Loca/3D；CesiumJS 订单触发评估 | P2 订单触发 |
| 低空经济（无人机巡检） | patrol 域预留无人机媒体/航线接口位 | P2 预留 |
| 端侧 GeoAI / 生成式制图 | 与本项目关联弱，AI 会话底座留"文本→样式/查询"接口位 | 观察 |

## 4. 更优解决方案（比"逐功能重写"更好的做法）

**整体方案选型（已定）**：方案 C = pg18 统一底座骨架（方案 B）+ **事件驱动数据面**（MQTT 网关→Redis Stream→多消费者）+ **Geo-Agent MCP 先行**；方案 A（绞杀者）仅作停机约束 fallback；**方案 D（SaaS 产品化）已确认为 C 落地后的商业演进路线（D8，详见 03 号文档）**。六个分叉点选型：TimescaleDB / 内存图+PostGIS / **AMap（锁定）** / Redis Stream→NATS / K8s+Helm / uni-app。

**七条反直觉降本建议**：
1. **不迁移就是最好的迁移**——约 25% 功能直接废弃（Jeecg/RuoYi 系统管理、三处重复 WebSocket、双套 DMA 复制、old_vue_gis2.0）。
2. **代码生成器是重构杠杆**——cnd/asset 纯 CRUD 域用 code_gen 起步，人周→天。
3. **坐标 ETL 是第一交付物**——JSON 文本坐标→geometry 的清洗流水线先行，失败行进隔离表；没有干净空间数据，算法重写无从对拍。
4. **MCP 工具先行于前端**——分析域重写后先注册 MCP，用 AI 会话验证正确性，界面后置。
5. **黄金用例对拍代替全量回归**——从 1.0/2.0 抽输入输出对，Go 重写逐对 diff。
6. **一套登录贯通四端 + RBAC 自建复用设计**——同源 JWT + client_type；认证中间件借鉴 kratos-kit，字典按 D5 独立。
7. **介质分型进数据模型不进菜单**——租户级配置 + 字典驱动，避免 1.0 use_type 三份维护。

## 5. 制作流程与后续（详见 01/02 号文档）

- 九步功能流水线与四条铁律详见 02 §2.1。
- 里程碑详见 02 §3.1（SaaS 产品化阶段 P-D1~P-D4 见 03 号文档）。
- 待确认事项清单见 01 号文档文末。
- 立即行动见 02 §3.4。
