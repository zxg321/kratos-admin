package core

import (
	"context"

	coredata "github.com/liujitcn/kratos-core/data"
	kitgorm "github.com/liujitcn/kratos-kit/database/gorm"
	"gorm.io/gorm"
)

// PermissionStoreAdapter 将 GIS 的权限存储适配为 Core 权限资源接口。
//
// 精简骨架阶段不读取 Admin 权限表：单条查询返回未找到使租户角色菜单同步
// 直接跳过，列表查询返回空使 Casbin 规则重建幂等，替换策略为空操作
// 不会影响 Admin 的权限数据。
type PermissionStoreAdapter struct{}

// NewPermissionStoreAdapter 创建权限存储适配器。
func NewPermissionStoreAdapter(_ map[string]*kitgorm.Client) (*PermissionStoreAdapter, error) {
	return &PermissionStoreAdapter{}, nil
}

// FindTenantByCode 返回未找到，使租户角色菜单同步跳过。
func (s *PermissionStoreAdapter) FindTenantByCode(_ context.Context, _ string) (coredata.TenantRecord, error) {
	return coredata.TenantRecord{}, gorm.ErrRecordNotFound
}

// ListTenants 返回空租户列表。
func (s *PermissionStoreAdapter) ListTenants(_ context.Context) ([]coredata.TenantRecord, error) {
	return nil, nil
}

// FindRoleByTenantIDAndCode 返回未找到，使租户角色菜单同步跳过。
func (s *PermissionStoreAdapter) FindRoleByTenantIDAndCode(_ context.Context, _ int64, _ string) (coredata.RoleRecord, error) {
	return coredata.RoleRecord{}, gorm.ErrRecordNotFound
}

// ListRoles 返回空角色列表。
func (s *PermissionStoreAdapter) ListRoles(_ context.Context) ([]coredata.RoleRecord, error) {
	return nil, nil
}

// ListRolesByCode 返回空角色列表。
func (s *PermissionStoreAdapter) ListRolesByCode(_ context.Context, _ string) ([]coredata.RoleRecord, error) {
	return nil, nil
}

// UpdateRoleMenus 空操作：GIS 不更新角色菜单。
func (s *PermissionStoreAdapter) UpdateRoleMenus(_ context.Context, _ coredata.RoleRecord) error {
	return nil
}

// ListMenusByIDs 返回空菜单列表。
func (s *PermissionStoreAdapter) ListMenusByIDs(_ context.Context, _ []int64) ([]coredata.MenuRecord, error) {
	return nil, nil
}

// ListPolicies 返回空策略列表。
func (s *PermissionStoreAdapter) ListPolicies(_ context.Context) ([]coredata.PolicyRecord, error) {
	return nil, nil
}

// ReplacePolicies 空操作：不替换数据库策略，避免影响 Admin 权限数据。
func (s *PermissionStoreAdapter) ReplacePolicies(_ context.Context, _ []coredata.PolicyRecord) error {
	return nil
}

var _ coredata.PermissionStore = (*PermissionStoreAdapter)(nil)
