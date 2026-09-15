# legacy GIS2.0 系统整合与借鉴分析报告

> 状态（2026-09-14 校准）：已被取代——被《20260913_gis2.0全量落地于kratos-admin技术栈方案》扩展，后者又被 gis/docs/snop-实施规划/00 取代。文中「高德引擎不建议替换/与 MapLibre 冲突」结论作废（D2：AMap 锁定）；MySQL 8/MapLibre 现状描述过时（现状一律 PostgreSQL）。仅作历史分析留档。

- 日期：2026-09-09
- 方向：能力迁移进本系统（go-kratos-admin 的 `gis` 模块）
- 定位：将 legacy GIS 系统（`vue3_gis2.0` 前端 + `java_gis2` 后端）的高价值能力迁移/借鉴到本系统 GIS 模块
- 结论侧重：管网行业空间业务分析算法移植 + 多图层/设备打点/可视化大屏前端能力复用

---

## 1. 两套系统现状

### 1.1 本系统 GIS 模块（目标系统）

| 维度 | 现状 |
| --- | --- |
| 后端 | Go + Kratos，Proto 契约驱动，GORM + MySQL 8 空间扩展（SRID 4326） |
| 已有接口 | 图层 CRUD/分页/列表，要素 CRUD/分页/bbox 空间查询，分析服务（测距/测积/缓冲区/叠加查询 within/intersects） |
| 前端 | portal：MapLibre GL 地图工作台 + 登录页，M2 起内置分析工具栏（测距/测积/缓冲区/叠加查询） |
| 可执行 | 可独立运行（后端 7002 / 门户 8850），或作为模块挂载 Kratos Core |
| 架构特点 | 单一仓库、标准 Kratos 分层（biz/data/service/model），空间计算依赖 MySQL ST_* 函数 |

代表实现：
- `gis/backend/internal/data/impl/mysql_spatial.go`：bbox 查询、ST_Length/ST_Area/ST_Buffer、ST_Within/ST_Intersects 与 SRID 处理
- `gis/backend/api/proto/gis/admin/v1/analysis.proto`：测距/测积/缓冲区/叠加查询
- `gis/portal/packages/gis-ui/src/AnalysisToolbar.vue`、`gis-core/src/useDraw.ts`：前端分析交互与绘制

### 1.2 legacy `vue3_gis2.0` 前端

