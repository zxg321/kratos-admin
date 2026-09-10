# GIS Portal 地图引擎迁移设计：MapLibre → 高德 AMap

- 日期：2026-09-09
- 状态：方案 A（引擎无关适配层）已确认
- 目标：将 gis portal 地图引擎从 MapLibre GL 切换为高德 AMap JSAPI v2，借鉴 `D:\www\gis2.0\vue3_gis2.0\packages\GISMap` 的核心模式
- 参考文档：https://lbs.amap.com/api/javascript-api-v2/documentation#maptype

---

## 1. 背景与目标

当前 GIS portal 使用 MapLibre GL：
- `gis/portal/packages/gis-core/src/MapView.vue`：创建 `maplibregl.Map`
- `gis/portal/packages/gis-core/src/useMap.ts`：GeoJSON source/layer 渲染
- `gis/portal/packages/gis-core/src/useDraw.ts`：maplibre-gl-draw 绘制
- `gis/portal/packages/gis-ui/src/AnalysisToolbar.vue`、`apps/portal/.../WorkbenchView.vue`：消费 `MapInstance`/`getBounds()`/`draw.create`

触发迁移原因：用户指定改用高德（地图 A 能力+备案合规源），并期望借鉴 legacy `GISMap` 包的核心模式。

### 已确认的关键决策
| 决策 | 结论 |
| --- | --- |
| 引擎抽象 | **定义引擎无关 `MapAdapter` 适配层** |
| 借鉴范围 | **核心模式**：Plugin + install 注入、Canvas 自绘覆盖物、图层切换 |
| 坐标系 | **库内 WGS84 + 前端展示转 GCJ02**（曾议定 GCJ02，已按评审修订） |
| 空间分析 | **库内 WGS84 直接计算**，无需转换，零损耗 |
| 数据库 | **PostgreSQL + PostGIS**（空间库），**Apache AGE**（管网拓扑图）混合 |
| 库隔离 | **GIS 独立建库 `gis`**，与 root admin 隔离 |
| 表命名 | **统一 `gis_` 前缀 + 中文字段注释** |

---

## 2. 总体架构

保持「GeoJSON 契约不变，引擎仅渲染层」的边界。后端接口与 GeoJSON 交互格式不变，仅在坐标基准上统一为 GCJ02。

```
gis/portal/packages/gis-core/src/
├── adapter/                 # 引擎无关层（对外唯一依赖）
│   ├── types.ts             # MapAdapter / Camera / MapEventListener
│   └── coord.ts             # WGS84 <-> GCJ02 转换 + 几何工具
├── amap/                    # 高德实现（私有，不对外）
│   ├── AMapAdapter.ts       # 实现 MapAdapter，管理 AMap.Map 生命周期
│   ├── amapOverlay.ts       # GeoJSON -> AMap overlay（Marker/Polygon/Polyline）渲染
│   └── amapDraw.ts          # 绘制：MouseTool / 自建 drawer + draw 事件适配
├── MapView.vue              # 高德容器 + 创建 AMapAdapter
└── index.ts                 # 导出 MapAdapter 类型（替换 MapInstance）
```

### 2.1 MapAdapter 接口（引擎无关面）
```ts
export interface MapAdapter {
  // 生命周期
  getMap(): unknown                 // 内部实例（引擎透传，供扩展）
  on(type: MapEventType, cb: (e) => void): void
  off(type: MapEventType, cb): void
  // 相机
  getBounds(): BBox                 // {south,west,north,east} GCJ02
  flyTo(center: [number, number]): void
  // 渲染：GeoJSON -> 覆盖物
  renderGeoJSON(key: string, data: FeatureCollection | Feature | Geometry, style: OverlayStyle): void
  removeOverlay(key: string): void
  setOverlayVisible(key: string, visible: boolean): void
  // 绘制控制器
  createDrawController(): DrawController  // activate/getGeometry/clear/destroy
  addPlugin(p: MapPlugin): void            // 借鉴 GISMap 的 install(map) 注入
  destroy(): void
}

export interface MapPlugin { id: symbol; install(map: MapAdapter): void }
export interface DrawController {
  activate(mode: 'point'|'line'|'polygon'|'none'): void
  getGeometry(): Geometry | null
  clear(): void
  destroy(): void
  onDraw(cb: (g: Geometry) => void): void
}
```

### 2.2 事件契约适配
- `draw.create` → `onDraw`（绘制完成回调）
- `map-ready` 事件载荷由 `maplibregl.Map` 改为 `MapAdapter`
- `feature-click` → `overlay click` 回调，返回要素 properties

---

## 3. 坐标系统与转换（核心风险点）

