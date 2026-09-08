package core

import (
	"context"

	coredata "github.com/liujitcn/kratos-core/data"
	"github.com/liujitcn/kratos-kit/database/gorm"
)

// APIStoreAdapter 将 GIS 的接口存储适配为 Core 资源接口。
//
// 精简骨架阶段不维护 OpenAPI 接口快照，全部方法为空操作，
// 保证启动期资源同步幂等执行。
type APIStoreAdapter struct{}

// NewAPIStoreAdapter 创建接口存储适配器。
func NewAPIStoreAdapter(_ map[string]*gorm.Client) (*APIStoreAdapter, error) {
	return &APIStoreAdapter{}, nil
}

// ReplaceAll 空操作：GIS 不维护接口快照。
func (s *APIStoreAdapter) ReplaceAll(_ context.Context, _ []*coredata.APIRecord) error {
	return nil
}

// ReplaceAllTranslations 空操作：GIS 不维护接口翻译快照。
func (s *APIStoreAdapter) ReplaceAllTranslations(_ context.Context, _ []*coredata.APITranslationRecord) error {
	return nil
}

// ListForPolicy 返回空接口列表，不参与权限重建。
func (s *APIStoreAdapter) ListForPolicy(_ context.Context) ([]*coredata.APIPolicyRecord, error) {
	return nil, nil
}

var _ coredata.APIStore = (*APIStoreAdapter)(nil)
