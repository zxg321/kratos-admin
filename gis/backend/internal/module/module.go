package module

import (
	"github.com/go-kratos/kratos/v3/middleware"
	"github.com/go-kratos/kratos/v3/transport/http"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/service"
	"github.com/liujitcn/kratos-core/module"
	configv1 "github.com/liujitcn/kratos-kit/api/gen/go/config/v1"
	authnEngine "github.com/liujitcn/kratos-kit/auth/authn/engine"
	authnmiddleware "github.com/liujitcn/kratos-kit/auth/authn/middleware"
	"github.com/liujitcn/kratos-kit/auth/authz/engine"
	"github.com/liujitcn/kratos-kit/cache"
	"github.com/liujitcn/kratos-kit/database/gorm"
	"github.com/liujitcn/kratos-kit/transport/mcp"
	"google.golang.org/grpc"
)

// Module 聚合 GIS 注册到 Core 宿主的协议服务。
type Module struct {
	services *service.Services
}

var _ module.Module = (*Module)(nil)

// BuildModules 创建包含 GIS 服务的模块集合。
func BuildModules(
	config *configv1.Bootstrap,
	databases map[string]*gorm.Client,
	authorizer engine.Engine,
	authenticator authnEngine.Authenticator,
) (module.Modules, func(), error) {
	db := databases[gorm.DefaultClientName]
	redis, cleanupRedis, err := cache.NewCache(config.GetData().GetRedis())
	if err != nil {
		return nil, nil, err
	}
	services, cleanup, err := service.NewServices(db, redis, authenticator)
	if err != nil {
		if cleanupRedis != nil {
			cleanupRedis()
		}
		return nil, nil, err
	}
	return module.Modules{
		&Module{services: services},
	}, func() {
		cleanup()
		if cleanupRedis != nil {
			cleanupRedis()
		}
	}, nil
}

// RegisterGRPC 注册 GIS 的全部 gRPC 服务。
func (m *Module) RegisterGRPC(registrar grpc.ServiceRegistrar) {
	m.services.RegisterGRPC(registrar)
}

// RegisterHTTP 注册 GIS 的全部 HTTP 服务，并对全部路由启用 JWT 认证。
func (m *Module) RegisterHTTP(server *http.Server) {
	m.services.RegisterHTTP(server)
	if m.services.Authenticator != nil {
		server.Use("/*", middleware.Chain(authnmiddleware.Server(m.services.Authenticator)))
	}
}

// RegisterMCP 注册 GIS 的 MCP 工具，当前模块暂无 MCP 工具。
func (m *Module) RegisterMCP(server *mcp.Server) {}