### 3.1 决策落地（与后端统一 GCJ02 方案的对比，此为最终）
- **数据基准**：库内 `gis_feature.geometry` 与后端所有地理坐标统一为 **WGS84 (SRID 4326)** —— 空间计算/存储天然精准
- **前端展示**：高德渲染/交互使用 GCJ02，前端在 **adapter 渲染入口统一做 WGS84→GCJ02** 转换，出网仍是 WGS84
- **空间分析**：分析用几何在**后端直接以 WGS84 计算**（PostGIS ST_* 函数，无需转换），结果 WGS84 返回
- **好处**：数据库/接口契约稳定为 WGS84 单一基准；GCJ02 仅存在于前端展示面，精度零损耗

```
后端(业务/数据)     前端(高德展示)
  WGS84 4326  ─────────────►  adapter 渲染时
      ▲ 空间分析直接用             wgs84ToGcj02 转换
      │ 零转换、零损耗            ─────────────►  高德 GCJ02 图层
      └──────────────────────────────────▲
    库内 gis_feature 存 WGS84           前端绘制的 GCJ02
                                         提交时 gcj02ToWgs84
```

### 3.2 转换工具 `coord.ts`（前端 adapter 内）
借鉴 GISMap 已依赖的 `gcoord`（`gcoord@^1.0.6`）实现 `WGS84 <-> GCJ02`：
```ts
// WGS84 <-> GCJ02 互转（每点）
wgs84ToGcj02([lng, lat]): [number, number]
gcj02ToWgs84([lng, lat]): [number, number]
// 几何整体转换（Point/LineString/Polygon/...）
transformGeometry(geo: Geometry, mode: 'wgs2gcj' | 'gcj2wgs'): Geometry
```

### 3.3 转换作用点（明确边界，避免漂移）
- **渲染**：后端 WGS84 GeoJSON → 前端 `wgs84ToGcj02` → 高德 overlay
- **绘制**：高德绘制产出 GCJ02 → 前端 `gcj02ToWgs84` → 提交后端（WGS84）
- **bbox 查询**：前端 `MapAdapter.getBounds()` 返回 GCJ02 bbox → `gcj02ToWgs84` 转 WGS84 后调后端 bbox 接口
- **后端**：完全不感知 GCJ02，全程 WGS84

---

## 4. 各层改造详设

### 4.1 前端 `gis-core`
| 文件 | 改造 |
| --- | --- |
| `MapView.vue` | 改用 `AMapLoader` 加载 JSAPI v2（key=`da311c16856f79c095f99930501722fc`），创建 `AMap.Map`，包成 `AMapAdapter`；`map-ready` emit adapter |
| `useMap.ts` → `adapter/` + `amap/amapOverlay.ts` | `renderFeatures`/`renderAnalysisResult`/`clearAnalysis` 改为 adapter 方法；高德实现为 Marker/Polygon/Polyline overlay |
| `useDraw.ts` → `amapDraw.ts` | 用高德 `AMap.MouseTool` 或自建 drawer 实现点/线/面绘制，产出 GeoJSON |
| `index.ts` | `MapInstance` → `MapAdapter` 类型导出 |

### 4.2 前端 `gis-ui` / `portal app`
| 消费点 | 改造 |
| --- | --- |
| `AnalysisToolbar.vue` | `props.map` 类型改 `MapAdapter`；`draw.create` → `onDraw`；渲染调用走 adapter |
| `WorkbenchView.vue` | `map.getBounds()` → `MapAdapter.getBounds()`（返回 GCJ02 bbox 传给后端 bbox 接口）；图层显隐走 `setOverlayVisible`；`map` 保持 `shallowRef` |
| 图层切换 | 借鉴 GISMap `MapContainer.changeMapLayer`，用高德 `TileLayer` 多底图（天地图/高德影像/矢量）切换 |

### 4.3 借鉴 GISMap 的核心模式
1. **Plugin + install(map) 注入**：量算、绘制、覆盖物工具均实现为 `MapPlugin`，由 adapter `addPlugin` 注入——低耦合且易扩展。
2. **Canvas 自绘覆盖物**：参考 `CanvasMarker`（`lngLatToContainer` + `requestAnimationFrame` 动画）实现吸附高亮/选区动画，性能好、样式自由。
3. **多图层源抽象**：高德 `TileLayer.Tile`/`Satellite` + 天地图 XYZ，抽象为统一图层源配置。

### 4.4 后端 `gis/backend`：PostgreSQL + PostGIS + Apache AGE 混合库
> **硬约束①：GIS 独立建库**——GIS 业务数据不再与 root admin 共库（当前 MySQL 已在独立 `gis_admin` 库）；迁移 PostgreSQL 后仍使用独立数据库（`gis`），不与 root/go-wind 库混用。AGE 图库亦在独立库（同库 `gis` 内自带 schema 或独立库，以连接配置为准）。
> **硬约束②：所有 GIS 表统一 `gis_` 前缀**——现有 `gis_layer`/`gis_feature`/`gis_layer_permission` 已合规；后续新增表一律 `gis_` 前缀 + 中文注释（沿用全库中文字段注释规范）。

