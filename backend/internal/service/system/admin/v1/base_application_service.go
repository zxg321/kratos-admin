package admin

import (
	"context"

	systemadminv1 "github.com/liujitcn/kratos-admin/backend/api/gen/go/system/admin/v1"
	biz "github.com/liujitcn/kratos-admin/backend/internal/biz/system/admin"
	commonv1 "github.com/liujitcn/kratos-core/api/gen/go/common/v1"
	"github.com/liujitcn/kratos-core/errorsx"

	"github.com/go-kratos/kratos/v3/log"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/emptypb"
)

const _ = grpc.SupportPackageIsVersion7

// BaseApplicationService Admin应用信息服务。
type BaseApplicationService struct {
	systemadminv1.UnimplementedBaseApplicationServiceServer
	baseApplicationCase *biz.BaseApplicationCase
}

// NewBaseApplicationService 创建Admin应用信息服务。
func NewBaseApplicationService(baseApplicationCase *biz.BaseApplicationCase) *BaseApplicationService {
	return &BaseApplicationService{baseApplicationCase: baseApplicationCase}
}

// OptionBaseApplication 查询选项失败。
func (s *BaseApplicationService) OptionBaseApplication(ctx context.Context, req *systemadminv1.OptionBaseApplicationRequest) (*commonv1.SelectOptionResponse, error) {
	res, err := s.baseApplicationCase.OptionBaseApplication(ctx, req)
	if err != nil {
		log.Error("OptionBaseApplication", "error", err)
		return nil, errorsx.WrapInternal(err, "查询选项失败")
	}
	return res, nil
}

// PageBaseApplication 查询应用信息分页列表失败。
func (s *BaseApplicationService) PageBaseApplication(ctx context.Context, req *systemadminv1.PageBaseApplicationRequest) (*systemadminv1.PageBaseApplicationResponse, error) {
	res, err := s.baseApplicationCase.PageBaseApplication(ctx, req)
	if err != nil {
		log.Error("PageBaseApplication", "error", err)
		return nil, errorsx.WrapInternal(err, "查询应用信息分页列表失败")
	}
	return res, nil
}

// GetBaseApplication 查询应用信息失败。
func (s *BaseApplicationService) GetBaseApplication(ctx context.Context, req *systemadminv1.GetBaseApplicationRequest) (*systemadminv1.BaseApplicationForm, error) {
	res, err := s.baseApplicationCase.GetBaseApplication(ctx, req.GetId())
	if err != nil {
		log.Error("GetBaseApplication", "error", err)
		return nil, errorsx.WrapInternal(err, "查询应用信息失败")
	}
	return res, nil
}

// CreateBaseApplication 创建应用信息失败。
func (s *BaseApplicationService) CreateBaseApplication(ctx context.Context, req *systemadminv1.CreateBaseApplicationRequest) (*emptypb.Empty, error) {
	err := s.baseApplicationCase.CreateBaseApplication(ctx, req.GetBaseApplication())
	if err != nil {
		log.Error("CreateBaseApplication", "error", err)
		return nil, errorsx.WrapInternal(err, "创建应用信息失败")
	}
	return new(emptypb.Empty), nil
}

// UpdateBaseApplication 更新应用信息失败。
func (s *BaseApplicationService) UpdateBaseApplication(ctx context.Context, req *systemadminv1.UpdateBaseApplicationRequest) (*emptypb.Empty, error) {
	err := s.baseApplicationCase.UpdateBaseApplication(ctx, req.GetId(), req.GetBaseApplication())
	if err != nil {
		log.Error("UpdateBaseApplication", "error", err)
		return nil, errorsx.WrapInternal(err, "更新应用信息失败")
	}
	return new(emptypb.Empty), nil
}

// DeleteBaseApplication 删除应用信息失败。
func (s *BaseApplicationService) DeleteBaseApplication(ctx context.Context, req *systemadminv1.DeleteBaseApplicationRequest) (*emptypb.Empty, error) {
	err := s.baseApplicationCase.DeleteBaseApplication(ctx, req.GetIds())
	if err != nil {
		log.Error("DeleteBaseApplication", "error", err)
		return nil, errorsx.WrapInternal(err, "删除应用信息失败")
	}
	return new(emptypb.Empty), nil
}

// SetBaseApplicationStatus 设置状态失败。
func (s *BaseApplicationService) SetBaseApplicationStatus(ctx context.Context, req *systemadminv1.SetBaseApplicationStatusRequest) (*emptypb.Empty, error) {
	err := s.baseApplicationCase.SetBaseApplicationStatus(ctx, req)
	if err != nil {
		log.Error("SetBaseApplicationStatus", "error", err)
		return nil, errorsx.WrapInternal(err, "设置状态失败")
	}
	return new(emptypb.Empty), nil
}
