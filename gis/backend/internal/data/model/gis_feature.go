package model

import "time"

// GisFeature GIS 要素。
type GisFeature struct {
	ID         int64     `gorm:"column:id;primaryKey;autoIncrement" json:"id"`           // 要素ID
	TenantID   int64     `gorm:"column:tenant_id;not null;default:1" json:"tenant_id"`   // 租户ID
	LayerID    int64     `gorm:"column:layer_id;not null" json:"layer_id"`               // 图层ID
	Geometry   []byte    `gorm:"column:geometry;type:geometry;not null" json:"-"`        // 几何（内部字节）
	Properties string    `gorm:"column:properties;type:json;not null" json:"properties"` // 属性配置
	CreatedBy  int64     `gorm:"column:created_by;not null;default:0" json:"created_by"` // 创建人ID
	CreatedAt  time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`     // 创建时间
	UpdatedAt  time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`     // 更新时间
}

// TableName 返回表名。
func (GisFeature) TableName() string { return "gis_feature" }
