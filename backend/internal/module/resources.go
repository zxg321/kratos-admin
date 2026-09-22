package module

import (
	"fmt"
	"io/fs"

	_const "github.com/liujitcn/kratos-admin/backend/internal/const"
	"github.com/liujitcn/kratos-admin/backend/internal/data/gen/data"
	"github.com/liujitcn/kratos-admin/backend/internal/i18n"
	"github.com/liujitcn/kratos-admin/backend/internal/openapi"
	"github.com/liujitcn/kratos-core/module"
	"github.com/liujitcn/kratos-kit/database/gorm"
)

type resource struct {
	projectKey  string
	projectName string
	models      module.Models
	i18n        fs.FS
	openAPI     fs.FS
	migrations  module.Migrations
}

// ProjectKey 返回 Admin 项目的稳定标识。
func (r *resource) ProjectKey() string {
	return r.projectKey
}

// ProjectName 返回 Admin 项目的展示名称。
func (r *resource) ProjectName() string {
	return r.projectName
}

// Models 返回 Admin 数据库自动迁移所需的模型。
func (r *resource) Models() module.Models {
	return r.models
}

// I18n 返回 Admin 项目语言文件系统。
func (r *resource) I18n() fs.FS {
	return r.i18n
}

// OpenAPI 返回 Admin OpenAPI 文件系统。
func (r *resource) OpenAPI() fs.FS {
	return r.openAPI
}

// Migrations 返回 Admin 数据库迁移资源。
func (r *resource) Migrations() module.Migrations {
	return r.migrations
}

var _ module.Resource = (*resource)(nil)

// NewModuleResources 创建 Admin 在业务对象构建前提供给 Core 的静态资源。
// 迁移资源暂不注册：当前 kratos-kit 迁移执行器仅支持 mysql/doris，postgres 下启动会被
// 资产校验拒绝；postgres 初始化数据已在开发库执行完毕（base_migration 有记录），
// 待上游迁移器支持 postgres 后再恢复注册。
func NewModuleResources() module.Resources {
	models := data.Models()
	return module.Resources{
		&resource{
			projectKey:  fmt.Sprintf("%s-%s", _const.Project, _const.AppID),
			projectName: _const.Name,
			models:      module.Models{gorm.DefaultClientName: models},
			openAPI:     openapi.Assets(),
			i18n:        i18n.Assets(),
		},
	}
}
