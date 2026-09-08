package gis

import (
	"github.com/google/wire"
	coreadapter "github.com/liujitcn/kratos-admin/gis/backend/adapter/core"
	kitadapter "github.com/liujitcn/kratos-admin/gis/backend/adapter/kit"
	gisModule "github.com/liujitcn/kratos-admin/gis/backend/internal/module"
	"github.com/liujitcn/kratos-core/job"
	"github.com/liujitcn/kratos-core/module"
	"github.com/liujitcn/kratos-core/queue"
	"github.com/liujitcn/kratos-core/sse"
	configv1 "github.com/liujitcn/kratos-kit/api/gen/go/config/v1"
	authnEngine "github.com/liujitcn/kratos-kit/auth/authn/engine"
	"github.com/liujitcn/kratos-kit/auth/authz/engine"
	"github.com/liujitcn/kratos-kit/database/gorm"
)

// GisResources 表示 GIS 提供的静态资源集合。
type GisResources module.Resources

// GisModules 表示 GIS 提供的协议模块集合。
type GisModules module.Modules

// GisTasks 表示 GIS 提供的定时任务集合。
type GisTasks job.Tasks

// GisStreams 表示 GIS 提供的 SSE 业务流集合。
type GisStreams sse.Streams

// GisConsumers 表示 GIS 提供的队列消费者集合。
type GisConsumers queue.Consumers

// ProviderSet 提供 GIS 业务、模块和运行时能力，交由 kratos-core.ProviderSet 装配。
var ProviderSet = wire.NewSet(
	coreadapter.ProviderSet,
	kitadapter.ProviderSet,
	NewModuleResources,
	NewModules,
	NewTasks,
	NewStreams,
	NewQueueConsumers,
)

// NewModuleResources 返回 GIS 提供给 Core 的模型、迁移和 OpenAPI 资源。
func NewModuleResources() GisResources {
	return GisResources(gisModule.NewModuleResources())
}

// NewModules 创建 GIS 注册到 Core 的协议模块集合。
func NewModules(
	config *configv1.Bootstrap,
	databases map[string]*gorm.Client,
	authorizer engine.Engine,
	authenticator authnEngine.Authenticator,
) (GisModules, func(), error) {
	modules, cleanup, err := gisModule.BuildModules(config, databases, authorizer, authenticator)
	return GisModules(modules), cleanup, err
}

// NewTasks 创建 GIS 提供给 Core 调度器的定时任务集合，当前模块暂无任务。
func NewTasks() (GisTasks, func(), error) {
	return GisTasks{}, func() {}, nil
}

// NewStreams 创建 GIS 提供给 Core SSE 服务的业务流集合，当前模块暂无业务流。
func NewStreams() (GisStreams, func(), error) {
	return GisStreams{}, func() {}, nil
}

// NewQueueConsumers 创建 GIS 提供给 Core 队列服务的消费者集合，当前模块暂无消费者。
func NewQueueConsumers() (GisConsumers, func(), error) {
	return GisConsumers{}, func() {}, nil
}
