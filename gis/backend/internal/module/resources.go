package module

import (
	"io/fs"

	_const "github.com/liujitcn/kratos-admin/gis/backend/internal/const"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/data/model"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/openapi"
	"github.com/liujitcn/kratos-admin/gis/backend/migration"
	"github.com/liujitcn/kratos-core/module"
	"github.com/liujitcn/kratos-kit/database/gorm"
)

type resource struct {
	projectKey  string
	projectName string
	migrations  module.Migrations
}

func (r *resource) ProjectKey() string  { return r.projectKey }
func (r *resource) ProjectName() string { return r.projectName }
func (r *resource) Models() module.Models {
	// 空间表由 SQL 迁移创建，此处仅预建迁移框架所需的集中记录表。
	return module.Models{
		gorm.DefaultClientName: []interface{}{new(model.BaseMigration)},
	}
}
func (r *resource) I18n() fs.FS { return nil }
func (r *resource) OpenAPI() fs.FS {
	return openapi.Assets()
}
func (r *resource) Migrations() module.Migrations { return r.migrations }

var _ module.Resource = (*resource)(nil)

// NewModuleResources 创建 GIS 在业务对象构建前提供给 Core 的静态资源。
func NewModuleResources() module.Resources {
	return module.Resources{
		&resource{
			projectKey:  _const.Project + "-" + _const.AppID,
			projectName: _const.Name,
			migrations: module.Migrations{
				{Name: migration.ModuleName, FS: migration.Assets(), Path: "."},
			},
		},
	}
}
