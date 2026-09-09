package service

import (
	adminv1 "github.com/liujitcn/kratos-admin/gis/backend/api/gen/go/gis/admin/v1"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/biz"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/data"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/data/impl"
	"github.com/liujitcn/kratos-admin/gis/backend/migration"
	authnEngine "github.com/liujitcn/kratos-kit/auth/authn/engine"
	"github.com/liujitcn/kratos-kit/cache"
	"github.com/liujitcn/kratos-kit/database/gorm"

	"github.com/go-kratos/kratos/v3/transport/http"
	"google.golang.org/grpc"
)

// Services 聚合 GIS 注册到宿主协议服务。
type Services struct {
	layerService    *LayerService
	featureService  *FeatureService
	analysisService *AnalysisService
	// Authenticator 是认证器，供模块 JWT 中间件复用。
	Authenticator authnEngine.Authenticator
}

// NewServices 创建 GIS 协议服务集合。
func NewServices(db *gorm.Client, redis cache.Cache, authenticator authnEngine.Authenticator) (*Services, func(), error) {
	// 框架迁移执行器暂不支持 postgres 驱动，PostGIS 空间表 DDL 由模块自执行
	// （脚本幂等，开启 enable_migrate 时在连接就绪后执行一次）。
	if db.MigrationEnabled() {
		if err := migration.RunPostgres(db.DB); err != nil {
			return nil, nil, err
		}
	}
	layerRepo := data.NewLayerRepo(db.DB)
	spatialRepo := impl.NewMysqlSpatialRepo(db.DB)
	layerCase := biz.NewLayerCase(layerRepo)
	featureCase := biz.NewFeatureCase(spatialRepo, layerRepo)
	analysisCase := biz.NewAnalysisCase(spatialRepo)
	return &Services{
		layerService:    NewLayerService(layerCase),
		featureService:  NewFeatureService(featureCase),
		analysisService: NewAnalysisService(analysisCase),
		Authenticator:   authenticator,
	}, func() {}, nil
}

// RegisterGRPC 注册全部 gRPC 服务。
func (s *Services) RegisterGRPC(registrar grpc.ServiceRegistrar) {
	adminv1.RegisterLayerServiceServer(registrar, s.layerService)
	adminv1.RegisterFeatureServiceServer(registrar, s.featureService)
	adminv1.RegisterAnalysisServiceServer(registrar, s.analysisService)
}

// RegisterHTTP 注册全部 HTTP 服务。
func (s *Services) RegisterHTTP(server *http.Server) {
	adminv1.RegisterLayerServiceHTTPServer(server, s.layerService)
	adminv1.RegisterFeatureServiceHTTPServer(server, s.featureService)
	adminv1.RegisterAnalysisServiceHTTPServer(server, s.analysisService)
}
