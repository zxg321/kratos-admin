# SNOP 仓库骨架规划（第一份实施文档）

> SNOP 实施规划 · 01
> 日期：2026-09-14
> 主语：**智慧能源运营管理一体化平台 SNOP**（GIS 为首批子模块）
> 方法：OpenSpec 式产物（提案 → 规格 → 设计 → 任务清单）；上游依据 = ADR-12 D1-D8
> 状态：实施规划正文；上游依据=ADR-12 D1-D8。

---

## 📌 提案（Why & What）

- **为什么**：GIS1.0/GIS2.0 功能已盘点（07/08），重构方案与八项决策（D1-D8）已锁定（09/11 + ADR-12）；需要把决策转成**可开工的仓库骨架**：目录结构、6 库与命名数据源、各域 proto 契约清单、auth/acl 角色矩阵。
- **范围（本文档）**：仓库骨架设计 + 数据库落地方式 + 契约清单 v0.1 + 角色矩阵 v0.1。
- **Non-goals**：不写业务代码、不做数据迁移 ETL、不定 UI 视觉；每项由 tasks 清单驱动后续变更。

---

## 1. 仓库骨架设计

### 1.1 形态决策

- **单仓 monorepo**（`snop/`）：Go 后端单应用多模块（复用 kratos-admin 的组合根/module 模式）+ 三端前端 + 部署物。
- **服务拓扑**：起步为 **1 个后端应用**（snop-backend，HTTP 7100 / gRPC 6100），内部按域分 module、按域连独立库；预留按域拆服务的边界（module 接口即拆分线）。现有 `gis/backend`（7002）代码作为 gis 域实现迁入。
- **技术栈**：Go 1.2x + Kratos v3 + kratos-core/kit + GORM + Wire + Buf（含 agent-tool/mcp-tool 插件链，为 Geo-Agent 预留）；前端 Vue3 + pnpm/turbo + AMap（GISMap 包）。

### 1.2 目录骨架

```text
snop/
├── backend/
│   ├── api/proto/                      # 唯一契约源（§3）
│   │   ├── snop/system/v1/             # auth/acl/字典/配置
│   │   ├── snop/gis/v1/                # layer/feature/analysis/pipe/equipment/collect/alarm/dma
│   │   ├── snop/patrol/v1/
│   │   ├── snop/iot/v1/
│   │   ├── snop/cnd/v1/
│   │   └── snop/asset/v1/
│   ├── api/gen/                        # Buf 生成（Go/gRPC/HTTP/OpenAPI/agent-tool/mcp-tool）禁手改
│   ├── internal/
│   │   ├── biz/{auth,gis,patrol,iot,cnd,asset}/   # 业务层，auth 含 acl 与字典
│   │   ├── data/                       # 按域分库的客户端与仓储（gorm-kit 生成 + 空间仓储）
│   │   ├── service/                    # 薄传输适配
│   │   ├── server/                     # 注册 + 中间件（JWT/租户/审计/权限）
│   │   ├── module/                     # module.Module 装配（六域聚合）+ 静态资源
│   │   ├── cmd/server/                 # 入口 + Wire 组合根
│   │   └── task/                       # 定时任务（备份/告警扫描/归档）
│   ├── migration/assets/v0.0.1/postgres/
│   │   ├── default/                    # snop_system 库
│   │   ├── snop_gis/ / snop_patrol/ / snop_iot/ / snop_cnd/ / snop_asset/
│   ├── configs/                        # data.yaml(data.databases 六库) + server/registry/oss...
│   └── Dockerfile
├── frontend/
│   ├── admin/                          # SNOP 管理后台（Vue3，自建 RBAC 界面）
│   ├── portal/                         # GIS 工作台（Vue3 + AMap，GISMap 包）
│   ├── uni-app/                        # 巡检/运维移动端
│   └── dashboard/                      # 大屏/驾驶舱
├── packages/                           # 跨端共享：gis-map(AMap 封装)、ui、utils、locales
├── deploy/                             # docker-compose → K8s/Helm（P1）
├── docs/                               # 实施文档（本系列）
└── Makefile                            # 根编排：gen/check/build/package
```

### 1.3 与 kratos-admin / gis 现有资产的关系

