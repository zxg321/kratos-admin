---
name: "kratos-v3"
description: "Kratos v3 Go 微服务框架开发技能。覆盖 App 生命周期、HTTP/gRPC 传输、中间件、config/errors/log(slog)/metadata/metrics/registry/selector 组件、proto+OpenAPI+Wire 工程实践，以及 v2→v3 迁移注意点。当需要使用 go-kratos/kratos/v3 开发、读写服务、加接口、配中间件、做依赖注入或处理 v3 兼容问题时调用。"
---

# Kratos v3 开发技能

面向 `github.com/go-kratos/kratos/v3`（v3.0.0+，Go 1.25+）的工程指导。本文档综合官方中文文档（go-kratos.dev/zh-cn/docs）与官方 v2→v3 迁移指南整理，并经 v3 核心源码（本地镜像 `D:\www\go\test\kratos\kratos`）逐项核验，突出 **v3 与 v2 的差异**（标注 ⚠️）。

> **源码为准**：框架层 API、包位置、函数签名一律以 `go-kratos/kratos/v3` 源码为准（本地镜像目录可直读），官方文档存在 v3 时滞；本文档的 v3 断言均已核对源码。

> 使用原则：同一功能尽量复用 `kratos-kit` / `go-utils` / `gorm-kit` 及核心库既有能力；确无适用方案时才基于本技能文档写框架层用法。

---

## 0. v3 关键差异速查（相对 v2，⚠️ 重点）

| 领域 | v2 | v3（本文档遵循） |
|---|---|---|
| 模块路径 | `go-kratos/kratos/v2` | `go-kratos/kratos/v3`，contrib 子模块同步切 `/v3` |
| JSON 编码 | 单一 `encoding/json` 统一处理 proto | 拆分：`v3/encoding/json`（标准库 JSON）+ `v3/encoding/protojson`（proto-JSON）；兼容行为在 `contrib/encoding/json/v3`。**禁止同进程注册两个 JSON codec** |
| 日志 | `log.Logger` / `log.Helper` / `log.Valuer` | 改用标准库 `log/slog`；`kratoslog.NewHandler/NewLogger`；应用与中间件选项接收 `*slog.Logger` |
| JWT 中间件 | `v2/middleware/auth/jwt` | 移出核心 → `github.com/go-kratos/contrib/middleware/jwt/v3` |
| 熔断 | 默认依赖 go-kratos/aegis | 解耦 aegis；自定义熔断用 `circuitbreaker.WithBreakerFactory` 显式注入 |
| 参数绑定 | `transport/http/binding`（导出包） | 移除；用 `http.BuildPath` 与 `transport/http.Context` 的 `Bind/BindVars/BindQuery/BindForm`；生成代码需 `go generate ./...` |
| 配置 | 无泛型便捷读取 | 新增泛型 `config.Get` |
| 其他 | — | metrics 统一走 OTel；默认直方图命名去 `_bucket` 冗余后缀 |

- 迁移指南一手来源：`github.com/go-kratos/kratos/docs/migration/v2-to-v3.md`（文档站暂无 v3 专章，以仓库内为准）。
- v3 = 清理历史耦合、削减核心依赖、把隐式行为显式化，**不属于 minor 升级**，生产环境升级须先审阅迁移指南并跑 `go test/vet`。

---

## 1. 项目布局（kratos-layout，v3 沿用）

```
.
├─ cmd/server/            # 启动入口：main.go、wire.go、wire_gen.go
├─ internal/
│  ├─ biz/                # 业务逻辑组装（DDD domain），repo 接口在此定义
│  ├─ data/               # 数据访问层（DB/cache），实现 biz 的 repo 接口
│  ├─ service/            # 实现 api 定义的 service（DTO→BO 转换，不写复杂逻辑）
│  ├─ conf/               # 配置结构（conf.proto → conf.pb.go）
│  └─ server/             # grpc.go / http.go，创建服务实例
├─ api/<pkg>/<svc>/v1/    # proto 与生成代码（pb.go、_grpc.pb.go、_http.pb.go、_errors.pb.go）
├─ configs/               # 本地样例配置（configs/*.yaml）
└─ third_party/           # 第三方 proto（google/api、validate/validate.proto 等）
```
- 职责边界：`service` 只做请求/响应适配 + 调用 biz Case；事务/租户/权限/状态/业务规则放 `biz`；数据库访问限 `data`。

---

## 2. 核心概念

