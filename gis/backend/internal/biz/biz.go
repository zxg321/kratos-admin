package biz

import (
	"github.com/google/wire"
)

// ProviderSet 汇总 GIS 业务用例依赖注入提供者。
var ProviderSet = wire.NewSet(
	NewLayerCase,
	NewFeatureCase,
)
