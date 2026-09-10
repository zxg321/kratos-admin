package biz

import (
	authData "github.com/liujitcn/kratos-kit/auth/data"
	_const "github.com/liujitcn/kratos-core/const"
)

// TenantScope 描述列表查询应限定的租户范围。
type TenantScope struct {
	// FilterByTenant 是否强制按租户过滤。
	FilterByTenant bool
	// TenantID 需过滤的租户编号。
	TenantID int64
}

// resolveTenantScope 根据当前登录身份与请求租户解析列表查询范围。
// 平台超级管理员可查看全部或按请求指定租户过滤；非超级用户固定限定在当前租户，忽略请求传入的租户编号。
func resolveTenantScope(authInfo *authData.UserTokenPayload, reqTenantID int64) TenantScope {
	isSuper := authInfo != nil && authInfo.RoleCode == _const.BASE_ROLE_CODE_SUPER
	if isSuper {
		if reqTenantID > 0 {
			return TenantScope{FilterByTenant: true, TenantID: reqTenantID}
		}
		return TenantScope{}
	}
	if authInfo == nil {
		// 无身份时按空范围处理（安全兜底），默认过滤到租户 0 以返回空集。
		return TenantScope{FilterByTenant: true, TenantID: 0}
	}
	return TenantScope{FilterByTenant: true, TenantID: authInfo.TenantId}
}