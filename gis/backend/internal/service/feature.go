package service

import (
	"context"

	adminv1 "github.com/liujitcn/kratos-admin/gis/backend/api/gen/go/gis/admin/v1"
	biz "github.com/liujitcn/kratos-admin/gis/backend/internal/biz"
	"github.com/go-kratos/kratos/v3/log"
	"github.com/liujitcn/kratos-core/errorsx"
	"google.golang.org/protobuf/types/known/emptypb"
)

// FeatureService GIS 要素服务。
type FeatureService struct {
	adminv1.UnimplementedFeatureServiceServer
	featureCase *biz.FeatureCase
}

// NewFeatureService 创建 GIS 要素服务。
func NewFeatureService(featureCase *biz.FeatureCase) *FeatureService {
	return &FeatureService{featureCase: featureCase}
}

// PageFeature 分页查询要素。
func (s *FeatureService) PageFeature(ctx context.Context, req *adminv1.PageFeatureRequest) (*adminv1.PageFeatureResponse, error) {
	res, err := s.featureCase.PageFeature(ctx, req)
	if err != nil {
		log.Error("PageFeature", "error", err)
		return nil, errorsx.WrapInternal(err, "查询要素失败")
	}
	return res, nil
}

// QueryFeatureByBBox 按 bbox 查询要素。
func (s *FeatureService) QueryFeatureByBBox(ctx context.Context, req *adminv1.QueryFeatureByBBoxRequest) (*adminv1.QueryFeatureByBBoxResponse, error) {
	res, err := s.featureCase.QueryFeatureByBBox(ctx, req)
	if err != nil {
		log.Error("QueryFeatureByBBox", "error", err)
		return nil, errorsx.WrapInternal(err, "查询要素失败")
	}
	return res, nil
}

// GetFeature 查询要素详情。
func (s *FeatureService) GetFeature(ctx context.Context, req *adminv1.GetFeatureRequest) (*adminv1.FeatureForm, error) {
	res, err := s.featureCase.GetFeature(ctx, req.GetId())
	if err != nil {
		log.Error("GetFeature", "error", err)
		return nil, errorsx.WrapInternal(err, "查询要素详情失败")
	}
	return res, nil
}

// CreateFeature 创建要素。
func (s *FeatureService) CreateFeature(ctx context.Context, req *adminv1.CreateFeatureRequest) (*emptypb.Empty, error) {
	if err := s.featureCase.CreateFeature(ctx, req.GetFeature()); err != nil {
		log.Error("CreateFeature", "error", err)
		return nil, errorsx.WrapInternal(err, "创建要素失败")
	}
	return new(emptypb.Empty), nil
}

// UpdateFeature 更新要素。
func (s *FeatureService) UpdateFeature(ctx context.Context, req *adminv1.UpdateFeatureRequest) (*emptypb.Empty, error) {
	if err := s.featureCase.UpdateFeature(ctx, req.GetId(), req.GetFeature()); err != nil {
		log.Error("UpdateFeature", "error", err)
		return nil, errorsx.WrapInternal(err, "更新要素失败")
	}
	return new(emptypb.Empty), nil
}

// DeleteFeature 删除要素。
func (s *FeatureService) DeleteFeature(ctx context.Context, req *adminv1.DeleteFeatureRequest) (*emptypb.Empty, error) {
	if err := s.featureCase.DeleteFeature(ctx, req.GetIds()); err != nil {
		log.Error("DeleteFeature", "error", err)
		return nil, errorsx.WrapInternal(err, "删除要素失败")
	}
	return new(emptypb.Empty), nil
}
