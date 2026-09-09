package module

import (
	"io/fs"

	_const "github.com/liujitcn/kratos-admin/gis/backend/internal/const"
	"github.com/liujitcn/kratos-admin/gis/backend/internal/openapi"
	"github.com/liujitcn/kratos-core/module"
)

type resource struct {
	projectKey  string
	projectName string
}

func (r *resource) ProjectKey() string  { return r.projectKey }
func (r *resource) ProjectName() string { return r.projectName }
func (r *resource) Models() module.Models {
	// PostgreSQL 数据源不使用框架集中迁移记录表 base_migration（该模型为
	// MySQL 方言，且框架迁移执行器暂不支持 postgres 驱动）；空间表 DDL 由
	// migration.RunPostgres 在连接就绪后自行执行，故不再向框架注册迁移模型。
	return module.Models{}
}
func (r *resource) I18n() fs.FS { return nil }
func (r *resource) OpenAPI() fs.FS {
	return openapi.Assets()
}
func (r *resource) Migrations() module.Migrations {
	// 框架迁移执行器（kratos-kit/database/gorm/migration）仅支持 mysql/doris
	// 数据库类型目录与驱动，postgres 迁移目录由其加载会直接报错；
	// PostGIS 迁移脚本由模块自执行（migration.RunPostgres），此处不再注册。
	return module.Migrations{}
}

var _ module.Resource = (*resource)(nil)

// NewModuleResources 创建 GIS 在业务对象构建前提供给 Core 的静态资源。
func NewModuleResources() module.Resources {
	return module.Resources{
		&resource{
			projectKey:  _const.Project + "-" + _const.AppID,
			projectName: _const.Name,
		},
	}
}