### 2.1 App 与 Server
- 传输层抽象接口：`Server`（`Start(ctx)/Stop(ctx)`）、`Transporter`（`Kind/Endpoint/Operation/Header`）、`Endpointer`（实现后才可注册注册中心）。
- 组装应用：
```go
app := kratos.New(
    kratos.Name("service.name"),
    kratos.Version("v1.0.0"),
    kratos.Logger(logger),          // v3 接收 *slog.Logger
    kratos.Server(httpSrv, grpcSrv),
    kratos.Registrar(reg),          // 注册到注册中心
)
defer app.Stop(); app.Run(ctx)
```
- 默认端口：gRPC `:9000`、HTTP `:8000`（以脚手架实际为准）。

### 2.2 中间件机制
- 签名：`func(handler.Handler) handler.Handler`，`handler.Handler = func(ctx, req) (reply, err)`。
- 编排：`middleware.Chain(ms...)`；**执行顺序：请求进按注册顺序，返回倒序（FILO）**。
- ⚠️ 核心中间件仅 7 个（`middleware/`）：`circuitbreaker, logging, metadata, ratelimit, recovery, selector, validate`；**tracing/metrics 已迁往 `contrib/otel`，jwt 已迁往 `contrib/middleware/jwt`**。
- 定向加载：`selector.Server(ms...)` / `selector.Client(ms...)`，匹配**按 Operation（gRPC path）非 HTTP 路由**：`Path/Regex/Prefix/Match(fn)`。

### 2.3 传输层
- **HTTP**（`transporter/http`，基于 gorilla/mux）Server Option：`Network/Address/Timeout/Logger/Middleware/Filter`（原生 Filter，先于 Service 中间件）、`RequestDecoder/ResponseEncoder/ErrorEncoder`、`TLSConfig/StrictSlash/Listener`。路由：`srv.Route("/v1").GET("/user/{id}", handler)` / `Handle` / `HandlePrefix`。
  - ⚠️ v3 参数绑定不再用 `binding` 导出包：请求侧用 `transport/http.Context` 的 `Bind/BindVars/BindQuery/BindForm`；生成代码需重新 `go generate`。
- **gRPC**（`transporter/grpc`）Option：`Network/Address/Timeout/Logger/Middleware/TLSConfig/UnaryInterceptor/StreamInterceptor/Options`。默认 timeout `2s`，默认负载均衡 `wrr`。客户端 Header 经 `AppendToOutgoingContext` 传 metadata。
- **注册 HTTP/gRPC**：`v1.RegisterXxxHTTPServer(srv, impl)` 与 `v1.RegisterXxxServer(srv, impl)`。

---

## 3. API / Proto 定义与生成

- 目录：`api/<package>/<service>/<version>/*.proto`；`option go_package="xxx/v1;v1"`（`;` 后为别名）。
- HTTP 注解：
```proto
service Greeter { rpc SayHello (HelloRequest) returns (HelloReply) {
  option (google.api.http) = {
    get: "/helloworld/{name}",
    additional_bindings { post: "/v1/greeter/say_hello", body: "*" }
  };
}}
```
- 命名：message/字段大驼峰/下划线小写，enum 值 `CAPITALS_WITH_UNDERSCORES` + `*_UNSPECIFIED=0`；repeated 复数。
- 生成命令：
  - 脚手架：`kratos new helloworld`；`kratos proto add api/helloworld/v1/demo.proto`
  - 生成 pb：`make api` 或 `kratos proto client <file>`（含 `_http.pb.go`，如缺则 `--go-http_opt=omitempty=false`）
  - 生成 service 模板：`kratos proto server <file> -t internal/service`
  - 前端 TS：`kratos proto client`（按仓库既有 Makefile 生成到 `frontend/**/rpc`）
- ⚠️ 改 proto 后必须 `make gen`（或 `go generate ./...`）重新生成，否则契约漂移；HTTP/gRPC 路径、前端请求、权限脚本需同步。

---

## 4. 组件

### 4.1 config
- 接口：`config.Source` / `config.Watcher`；内置 `file.NewSource`（文件或目录）、`env.NewSource("KRATOS_")`；contrib：apollo/etcd/consul/nacos/kubernetes/polaris。
- API：`config.New(config.WithSource(...))` → `c.Load()` → `c.Scan(&struct)` / `c.Value("a.b").String()` / `c.Watch(key, fn)`；v3 可用泛型 `config.Get`。
- ⚠️ 多 source 根层 key 冲突按读取顺序覆盖，**勿依赖跨 source 同名根 key 覆盖**；仅层级冲突才合并。

