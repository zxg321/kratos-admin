package admin

import (
	"context"
	"time"

	systemadminv1 "github.com/liujitcn/kratos-admin/backend/api/gen/go/system/admin/v1"

	adminv1 "github.com/liujitcn/kratos-admin/backend/api/gen/go/system/admin/v1"
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
	adminv1.UnimplementedBaseApplicationServiceServer
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

// PageApplicationUser 分页查询应用授权用户。
func (s *BaseApplicationService) PageApplicationUser(ctx context.Context, req *systemadminv1.PageApplicationUserRequest) (*systemadminv1.PageApplicationUserResponse, error) {
	list, total, err := s.baseApplicationCase.PageApplicationUser(ctx, req.GetApplicationId(), req.GetPageNum(), req.GetPageSize())
	if err != nil {
		return nil, err
	}
	resList := make([]*systemadminv1.BaseApplicationUser, 0, len(list))
	for _, item := range list {
		resList = append(resList, &systemadminv1.BaseApplicationUser{
			Id:        item.ID,
			UserId:    item.UserID,
			CreatedAt: item.CreatedAt.Format(time.RFC3339),
		})
	}
	return &systemadminv1.PageApplicationUserResponse{BaseApplicationUsers: resList, Total: int32(total)}, nil
}

// SetApplicationUser 授权用户（绑定）。
func (s *BaseApplicationService) SetApplicationUser(ctx context.Context, req *systemadminv1.SetApplicationUserRequest) (*emptypb.Empty, error) {
	if req.GetApplicationId() <= 0 || req.GetUserId() <= 0 {
		return nil, errorsx.InvalidArgument("应用ID与用户ID必填")
	}
	if err := s.baseApplicationCase.SetApplicationUser(ctx, req.GetApplicationId(), req.GetUserId()); err != nil {
		return nil, err
	}
	return new(emptypb.Empty), nil
}

// DeleteApplicationUser 移除授权用户。
func (s *BaseApplicationService) DeleteApplicationUser(ctx context.Context, req *systemadminv1.DeleteApplicationUserRequest) (*emptypb.Empty, error) {
	if req.GetApplicationId() <= 0 || req.GetUserId() <= 0 {
		return nil, errorsx.InvalidArgument("应用ID与用户ID必填")
	}
	if err := s.baseApplicationCase.DeleteApplicationUser(ctx, req.GetApplicationId(), req.GetUserId()); err != nil {
		return nil, err
	}
	return new(emptypb.Empty), nil
}
