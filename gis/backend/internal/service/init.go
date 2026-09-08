package service

import (
	"github.com/go-kratos/kratos/v3/transport/http"
	authnEngine "github.com/liujitcn/kratos-kit/auth/authn/engine"
	"github.com/liujitcn/kratos-kit/cache"
	"github.com/liujitcn/kratos-kit/database/gorm"
	"google.golang.org/grpc"
)

// Services 聚合 GIS 注册到宿主协议服务（占位，Task 9 完善）。
type Services struct {
	// Authenticator 是认证器，供模块 JWT 中间件复用。
	Authenticator authnEngine.Authenticator
}

// NewServices 创建 GIS 协议服务集合（占位，Task 9 完善）。
func NewServices(db *gorm.Client, redis cache.Cache, authenticator authnEngine.Authenticator) (*Services, func(), error) {
	return &Services{Authenticator: authenticator}, func() {}, nil
}

// RegisterGRPC 占位，Task 9 注册 GIS gRPC 服务。
func (s *Services) RegisterGRPC(registrar grpc.ServiceRegistrar) {}

// RegisterHTTP 占位，Task 9 注册 GIS HTTP 服务。
func (s *Services) RegisterHTTP(server *http.Server) {}
