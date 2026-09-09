package impl

import (
	"context"
	"fmt"
	"strings"

	"github.com/liujitcn/kratos-admin/gis/backend/internal/data"
	"gorm.io/gorm"
)

// MysqlSpatialRepo MySQL 空间扩展实现。
type MysqlSpatialRepo struct {
	db *gorm.DB
}

// NewMysqlSpatialRepo 创建 MySQL 空间扩展实现。
func NewMysqlSpatialRepo(db *gorm.DB) data.SpatialRepo {
	return &MysqlSpatialRepo{db: db}
}

var _ data.SpatialRepo = (*MysqlSpatialRepo)(nil)

// InsertFeature 插入要素。通过底层 *sql.DB 获取自增 ID。
func (r *MysqlSpatialRepo) InsertFeature(ctx context.Context, tenantID, layerID, createdBy int64, geometry, properties string) (int64, error) {
	sqlDB, err := r.db.DB()
	if err != nil {
		return 0, err
	}
	res, err := sqlDB.ExecContext(ctx,
		`INSERT INTO gis_feature (tenant_id, layer_id, geometry, properties, created_by)
		 VALUES (?, ?, ST_GeomFromGeoJSON(?), ?, ?)`,
		tenantID, layerID, geometry, properties, createdBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

// UpdateFeature 更新要素几何与属性。
func (r *MysqlSpatialRepo) UpdateFeature(ctx context.Context, tenantID, id int64, geometry, properties string) error {
	return r.db.WithContext(ctx).Exec(
		`UPDATE gis_feature SET geometry = ST_GeomFromGeoJSON(?), properties = ? WHERE id = ? AND tenant_id = ?`,
		geometry, properties, id, tenantID,
	).Error
}

// DeleteFeatures 批量删除要素。
func (r *MysqlSpatialRepo) DeleteFeatures(ctx context.Context, tenantID int64, ids []int64) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, 0, len(ids))
	args := make([]interface{}, 0, len(ids)+1)
	args = append(args, tenantID)
	for _, id := range ids {
		placeholders = append(placeholders, "?")
		args = append(args, id)
	}
	return r.db.WithContext(ctx).Exec(
		fmt.Sprintf(`DELETE FROM gis_feature WHERE tenant_id = ? AND id IN (%s)`, strings.Join(placeholders, ",")),
		args...,
	).Error
}

// GetFeature 查询要素详情。
func (r *MysqlSpatialRepo) GetFeature(ctx context.Context, tenantID, id int64) (*data.SpatialFeature, error) {
	var out data.SpatialFeature
	err := r.db.WithContext(ctx).Raw(
		`SELECT id, layer_id, ST_AsGeoJSON(geometry) AS geometry, properties, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
		 FROM gis_feature WHERE tenant_id = ? AND id = ?`,
		tenantID, id,
	).Scan(&out).Error
	if err != nil {
		return nil, err
	}
	return &out, nil
}

// PageFeature 分页查询要素。
func (r *MysqlSpatialRepo) PageFeature(ctx context.Context, tenantID, layerID, page, pageSize int64) ([]*data.SpatialFeature, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 500 {
		pageSize = 20
	}
	var total int64
	if err := r.db.WithContext(ctx).Table("gis_feature").
		Where("tenant_id = ? AND layer_id = ?", tenantID, layerID).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []*data.SpatialFeature
	err := r.db.WithContext(ctx).Raw(
		`SELECT id, layer_id, ST_AsGeoJSON(geometry) AS geometry, properties, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
		 FROM gis_feature WHERE tenant_id = ? AND layer_id = ?
		 ORDER BY id DESC LIMIT ? OFFSET ?`,
		tenantID, layerID, pageSize, (page-1)*pageSize,
	).Scan(&list).Error
	return list, total, err
}