### 4.2 errors
- 模型与 gRPC 状态码对齐，`Error` 实现 `GRPCStatus()`；字段 `code`（HTTP/gRPC 状态）、`reason`（业务码，服务内唯一）、`message`（用户可读）、`metadata`。
- proto 定义：`import "errors/errors.proto"` + 枚举 `option (errors.default_code)=500`、项 `[(errors.code)=404]`（码范围 `0<code≤600`）；`protoc-gen-go-errors` 生成 `IsXxx(err)` / `ErrorXxx(format,args...)`。
- 用法：`errors.New(500,"USER_NOT_FOUND","msg").WithMetadata(...)`；断言 `errors.Is(err, errors.BadRequest("...",""))`、`errors.FromError(err)` 取 `.Reason/.Code`。

### 4.3 log（v3 → log/slog ⚠️）
- v3 改用标准库 `log/slog`，`log` 包内无 `Logger interface` / `Helper`；核心能力由 `slog` + 构建器承担。
- 构建日志器：
  - `lg := slog.New(kratoslog.NewHandler(kratoslog.WithWriter(w), kratoslog.WithFormat(kratoslog.FormatJSON)))`
  - 或包任意 `slog.Handler`：`lg := kratoslog.NewLogger(handler)`（`NewLogger(handler slog.Handler, opts...) *slog.Logger`）。
- ctx 携带字段：`kratoslog.ContextWithAttrs(ctx, slog.String("trace_id", ...))`。
- 应用/中间件日志选项统一收 `*slog.Logger`：`kratos.New(..., kratos.Logger(lg), ...)`。
- OTel log handler 走 `contrib/otel/log`（`NewHandler(name) slog.Handler`）。

### 4.4 metadata
- 经 HTTP Header 传递：前缀 `x-md-global-*`（全局）、`x-md-local-*`（局部），meta 中间件可定制 prefix。
- 读：`metadata.FromServerContext(ctx).Get("key")`；写：`metadata.AppendToClientContext(ctx, "key", "val")`。

### 4.5 metrics（⚠️ v3 已迁 contrib/otel/metrics，接口用 OTel）
- v3 核心无 metrics 中间件；`contrib/otel/metrics` 提供 `Server(opts...)/Client(opts...)`（`middleware.Middleware`）。
- 选项：`WithRequests(metric.Int64Counter)`、`WithSeconds(metric.Float64Histogram)`。
- Counter/Histogram 由 OTel 创建（`go.opentelemetry.io/otel/metric`），暴露 Prometheus 需挂 `promhttp.Handler()` 到 `/metrics`；直方图命名去 `_bucket` 冗余后缀。
- 旧 v2 的 `metrics.Observer/Counter` 接口与 `prom.NewHistogram` 写法在 v3 不复存在。

### 4.6 encoding
- 接口：`Codec{Marshal/Unmarshal/Name()}`，须线程安全，`encoding.RegisterCodec` 注册。内置 form/json/protobuf/xml/yaml。
- ⚠️ v3 JSON 拆成 `encoding/json`（标准库）与 `encoding/protojson`；`protojson.MarshalOptions{EmitUnpopulated:true}`。**勿同时注册两个 JSON codec**。

### 4.7 registry & selector
- 注册：`Registrar{Register/Deregister}`、`Discovery{GetService/Watch}`；contrib：consul/etcd/nacos/kubernetes/polaris/zookeeper。`kratos.Registrar(reg)` 自动注/反注。
- 发现：Endpoint 形如 `discovery://<authority>/<service>`。
- selector：`wrr`（默认）/`p2c`/`random`；`selector.SetGlobalSelector(builder)`；filter 如 `filter.Version("2.0.0")`；gRPC 只能全局注入 balancer name。

---

## 5. 中间件目录

