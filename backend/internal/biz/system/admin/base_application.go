package biz

import (
	"context"
	"fmt"

	systemadminv1 "github.com/liujitcn/kratos-admin/backend/api/gen/go/system/admin/v1"

	adminv1 "github.com/liujitcn/kratos-admin/backend/api/gen/go/system/admin/v1"
	commonv1 "github.com/liujitcn/kratos-core/api/gen/go/common/v1"

	"github.com/liujitcn/kratos-admin/backend/internal/data/gen/data"
	"github.com/liujitcn/kratos-admin/backend/internal/data/gen/models"
	_const "github.com/liujitcn/kratos-core/const"
	"time"
	"github.com/liujitcn/kratos-core/biz"

	"github.com/liujitcn/go-utils/mapper"
	_string "github.com/liujitcn/go-utils/string"
	"github.com/liujitcn/gorm-kit/repository"
)

// BaseApplicationCase 应用信息业务实例。
type BaseApplicationCase struct {
	*biz.BaseCase
	*data.BaseApplicationRepository
	baseApplicationUserRepo *data.BaseApplicationUserRepository
	formMapper *mapper.CopierMapper[adminv1.BaseApplicationForm, models.BaseApplication]
	mapper     *mapper.CopierMapper[adminv1.BaseApplication, models.BaseApplication]
}

// NewBaseApplicationCase 创建应用信息业务实例。
func NewBaseApplicationCase(baseCase *biz.BaseCase, baseApplicationRepo *data.BaseApplicationRepository, baseApplicationUserRepo *data.BaseApplicationUserRepository) *BaseApplicationCase {
	return &BaseApplicationCase{
		BaseCase:                  baseCase,
		BaseApplicationRepository: baseApplicationRepo,
		baseApplicationUserRepo:   baseApplicationUserRepo,
		formMapper:                mapper.NewCopierMapper[adminv1.BaseApplicationForm, models.BaseApplication](),
		mapper:                    mapper.NewCopierMapper[adminv1.BaseApplication, models.BaseApplication](),
	}
}

// OptionBaseApplication 查询应用信息下拉选择。
func (c *BaseApplicationCase) OptionBaseApplication(ctx context.Context, _ *systemadminv1.OptionBaseApplicationRequest) (*commonv1.SelectOptionResponse, error) {
	query := c.Query(ctx).BaseApplication

	opts := make([]repository.QueryOption, 0, 1)
	opts = append(opts, repository.Order(query.CreatedAt.Desc()))

	list, err := c.List(ctx, opts...)
	if err != nil {
		return nil, err
	}
	options := make([]*commonv1.SelectOptionResponse_Option, 0, len(list))
	for _, item := range list {
		options = append(options, &commonv1.SelectOptionResponse_Option{Label: fmt.Sprint(item.Name), Value: int64(item.ID), Disabled: fmt.Sprint(item.Status) != "1"})
	}
	return &commonv1.SelectOptionResponse{List: options}, nil
}

// PageBaseApplication 查询应用信息分页列表。
func (c *BaseApplicationCase) PageBaseApplication(ctx context.Context, req *systemadminv1.PageBaseApplicationRequest) (*systemadminv1.PageBaseApplicationResponse, error) {
	query := c.Query(ctx).BaseApplication
	opts := make([]repository.QueryOption, 0, 5)
	opts = append(opts, repository.Order(query.CreatedAt.Desc()))
	if req.TenantId != nil {
		opts = append(opts, repository.Where(query.TenantID.Eq(req.GetTenantId())))
	}
	if req.GetName() != "" {
		opts = append(opts, repository.Where(query.Name.Like("%"+req.GetName()+"%")))
	}
	if req.GetCode() != "" {
		opts = append(opts, repository.Where(query.Code.Like("%"+req.GetCode()+"%")))
	}
	if req.Status != nil {
		opts = append(opts, repository.Where(query.Status.Eq(req.GetStatus())))
	}

	// 授权过滤：非超级管理员仅可见 base_application_user 中分配了权限的应用（跳转访问控制的数据闸门）。
	authInfo, err := c.GetAuthInfo(ctx)
	if err != nil {
		return nil, err
	}
	if authInfo.RoleCode != _const.BASE_ROLE_CODE_SUPER {
		uq := c.baseApplicationUserRepo.Query(ctx)
		userOpts := []repository.QueryOption{
			repository.Where(uq.BaseApplicationUser.UserID.Eq(authInfo.UserId)),
		}
		authorized, err := c.baseApplicationUserRepo.List(ctx, userOpts...)
		if err != nil {
			return nil, err
		}
		allowedIDs := make([]int64, 0, len(authorized))
		for _, item := range authorized {
			allowedIDs = append(allowedIDs, item.ApplicationID)
		}
		if len(allowedIDs) == 0 {
			return &systemadminv1.PageBaseApplicationResponse{BaseApplications: []*systemadminv1.BaseApplication{}, Total: 0}, nil
		}
		opts = append(opts, repository.Where(query.ID.In(allowedIDs...)))
	}

	list, total, err := c.Page(ctx, req.GetPageNum(), req.GetPageSize(), opts...)
	if err != nil {
		return nil, err
	}

	resList := make([]*systemadminv1.BaseApplication, 0, len(list))
	for _, item := range list {
		res := c.mapper.ToDTO(item)
		resList = append(resList, res)
	}
	return &systemadminv1.PageBaseApplicationResponse{BaseApplications: resList, Total: int32(total)}, nil
}