// QueryFeatureByBBox 按 bbox 查询要素。
func (r *MysqlSpatialRepo) QueryFeatureByBBox(ctx context.Context, tenantID, layerID int64, south, west, north, east float64, limit int64) ([]*data.SpatialFeature, error) {
	if limit < 1 || limit > 5000 {
		limit = 1000
	}
	// 构造 bbox 闭合多边形（WGS84）。MySQL 的 ST_GeomFromText 对 SRID 4326 期望
	// WKT 坐标为（纬度 经度），故每个点按 south/west、south/east、north/east、
	// north/west 的（lat lon）顺序拼接。
	polygon := fmt.Sprintf("POLYGON((%f %f,%f %f,%f %f,%f %f,%f %f))",
		south, west, south, east, north, east, north, west, south, west)
	var list []*data.SpatialFeature
	err := r.db.WithContext(ctx).Raw(
		`SELECT id, layer_id, ST_AsGeoJSON(geometry) AS geometry, properties, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
		 FROM gis_feature
		 WHERE tenant_id = ? AND layer_id = ?
		   AND ST_Intersects(geometry, ST_GeomFromText(?, 4326))
		 ORDER BY id DESC LIMIT ?`,
		tenantID, layerID, polygon, limit,
	).Scan(&list).Error
	return list, err
}

// 说明：MySQL 8.0.13+ 对 SRID 4326（WGS84）的几何，ST_Length 直接返回球面
// 距离（米）、ST_Area 直接返回球面面积（平方米）、ST_Buffer 的缓冲距离参数
// 也直接以米为单位，因此无需再做度↔米换算。

// MeasureDistance 测量折线长度（米，球面）。
func (r *MysqlSpatialRepo) MeasureDistance(ctx context.Context, tenantID int64, geometry string) (float64, error) {
	var meters float64
	if err := r.db.WithContext(ctx).Raw(
		`SELECT ST_Length(ST_GeomFromGeoJSON(?))`, geometry,
	).Scan(&meters).Error; err != nil {
		return 0, err
	}
	return meters, nil
}

// MeasureArea 测量多边形面积（平方米，球面）。
func (r *MysqlSpatialRepo) MeasureArea(ctx context.Context, tenantID int64, geometry string) (float64, error) {
	var squareMeters float64
	if err := r.db.WithContext(ctx).Raw(
		`SELECT ST_Area(ST_GeomFromGeoJSON(?))`, geometry,
	).Scan(&squareMeters).Error; err != nil {
		return 0, err
	}
	return squareMeters, nil
}

// BufferGeometry 生成缓冲区，返回 GeoJSON geometry 文本。缓冲距离以米为单位。
func (r *MysqlSpatialRepo) BufferGeometry(ctx context.Context, tenantID int64, geometry string, distanceMeters float64) (string, error) {
	var result string
	if err := r.db.WithContext(ctx).Raw(
		`SELECT ST_AsGeoJSON(ST_Buffer(ST_GeomFromGeoJSON(?), ?))`,
		geometry, distanceMeters,
	).Scan(&result).Error; err != nil {
		return "", err
	}
	return result, nil
}

// QueryFeatureWithin 查询范围 geometry 内的要素。
func (r *MysqlSpatialRepo) QueryFeatureWithin(ctx context.Context, tenantID, layerID int64, geometry string, limit int64) ([]*data.SpatialFeature, error) {
	if limit < 1 || limit > 5000 {
		limit = 1000
	}
	var list []*data.SpatialFeature
	err := r.db.WithContext(ctx).Raw(
		`SELECT id, layer_id, ST_AsGeoJSON(geometry) AS geometry, properties, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
		 FROM gis_feature
		 WHERE tenant_id = ? AND layer_id = ?
		   AND ST_Within(geometry, ST_GeomFromGeoJSON(?))
		 ORDER BY id DESC LIMIT ?`,
		tenantID, layerID, geometry, limit,
	).Scan(&list).Error
	return list, err
}

// QueryFeatureIntersects 查询与范围 geometry 相交的要素。
func (r *MysqlSpatialRepo) QueryFeatureIntersects(ctx context.Context, tenantID, layerID int64, geometry string, limit int64) ([]*data.SpatialFeature, error) {
	if limit < 1 || limit > 5000 {
		limit = 1000
	}
	var list []*data.SpatialFeature
	err := r.db.WithContext(ctx).Raw(
		`SELECT id, layer_id, ST_AsGeoJSON(geometry) AS geometry, properties, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
		 FROM gis_feature
		 WHERE tenant_id = ? AND layer_id = ?
		   AND ST_Intersects(geometry, ST_GeomFromGeoJSON(?))
		 ORDER BY id DESC LIMIT ?`,
		tenantID, layerID, geometry, limit,
	).Scan(&list).Error
	return list, err
}