| 资产 | 处置 |
|---|---|
| kratos-kit authn/authz 中间件、config/oss/queue/sse | **复用库**（go.mod 依赖），但用户/角色/菜单/字典数据模型全新（ADR-12 D4/D5） |
| kratos-admin base_* admin 系统 | 不使用（D4）；审计/备份/文件等设计模式可参照 |
| gis/backend（layer/feature/analysis + PostGIS） | 迁入 `internal/{biz,data}/gis`，proto 从 `gis/admin/v1` 平移到 `snop/gis/v1` |
| gis/portal（AMapAdapter 已落地） | 迁入 `frontend/portal`，清理 maplibre-gl 残留依赖 |
| GISMap 包（vue3_gis2.0） | 抽取为 `packages/gis-map`（Vue3 版共享包） |

---

## 2. 六库与命名数据源（D6 落地）

### 2.1 configs/data.yaml 骨架

```yaml
data:
  databases:                    # 命名数据源：一库一子系统
    system:   { driver: postgres, source: "host=127.0.0.1 port=5455 user=snop dbname=snop_system sslmode=disable" }
    gis:      { driver: postgres, source: "host=127.0.0.1 port=5455 user=snop dbname=snop_gis sslmode=disable" }
    patrol:   { driver: postgres, source: "host=127.0.0.1 port=5455 user=snop dbname=snop_patrol sslmode=disable" }
    iot:      { driver: postgres, source: "host=127.0.0.1 port=5455 user=snop dbname=snop_iot sslmode=disable" }
    cnd:      { driver: postgres, source: "host=127.0.0.1 port=5455 user=snop dbname=snop_cnd sslmode=disable" }
    asset:    { driver: postgres, source: "host=127.0.0.1 port=5455 user=snop dbname=snop_asset sslmode=disable" }
  redis: { addr: [127.0.0.1:6379] }
```

### 2.2 库 × 扩展 × 迁移目录映射

| 库 | 扩展 | GORM AutoMigrate 域模型 | v0.0.1 初始化 SQL 目录 |
|---|---|---|---|
| snop_system | — | auth/acl：sys_user、sys_role、sys_menu、sys_api、sys_dict(+item)、sys_tenant、sys_config、sys_login_log | `postgres/default/` |
| snop_gis | **PostGIS 4326** | gis_layer/feature/layer_grant、gis_pipe(+point)、**gis_overlay(+point)（统一表，12 类设备/覆盖物以 type 区分，待确认 #5 已决）**、gis_collect_data(+point)、gis_alarm_*、dma_* | `postgres/snop_gis/` |
| snop_patrol | PostGIS（轨迹/区域） | patrol_plan/region/order(+task/execute)/track/danger/reading/upload | `postgres/snop_patrol/` |
| snop_iot | **TimescaleDB 2.30.0（已装配，待确认 #6 已决）** | iot_device/device_drive/device_event、iot_telemetry(hypertable)、iot_alarm_* | `postgres/snop_iot/` |
| snop_cnd | — | cnd_accident/rescue_order/plan/material/storehouse/duty | `postgres/snop_cnd/` |
| snop_asset | — | asset_ledger/maintenance/purchase | `postgres/snop_asset/` |

跨库纪律（D6）：禁止跨库 JOIN；跨域只存 ID + 冗余快照，详情走 gRPC 契约；聚合统计由域接口提供、上层组装。

---

## 3. 各域 proto 契约清单 v0.1

> 命名：`snop/<domain>/v1/*.proto`；每个 proto 同步产出 HTTP/gRPC/OpenAPI/Agent Tool/MCP Tool（buf 插件链，Geo-Agent 预留）。P0=首批实施。

### 3.1 snop/system/v1（snop_system 库）

| proto | 服务 | 关键 RPC | 优先级 |
|---|---|---|---|
| auth.proto | AuthService | Login / RefreshToken / Logout / GetCaptcha / ChangePassword / ListMySessions / RevokeMySessions | **P0** |
| user.proto | UserService | User CRUD / PageUsers / ResetPassword / SetUserRoles | **P0** |
| role.proto | RoleService | Role CRUD / SetRoleMenus / SetRoleApis | **P0** |
| menu.proto | MenuService | MenuTree / Menu CRUD（按 client_type：admin/portal/app/dashboard） | **P0** |
| api.proto | ApiService | API 注册（OpenAPI 同步）/ PageApis / 绑定角色 | P0 |
| tenant.proto | TenantService | 租户(企业) CRUD / 企业参数配置 | **P0** |
| dict.proto | DictService | 字典/字典项 CRUD（**system 域自有字典**；其余域按同模板各自实现） | P0 |
| config.proto | ConfigService | 平台参数 CRUD / 表单配置 | P1 |
| loginlog.proto | LoginLogService | 登录日志分页（审计起点） | P1 |

