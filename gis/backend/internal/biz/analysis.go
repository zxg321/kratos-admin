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

// AnalysisCase 空间分析业务用例。
type AnalysisCase struct {
	spatialRepo data.SpatialRepo
}

// NewAnalysisCase 创建空间分析业务用例。
func NewAnalysisCase(spatialRepo data.SpatialRepo) *AnalysisCase {
	return &AnalysisCase{spatialRepo: spatialRepo}
}

// MeasureDistance 测量折线长度（米）。
func (c *AnalysisCase) MeasureDistance(ctx context.Context, geometry *commonv1.Geometry) (*adminv1.MeasureDistanceResponse, error) {
	if err := validateAnalysisGeometry(geometry, "LineString"); err != nil {
		return nil, err
	}
	meters, err := c.spatialRepo.MeasureDistance(ctx, 1, geometry.GetCoordinates())
	if err != nil {
		log.Error("MeasureDistance", "error", err)
		return nil, errors.InternalServer("ANALYSIS_DISTANCE_ERROR", "测量距离失败")
	}
	return &adminv1.MeasureDistanceResponse{Meters: meters}, nil
}

// MeasureArea 测量多边形面积（平方米）。
func (c *AnalysisCase) MeasureArea(ctx context.Context, geometry *commonv1.Geometry) (*adminv1.MeasureAreaResponse, error) {
	if err := validateAnalysisGeometry(geometry, "Polygon"); err != nil {
		return nil, err
	}
	squareMeters, err := c.spatialRepo.MeasureArea(ctx, 1, geometry.GetCoordinates())
	if err != nil {
		log.Error("MeasureArea", "error", err)
		return nil, errors.InternalServer("ANALYSIS_AREA_ERROR", "测量面积失败")
	}
	return &adminv1.MeasureAreaResponse{SquareMeters: squareMeters}, nil
}

// BufferGeometry 生成缓冲区。
func (c *AnalysisCase) BufferGeometry(ctx context.Context, req *adminv1.BufferGeometryRequest) (*adminv1.BufferGeometryResponse, error) {
	if err := validateAnalysisGeometry(req.GetGeometry(), ""); err != nil {
		return nil, err
	}
	result, err := c.spatialRepo.BufferGeometry(ctx, 1, req.GetGeometry().GetCoordinates(), req.GetDistanceMeters())
	if err != nil {
		log.Error("BufferGeometry", "error", err)
		return nil, errors.InternalServer("ANALYSIS_BUFFER_ERROR", "生成缓冲区失败")
	}
	return &adminv1.BufferGeometryResponse{Result: &commonv1.Geometry{Type: "Polygon", Coordinates: result}}, nil
}

// QueryFeatureWithin 查询范围几何内的要素。
func (c *AnalysisCase) QueryFeatureWithin(ctx context.Context, req *adminv1.QueryFeatureWithinRequest) (*adminv1.QueryFeatureWithinResponse, error) {
	result, err := c.overlayQuery(ctx, req.GetQuery(), true)
	if err != nil {
		return nil, err
	}
	return &adminv1.QueryFeatureWithinResponse{Result: result}, nil
}

// QueryFeatureIntersects 查询与范围几何相交的要素。
func (c *AnalysisCase) QueryFeatureIntersects(ctx context.Context, req *adminv1.QueryFeatureIntersectsRequest) (*adminv1.QueryFeatureIntersectsResponse, error) {
	result, err := c.overlayQuery(ctx, req.GetQuery(), false)
	if err != nil {
		return nil, err
	}
	return &adminv1.QueryFeatureIntersectsResponse{Result: result}, nil
}

// overlayQuery 叠加查询公共逻辑。
func (c *AnalysisCase) overlayQuery(ctx context.Context, query *adminv1.OverlayQueryRequest, within bool) (*adminv1.OverlayQueryResponse, error) {
	if query == nil {
		return nil, errors.BadRequest("OVERLAY_QUERY_REQUIRED", "叠加查询条件不能为空")
	}
	if err := validateAnalysisGeometry(query.GetGeometry(), ""); err != nil {
		return nil, err
	}
	limit := query.GetLimit()
	var (
		list []*data.SpatialFeature
		err  error
	)
	if within {
		list, err = c.spatialRepo.QueryFeatureWithin(ctx, 1, query.GetLayerId(), query.GetGeometry().GetCoordinates(), limit)
	} else {
		list, err = c.spatialRepo.QueryFeatureIntersects(ctx, 1, query.GetLayerId(), query.GetGeometry().GetCoordinates(), limit)
	}
	if err != nil {
		log.Error("overlayQuery", "within", within, "error", err)
		return nil, errors.InternalServer("ANALYSIS_OVERLAY_ERROR", "叠加查询失败")
	}
	return &adminv1.OverlayQueryResponse{List: toFeatureForms(list)}, nil
}

// validateAnalysisGeometry 校验分析用几何：coordinates 必须为合法 GeoJSON geometry 文本，
// 且当期望类型非空时 type 需匹配。
func validateAnalysisGeometry(geometry *commonv1.Geometry, expectedType string) error {
	if geometry == nil {
		return errors.BadRequest("GEOMETRY_REQUIRED", "几何不能为空")
	}
	if err := validateGeoJSON(geometry.GetCoordinates()); err != nil {
		return err
	}
	if expectedType != "" {
		var v map[string]interface{}
		if err := json.Unmarshal([]byte(geometry.GetCoordinates()), &v); err == nil {
			if t, _ := v["type"].(string); t != "" && t != expectedType {
				return errors.BadRequest("GEOMETRY_TYPE_INVALID", "几何类型必须为"+expectedType)
			}
		}
	}
	return nil
}