// GetBaseApplication 查询应用信息详情。
func (c *BaseApplicationCase) GetBaseApplication(ctx context.Context, id int64) (*systemadminv1.BaseApplicationForm, error) {
	baseApplication, err := c.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return c.formMapper.ToDTO(baseApplication), nil
}

// CreateBaseApplication 创建应用信息。
func (c *BaseApplicationCase) CreateBaseApplication(ctx context.Context, req *systemadminv1.BaseApplicationForm) error {
	baseApplication := c.formMapper.ToEntity(req)
	return c.Create(ctx, baseApplication)
}

// UpdateBaseApplication 更新应用信息。
func (c *BaseApplicationCase) UpdateBaseApplication(ctx context.Context, id int64, req *systemadminv1.BaseApplicationForm) error {
	baseApplication := c.formMapper.ToEntity(req)
	baseApplication.ID = id
	return c.UpdateByID(ctx, baseApplication)
}

// DeleteBaseApplication 删除应用信息。
func (c *BaseApplicationCase) DeleteBaseApplication(ctx context.Context, ids string) error {
	return c.DeleteByIDs(ctx, _string.ConvertStringToInt64Array(ids))
}

// SetBaseApplicationStatus 设置状态状态。
func (c *BaseApplicationCase) SetBaseApplicationStatus(ctx context.Context, req *systemadminv1.SetBaseApplicationStatusRequest) error {
	return c.UpdateByID(ctx, &models.BaseApplication{
		ID:     req.GetId(),
		Status: req.GetStatus(),
	})
}

// PageApplicationUser 分页查询应用授权用户。
func (c *BaseApplicationCase) PageApplicationUser(ctx context.Context, applicationID int64, pageNum, pageSize int32) ([]*models.BaseApplicationUser, int64, error) {
	uq := c.baseApplicationUserRepo.Query(ctx)
	opts := []repository.QueryOption{
		repository.Where(uq.BaseApplicationUser.ApplicationID.Eq(applicationID)),
		repository.Order(uq.BaseApplicationUser.CreatedAt.Desc()),
	}
	return c.baseApplicationUserRepo.Page(ctx, int64(pageNum), int64(pageSize), opts...)
}

// SetApplicationUser 授权用户（幂等：已授权则跳过）。
func (c *BaseApplicationCase) SetApplicationUser(ctx context.Context, applicationID, userID int64) error {
	authInfo, err := c.GetAuthInfo(ctx)
	if err != nil {
		return err
	}
	uq := c.baseApplicationUserRepo.Query(ctx)
	existing, err := c.baseApplicationUserRepo.List(ctx,
		repository.Where(uq.BaseApplicationUser.ApplicationID.Eq(applicationID)),
		repository.Where(uq.BaseApplicationUser.UserID.Eq(userID)),
	)
	if err != nil {
		return err
	}
	if len(existing) > 0 {
		return nil
	}
	now := time.Now()
	item := &models.BaseApplicationUser{
		ApplicationID: applicationID,
		UserID:        userID,
		TenantID:      authInfo.TenantId,
		CreatedBy:     authInfo.UserId,
		UpdatedBy:     authInfo.UserId,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
	return c.baseApplicationUserRepo.Create(ctx, item)
}

// DeleteApplicationUser 移除授权（软删）。
func (c *BaseApplicationCase) DeleteApplicationUser(ctx context.Context, applicationID, userID int64) error {
	uq := c.baseApplicationUserRepo.Query(ctx)
	list, err := c.baseApplicationUserRepo.List(ctx,
		repository.Where(uq.BaseApplicationUser.ApplicationID.Eq(applicationID)),
		repository.Where(uq.BaseApplicationUser.UserID.Eq(userID)),
	)
	if err != nil {
		return err
	}
	for _, item := range list {
		if err := c.baseApplicationUserRepo.DeleteByID(ctx, item.ID); err != nil {
			return err
		}
	}
	return nil
}
