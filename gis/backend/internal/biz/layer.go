package biz

import (
	"context"
	"strconv"
	"strings"

	adminv1 "github.com/liujitcn/kratos-admin/gis/backend/api/gen/go/gis/admin/v1"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/data"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/data/model"
	"github.com/go-kratos/kratos/v3/errors"
	"github.com/go-kratos/kratos/v3/log"
)

// LayerCase 图层业务用例。
type LayerCase struct {
	layerRepo *data.LayerRepo
}

// NewLayerCase 创建图层业务用例。
func NewLayerCase(layerRepo *data.LayerRepo) *LayerCase {
	return &LayerCase{layerRepo: layerRepo}
}

// PageLayer 分页查询图层。
func (c *LayerCase) PageLayer(ctx context.Context, req *adminv1.PageLayerRequest) (*adminv1.PageLayerResponse, error) {
	page := req.GetPage()
	if page < 1 {
		page = 1
	}
	pageSize := req.GetPageSize()
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	list, total, err := c.layerRepo.Page(ctx, req.GetName(), req.GetStatus(), page, pageSize)
	if err != nil {
		log.Error("PageLayer", "error", err)
		return nil, errors.InternalServer("LAYER_PAGE_ERROR", "查询图层失败")
	}
	items := make([]*adminv1.LayerForm, 0, len(list))
	for _, m := range list {
		items = append(items, toLayerForm(m))
	}
	return &adminv1.PageLayerResponse{List: items, Total: total}, nil
}

// ListLayer 查询全部图层。
func (c *LayerCase) ListLayer(ctx context.Context, req *adminv1.ListLayerRequest) (*adminv1.ListLayerResponse, error) {
	list, err := c.layerRepo.List(ctx, req.GetStatus())
	if err != nil {
		log.Error("ListLayer", "error", err)
		return nil, errors.InternalServer("LAYER_LIST_ERROR", "查询图层失败")
	}
	items := make([]*adminv1.LayerForm, 0, len(list))
	for _, m := range list {
		items = append(items, toLayerForm(m))
	}
	return &adminv1.ListLayerResponse{List: items}, nil
}

// GetLayer 查询图层详情。
func (c *LayerCase) GetLayer(ctx context.Context, id int64) (*adminv1.LayerForm, error) {
	m, err := c.layerRepo.Get(ctx, id)
	if err != nil {
		log.Error("GetLayer", "id", id, "error", err)
		return nil, errors.NotFound("LAYER_NOT_FOUND", "图层不存在")
	}
	return toLayerForm(m), nil
}

// CreateLayer 创建图层。
func (c *LayerCase) CreateLayer(ctx context.Context, layer *adminv1.LayerForm) error {
	if err := validateLayerType(layer.GetLayerType()); err != nil {
		return err
	}
	m := &model.GisLayer{
		TenantID:  1,
		Name:      layer.GetName(),
		LayerType: layer.GetLayerType(),
		Style:     layer.GetStyle(),
		Visible:   layer.GetVisible(),
		Status:    layer.GetStatus(),
		CreatedBy: 0,
	}
	if m.Status == 0 {
		m.Status = 1
	}
	if m.Style == "" {
		m.Style = "{}"
	}
	return c.layerRepo.Create(ctx, m)
}

// UpdateLayer 更新图层。
func (c *LayerCase) UpdateLayer(ctx context.Context, id int64, layer *adminv1.LayerForm) error {
	m, err := c.layerRepo.Get(ctx, id)
	if err != nil {
		return errors.NotFound("LAYER_NOT_FOUND", "图层不存在")
	}
	m.Name = layer.GetName()
	m.LayerType = layer.GetLayerType()
	m.Style = layer.GetStyle()
	m.Visible = layer.GetVisible()
	m.Status = layer.GetStatus()
	return c.layerRepo.Update(ctx, m)
}

// DeleteLayer 删除图层。
func (c *LayerCase) DeleteLayer(ctx context.Context, ids string) error {
	idsInt := parseIDs(ids)
	if len(idsInt) == 0 {
		return errors.BadRequest("LAYER_ID_INVALID", "图层ID不能为空")
	}
	return c.layerRepo.Delete(ctx, idsInt)
}

func validateLayerType(t string) error {
	switch t {
	case "point", "line", "polygon":
		return nil
	default:
		return errors.BadRequest("LAYER_TYPE_INVALID", "图层类型仅支持 point/line/polygon")
	}
}

func parseIDs(ids string) []int64 {
	parts := strings.Split(ids, ",")
	out := make([]int64, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		v, err := strconv.ParseInt(p, 10, 64)
		if err == nil && v > 0 {
			out = append(out, v)
		}
	}
	return out
}

func toLayerForm(m *model.GisLayer) *adminv1.LayerForm {
	return &adminv1.LayerForm{
		Id:        m.ID,
		Name:      m.Name,
		LayerType: m.LayerType,
		Style:     m.Style,
		Visible:   m.Visible,
		Status:    m.Status,
		CreatedAt: strPtr(m.CreatedAt.Format("2006-01-02 15:04:05")),
	}
}

func strPtr(s string) *string {
	return &s
}
