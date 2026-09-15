# 部署运维与 CI/CD 分析

> 状态：现状快照（部署现状盘点）；目标部署口径以 ../snop-实施规划/ 为准。

> kratos-admin 项目深度分析 · 06
> 日期：2026-09-14
> 方法：基于仓库 Makefile、Dockerfile、docker-compose、GitHub workflows 与脚本的静态核实

---

## TL;DR

- 部署形态：**仅容器化两个后端应用**（admin 7001/6001，GIS 7002/6002），中间件（PostgreSQL+PostGIS :5455、Redis :6379、Consul :8500、Vault）复用宿主机实例，容器经 `host.docker.internal` 访问。
- 构建链：Docker multi-stage（`golang:1.27-alpine` 编译 → `alpine:3.22` 运行），前端 H5 产物随镜像发布，启动时合并到 `/app/data` 且不清空既有上传。
- 发布体系完整：`make tag VERSION=x.y.z` 一条命令完成 i18n 门禁 → 分支同步检查 → 后端测试 + 前端打包 → 三组 tag 推送 → npm Trusted Publishing。
- CI 三工作流：安全扫描（govulncheck/gosec/pnpm audit，每周定时）、PG 迁移 SQL 静态校验、npm 发布。

---

## 1. 部署拓扑

### 1.1 docker-compose.yml（仓库根）

