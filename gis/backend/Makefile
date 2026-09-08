# GIS Backend Makefile

.PHONY: help api wire gen fmt run run-only build check

SERVER_PACKAGE ?= ./internal/cmd/server
CONF ?= ./configs
APP_ENV ?= dev

GO_BIN_DIR ?= $(or $(shell go env GOBIN),$(shell go env GOPATH)/bin)

# 生成 protobuf Go 代码
api:
	@echo "==> 生成 GIS protobuf Go 代码"
	@cd api && PATH="$(GO_BIN_DIR):$$PATH" buf generate --template buf.gen.yaml
	@PATH="$(GO_BIN_DIR):$$PATH" find api/gen/go -type f -name '*.go' -exec goimports -w {} +
	@echo "==> GIS protobuf Go 代码生成完成"

# 生成独立服务入口 Wire 依赖注入代码
wire:
	@cd "$(SERVER_PACKAGE)" && PATH="$(GO_BIN_DIR):$$PATH" wire . && \
		PATH="$(GO_BIN_DIR):$$PATH" goimports -w wire.go wire_gen.go
	@echo "==> GIS Wire 依赖注入代码生成完成"

# 格式化 Go 代码
fmt:
	@PATH="$(GO_BIN_DIR):$$PATH" find . -type f -name '*.go' -exec goimports -w {} +

# 全部后端产物
gen:
	@$(MAKE) api
	@$(MAKE) wire
	@$(MAKE) fmt

# 直接启动服务
run-only:
	@go run "$(SERVER_PACKAGE)" -c "$(CONF)" -e "$(APP_ENV)"

# 刷新接口与 Wire 后运行服务
run:
	@$(MAKE) api
	@$(MAKE) wire
	@$(MAKE) run-only

# 静态检查与测试
check:
	@PATH="$(GO_BIN_DIR):$$PATH" golangci-lint run ./...
	@go test ./...

# 构建二进制
build:
	@$(MAKE) wire
	@CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o bin/server "$(SERVER_PACKAGE)"

help:
	@echo "make run   刷新接口与 Wire 后启动"
	@echo "make gen   生成全部后端产物"
	@echo "make check 执行 lint 与测试"
	@echo "make build 构建 Linux amd64 二进制"

.DEFAULT_GOAL := help
