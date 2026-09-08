package core

import (
	"context"

	coredata "github.com/liujitcn/kratos-core/data"
	"github.com/liujitcn/kratos-kit/database/gorm"
)

// LogStoreAdapter 将 GIS 的日志存储适配为 Core 审计日志接口。
//
// 精简骨架阶段不持久化审计日志，写入与存在性判断均为空操作。
type LogStoreAdapter struct{}

// NewLogStoreAdapter 创建日志存储适配器。
func NewLogStoreAdapter(_ map[string]*gorm.Client) (*LogStoreAdapter, error) {
	return &LogStoreAdapter{}, nil
}

// CreateAPI 空操作：GIS 不持久化 API 访问日志。
func (s *LogStoreAdapter) CreateAPI(_ context.Context, _ coredata.APILogRecord) error {
	return nil
}

// ExistsAPI 返回不存在，避免去重判断干扰空实现。
func (s *LogStoreAdapter) ExistsAPI(_ context.Context, _ int64) (bool, error) {
	return false, nil
}

// CreatePolicyEvaluation 空操作：GIS 不持久化策略评估日志。
func (s *LogStoreAdapter) CreatePolicyEvaluation(_ context.Context, _ coredata.PolicyEvaluationLogRecord) error {
	return nil
}

// ExistsPolicyEvaluation 返回不存在，避免去重判断干扰空实现。
func (s *LogStoreAdapter) ExistsPolicyEvaluation(_ context.Context, _ int64) (bool, error) {
	return false, nil
}

var _ coredata.LogStore = (*LogStoreAdapter)(nil)
