package core

import (
	"context"
	"fmt"

	coredata "github.com/liujitcn/kratos-core/data"
	kitgorm "github.com/liujitcn/kratos-kit/database/gorm"
	"gorm.io/gorm"
)

// TransactionAdapter 将默认 GORM 客户端的事务能力适配为 Core 事务接口。
type TransactionAdapter struct {
	db *gorm.DB
}

// NewTransaction 从默认数据库客户端创建事务适配器。
func NewTransaction(databases map[string]*kitgorm.Client) (coredata.Transaction, error) {
	client, ok := databases[kitgorm.DefaultClientName]
	if !ok || client == nil || client.DB == nil {
		return nil, fmt.Errorf("默认数据源未配置")
	}
	return &TransactionAdapter{db: client.DB}, nil
}

// Transaction 在默认数据源事务中执行回调。
//
// GIS 资源同步适配器暂不访问数据库，回调直接复用原上下文执行；
// 后续业务适配器接入数据库时，应改为从事务上下文读取并复用事务查询。
func (t *TransactionAdapter) Transaction(ctx context.Context, fn func(context.Context) error) error {
	if t == nil || t.db == nil {
		return fn(ctx)
	}
	return t.db.Transaction(func(_ *gorm.DB) error {
		return fn(ctx)
	})
}

var _ coredata.Transaction = (*TransactionAdapter)(nil)
