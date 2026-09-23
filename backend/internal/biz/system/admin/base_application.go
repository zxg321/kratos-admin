package biz

import (
	"context"
	"fmt"

	systemadminv1 "github.com/liujitcn/kratos-admin/backend/api/gen/go/system/admin/v1"

	adminv1 "github.com/liujitcn/kratos-admin/backend/api/gen/go/system/admin/v1"
	commonv1 "github.com/liujitcn/kratos-core/api/gen/go/common/v1"

	"github.com/liujitcn/kratos-admin/backend/internal/data/gen/data"
	"github.com/liujitcn/kratos-admin/backend/internal/data/gen/models"
	"github.com/liujitcn/kratos-core/biz"

	"github.com/liujitcn/go-utils/mapper"
	_string "github.com/liujitcn/go-utils/string"
	"github.com/liujitcn/gorm-kit/repository"
)

// BaseApplicationCase 应用信息业务实例。
type BaseApplicationCase struct {
	*biz.BaseCase
	*data.BaseApplicationRepository
	formMapper *mapper.CopierMapper[adminv1.BaseApplicationForm, models.BaseApplication]
	mapper     *mapper.CopierMapper[adminv1.BaseApplication, models.BaseApplication]
}

// NewBaseApplicationCase 创建应用信息业务实例。
func NewBaseApplicationCase(baseCase *biz.BaseCase, baseApplicationRepo *data.BaseApplicationRepository) *BaseApplicationCase {
	return &BaseApplicationCase{
		BaseCase:                  baseCase,
		BaseApplicationRepository: baseApplicationRepo,
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
