package model

import "time"

// GisLayerPermission GIS 图层授权。
type GisLayerPermission struct {
	ID          int64     `gorm:"column:id;primaryKey;autoIncrement" json:"id"`              // ID
	TenantID    int64     `gorm:"column:tenant_id;not null;default:1" json:"tenant_id"`      // 租户ID
	LayerID     int64     `gorm:"column:layer_id;not null" json:"layer_id"`                  // 图层ID
	SubjectType string    `gorm:"column:subject_type;size:16;not null" json:"subject_type"`  // 主体类型
	SubjectID   int64     `gorm:"column:subject_id;not null" json:"subject_id"`              // 主体ID
	PermLevel   string    `gorm:"column:perm_level;size:16;not null" json:"perm_level"`      // 权限级别
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`        // 创建时间
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`        // 更新时间
}

// TableName 返回表名。
func (GisLayerPermission) TableName() string { return "gis_layer_permission" }
