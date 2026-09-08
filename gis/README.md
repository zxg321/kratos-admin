# GIS 系统

独立 GIS 系统，基于 kratos-admin 的 Go + Kratos 技术栈，负责空间数据管理与地图要素服务，可独立运行，也可作为模块挂载到 Kratos Core 宿主。

## 目录

| 目录 | 说明 |
| --- | --- |
| `backend` | GIS 后端：Proto 契约、GORM、空间数据仓库、迁移与服务实现。 |

## 启动

GIS 后端依赖 MySQL、Redis、Consul、Vault 四件套中间件（同根仓库后端），空间数据使用 MySQL 8 空间扩展（SRID 4326）。

```bash
make -C gis/backend run
```

常用命令见 `make -C gis/backend help`：

| 目标 | 说明 |
| --- | --- |
| `make -C gis/backend api` | 生成 protobuf Go 代码 |
| `make -C gis/backend wire` | 生成 Wire 依赖注入代码 |
| `make -C gis/backend gen` | 生成全部后端产物 |
| `make -C gis/backend run` | 刷新接口与 Wire 后启动服务 |
| `make -C gis/backend build` | 构建 Linux amd64 二进制 |

## 接口契约

Proto 文件位于 `gis/backend/api/proto`，是唯一契约来源：

- `gis/common/v1/common.proto`：空间几何（Geometry）等公共类型。
- `gis/admin/v1/layer.proto`：图层服务（CRUD、分页、列表）。
- `gis/admin/v1/feature.proto`：要素服务（CRUD、分页、bbox 空间查询）。

HTTP 接口前缀 `/api/v1/gis/admin/`，gRPC 服务名 `gis.admin.v1.*`。

## 数据库迁移

空间表初始化迁移统一维护在 `gis/backend/migration/assets/v0.0.1`，M1 包含图层、要素与图层授权三类空间表。
