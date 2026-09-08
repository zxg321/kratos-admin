package main

import (
	gisbackend "github.com/liujitcn/kratos-admin/gis/backend"
	"github.com/liujitcn/kratos-core/job"
	"github.com/liujitcn/kratos-core/module"
	"github.com/liujitcn/kratos-core/queue"
	"github.com/liujitcn/kratos-core/sse"
)

// provideResources 将 GIS 静态资源转换为 Core 静态资源集合。
func provideResources(gisResources gisbackend.GisResources) module.Resources {
	return module.Resources(gisResources)
}

// provideModules 将 GIS 协议模块转换为 Core 协议模块集合。
func provideModules(gisModules gisbackend.GisModules) module.Modules {
	return module.Modules(gisModules)
}

// provideTasks 将 GIS 定时任务转换为 Core 定时任务集合。
func provideTasks(gisTasks gisbackend.GisTasks) job.Tasks {
	return job.Tasks(gisTasks)
}

// provideStreams 将 GIS SSE 业务流转换为 Core SSE 业务流集合。
func provideStreams(gisStreams gisbackend.GisStreams) sse.Streams {
	return sse.Streams(gisStreams)
}

// provideConsumers 将 GIS 队列消费者转换为 Core 队列消费者集合。
func provideConsumers(gisConsumers gisbackend.GisConsumers) queue.Consumers {
	return queue.Consumers(gisConsumers)
}