| 维度 | 现状 |
| --- | --- |
| 架构 | pnpm + turbo + `@micro-zoe/micro-app` 微前端 monorepo（main 基座 + apps/* 子应用 + packages/* + global-store + common） |
| 地图引擎 | **高德 AMap JSAPI 2.0**（GISMap 包封装），另有多图层（天地图矢量/影像、高德影像、默认） |
| 多应用 | home / gis / gis-manager / routing-inspection / routing-manager / prod（指挥调度）/ prod-manager / monitoring-assembly（监控监管）/ visualization-dashboard（大屏） |
| 技术栈 | Vue3 + Pinia + Element Plus + ECharts + micro-app |

关键资产：
- `packages/GISMap`：`MapContainer`、图层组件、坐标系枚举 `CRSTypes`、`MapInstaller` 插件接口，绘制插件（`PolygonDrawer/Editor`、`LineDrawer/Editor`、`LineMeasure`、`RectDrawer`、`AreaSurvey`）
- `apps/gis/src/views/home`、`views/pipeline`：多图层组合 + `MarkerSetter` + `useDeviceMarker` 设备打点
- `global-store/src/modules/user.ts`：token/用户/权限统一管理（跨子应用）

### 1.3 legacy `java_gis2` 后端

| 维度 | 现状 |
| --- | --- |
| 架构 | Spring Boot 3.2.4 + DDD 四层（gis-api / gis-application / gis-domain / gis-infrastructure），Maven 多模块 |
| 存储 | MySQL 8 + MyBatis-Plus |
| 空间能力核心 | `OverlayAnalysisController` 暴露 `/map/analysis` 下关阀分析、图形分析、拓扑分析、开挖分析、连通分析 |
| 高价值算法 | **管网图遍历/关系推理类**分析（非纯 ST_* 函数），常见于水务/管网行业 |

关键实现：
- `overlay/analysis/service/ValveTurnoffAssayService`：关阀影响范围——从断点/阀门点递归向上下游扩展遍历管网，标记已分析点/阀门避免重复（广度/深度优先遍历）
- `overlay/analysis/service/TopologyAssayService`：聚合注册所有拓扑分析实现并逐个执行
- `overlay/analysis/service/GraphicAssayService`：按图形类型（矩形/多边形/圆形）分发到各实现
- `overlay/analysis/service/ExcavationAssayService`：开挖分析——计算开挖点埋深、地面高程、规格、设施及周围物体数量
- `pipe/service/PipeConnectivityAssayService`：连通性——基于管道与地标点关系，`point.isOn(line,2)` 判断点在线段附近，标记 CONNECTED / UNCONNECTED / SOLITARY_DUCT
- `service/impl/OverlayAnalysisAppService`：应用层转发 + 结果 VO 转换

---

## 2. 整合与借鉴策略（核心建议）

采用**「分层迁移」策略**：不整体搬移 legacy，而是识别高价值能力，按「算法层 → 后端契约层 → 前端能力层」三个层次选择性迁移，与现有 Kratos 架构融合。

### 2.1 优先迁移（直接价值高、与现有架构契合）

#### A. 管网空间业务分析算法（后端，最高优先）
将 legacy 的**图遍历类空间分析**移植为 Go + 现有 GIS 模块能力：

| 能力 | legacy 算法要点 | 本系统落点建议 |
| --- | --- | --- |
| 关阀影响范围分析 | 断点/阀门点沿管道双向递归扩展，标记已分析点避免环回 | 新增 `ValveTurnoffService`，抽象"管网图（节点-边）"数据模型 |
| 连通性分析 | 点在线段附近（容差 2）标记连通/孤立 | 复用要素 bbox 查询 + MySQL ST_Distance，多容差阈值 |
| 拓扑分析 | 注册多实现聚合执行 | 用 Kratos DI + 接口注册机制替代 Java 实现注册 |
| 开挖分析 | 埋深/高程/规格/设施统计 | 结合要素属性查询 + 空间关系判定 |
| 图形分析 | 按矩形/多边形/圆形分发 | 复用现有叠加查询 within/intersects 基础，扩展几何类型分发 |

**迁移建议**：先在 `gis/backend/internal/biz` 建立独立分析策略包（如 `internal/analysis`），用 Go 接口 + DI 实现"实现注册/聚合"模式；数据层用现有 `mysql_spatial.go` 能力组合（bbox 预筛 + 精确几何判定），避免一次性引入大量 ST_*。图遍历数据结构（Node-Edge、访问标记）可作为象棋式纯内存算法模块，便于单元测试。

#### B. 多图层/底图源管理（前端，中等优先）
legacy 的 GISMap 多图层（天地图矢量/影像、高德影像、坐标系枚举）是普适能力。本系统 portal 目前以 MapLibre GL 为主，可借鉴：
- 抽象「图层源」配置模型（模板加载天地图/高德影像是在线 WMTS/XYZ，不绑定具体引擎）
- 在 `gis-core` 增加统一的 LayerRegistry / 图层切换器，MapLibre 加载 XYZ tile source 即可支持多底图，避免引擎重绑定

#### C. 设备打点与实际业务联动（前端）
legacy 的 `useDeviceMarker`、`MarkerSetter` 结合要素表可抽象为「业务点渲染器」（点位样式、点击高亮、联动要素详情），可直接在 portal 复用，价值覆盖大屏/监控/巡检多端。

### 2.2 借鉴但需权衡（二次评估）

| 能力 | 借鉴价值 | 风险/权衡 |
| --- | --- | --- |
| micro-app 微前端拆分 | 多业务模块可独立开发/发布 | 本系统 portal 为单工作台，Kratos Core 模块挂载已覆盖多模块；引入 micro-app 增加复杂度，**不建议** |
| 高德引擎（GISMap） | 高德影像丰富、插件齐全 | 与现有 MapLibre 冲突、坐标系 GCJ-02 偏移；**不建议替换**，仅借鉴图层源抽象 |
| ECharts 可视化大屏 | 大屏/统计场景高价值 | 可单独作为 portal 一个新视图，不依赖 legacy 子应用，**建议抽象为独立资源** |
| 指挥调度/监控监管/巡检 | 业务型子系统 | 依赖 IoT、视频等外部系统，超出 GIS 模块范畴；**建议仅在文档层记录对接位**，不迁移 |

### 2.3 架构融合要点（避免两层漂移）
遵循仓库 AGENTS.md：接口契约 → 后端实现 → 前端调用 → SQL/文档 同步改动。
- 新增分析能力必须在 `gis/backend/api/proto/gis/admin/v1` 新增/扩展 proto，再生成 `api/gen`、`rpc`、OpenAPI。
- 空间表若需新增（如管网节点/边），统一放 `gis/backend/migration/assets/v0.0.1`，字段使用中文注释。
- 坐标系统一约束：本系统固定 SRID 4326；若引入 legacy 的 CGCS/GCJ 数据，需明确转换策略和文档记录。

---

## 3. 落地分期建议

- **P0（近期）**：管网图遍历算法移植（关阀/拓扑/连通/开挖）到 `internal/analysis`，补充单元测试；先做数据模型设计（节点/边/要素关联）。
- **P1（中期）**：portal 增加多图层源抽象 + 设备打点渲染器；落地大屏视图（复用 ECharts）。
- **P2（远期）**：沉淀统一图层源/业务点渲染为 `gis-core`/`gis-ui` 可复用组件；评估是否承接指挥调度等外部系统对接。

---

## 4. 打分与风险洞察

> 依据用户规则：所有结果 10 分制评分，洞察潜在问题并给出合理化建议。

### 4.1 综合评分

| 维度 | 评分（10分制） | 说明 |
| --- | --- | --- |
| 迁移价值度 | **8.5** | legacy 管网算法是本系统稀缺值，价值明确；但非纯 GIS 通用能力 |
| 架构契合度 | **9.0** | 拆分落点（internal/analysis、proto 契约、gis-core 组件）与现有 Kratos 分层高度契合 |
| 迁移风险度 | **7.0** | 图算法迁移需重写 + 坐标系/数据模型差异是主要风险 |
| 前端可复用性 | **7.5** | 多图层源/设备打点/大屏可复用；微前端与高德引擎不建议复用 |
| 整体综合 | **8.0** | 值得分阶段推进，优先 P0 算法迁移 |

### 4.2 潜在问题与合理化建议

1. **图算法直接翻译陷阱**：legacy 关阀/拓扑算法耦合于其数据模型（管道、阀门、地标点字段），直接照搬会带偏本系统空间模型。
   → 建议：先设计本系统「管网节点-边」数据模型与现存要素模型的关系，再重写图遍历；算法保持纯内存可单测。

2. **坐标系漂移**：legacy 高德数据为 GCJ-02，本系统为 SRID 4326（WGS84），叠加会偏移。
   → 建议：统一入口做坐标转换（GCJ→WGS84），或在数据接入阶段规范；文档明确坐标系约束，避免后端/前端两层漂移。

3. **空间分析性能**：关阀遍历是图算法，若在 MySQL 逐点 ST_* 判定会慢。
   → 建议：bbox 预筛 + 内存图结构，把高频判定放内存，DB 只做粗筛。

4. **前端引擎不一致**：legacy 用高德，本系统用 MapLibre，图层插件（PolygonEditor/AreaSurvey）不能搬。
   → 建议：只借鉴「图层源抽象 + 业务点渲染」，引擎绑定保持在 gis-core 层，屏蔽差异。

5. **微前端误迁移**：micro-app 拆分会引入与 Kratos Core 模块挂载机制重叠的复杂度。
   → 明确不迁移，避免过度设计。

### 4.3 结论
建议按 **P0（图遍历算法移植）→ P1（前端多图层/打点/大屏）→ P2（沉淀通用组件）** 推进。优先落地关阀/连通性分析，其价值最直接且可用现有空间查询能力支撑。

---

## 附录：关键参考路径（legacy）

- 后端分析算法：`D:\www\gis2.0\java_gis2\gis-domain\src\main\java\com\maida\gis\overlay\analysis\service\*.java`、`...\pipe\service\PipeConnectivityAssayService.java`
- 后端接口出口：`...\gis-application\...\controller\OverlayAnalysisController.java`
- 前端 GISMap：`D:\www\gis2.0\vue3_gis2.0\packages\GISMap\**`
- 前端业务：`D:\www\gis2.0\vue3_gis2.0\apps\gis\src\views\**`