| 服务 | 镜像 | 端口 | 数据卷 |
| --- | --- | --- | --- |
| `admin` | kratos-admin/backend:local | 7001 HTTP / 6001 gRPC | admin-data / admin-logs / admin-backups → /app/* |
| `gis-backend` | kratos-admin/gis-backend:local | 7002 HTTP / 6002 gRPC | gis-logs → /app/logs |

- 每个服务以 `-e docker` 启动，加载 `configs/*.docker.yaml`（数据库/Consul 指向 host.docker.internal）。
- `TZ=Asia/Shanghai`，`restart: unless-stopped`。
- 中间件不在 compose 内；如需数据库容器化需自行扩展 compose（六库部署规划见 ../snop-实施规划/01，部署运维手册规划见 02 §3.3）。

### 1.2 Makefile docker 目标（根 Makefile）

- `docker-build`：先构建三端前端 H5 → docker build（默认 linux/amd64，上下文 `backend/`）。
- `docker-build-multiarch`：Buildx 同时构建 amd64+arm64，默认 `--push`。
- `docker-run`：宿主机映射 data/logs/backups/configs 四目录；容器内 `./server -c ./configs -e $APP_ENV`；注入 `VAULT_TOKEN`（不落盘）。
- `docker-stop`：停止但保留容器与数据。

### 1.3 密钥与安全运维

- Vault 根密钥管理：配置解密（`ENC[...]`）、业务密钥派生（`kratos-kit:mfa/encryption`、`kratos-admin:backup/integrity|encryption`、`kratos-admin:oauth/credential-protection`、`kratos-admin:base-log-fallback/integrity`）；Vault 不可用时启动失败、不降级。
- 生产基线校验：以 prod/production 启动时，数据库初始化前校验 `SECURITY_TLS_TERMINATED`、`SECURITY_DATABASE_TLS_TERMINATED`、`SECURITY_REDIS_TLS_TERMINATED`、`SECURITY_EXTERNAL_BACKUP`、`SECURITY_EXTERNAL_LOG_ARCHIVE`、`SECURITY_EXTERNAL_FILE_SCAN` 六项外部能力声明。
- 备份：每日 02:00 `BaseTableBackup`，AES-256 加密 + SHA-256/HMAC 完整性校验 + OSS 上传 + 回读校验；恢复走 `ExecuteBaseTableBackupRestore`，要求停写与隔离演练。
- 日志兜底：队列失败时写 `admin-log.jsonl`（HMAC 防篡改），每日任务回灌日志表。
- HTTPS 联调：`scripts/generate-dev-cert.sh <局域网IP>` 生成根 `certs/` 共享证书，`APP_ENV=https` 启动 7001。

## 2. 构建与生成链

| 层级 | 命令 | 说明 |
| --- | --- | --- |
| 全仓 | `make gen` / `make check` | Backend 生成/检查 → Frontend ts → i18n |
| 后端 | `make -C backend api|openapi|gorm-gen|wire|gen|check|test|fmt|build` | Buf+protoc、OpenAPI、GORM-gen、Wire 产物全部生成，禁止手改 |
| 前端 | `make -C frontend ts[-admin|-uni-app|-taro-app]` | 三端 TypeScript RPC 统一由 `backend/api` 的 Buf 配置生成 |
| 构建 | `make build` | 后端 linux/amd64 二进制 + 三端 H5（admin→backend/data/admin，uni-app→data/uni-app，taro→data/taro-app；小程序产物 dist/build/mp-weixin） |
| 打包 | `make package` | 后端 tar.gz（bin/server + configs）+ 10 个 npm 包 |

Go 1.27.0（go.mod）、Node ≥22.12 / ^20.19、pnpm 10.x（各 workspace packageManager 指定）。

## 3. CI/CD 与发布

### 3.1 GitHub Actions（3 个）

| 工作流 | 触发 | 内容 |
| --- | --- | --- |
| `security.yml` | PR / main push / 每周一 02:17 / 手动 | 后端 govulncheck + gosec（high/high）；前端 pnpm audit（≥high）；仓库与镜像上下文扫描。注意：后端依赖未公开版本的 `liujitcn/go-utils` crypto API，CI 中固定 commit 检出并 `go mod edit -replace` |
| `pg-migration-sql.yml` | 迁移资产变更 | pglast 静态校验 PG SQL（详见 05 文档） |
| `publish-npm.yml` | tag `npm/vX.Y.Z` | npm Trusted Publishing 发布 10 包 |

### 3.2 发布流程（`make tag VERSION=x.y.z` → scripts/tag_release.py）

1. `i18n-check`（只读门禁：语言包/SQL 翻译/OpenAPI 多语言一致性，不通过直接拒绝发布）
2. 校验当前分支为远程默认分支且与 origin 同步
3. 后端测试 + 前端打包
4. 推送 `vX.Y.Z`、`backend/vX.Y.Z`、`npm/vX.Y.Z`
5. `publish-npm.yml` 发布：admin core/system/cli、uni-app core/system/cli、taro core/ui/system/cli（三个默认宿主为私有包不发布）

本机要求：git、gh、GitHub 登录态；本地直发可 `make -C frontend publish`（跳过 registry 已存在版本）。

### 3.3 Git hooks（scripts/githooks）

`make init` 启用；提交前执行管理端暂存文件检查（lint-staged）、commitlint 校验提交信息。

## 4. scripts/ 工具脚本

| 脚本 | 用途 |
| --- | --- |
| `verify_i18n.py` | 只读校验语言集合、语言键、占位符、SQL 翻译与 OpenAPI |
| `sync_locales.py` | 同步语言包集合、前端注册文件、代码生成语言目录 |
| `generate_locale_drafts.py` | 新增语言草稿（`i18n-add`），支持机器翻译/离线模式 |
| `generate_openapi_locales.py` | OpenAPI 多语言 YAML 生成（Google V1 / OpenCC 自动翻译，可关） |
| `local_openapi_i18n.py` | 本地术语映射 |
| `validate_pg_migration.py` | pglast 校验 PG 迁移 SQL |
| `tag_release.py` | 统一发布编排 |
| `generate-dev-cert.sh` | 局域网 HTTPS 共享开发证书 |

## 5. 亮点与技术债

**亮点**
1. 发布门禁设计严格：i18n 不一致拒绝发版、分支同步强制、发布流程一条命令可重复。
2. 生成物哲学贯彻彻底（Proto/GORM/Wire/RPC/OpenAPI 全生成），Makefile 目标分层清晰（根/backend/frontend/gis 四级）。
3. 安全基线自动化：CI 漏洞扫描定时跑、生产启动前置校验、备份端到端校验。
4. 容器只装应用不装中间件，数据卷与配置目录约定明确，启动时配置/静态资源"只补缺不覆盖"。

**技术债 / 风险（P0-P2）**
- **P1｜CI 依赖未公开版本的 go-utils**（固定 commit + replace）：供应链单点，上游仓库不可用或强推会导致 CI 断裂；建议 tag 化或发布模块版本。
- **P1｜无部署环境编排**：compose 只覆盖后端应用，Vault/Consul/PG 的生产部署、解封、凭据轮转完全依赖人工（文档已声明），缺一份"生产部署 checklist"落地文件。
- **P2｜docker-build-multiarch 默认 `--push`**：误执行可能直接推送镜像仓库；建议默认 `--load` 并显式传 `--push`。
- **P2｜根 `certs/dev-cert.pem` 已入仓库目录**（项目布局可见）：应确认 .gitignore 覆盖，避免私钥泄露。
- **P2｜`security.yml` 只扫 frontend/admin 依赖**：uni-app 与 taro-app 的 pnpm audit 未覆盖。

---

## ✅ 建议行动清单

| # | 行动 | 优先级 |
|---|------|--------|
| 1 | go-utils 依赖 tag 化/发版，替换 CI 固定 commit | P1 |
| 2 | 编写生产部署 checklist（Vault 解封、凭据轮转、TLS、备份演练） | P1 |
| 3 | 确认 certs/ 与 *.dev.yaml 的 .gitignore 覆盖并轮换历史证书 | P1 |
| 4 | security.yml 补扫 uni-app / taro-app 依赖 | P2 |
| 5 | multiarch 默认输出改为本地 load | P2 |
