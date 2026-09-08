package core

import (
	"github.com/google/wire"
	coredata "github.com/liujitcn/kratos-core/data"
)

// ProviderSet 提供 Core 所需的 GIS 数据适配器。
//
// GIS 当前以精简骨架运行，适配器不读取 Admin 资源表，保证启动期资源同步
// 幂等且不影响其他模块；后续接入 Admin 共享权限体系时在此替换为真实仓储。
var ProviderSet = wire.NewSet(
	NewAPIStoreAdapter,
	wire.Bind(new(coredata.APIStore), new(*APIStoreAdapter)),
	NewJobStoreAdapter,
	wire.Bind(new(coredata.JobStore), new(*JobStoreAdapter)),
	NewLogStoreAdapter,
	wire.Bind(new(coredata.LogStore), new(*LogStoreAdapter)),
	NewPermissionStoreAdapter,
	wire.Bind(new(coredata.PermissionStore), new(*PermissionStoreAdapter)),
	NewTransaction,
)
