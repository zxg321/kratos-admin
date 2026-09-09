package main

import (
	"context"

	_const "github.com/liujitcn/kratos-admin/gis/backend/internal/const"
	configv1 "github.com/liujitcn/kratos-kit/api/gen/go/config/v1"
	"github.com/liujitcn/kratos-kit/bootstrap"

	_ "github.com/liujitcn/kratos-kit/database/gorm/driver/postgres"
	_ "github.com/liujitcn/kratos-kit/logger/zap"
	_ "github.com/liujitcn/kratos-kit/registry/consul"
)

// main 启动 GIS 独立服务。
func main() {
	ctx := bootstrap.NewContext(
		context.Background(),
		&configv1.AppInfo{
			Project: _const.Project,
			AppId:   _const.AppID,
			Name:    _const.Name,
			Version: _const.Version,
		},
	)
	if err := bootstrap.RunApp(ctx, NewApp); err != nil {
		panic(err)
	}
}
