package kit

import (
	"context"

	"github.com/liujitcn/kratos-kit/database/gorm"
	"github.com/liujitcn/kratos-kit/redact"
)

// RedactPolicyResolver 将 GIS 的脱敏策略转换为运行时策略。
//
// 精简骨架阶段不加载脱敏策略，Resolve 始终返回未命中，
// 请求和响应字段按默认规则处理（不做额外脱敏）。
type RedactPolicyResolver struct{}

// NewRedactPolicyResolver 创建脱敏策略解析器。
func NewRedactPolicyResolver(_ map[string]*gorm.Client) (*RedactPolicyResolver, error) {
	return &RedactPolicyResolver{}, nil
}

// Resolve 返回未命中，GIS 暂不启用运行时字段脱敏。
func (r *RedactPolicyResolver) Resolve(_ context.Context, _ string) (redact.FieldPolicy, bool) {
	return redact.FieldPolicy{}, false
}

var _ redact.PolicyResolver = (*RedactPolicyResolver)(nil)
