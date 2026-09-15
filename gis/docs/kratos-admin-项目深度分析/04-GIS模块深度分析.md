# GIS 模块深度分析（gis/）

> 状态：现状溯源分析（先于 ADR-12 D1-D8 决策）；结论与决策冲突时以 12-技术决策记录ADR.md 为准。

> kratos-admin 项目深度分析 · 04
> 日期：2026-09-14
> 方法：对 `gis/backend`、`gis/portal`、`gis/docs` 的源码级静态分析（已跳过 node_modules）

---

## TL;DR

- GIS 是基于同一技术栈（Kratos v3 + kratos-core + kratos-kit + GORM + Vue3/Vite）的**独立子系统**：后端 7002/6002 端口独立运行，也可作为模块挂载进 kratos-core；portal 门户 8850 端口，地图引擎**已完成 MapLibre→高德 AMap 迁移**（`gis-core/src/MapView.vue` 经 `AMapAdapter` 加载 `@amap/amap-jsapi-loader`，引擎无关 `MapAdapter` 适配层），与 ADR-12 D2 锁定的 AMap 方向一致。
- 空间能力：PostgreSQL + PostGIS（SRID 4326，独立 `gis` 库，表前缀 `gis_`），M1 已交付图层/要素/授权三类表与 CRUD + bbox 空间查询，M2 交付测距/测积/缓冲区/叠加分析。
- **复用设计是最大亮点**：portal 直接依赖 npm 包 `@liujitcn/kratos-admin-core` 做登录/布局/请求/RPC，`runtime.go` 复用 admin 的 GORM 客户端与 Casbin，登录态与主系统完全打通（开发账号 super/112233）。
- 正处于 **GIS 1.x → GIS 2.0（管网域 + kratos-admin 技术栈全量落地）的演进拐点**，docs/ 下 2026-09 新文档勾勒了完整 2.0 蓝图与 proto 契约草案；地图引擎已锁定 AMap（**18-20 缩放级及以下必须清晰**，ADR-12 D2），"向 MapLibre 迁移"类规划全部剔除。
- 主要风险：ESLint 关闭、portal 无测试、apps/portal 依赖表残留 maplibre-gl 需清理、图层授权服务仅注册未接线、分析接口无权限注解。

---

## 1. 目录全景

```text
gis/
├── README.md            # 启动方式、接口契约、迁移说明
├── backend/             # GIS 后端（Kratos，端口 7002 HTTP / 6002 gRPC）
│   ├── api/proto/gis/   # 唯一契约源：common/geometry + admin/{layer,feature,analysis}
│   ├── internal/{biz,data,service,server,module}
│   ├── internal/data/gorm/  # 空间仓储（ST_ 函数）
│   ├── configs/         # data.dev.yaml 等（PostgreSQL+PostGIS :5455 独立 gis 库）
│   └── Dockerfile
├── portal/              # GIS 门户前端（pnpm workspace，8850）
│   ├── apps/portal      # 默认宿主
│   ├── packages/{core,system,amap,portal}/
│   └── internal/{vite-config,tsconfig}
└── docs/                # 本文档所在目录（含 legacy、2.0 redesign、prototype）
```

## 2. 后端分析

### 2.1 架构与依赖

- 与主仓库同构：Kratos v3.0.0 + kratos-core v0.0.30 + kratos-kit v0.0.82 + GORM v1.30 + Wire v0.6，分层 service（薄）→ biz（业务）→ data/gorm（PostGIS）。
- `internal/module/module.go` 实现 `module.Module`：注册 gis.admin.v1 HTTP/gRPC、i18n 资源、空间模型 AutoMigrate 与 v0.0.1 迁移（`//go:embed assets/*`）。**可作为模块挂载进 kratos-core 宿主**（README 明确该路线，挂载时须注意 Casbin 与审计消费是可选增强而非必需）。
- `runtime.go`：复用 admin 的 GORM 客户端（`adminruntime.Data()`）+ gis 独立客户端 + Casbin enforcer（kratos-kit authz），登录态与主系统完全打通。

### 2.2 空间数据模型与迁移

