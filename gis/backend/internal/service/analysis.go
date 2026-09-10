package service

import (
	"context"

	adminv1 "github.com/liujitcn/kratos-admin/gis/backend/api/gen/go/gis/admin/v1"
	biz "github.com/liujitcn/kratos-admin/gis/backend/internal/biz"
	"github.com/go-kratos/kratos/v3/log"
	"github.com/liujitcn/kratos-core/errorsx"
)

// AnalysisService GIS 空间分析服务。
type AnalysisService struct {
	adminv1.UnimplementedAnalysisServiceServer
	analysisCase *biz.AnalysisCase
}

// NewAnalysisService 创建 GIS 空间分析服务。
func NewAnalysisService(analysisCase *biz.AnalysisCase) *AnalysisService {
	return &AnalysisService{analysisCase: analysisCase}
}

// MeasureDistance 测量折线长度。
func (s *AnalysisService) MeasureDistance(ctx context.Context, req *adminv1.MeasureDistanceRequest) (*adminv1.MeasureDistanceResponse, error) {
	res, err := s.analysisCase.MeasureDistance(ctx, req.GetGeometry())
	if err != nil {
		log.Error("MeasureDistance", "error", err)
		return nil, errorsx.WrapInternal(err, "测量距离失败")
	}
	return res, nil
}

// MeasureArea 测量多边形面积。
func (s *AnalysisService) MeasureArea(ctx context.Context, req *adminv1.MeasureAreaRequest) (*adminv1.MeasureAreaResponse, error) {
	res, err := s.analysisCase.MeasureArea(ctx, req.GetGeometry())
	if err != nil {
		log.Error("MeasureArea", "error", err)
		return nil, errorsx.WrapInternal(err, "测量面积失败")
	}
	return res, nil
}

// BufferGeometry 生成缓冲区。
func (s *AnalysisService) BufferGeometry(ctx context.Context, req *adminv1.BufferGeometryRequest) (*adminv1.BufferGeometryResponse, error) {
	res, err := s.analysisCase.BufferGeometry(ctx, req)
	if err != nil {
		log.Error("BufferGeometry", "error", err)
		return nil, errorsx.WrapInternal(err, "生成缓冲区失败")
	}
	return res, nil
}

// QueryFeatureWithin 叠加查询：范围几何内的要素。
func (s *AnalysisService) QueryFeatureWithin(ctx context.Context, req *adminv1.QueryFeatureWithinRequest) (*adminv1.QueryFeatureWithinResponse, error) {
	res, err := s.analysisCase.QueryFeatureWithin(ctx, req)
	if err != nil {
		log.Error("QueryFeatureWithin", "error", err)
		return nil, errorsx.WrapInternal(err, "叠加查询失败")
	}
	return res, nil
}

// QueryFeatureIntersects 叠加查询：与范围几何相交的要素。
func (s *AnalysisService) QueryFeatureIntersects(ctx context.Context, req *adminv1.QueryFeatureIntersectsRequest) (*adminv1.QueryFeatureIntersectsResponse, error) {
	res, err := s.analysisCase.QueryFeatureIntersects(ctx, req)
	if err != nil {
		log.Error("QueryFeatureIntersects", "error", err)
		return nil, errorsx.WrapInternal(err, "叠加查询失败")
	}
	return res, nil
}
