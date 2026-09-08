package biz

import (
	"context"
	"encoding/json"

	adminv1 "github.com/liujitcn/kratos-admin/gis/backend/api/gen/go/gis/admin/v1"
	commonv1 "github.com/liujitcn/kratos-admin/gis/backend/api/gen/go/gis/common/v1"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/data"
	"github.com/go-kratos/kratos/v3/errors"
	"github.com/go-kratos/kratos/v3/log"
)

// FeatureCase 要素业务用例。
type FeatureCase struct {
	spatialRepo data.SpatialRepo
	layerRepo   *data.LayerRepo
}

// NewFeatureCase 创建要素业务用例。
func NewFeatureCase(spatialRepo data.SpatialRepo, layerRepo *data.LayerRepo) *FeatureCase {
	return &FeatureCase{spatialRepo: spatialRepo, layerRepo: layerRepo}
}

// validateGeoJSON 校验 GeoJSON geometry 文本格式。
func validateGeoJSON(raw string) error {
	var v map[string]interface{}
	if err := json.Unmarshal([]byte(raw), &v); err != nil {
		return errors.BadRequest("GEOMETRY_INVALID", "几何格式错误")
	}
	if t, ok := v["type"].(string); !ok || t == "" {
		return errors.BadRequest("GEOMETRY_TYPE_INVALID", "几何类型缺失")
	}
	return nil
}

// PageFeature 分页查询要素。
func (c *FeatureCase) PageFeature(ctx context.Context, req *adminv1.PageFeatureRequest) (*adminv1.PageFeatureResponse, error) {
	list, total, err := c.spatialRepo.PageFeature(ctx, 1, req.GetLayerId(), req.GetPage(), req.GetPageSize())
	if err != nil {
		log.Error("PageFeature", "error", err)
		return nil, errors.InternalServer("FEATURE_PAGE_ERROR", "查询要素失败")
	}
	return &adminv1.PageFeatureResponse{List: toFeatureForms(list), Total: total}, nil
}

// QueryFeatureByBBox 按 bbox 查询要素。
func (c *FeatureCase) QueryFeatureByBBox(ctx context.Context, req *adminv1.QueryFeatureByBBoxRequest) (*adminv1.QueryFeatureByBBoxResponse, error) {
	list, err := c.spatialRepo.QueryFeatureByBBox(ctx, 1, req.GetLayerId(),
		req.GetSouth(), req.GetWest(), req.GetNorth(), req.GetEast(), req.GetLimit())
	if err != nil {
		log.Error("QueryFeatureByBBox", "error", err)
		return nil, errors.InternalServer("FEATURE_BBOX_ERROR", "查询要素失败")
	}
	return &adminv1.QueryFeatureByBBoxResponse{List: toFeatureForms(list)}, nil
}

// GetFeature 查询要素详情。
func (c *FeatureCase) GetFeature(ctx context.Context, id int64) (*adminv1.FeatureForm, error) {
	sf, err := c.spatialRepo.GetFeature(ctx, 1, id)
	if err != nil {
		log.Error("GetFeature", "id", id, "error", err)
		return nil, errors.NotFound("FEATURE_NOT_FOUND", "要素不存在")
	}
	return toFeatureForm(sf), nil
}

// CreateFeature 创建要素。
func (c *FeatureCase) CreateFeature(ctx context.Context, feature *adminv1.FeatureForm) error {
	if feature == nil || feature.GetGeometry() == nil {
		return errors.BadRequest("GEOMETRY_REQUIRED", "几何不能为空")
	}
	if err := validateGeoJSON(feature.GetGeometry().GetCoordinates()); err != nil {
		return err
	}
	_, err := c.spatialRepo.InsertFeature(ctx, 1, feature.GetLayerId(), 0, feature.GetGeometry().GetCoordinates(), feature.GetProperties())
	return err
}

// UpdateFeature 更新要素。
func (c *FeatureCase) UpdateFeature(ctx context.Context, id int64, feature *adminv1.FeatureForm) error {
	if feature == nil || feature.GetGeometry() == nil {
		return errors.BadRequest("GEOMETRY_REQUIRED", "几何不能为空")
	}
	if err := validateGeoJSON(feature.GetGeometry().GetCoordinates()); err != nil {
		return err
	}
	return c.spatialRepo.UpdateFeature(ctx, 1, id, feature.GetGeometry().GetCoordinates(), feature.GetProperties())
}

// DeleteFeature 删除要素。
func (c *FeatureCase) DeleteFeature(ctx context.Context, ids string) error {
	idsInt := parseIDs(ids)
	if len(idsInt) == 0 {
		return errors.BadRequest("FEATURE_ID_INVALID", "要素ID不能为空")
	}
	return c.spatialRepo.DeleteFeatures(ctx, 1, idsInt)
}

func toFeatureForm(sf *data.SpatialFeature) *adminv1.FeatureForm {
	return &adminv1.FeatureForm{
		Id:         sf.ID,
		LayerId:    sf.LayerID,
		Geometry:   &commonv1.Geometry{Type: "Geometry", Coordinates: sf.Geometry, Srid: int32Ptr(4326)},
		Properties: sf.Properties,
		CreatedAt:  strPtr(sf.CreatedAt),
	}
}

func toFeatureForms(list []*data.SpatialFeature) []*adminv1.FeatureForm {
	out := make([]*adminv1.FeatureForm, 0, len(list))
	for _, sf := range list {
		out = append(out, toFeatureForm(sf))
	}
	return out
}

func int32Ptr(v int32) *int32 {
	return &v
}
