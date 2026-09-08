package model

import "time"

// GisLayer GIS 图层。
type GisLayer struct {
	ID        int64     `gorm:"column:id;primaryKey;autoIncrement" json:"id"`           // 图层ID
	TenantID  int64     `gorm:"column:tenant_id;not null;default:1" json:"tenant_id"`   // 租户ID
	Name      string    `gorm:"column:name;size:128;not null" json:"name"`              // 图层名称
	LayerType string    `gorm:"column:layer_type;size:16;not null" json:"layer_type"`   // 图层类型
	Style     string    `gorm:"column:style;type:json;not null" json:"style"`           // 样式配置
	Visible   bool      `gorm:"column:visible;not null;default:true" json:"visible"`    // 是否可见
	Status    int32     `gorm:"column:status;not null;default:1" json:"status"`         // 状态
	CreatedBy int64     `gorm:"column:created_by;not null;default:0" json:"created_by"` // 创建人ID
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`     // 创建时间
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`     // 更新时间
}

// TableName 返回表名。
func (GisLayer) TableName() string { return "gis_layer" }