| 中间件 | 作用 / 关键用法 |
|---|---|
| auth(⚠️jwt) | v3 移到 `contrib/middleware/jwt/v3`；`jwt.Server(keyFunc)`/`Client`、`WithSigningMethod(HS256)`、`WithClaims`（server 每次返回新对象）；`jwt.FromContext(ctx)` 取 Claims。仅做服务间认证，业务令牌自实现签发 |
| circuitbreaker | 客户端熔断，默认 sre；`WithGroup` 按 Operation 分组，自定义须实现 `Allow/MarkSuccess/MarkFailed`；超限 `ErrNotAllowed(503)`。⚠️ v3 用 `WithBreakerFactory` 注入 aegis 熔断 |
| logging | `logging.Server(logger)`/`Client`；日志含 `trace_id/span_id`；server 端仅打 trace_id 不采集 |
| metrics(⚠️移核心) | 已不在核心；`contrib/otel/metrics`：`WithRequests(metric.Int64Counter)`、`WithSeconds(metric.Float64Histogram)`，即 OTel 中间件 `Server/Client` |
| ratelimit | 服务端 bbr 限流；`WithLimiter(Limiter)`（须实现 `Allow() (DoneFunc,error)`）；超限 `ErrLimitExceed(429)` |
| recovery | panic 兜底；`WithHandler(HandlerFunc)`（如投递 sentry）、`WithLogger` |
| tracing(⚠️移核心) | 已不在核心；`contrib/otel/tracing`：`Server/Client`，`WithTracerProvider`、`WithPropagator`，配套 OTLP exporter |
| validate | 基于 proto-gen-validate；proto 写 `(validate.rules).*`，`validate.Validator()` 注入自动校验 |

---

## 6. 依赖注入（Wire）

- Provider（普通函数）+ Injector；每模块导出一个 `ProviderSet = wire.NewSet(NewData, NewXxxRepo)`。
- `cmd/server/wire.go`：`panic(wire.Build(server.ProviderSet, data.ProviderSet, biz.ProviderSet, service.ProviderSet, newApp))`；在 main 目录跑 `wire` 生成 `wire_gen.go`。
- ⚠️ 生成产物（`wire_gen.go` 等）勿手改，统一 `make wire`。

---

## 7. 数据层

- 本仓库用 **GORM**（`kratos-kit/database/gorm` + `gorm.io/gen`），非 ent。
- 通用 data 层：实现 biz 定义 repo 接口；用 `kratos-kit` 的 DB 能力，禁止手写运行时 SQL（`.Raw/Exec/Expr/字符串 Where`），一律用 gorm/gen 类型化能力（见根 ACENTS.md/服务接入指南）。
- 迁移：本仓库统一维护在 `backend/migration/assets/v0.0.1/mysql`（及 postgres 目录），PG 方言差异见项目记忆（advisory lock、`$N` 占位符、无 BOM、单语句执行等）。

---

## 8. Docker 部署

- kratos-layout 自带多阶段 Dockerfile：builder `golang:<ver> make build`，runtime `distroless/debian-slim`（装 ca-certificates、netbase、时区），`EXPOSE 8000 9000`，配置挂 `/data/conf`。
- 运行：`docker run -p 8000:8000 -p 9000:9000 -v <hostconfigs>:/data/conf <image>`。
- 建议：Go 基础镜像随 `go.mod` go 版本升级，勿沿用早期 `golang:1.19`。

---

## 9. v2→v3 迁移清单（升级项目/读老代码时用）

1. import `go-kratos/kratos/v2` → `/v3`（含 contrib），`go mod tidy`。
2. JSON：显式选择 `encoding/json` 或 `encoding/protojson`（或引入 `contrib/encoding/json/v3` 兼容）；**不注册两个 JSON codec**。
3. 日志：`log.Logger/Helper` → `log/slog` + `kratoslog.NewLogger`。
4. JWT：import 改 `contrib/middleware/jwt/v3`（才引入 golang-jwt/jwt/v5）。
5. 熔断：确认自定义熔断是否依赖 aegis，改用 `WithBreakerFactory`。
6. 绑定：`transport/http/binding` → `http.BuildPath` + `Context.Bind*`。
7. 重新生成：`go generate ./...`（/ `make gen`）。
8. `go test` / `go vet` / lint 全绿后再上线，建议灰度。

---

## 10. 常见问题

- `descriptor.proto not found` → protoc 未装或 include 缺 `google`；IDE 波浪线 → 把 `third_party` 加入 protobuf include。
- `kratos client` 未生成 http → `make http` 或加 `--go-http_opt=omitempty=false`。
- `command not found` → 把 GOBIN 配入 `PATH`。
- 升级后报错 → `kratos upgrade` + 核对 go.mod + `go generate ./...`。

## 参考
- 官方文档：<https://go-kratos.dev/zh-cn/docs/>
- 迁移指南：<https://github.com/go-kratos/kratos/blob/main/docs/migration/v2-to-v3.md>
- 插件生态：<https://go-kratos.dev/zh-cn/docs/intro/design/>