### 3.2 snop/gis/v1（snop_gis 库，现 gis/admin/v1 平移扩展）

| proto | 服务 | 关键 RPC | 优先级 |
|---|---|---|---|
| common.proto | Geometry 多态消息 | （Point/LineString/Polygon/Multi*，buf validate 语义校验） | **P0** |
| layer.proto | LayerService | CRUD/分页/列表 + LayerGrant（授权接线补齐） | **P0** |
| feature.proto | FeatureService | CRUD/分页/**Bbox 空间查询** | **P0** |
| analysis.proto | AnalysisService | MeasureDistance / MeasureArea / Buffer / Overlay(within/intersects) | **P0** |
| pipe.proto | PipeService | 管线/管点 CRUD、Import、Topology 查询 | **P0** |
| pipe_analysis.proto | PipeAnalysisService | **ValveTurnoff(关阀) / Connectivity(连通) / Topology(拓扑) / Excavation(开挖) / Graphic(图形)** | **P0** |
| overlay.proto | OverlayService | 12 类设备/覆盖物统一表（gis_overlay，type 区分）台账 CRUD/History | **P0** |
| collect.proto | CollectService | 采集导入 / 变更计算链 / 明细查询 | P1 |
| alarm.proto | AlarmService | AlarmConfig CRUD(批量预警值) / AlarmInfo 分页/确认 | P1 |
| dma.proto | DmaService | 分区 CRUD / 产销统计 / **漏损六步 / 输差诊断 / 模拟分析** | P1 |
| overlay_stat.proto | OverlayStatService | 管线长度/增长等统计报表 | P1 |

### 3.3 其余域

| 域 / 库 | proto | 服务与关键 RPC | 优先级 |
|---|---|---|---|
| patrol / snop_patrol | plan/order/track/danger/statistics | PlanningRegion/WorkOrder(创建-执行-暂停-终止)、StaffTrack 回放、HiddenDangers 闭环、MeterReading、Statistics | **P1** |
| iot / snop_iot | device/telemetry/alarm | DeviceRegistry、**VendorAdapter(8 厂商)**、TelemetryQuery(实时/时/日/月)、AlarmRule→AlarmEvent、Dashboard | **P1** |
| cnd / snop_cnd | accident/rescue/plan/material/duty | Accident 接报、RescueOrder 全流程、EmergencyPlan、Material 收发存、Duty 排班 | **P2** |
| asset / snop_asset | ledger/maintenance/purchase | Asset CRUD、维保记录、采购入库 | **P2** |
| （平台）mcp | — | 以上全部服务经 buf 插件自动注册 MCP Tool；首批注册：五类管网分析 + DMA（09 文档 P0 建议） | **P0** |

---

## 4. auth/acl 角色矩阵 v0.1（snop_system）

### 4.1 核心表

`sys_user`、`sys_role`、`sys_user_role`、`sys_menu`（含 client_type: admin/portal/app/dashboard）、`sys_role_menu`、`sys_api`、`sys_role_api`（按钮/接口级）、`sys_tenant`（企业=租户）、`sys_dict`/`sys_dict_item`（system 域自有）、`sys_config`、`sys_login_log`。JWT claims：`user_id / tenant_id / roles[] / client_type`。

### 4.2 角色矩阵（R=读 W=写 A=管理）

| 功能域 \ 角色 | 平台超管<br>system_admin | 企业管理员<br>ep_admin | GIS 管理员<br>gis_admin | GIS 作业员<br>gis_operator | 巡检管理员<br>patrol_manager | 巡检员<br>patrol_inspector | IoT 运维<br>iot_operator | 调度员<br>cnd_dispatcher | 大屏访客<br>viewer |
|---|---|---|---|---|---|---|---|---|---|
| 租户/企业管理 | A | — | — | — | — | — | — | — | — |
| 用户/角色/菜单 | A | A(本企业) | — | — | — | — | — | — | — |
| 字典/配置 | A | W(业务字典) | W(gis_dict) | R | W(patrol_dict) | R | W(iot_dict) | W(cnd_dict) | — |
| GIS 图层/要素 | R | R | **A** | W | R | R | R | R | — |
| 管网五类分析 | R | R | **A** | R | R | — | R | R | — |
| DMA 漏损分析 | R | R | W | R | R | — | R | R | — |
| 巡检计划/工单 | R | R | — | — | **A** | W(执行/上报) | — | — | — |
| 轨迹回放 | R | R | R | R | **A** | R(本人) | — | R | — |
| IoT 设备/遥测 | R | R | R | R | R | R | **A** | R | — |
| 告警处理 | R | R | W | W | W | W | **A** | W | — |
| 指挥调度 | R | R | — | — | R | — | R | **A** | — |
| EAM 资产 | R | R | — | — | — | — | R | — | — |
| 大屏/驾驶舱 | R | R | R | R | R | — | R | R | **R** |
| MCP/AI 工具调用 | A | W | W | R | W | — | W | W | — |

约定：client_type 过滤菜单（管理后台=PC、工作台=portal、大屏=dashboard 只读免登 token 或专用访客账号、移动端=app）；企业数据隔离按 tenant_id 强制过滤（sql scope）；巡检员"本人数据"约束在 service 层强制。

### 4.3 登录贯通链路（D4）

```text
任一端登录 → AuthService.Login(client_type) → 校验(密码+可选验证码) →
签发 JWT(access 内存 / refresh HttpOnly Cookie) → 网关/中间件解析 claims →
按 client_type 过滤菜单树 → 按 roles 加载按钮/API 权限 → 各端路由/指令生效
```

规格（RFC 2119 关键场景）：
- **Scenario: 跨端同账号** — GIVEN 同一用户在管理后台与 portal，WHEN 分别登录，THEN 两者 token 同源签发、菜单按 client_type 不同。
- **Scenario: 租户隔离** — GIVEN 企业 A 的 gis_operator，WHEN 请求要素列表，THEN 仅返回 tenant_id=A 的要素，跨租户 ID 直接 404。
- **Scenario: 高缩放清晰度** — GIVEN 管网要素已加载，WHEN 地图缩放至 18/19/20 级，THEN 矢量要素清晰渲染、交互不掉帧、自建瓦片无空白级。

---

## ✅ 任务清单（OpenSpec tasks）

- [ ] **T1 (P0)** 初始化 snop 仓库骨架：目录 + Makefile + buf/wire 配置 + CI（build/test/lint）
- [ ] **T2 (P0)** 建六库（snop_*）+ `data.databases` 配置 + 迁移目录骨架（各库 README→描述）
- [ ] **T3 (P0)** system 域：auth/user/role/menu/tenant/dict proto → 生成 → 服务实现 + JWT 中间件（claims: tenant/roles/client_type）
- [ ] **T4 (P0)** gis 域迁入：gis/admin/v1 → snop/gis/v1 平移，补 LayerGrant 接线与 HTTP 注册
- [ ] **T5 (P0)** pipe + pipe_analysis 契约与 Go 实现（内存图+PostGIS 混合，黄金用例对拍）
- [ ] **T6 (P0)** 五类分析 + DMA 注册 MCP Tool（buf 插件链）
- [ ] **T7 (P1)** portal 迁入 + maplibre-gl 残留清理 + 18-20 级清晰度验收用例
- [ ] **T8 (P1)** patrol/iot 域契约与实现；uni-app 移动端骨架
- [ ] **T9 (P1)** 坐标 ETL（JSON→geometry）+ 150 表映射清单执行
- [ ] **T10 (P2)** cnd/asset 域（code_gen 起步）；BPM 适配器；大屏
- [ ] **T11 (P1)** K8s/Helm 与对象存储瓦片
- [ ] **T12 (P2)** 旧系统冻结清单（old_vue_gis2.0、iot_dev SB2.6 等）归档

## ⚠️ 待确认

1. ⚠️ 已决：DMA 并入 snop_gis（D6 六库无独立 DMA 库，见 04 模块 6）。
2. ⚠️ 已决：大屏 client_type 专用菜单 + 只读 token（04 F-V02）。
3. ⚠️ 已决：是，随 D8 行业模板预置角色/菜单/字典模板（03 §2）。
4. ✅ 已决（2026-09-15）：gis/backend 7002 **直接迁入单应用，不保留独立进程双跑**；docker-compose 中 kratos-gis 服务在 T4 迁入完成后下线。
5. ✅ 已决（2026-09-15）：**采用 gis_overlay 统一表（方案 B）**——12 类设备/覆盖物统一存储、type 字段区分；契约定名 overlay.proto / OverlayService；§2.2 与 §3.2 已同步。
6. ✅ 已决（2026-09-15）：**TimescaleDB 已在 age 容器内装配**（2.30.0，PG18；镜像固化 snop-age-ts:pg18，preload=age,timescaledb，hypertable 冒烟通过；见 snop/deploy/age-timescaledb.md）。