| 表（前缀 gis_） | 要点 |
| --- | --- |
| layer | 图层元数据；`geometry_type` 枚举校验（Point/LineString/Polygon/Multi*） |
| feature | 要素；`geom geometry(geometry,4326) NOT NULL`，空间索引 `idx_gis_feature_geom (gist)` |
| layer_grant | 授权；`UNIQUE(layer_id, role_code)`，role_code 枚举校验 |

- 迁移仅 postgres 方言（v0.0.1），启动时 AutoMigrate 兜底；GORM 类型 `datatypes.JSON`/`geom.Statement` 正确处理 PostGIS。
- `feature.go` 用原生 SQL + 参数化 ST_ 函数（`ST_AsGeoJSON/ST_GeomFromGeoJSON/&&` bbox）规避注入；WKB hex 解码为 gis common Geometry DTO。

### 2.3 Proto 契约与服务

- `gis/common/v1/common.proto`：Geometry 多态消息（Point/LineString/Polygon/Multi*），buf validate 语义校验（lng ±180 / lat ±90、ring 至少 4 点首尾闭合）。
- `gis/admin/v1/layer.proto` / `feature.proto`（CRUD+分页+bbox 空间查询）/ `analysis.proto`（M2：MeasureDistance/MeasureArea/Buffer/Overlay，全 POST 语义）。
- HTTP 前缀 `/api/v1/gis/admin/`；生成 6 插件（Go/gRPC/HTTP/OpenAPI/agent-tool/mcp-tool）。
- 分析实现（`internal/biz/system/admin/analysis.go`）：测距 `ST_Distance(geography)`（米）、测积 `ST_Area(geography)`、缓冲 `ST_Buffer(geography, radius)`（结果强制 Polygon/MultiPolygon）、叠加 ST_Intersects/ST_Within+ST_AsGeoJSON；service 层 geometry 解析错误统一 `InvalidArgument("invalid geometry")`。

### 2.4 已知缺口（代码级证据）

- `internal/server/http.go:30` 注册 `gis.admin.v1.LayerService` 后，**LayerGrantService / AnalysisService / FeatureService 未注册 HTTP**；`layer_grant.go` 仅返回 `kratoserr.Unimplemented`。
- biz 层授权判断仅 4 处角色硬编码（`super_admin || gis_admin || gis_user`），**未走 Casbin 策略表**。
- 配置面较 admin 简化：无 Vault、无 OAuth，DB 密码明文。

## 3. 门户前端分析

- pnpm workspace（apps/portal + packages/{core,system,amap,portal} + internal/{vite-config,tsconfig}），Vue 3.5 / Vite 7 / TS 5.9 / Pinia 3 / Element Plus 2.11 / turf 7.2（分析辅助）/ osl-utm（UTM 投影）；地图经 `@amap/amap-jsapi-loader` + `gcoord` 加载 AMap，MapLibre 仅残留于 apps/portal 依赖表（maplibre-gl 5.24.0，迁移未清理，**应剔除**）。
- **直接复用主系统 core**：package.json 依赖 `@liujitcn/kratos-admin-core`（npm registry 正式包），登录、布局、请求/RPC 基建零重复；GIS 专属的 layers/features/analysis 页面在 packages/system 中。
- 开发代理（apps/portal/vite.config.ts）：`/api/v1/base` → admin 后端 7001，`/api/v1/gis` → GIS 后端 7002；登录复用主系统账号体系（super/112233），token/JWT/Casbin 由 core 统一处理。
- M2 起工作台内置分析工具栏：测距、测积、缓冲区（米）、叠加查询（范围内/相交），地图交互绘制后自动调接口渲染结果（README）。
- **风险**：根 `eslint.config.js` 存在 `...tseslint.config.disableTypeChecked` 且配置体基本注释，等于关闭类型感知 lint；全 workspace 无任何 `*.{test,spec}.*` 文件；`@liujitcn/*` 版本范围 `^0.0.x`，随上游升级存在契约漂移风险。

## 4. docs/ 现有文档与 GIS 2.0 演进

