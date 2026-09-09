package data

import (
	"context"
)

// SpatialFeature 空间要素查询结果（几何以 GeoJSON 文本返回，存储方言无关）。
type SpatialFeature struct {
	ID         int64  // 要素ID
	LayerID    int64  // 图层ID
	Geometry   string // GeoJSON geometry 文本
	Properties string // 属性 JSON 文本
	CreatedAt  string // 创建时间
}

// SpatialRepo 空间要素存储接口。MySQL 空间扩展与 PostGIS 各自实现，
// 业务层仅依赖本接口，实现存储演进与切换。
type SpatialRepo interface {
	// InsertFeature 插入要素。geometry 为 GeoJSON geometry 文本（SRID 4326），返回新要素ID。
	InsertFeature(ctx context.Context, tenantID, layerID, createdBy int64, geometry, properties string) (int64, error)
	// UpdateFeature 更新要素几何与属性。
	UpdateFeature(ctx context.Context, tenantID, id int64, geometry, properties string) error
	// DeleteFeatures 批量删除要素。
	DeleteFeatures(ctx context.Context, tenantID int64, ids []int64) error
	// GetFeature 查询要素详情。
	GetFeature(ctx context.Context, tenantID, id int64) (*SpatialFeature, error)
	// PageFeature 分页查询要素。
	PageFeature(ctx context.Context, tenantID, layerID, page, pageSize int64) ([]*SpatialFeature, int64, error)
	// QueryFeatureByBBox 按 bbox 查询要素（south/west/north/east，WGS84 度数）。
	QueryFeatureByBBox(ctx context.Context, tenantID, layerID int64, south, west, north, east float64, limit int64) ([]*SpatialFeature, error)
	// MeasureDistance 测量折线长度（米，平面近似）。geometry 为 GeoJSON geometry 文本。
	MeasureDistance(ctx context.Context, tenantID int64, geometry string) (float64, error)
	// MeasureArea 测量多边形面积（平方米，平面近似）。geometry 为 GeoJSON geometry 文本。
	MeasureArea(ctx context.Context, tenantID int64, geometry string) (float64, error)
	// BufferGeometry 生成缓冲区，返回 GeoJSON geometry 文本。distance 为缓冲距离（米）。
	BufferGeometry(ctx context.Context, tenantID int64, geometry string, distanceMeters float64) (string, error)
	// QueryFeatureWithin 查询范围 geometry 内的要素。
	QueryFeatureWithin(ctx context.Context, tenantID, layerID int64, geometry string, limit int64) ([]*SpatialFeature, error)
	// QueryFeatureIntersects 查询与范围 geometry 相交的要素。
	QueryFeatureIntersects(ctx context.Context, tenantID, layerID int64, geometry string, limit int64) ([]*SpatialFeature, error)
}
