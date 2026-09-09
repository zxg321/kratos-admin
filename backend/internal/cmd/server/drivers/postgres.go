package drivers

import (
	"github.com/liujitcn/kratos-kit/database/gorm/driver"
	gormpg "gorm.io/driver/postgres"
)

// postgres 驱动注册：使配置 driver=postgres 时能通过 driver.Opens 建立连接。
func init() {
	driver.Opens["postgres"] = gormpg.Open
}