| 文档/目录 | 定位 |
| --- | --- |
| `legacy-gis2.0-整合与借鉴分析.md` | 旧版独立 GIS（GIS1.x）与 2.0 的整合与借鉴结论 |
| `20260909_gis_portal_amap迁移设计.md` | portal 从 MapLibre **迁移到 AMap** 的设计（方案 A 引擎无关适配层，**已实施落地**：`AMapAdapter` + MapAdapter + 库内 WGS84/展示 GCJ02；方向与 ADR-12 D2 一致） |
| `20260913_gis2.0全量落地于kratos-admin技术栈方案.md` | **2.0 总蓝图**：复用 kratos-core/kit 生态、独立部署边界、与 admin 的集成方式 |
| `20260913_管网域proto契约草案.md` / `20260913_管网域表映射清单.md` | 管网域（管线/管点/管段等）的 proto 契约与表映射设计稿 |
| `gis2.0-redesign/`、`prototype/` | 2.0 重设计过程稿与原型（旧 AMap 技术栈痕迹仍在，注意区分现状与规划） |

**演进状态判断**：M1（图层/要素/授权表 + CRUD + bbox）与 M2（四类空间分析 + 工具栏）已落地；授权服务与分析服务的 HTTP 接线、Casbin 化授权、管网域是 2.0 的下一阶段，契约尚未定型（"草案"命名）。

## 5. 与主仓库的集成点

1. 根 `docker-compose.yml`：`gis-backend` 服务，7002/6002 暴露，中间件复用宿主机（PostgreSQL+PostGIS :5455）。
2. 根 `README.md` 目录表将 gis 列为独立系统（可独立运行或挂载 Kratos Core）。
3. portal 与 admin 通过同一账号体系（JWT/Casbin）+ 分路径代理集成；后端层面 `runtime.go` 共享 GORM 客户端工厂。
4. 技术栈全面对齐（同 Kratos/core/kit/GORM 版本策略），生成链（buf/wire）命令同构。

## 6. 亮点与技术债

**亮点**
1. 一套技术栈两处复用：后端 module 化可挂载、前端直接复用 npm 版 admin core，集成成本极低。
2. PostGIS 使用规范：SRID 4326 统一、geography 计量、GiST 索引、参数化 ST_ 函数。
3. buf validate 做几何语义校验，service 层错误码规范（InvalidArgument/NotFound/AlreadyExists）。
4. Proto 即契约 + 6 插件生成，与主仓库纪律一致。

**技术债 / 风险（P0-P2）**
- **P1｜HTTP 注册不完整**：Feature/Analysis/Grant 服务未全部注册 HTTP（`internal/server/http.go:30` 附近），接口契约与实际可调用面不一致。
- **P1｜授权未接 Casbin、角色硬编码**：layer_grant 表已有但服务 Unimplemented，权限模型悬空。
- **P1｜前端质量门禁缺失**：ESLint 形同虚设 + 零测试。
- **P1｜AMap 引擎补强与 MapLibre 残留清理（ADR-12 D2）**：portal 已在 AMap 上运行，剩余动作——① 剔除 apps/portal 依赖表的 maplibre-gl 残留及未清理代码；② 落实 **18-20 缩放级及以下清晰度**验收（AMap JSAPI 最大 20 级：矢量要素分级加载、影像/CAD 自建瓦片金字塔覆盖至 20 级、高缩放级交互不掉帧）。
- **P2｜GIS 后端配置无 Vault/OAuth**，与主系统安全基线不对齐（若仅内网部署可接受，需明示）。
- **P2｜分析接口无权限注解**，叠查询可对全库要素做空间探测，公网暴露时是信息泄露面。

---

## ✅ 建议行动清单

| # | 行动 | 优先级 |
|---|------|--------|
| 1 | 补齐 HTTP 服务注册（Feature/Analysis/Grant），对齐 proto 契约 | P1 |
| 2 | 实现 LayerGrantService 或明确降级删除，授权改走 Casbin | P1 |
| 3 | portal 恢复类型感知 ESLint 并补最小测试（store/geometry 工具函数） | P1 |
| 4 | 旧 prototype 文档加状态标记归档 | P2 |
| 5 | 分析/要素接口加权限注解与租户过滤核查 | P2 |
