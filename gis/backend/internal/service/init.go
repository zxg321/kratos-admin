package service

import (
	adminv1 "github.com/liujitcn/kratos-admin/gis/backend/api/gen/go/gis/admin/v1"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/biz"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/data"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/data/impl"
	authnEngine "github.com/liujitcn/kratos-kit/auth/authn/engine"
	"github.com/liujitcn/kratos-kit/cache"
	"github.com/liujitcn/kratos-kit/database/gorm"

	"github.com/go-kratos/kratos/v3/transport/http"
	"google.golang.org/grpc"
)

// Services 聚合 GIS 注册到宿主协议服务。
type Services struct {
	layerService   *LayerService
	featureService *FeatureService
	// Authenticator 是认证器，供模块 JWT 中间件复用。
	Authenticator authnEngine.Authenticator
}

// NewServices 创建 GIS 协议服务集合。
func NewServices(db *gorm.Client, redis cache.Cache, authenticator authnEngine.Authenticator) (*Services, func(), error) {
	layerRepo := data.NewLayerRepo(db.DB)
	spatialRepo := impl.NewMysqlSpatialRepo(db.DB)
	layerCase := biz.NewLayerCase(layerRepo)
	featureCase := biz.NewFeatureCase(spatialRepo, layerRepo)
	return &Services{
		layerService:   NewLayerService(layerCase),
		featureService: NewFeatureService(featureCase),
		Authenticator:  authenticator,
	}, func() {}, nil
}

// RegisterGRPC 注册全部 gRPC 服务。
func (s *Services) RegisterGRPC(registrar grpc.ServiceRegistrar) {
	adminv1.RegisterLayerServiceServer(registrar, s.layerService)
	adminv1.RegisterFeatureServiceServer(registrar, s.featureService)
}

// RegisterHTTP 注册全部 HTTP 服务。
func (s *Services) RegisterHTTP(server *http.Server) {
	adminv1.RegisterLayerServiceHTTPServer(server, s.layerService)
	adminv1.RegisterFeatureServiceHTTPServer(server, s.featureService)
}
