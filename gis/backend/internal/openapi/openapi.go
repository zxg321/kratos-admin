package openapi

import (
	"embed"
	"io/fs"
)

//go:embed assets/*
var openapiFS embed.FS

// Assets 返回 GIS OpenAPI 文档文件系统。
func Assets() fs.FS {
	value, err := fs.Sub(openapiFS, "assets")
	if err != nil {
		panic(err)
	}
	return value
}
