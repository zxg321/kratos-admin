---
name: "kratos-v3-migration"
description: "Kratos 框架 v2→v3 迁移与兼容改造技能。覆盖模块路径 /v3、JSON codec 拆分、log/slog 迁移、JWT 移出核心、circuitbreaker 解耦、transport/http/binding 移除、config 泛型 Get 等 Breaking Changes。当需要把 go-kratos/kratos/v2 项目升级到 v3、修复 v3 下已失效的旧写法、或核对 v2/v3 差异时调用。"
---

# Kratos v2 → v3 迁移技能

官方一手来源：`github.com/go-kratos/kratos/docs/migration/v2-to-v3.md`（文档站 go-kratos.dev 尚无 v3 迁移专章）。v3 为"非 minor"升级，生产服务升级前必须先审阅迁移指南，并跑 `go test` / `go vet` 摸底。Go 要求 **1.25+**。

## 逐项迁移清单

### 1. 模块路径
- 全部 `github.com/go-kratos/kratos/v2` → `/v3`；contrib 子模块同步 `/v3`。
- 改完 `go mod tidy`。跨模块（本仓库：backend、gis/backend、api、client 等）若共享 go.mod，确认依赖版本收敛。

### 2. JSON 编码拆分（最易踩坑 ⚠️）
- v2 单一 `encoding/json` 统一处理 `proto.Message`。
- v3 拆为：
  - `go-kratos/kratos/v3/encoding/json`（标准库 JSON 语义）
  - `go-kratos/kratos/v3/encoding/protojson`（protobuf-JSON 语义）
  - 兼容旧行为：`go-kratos/contrib/encoding/json/v3`。
- **禁止同进程注册两个 JSON codec**，否则 codec 查找歧义。

### 3. 日志迁移到 log/slog ⚠️
- 废弃：`log.Logger` / `log.Helper` / `log.Valuer` / `log.NewStdLogger`。
- 改用标准库 `log/slog`：
  - `kratoslog.NewHandler(opts...)` 构建 handler，`kratoslog.NewLogger(h)` 包装。
  - Application 与中间件选项统一接收 `*slog.Logger`。
  - OTel logs：`go-kratos/contrib/otel/v3/log` 提供 handler。
- 自查点：所有 `log.NewHelper`、`log.With(...Valuer...)`、`DefaultTimestamp/Caller` 旧用法。

### 4. JWT 中间件移出核心
- `v2/middleware/auth/jwt` → `go-kratos/contrib/middleware/jwt/v3`。
- 仅在使用 JWT 时才拉 `golang-jwt/jwt/v5`。读旧代码要改两条 import。

### 5. 熔断解耦 aegis
- v2 默认熔断依赖 `go-kratos/aegis`；v3 核心不再默认引入。
- 自定义 Aegis 熔断需显式引用，并用 `circuitbreaker.WithBreakerFactory` 注入。

### 6. transport/http/binding 移除 ⚠️
- v2 导出的 `transport/http/binding` 在 v3 移除。
- 改为：
  - 手写代码：`http.BuildPath(...)` 与 `transport/http.Context` 的 `Bind` / `BindVars` / `BindQuery` / `BindForm`。
  - 生成代码：改动后必须 `go generate ./...`（/ `make gen` 按仓库流程）。

### 7. config 增强
- v3 新增泛型 `config.Get`（相比 v2 的 `Value(...)` 更类型安全）。
- 顺带修复了部分 JSON 热更新解析 bug。

### 8. metrics/OTel
- v3 统一走 OTel Metrics（`otel/exporters/prometheus`）。
- 默认直方图命名去掉 `_bucket` 冗余后缀；旧 `prom.NewHistogram/NewCounter` 在 v3 失效，需改 `otel` 方式。
- 该点此前文档站未完整覆盖，以仓库 release notes / 源码为准核验。

## 升级验证步骤
1. 全局改 import 并 `go mod tidy`。
2. 显式选 JSON codec（json 或 protojson 或 compat）。
3. 日志迁 slog；JWT 引 contrib；熔断注入 factory。
4. 替换 direct binding 用法。
5. `go generate ./...` / `make gen` 重生成。
6. `go test ./...`、`go vet ./...`、lint 全绿后再上线，建议小流量灰度。

## 常见错误速判
- 报"两个 JSON codec"→ 检查是否同时 import `encoding/json` 与 `contrib/encoding/json/v3`。
- 报 `log.Helper undefined` → 未迁移 slog。
- 报 `binding` 包不存在 → 改 `Context.Bind*` 并重新生成。
- gRPC/HTTP 注册接口仍引用 `v2` → 校验 go.sum 模块路径混用。

## 参考
- 迁移指南：<https://github.com/go-kratos/kratos/blob/main/docs/migration/v2-to-v3.md>
- 版本跟踪 issue：go-kratos/kratos #3820