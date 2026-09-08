package data

import (
	"context"

	"github.com/liujitcn/kratos-admin/gis/backend/internal/data/model"
	"gorm.io/gorm"
)

// permLevelRank 权限级别等级映射（越大权限越高）。
var permLevelRank = map[string]int{
	"view":  1,
	"edit":  2,
	"admin": 3,
}

// LayerRepo 图层仓储。
type LayerRepo struct {
	db *gorm.DB
}

// NewLayerRepo 创建图层仓储。
func NewLayerRepo(db *gorm.DB) *LayerRepo {
	return &LayerRepo{db: db}
}

// Page 分页查询图层。
func (r *LayerRepo) Page(ctx context.Context, name string, status int32, page, pageSize int64) ([]*model.GisLayer, int64, error) {
	q := r.db.WithContext(ctx).Model(&model.GisLayer{})
	if name != "" {
		q = q.Where("name LIKE ?", "%"+name+"%")
	}
	if status > 0 {
		q = q.Where("status = ?", status)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []*model.GisLayer
	err := q.Order("id DESC").Limit(int(pageSize)).Offset(int((page - 1) * pageSize)).Find(&list).Error
	return list, total, err
}

// List 查询全部图层（可按状态过滤）。
func (r *LayerRepo) List(ctx context.Context, status int32) ([]*model.GisLayer, error) {
	q := r.db.WithContext(ctx).Model(&model.GisLayer{}).Where("tenant_id = 1")
	if status > 0 {
		q = q.Where("status = ?", status)
	}
	var list []*model.GisLayer
	err := q.Order("id ASC").Find(&list).Error
	return list, err
}

// Get 查询图层详情。
func (r *LayerRepo) Get(ctx context.Context, id int64) (*model.GisLayer, error) {
	var m model.GisLayer
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&m).Error
	return &m, err
}

// Create 创建图层。
func (r *LayerRepo) Create(ctx context.Context, m *model.GisLayer) error {
	return r.db.WithContext(ctx).Create(m).Error
}

// Update 更新图层。
func (r *LayerRepo) Update(ctx context.Context, m *model.GisLayer) error {
	return r.db.WithContext(ctx).Model(&model.GisLayer{}).Where("id = ?", m.ID).
		Select("name", "layer_type", "style", "visible", "status").Updates(m).Error
}

// Delete 批量删除图层。
func (r *LayerRepo) Delete(ctx context.Context, ids []int64) error {
	return r.db.WithContext(ctx).Where("id IN ?", ids).Delete(&model.GisLayer{}).Error
}

// HasPermission 判断主体对图层的权限（要求 level 及以下等级权限满足 required）。
func (r *LayerRepo) HasPermission(ctx context.Context, layerID, subjectID int64, subjectType, required string) (bool, error) {
	need, ok := permLevelRank[required]
	if !ok {
		return false, nil
	}
	rows, err := r.db.WithContext(ctx).Model(&model.GisLayerPermission{}).
		Where("layer_id = ? AND subject_id = ? AND subject_type = ?", layerID, subjectID, subjectType).
		Select("perm_level").Rows()
	if err != nil {
		return false, err
	}
	defer rows.Close()
	for rows.Next() {
		var level string
		if err := rows.Scan(&level); err != nil {
			return false, err
		}
		if permLevelRank[level] >= need {
			return true, nil
		}
	}
	return false, nil
}
