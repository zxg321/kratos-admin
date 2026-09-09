package migration

import (
	"embed"
	"fmt"
	"io/fs"
	"path"
	"sort"
	"strings"

	"gorm.io/gorm"
)

// ModuleName 是 GIS 迁移在 Core 资源注册表中的稳定模块名。
const ModuleName = "gis"

//go:embed assets
var baseMigrationFS embed.FS

// Assets 返回 GIS 迁移脚本文件系统，交由 Core 统一注册和执行。
func Assets() fs.FS {
	value, err := fs.Sub(baseMigrationFS, "assets")
	if err != nil {
		panic(err)
	}
	return value
}

// postgresUpDir 是 PostGIS 迁移脚本所在目录（相对 assets 根）。
const postgresUpDir = "v0.0.1/postgres"

// RunPostgres 执行 PostGIS 版本化迁移脚本。
//
// 框架迁移执行器（kratos-kit/database/gorm/migration）当前仅支持 mysql/doris
// 数据库类型目录与驱动，PostgreSQL 数据源需由模块在连接就绪后自行执行。
// 脚本内使用 IF NOT EXISTS 保证幂等，可安全重复执行。
func RunPostgres(db *gorm.DB) error {
	if db == nil {
		return fmt.Errorf("数据库连接不能为空")
	}
	upFS, err := fs.Sub(baseMigrationFS, path.Join("assets", postgresUpDir))
	if err != nil {
		return fmt.Errorf("读取 PostGIS 迁移目录失败: %w", err)
	}
	entries, err := fs.ReadDir(upFS, ".")
	if err != nil {
		return fmt.Errorf("读取 PostGIS 迁移目录失败: %w", err)
	}
	names := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".up.sql") {
			continue
		}
		names = append(names, entry.Name())
	}
	sort.Strings(names)
	for _, name := range names {
		content, readErr := fs.ReadFile(upFS, name)
		if readErr != nil {
			return fmt.Errorf("读取迁移脚本 %s 失败: %w", name, readErr)
		}
		for _, statement := range splitSQLStatements(string(content)) {
			if statement == "" {
				continue
			}
			if execErr := db.Exec(statement).Error; execErr != nil {
				return fmt.Errorf("执行迁移脚本 %s 失败: %w", name, execErr)
			}
		}
	}
	return nil
}

// splitSQLStatements 按分号拆分 SQL 脚本为单条语句，忽略 -- 行注释行。
func splitSQLStatements(sql string) []string {
	var statements []string
	var builder strings.Builder
	for _, line := range strings.Split(sql, "\n") {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "--") {
			continue
		}
		builder.WriteString(line)
		builder.WriteString("\n")
		if strings.Contains(trimmed, ";") {
			statements = append(statements, strings.TrimSpace(builder.String()))
			builder.Reset()
		}
	}
	if builder.Len() > 0 {
		statements = append(statements, strings.TrimSpace(builder.String()))
	}
	return statements
}