- **空间数据主库**：PostgreSQL（`age` 容器，5455，postgre/postgre），**GIS 独立库 `gis`**，启用 PostGIS + AGE 两扩展
- **PostGIS 职责**：`gis_feature.geometry` 等空间几何存储与空间分析（测距/测积/缓冲/叠加），全程 **WGS84 SRID 4326**，无坐标转换
- **Apache AGE 职责**：管网拓扑图（节点-边模型），支撑关阀影响、连通性、供排水分析，借鉴 legacy GISMap 业务分析

| 点 | 改造 |
| --- | --- |
| `migration/.../0001_gis_init.up.sql` | MySQL SQL → PostGIS DDL（`GEOMETRY` → `geometry`, `SRID 4326` 显式）；`gorm.io/driver/postgres`；**独立库 `gis` + `gis_` 前缀表**；已有 MySQL 数据需迁移 |
| `master`/`data` 装配 | data.dev.yaml source 改 PostGIS 连接（库 `gis`）；gorm driver mysql → postgres；PostGIS/AGE 扩展在迁移脚本启用 |
| 新建 `gis_topology` (AGE) | 管网节点/边图，`gis_` 前缀，视连通性分析落地阶段再迁移 legacy 算法 |
| `biz/analysis.go` | 沿用 WGS84 直接计算，**不需要坐标转换**；如引入管网分析则接 AGE |
| `biz/feature.go` | `Srid` 保持 4326（WGS84），语义无变化 |
| `data/impl/mysql_spatial.go` | ST_* 语法契合 PostGIS，仅替换驱动与连接；对应 `gis_feature`/`gis_layer` 等 `gis_` 表 |

> PostGIS 建议显式 `SELECT PostGIS_Version()` 校验；GEOMETRY 列设 `SRID 4326` + GiST 空间索引。

---

## 5. 依赖与配置

### 前端
- 高德 JSAPI：`@amap/amap-jsapi-loader`（新增）
- 坐标转换：`gcoord`（新增，GISMap 同款，仅前端 adapter 使用）
- web 密钥：`da311c16856f79c095f99930501722fc`（放 front .env.local，勿提交源码库）
- 移除：`maplibre-gl`、`maplibre-gl-draw`、`geojson` 类型（如不再需要）

### 后端/数据源
- gorm 驱动：`kratos-kit/database/gorm/driver/mysql` → `.../driver/postgres`（`gorm.io/driver/postgres v1.6.0` 已在 go.mod，直接引入 kratos-kit postgres driver）
- PostgreSQL 实例：`age` 容器（5455，postgre/postgre，postgres 18），启用 `postgis` + `age` 扩展
- **GIS 独立库 `gis`**：data.dev.yaml source 指向 `postgres://postgre:postgre@127.0.0.1:5455/gis?sslmode=disable`；请求所有表保持 `gis_` 前缀
- 迁移脚本：MySQL → PostGIS DDL（`ST_GeomFromGeoJSON`/`ST_AsGeoJSON`/`ST_Transform` 兼容），建库与扩展 `CREATE DATABASE gis; CREATE EXTENSION postgis;`

---

## 6. 工作量与风险

### 6.1 工作量拆解
| 任务 | 说明 |
| --- | --- |
| P0 适配层骨架 | `adapter/types.ts`、`coord.ts`、`AMapAdapter` 基础 |
| P1 渲染 | `amapOverlay.ts` GeoJSON→overlay（渲染时 WGS84→GCJ02），要素/分析结果渲染 |
| P2 绘制 | `amapDraw.ts` 点/线/面绘制（绘制结果 GCJ02→WGS84），事件适配 |
| P3 UI 适配 | `AnalysisToolbar`/`WorkbenchView` 改造 |
| P4 数据源迁移 | MySQL → PostgreSQL + PostGIS（DDL、驱动、连接、数据迁移） |
| P5 借鉴 | 图层切换、Plugin、Canvas 覆盖物；AGE 管网拓扑（按需阶段） |
| P6 验证 | 类型检查 + 构建 + 浏览器联调 |

### 6.2 风险清单
| 风险 | 等级 | 缓解 |
| --- | --- | --- |
| MySQL→PostgreSQL 差异（驱动/SQL/时间序列类型） | 高 | PostGIS 语法兼容 ST_*；先做可回滚迁移脚本 + 数据校验 |
| PostGIS/AGE 扩展未在 `age` 容器就绪 | 高 | 迁移脚本显式 `CREATE EXTENSION IF NOT EXISTS postgis/age`；启动前探活 |
| 前端坐标转换边界漂移 | 中 | 转换集中 `coord.ts`，仅 adapter 渲染/绘制/bbox 三处 |
| 绘制交互差异（MouseTool vs maplibre-gl-draw） | 中 | 收敛到 DrawController 接口 |
| 前端 `map` shallowRef 类型 | 低 | 沿用现有 shallowRef 经验 |

