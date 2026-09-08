package service

import (
	"context"

	adminv1 "github.com/liujitcn/kratos-admin/gis/backend/api/gen/go/gis/admin/v1"
	biz "github.com/liujitcn/kratos-admin/gis/backend/internal/biz"
	"github.com/go-kratos/kratos/v3/log"
	"github.com/liujitcn/kratos-core/errorsx"
	"google.golang.org/protobuf/types/known/emptypb"
)

// LayerService GIS 图层服务。
type LayerService struct {
	adminv1.UnimplementedLayerServiceServer
	layerCase *biz.LayerCase
}

// NewLayerService 创建 GIS 图层服务。
func NewLayerService(layerCase *biz.LayerCase) *LayerService {
	return &LayerService{layerCase: layerCase}
}

// PageLayer 分页查询图层。
func (s *LayerService) PageLayer(ctx context.Context, req *adminv1.PageLayerRequest) (*adminv1.PageLayerResponse, error) {
	res, err := s.layerCase.PageLayer(ctx, req)
	if err != nil {
		log.Error("PageLayer", "error", err)
		return nil, errorsx.WrapInternal(err, "查询图层失败")
	}
	return res, nil
}

// ListLayer 查询全部图层。
func (s *LayerService) ListLayer(ctx context.Context, req *adminv1.ListLayerRequest) (*adminv1.ListLayerResponse, error) {
	res, err := s.layerCase.ListLayer(ctx, req)
	if err != nil {
		log.Error("ListLayer", "error", err)
		return nil, errorsx.WrapInternal(err, "查询图层失败")
	}
	return res, nil
}

// GetLayer 查询图层详情。
func (s *LayerService) GetLayer(ctx context.Context, req *adminv1.GetLayerRequest) (*adminv1.LayerForm, error) {
	res, err := s.layerCase.GetLayer(ctx, req.GetId())
	if err != nil {
		log.Error("GetLayer", "error", err)
		return nil, errorsx.WrapInternal(err, "查询图层详情失败")
	}
	return res, nil
}

// CreateLayer 创建图层。
func (s *LayerService) CreateLayer(ctx context.Context, req *adminv1.CreateLayerRequest) (*emptypb.Empty, error) {
	if err := s.layerCase.CreateLayer(ctx, req.GetLayer()); err != nil {
		log.Error("CreateLayer", "error", err)
		return nil, errorsx.WrapInternal(err, "创建图层失败")
	}
	return new(emptypb.Empty), nil
}

// UpdateLayer 更新图层。
func (s *LayerService) UpdateLayer(ctx context.Context, req *adminv1.UpdateLayerRequest) (*emptypb.Empty, error) {
	if err := s.layerCase.UpdateLayer(ctx, req.GetId(), req.GetLayer()); err != nil {
		log.Error("UpdateLayer", "error", err)
		return nil, errorsx.WrapInternal(err, "更新图层失败")
	}
	return new(emptypb.Empty), nil
}

// DeleteLayer 删除图层。
func (s *LayerService) DeleteLayer(ctx context.Context, req *adminv1.DeleteLayerRequest) (*emptypb.Empty, error) {
	if err := s.layerCase.DeleteLayer(ctx, req.GetIds()); err != nil {
		log.Error("DeleteLayer", "error", err)
		return nil, errorsx.WrapInternal(err, "删除图层失败")
	}
	return new(emptypb.Empty), nil
}
