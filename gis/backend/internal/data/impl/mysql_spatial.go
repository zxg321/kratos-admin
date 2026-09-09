package impl

import (
	"context"
	"fmt"
	"strings"

	"github.com/liujitcn/kratos-admin/gis/backend/internal/data"
	"gorm.io/gorm"
)

// MysqlSpatialRepo 空间扩展实现（PostGIS 方言）。
//
// 数据源已从 MySQL 迁移到 PostgreSQL + PostGIS，本实现为 PostGIS 方言：
//   - 几何入参统一 ST_SetSRID(ST_GeomFromGeoJSON(?), 4326) 显式指定 SRID；
//   - 测距/测积/缓冲使用 geography(...) 球面语义，距离单位为米、面积为平方米；
//   - bbox 多边形使用 ST_MakeEnvelope(west, south, east, north, 4326)；
//   - properties 为 JSONB 列，写入用 ?::jsonb 显式转换、读取用 properties::text。
type MysqlSpatialRepo struct {
	db *gorm.DB
}

// NewMysqlSpatialRepo 创建空间扩展实现（PostGIS）。
func NewMysqlSpatialRepo(db *gorm.DB) data.SpatialRepo {
	return &MysqlSpatialRepo{db: db}
}

var _ data.SpatialRepo = (*MysqlSpatialRepo)(nil)

// InsertFeature 插入要素。PostgreSQL 无自增 LastInsertId，通过 RETURNING 取新 ID。
func (r *MysqlSpatialRepo) InsertFeature(ctx context.Context, tenantID, layerID, createdBy int64, geometry, properties string) (int64, error) {
	sqlDB, err := r.db.DB()
	if err != nil {
		return 0, err
	}
	var id int64
	err = sqlDB.QueryRowContext(ctx,
		`INSERT INTO gis_feature (tenant_id, layer_id, geometry, properties, created_by)
		 VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), $4::jsonb, $5)
		 RETURNING id`,
		tenantID, layerID, geometry, properties, createdBy,
	).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// UpdateFeature 更新要素几何与属性。
func (r *MysqlSpatialRepo) UpdateFeature(ctx context.Context, tenantID, id int64, geometry, properties string) error {
	return r.db.WithContext(ctx).Exec(
		`UPDATE gis_feature SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(?), 4326), properties = ?::jsonb WHERE id = ? AND tenant_id = ?`,
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
		`SELECT id, layer_id, ST_AsGeoJSON(geometry) AS geometry, properties::text AS properties, to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
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
		`SELECT id, layer_id, ST_AsGeoJSON(geometry) AS geometry, properties::text AS properties, to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
		 FROM gis_feature WHERE tenant_id = ? AND layer_id = ?
		 ORDER BY id DESC LIMIT ? OFFSET ?`,
		tenantID, layerID, pageSize, (page-1)*pageSize,
	).Scan(&list).Error
	return list, total, err
}

// QueryFeatureByBBox 按 bbox 查询要素。
// bbox 多边形使用 ST_MakeEnvelope(west, south, east, north, 4326) 构造，
// 坐标顺序为（经度 纬度），与 WGS84 一致。
func (r *MysqlSpatialRepo) QueryFeatureByBBox(ctx context.Context, tenantID, layerID int64, south, west, north, east float64, limit int64) ([]*data.SpatialFeature, error) {
	if limit < 1 || limit > 5000 {
		limit = 1000
	}
	var list []*data.SpatialFeature
	err := r.db.WithContext(ctx).Raw(
		`SELECT id, layer_id, ST_AsGeoJSON(geometry) AS geometry, properties::text AS properties, to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
		 FROM gis_feature
		 WHERE tenant_id = ? AND layer_id = ?
		   AND ST_Intersects(geometry, ST_MakeEnvelope(?, ?, ?, ?, 4326))
		 ORDER BY id DESC LIMIT ?`,
		tenantID, layerID, west, south, east, north, limit,
	).Scan(&list).Error
	return list, err
}

// 说明：PostGIS 中 ST_Length/ST_Area 对 geometry(4326) 返回平面度/度²，
// 通过 geography(...) 包一层获得球面语义，距离单位为米、面积为平方米；
// ST_Buffer 的缓冲距离参数同样以米为单位。

// MeasureDistance 测量折线长度（米，球面）。
func (r *MysqlSpatialRepo) MeasureDistance(ctx context.Context, tenantID int64, geometry string) (float64, error) {
	var meters float64
	if err := r.db.WithContext(ctx).Raw(
		`SELECT ST_Length(geography(ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)))`, geometry,
	).Scan(&meters).Error; err != nil {
		return 0, err
	}
	return meters, nil
}

// MeasureArea 测量多边形面积（平方米，球面）。
func (r *MysqlSpatialRepo) MeasureArea(ctx context.Context, tenantID int64, geometry string) (float64, error) {
	var squareMeters float64
	if err := r.db.WithContext(ctx).Raw(
		`SELECT ST_Area(geography(ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)))`, geometry,
	).Scan(&squareMeters).Error; err != nil {
		return 0, err
	}
	return squareMeters, nil
}

// BufferGeometry 生成缓冲区，返回 GeoJSON geometry 文本。缓冲距离以米为单位。
func (r *MysqlSpatialRepo) BufferGeometry(ctx context.Context, tenantID int64, geometry string, distanceMeters float64) (string, error) {
	var result string
	if err := r.db.WithContext(ctx).Raw(
		`SELECT ST_AsGeoJSON(ST_Buffer(geography(ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)), ?))`,
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
		`SELECT id, layer_id, ST_AsGeoJSON(geometry) AS geometry, properties::text AS properties, to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
		 FROM gis_feature
		 WHERE tenant_id = ? AND layer_id = ?
		   AND ST_Within(geometry, ST_SetSRID(ST_GeomFromGeoJSON(?), 4326))
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
		`SELECT id, layer_id, ST_AsGeoJSON(geometry) AS geometry, properties::text AS properties, to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
		 FROM gis_feature
		 WHERE tenant_id = ? AND layer_id = ?
		   AND ST_Intersects(geometry, ST_SetSRID(ST_GeomFromGeoJSON(?), 4326))
		 ORDER BY id DESC LIMIT ?`,
		tenantID, layerID, geometry, limit,
	).Scan(&list).Error
	return list, err
}