---

## 7. 验收标准
1. 三包（gis-core / gis-ui / portal）`vue-tsc` 类型检查通过，portal 构建通过。
2. 高德地图实例成功加载，多图层（天地图/高德影像/矢量）切换正常，GCJ02 展示与 WGS84 数据一致性校验通过。
3. 要素/分析结果以 GeoJSON 渲染为覆盖物，点击命中要素。
4. 测距/测积/缓冲区/叠加查询结果与后端 WGS84 计算一致，纯前端 GCJ02 展示无精度损耗。
5. 后端 e2e：迁移到 PostGIS 后六接口通过（200 ping 命中、缓冲区半径误差 < 容差）；`PostGIS_Version()` 正常；MySQL 数据迁移完成且校验一致。
6. 无控制台错误，生命周期（切页/卸载）无泄漏。

---

## 8. 评分与洞察

### 8.1 综合评分（10 分制）
| 维度 | 评分 | 说明 |
| --- | --- | --- |
| 架构合理性 | 8.8 | MapAdapter 适配层隔离引擎，前端展示转 GCJ02 边界清晰 |
| 坐标方案 | 9.0 | 库内 WGS84 + 前端展示转 GCJ02，单一基准、零精度损耗，业界推荐 |
| 数据存储 | 7.8 | PostGIS + AGE 混合能力强，但扩展就绪性待验证 |
| 借鉴度 | 8.0 | 复用 Plugin/Canvas/图层源三核心模式 |
| 工作量/复杂度 | 6.8 | 新增跨库迁移（MySQL→PostGIS）工作量偏重 |
| 整体综合 | 8.1 | 架构与坐标方向正确，数据源迁移为最大成本项 |

### 8.2 关键洞察与合理化建议
1. **坐标方案已回归最稳健形态**：库内 WGS84、前端展示转 GCJ02，规避了 GCJ02 加密坐标用于计算的精度与合规风险，属于业界标准做法。建议固化 `coord.ts` 转换边界，避免后续代码绕过。
2. **跨库迁移是最主要工作项**：MySQL `GEOMETRY`/`ST_*` → PostGIS 语法大体兼容，但时间序列类型、时区、驱动（gorm mysql→postgres）、`date_format` 等 SQL 方言需逐个适配。建议独立迁移脚本 + 数据校验断言 + 可回滚。
3. **AGE + PostGIS 同库**：`age` 容器已运行可先用；但需确认 `postgis` 扩展是否已装（可能需 `CREATE EXTENSION`）。管网拓扑若当前无业务，建议先只落 PostGIS，AGE 延后到借鉴 legacy 图算法时再启用，避免过早引入复杂度。
4. **密钥管理**：高德 key 属敏感凭据，放 `.env.local` 并加入 `.gitignore`，构建注入。
5. **`go-wind-pg`（Exited）备用**：若 `age` 容器不满足 PostGIS 版本要求，可启动 `go-wind-pg`（5432, postgres/postgres/*Abcd123456, 库 gwa）作备用空间库。

### 8.3 落地建议
按 P0→P6 顺序推进，重点：先把 P4（MySQL→PostGIS）作为前置独立小步验证扩展就绪与迁移，再进入 P0-P3 前端适配；AGE 拓扑按需延后。P1/P2 的坐标转换可先实现并用单元测试验证（wgs84/gcj02 互转 + 几何转换）。

---

## 附录：关键现有文件
- `gis/portal/packages/gis-core/src/MapView.vue`
- `gis/portal/packages/gis-core/src/useMap.ts`、`useDraw.ts`、`index.ts`
- `gis/portal/packages/gis-ui/src/AnalysisToolbar.vue`
- `gis/portal/apps/portal/src/views/WorkbenchView.vue`
- `gis/backend/internal/biz/analysis.go`、`feature.go`
- `gis/backend/internal/data/impl/mysql_spatial.go`
- `gis/backend/migration/assets/v0.0.1/mysql/0001_gis_init.up.sql`
- 数据库：`age` 容器（5455, postgre/postgre, postgres 18, AGE+PostGIS）为主；`go-wind-pg`（5432, postgres, 库 gwa）备用
- 借鉴参考：`D:\www\gis2.0\vue3_gis2.0\packages\GISMap\{index,init,plugins\CanvasMarker,plugins\Adsorption,components\MapContainer}.ts/vue`