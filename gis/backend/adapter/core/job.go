package core

import (
	"context"

	coredata "github.com/liujitcn/kratos-core/data"
	kitgorm "github.com/liujitcn/kratos-kit/database/gorm"
	"gorm.io/gorm"
)

// JobStoreAdapter 将 GIS 的任务存储适配为 Core 任务接口。
//
// 精简骨架阶段不持久化定时任务，列表查询返回空、单条查询返回未找到，
// 保证调度器启动无任务且行为幂等。
type JobStoreAdapter struct{}

// NewJobStoreAdapter 创建任务存储适配器。
func NewJobStoreAdapter(_ map[string]*kitgorm.Client) (*JobStoreAdapter, error) {
	return &JobStoreAdapter{}, nil
}

// List 返回空任务列表。
func (s *JobStoreAdapter) List(_ context.Context) ([]coredata.JobRecord, error) {
	return nil, nil
}

// FindByID 返回未找到，避免调度器按不存在任务继续调度。
func (s *JobStoreAdapter) FindByID(_ context.Context, _ int64) (coredata.JobRecord, error) {
	return coredata.JobRecord{}, gorm.ErrRecordNotFound
}

// UpdateEntryID 空操作：GIS 不持久化任务入口编号。
func (s *JobStoreAdapter) UpdateEntryID(_ context.Context, _ int64, _ int32) error {
	return nil
}

// CreateLog 空操作：GIS 不持久化任务执行日志。
func (s *JobStoreAdapter) CreateLog(_ context.Context, _ coredata.JobLogRecord) error {
	return nil
}

var _ coredata.JobStore = (*JobStoreAdapter)(nil)
