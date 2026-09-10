package backup

import (
	"context"
	"database/sql"
	"encoding/hex"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"
)

// PostgresDumpOptions 描述 PostgreSQL 数据导出的内容范围。
type PostgresDumpOptions struct {
	// Table 是需要导出的数据表名称。
	Table string
	// Where 是可选的数据筛选条件（PostgreSQL 方言，标识符自行加双引号）。
	Where string
}

// DumpPostgresData 使用 Go 将 PostgreSQL 表数据编码为可执行的 INSERT 语句。
// 用于归档场景，与 pg_dump 不同，它支持 WHERE 筛选并生成可回放的标准 SQL。
func DumpPostgresData(ctx context.Context, db *sql.DB, options PostgresDumpOptions, target io.Writer) error {
	if db == nil {
		return fmt.Errorf("PostgreSQL 数据库连接为空")
	}
	if target == nil {
		return fmt.Errorf("SQL 导出目标为空")
	}
	if options.Table == "" {
		return fmt.Errorf("SQL 导出表名为空")
	}
	tx, err := db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead, ReadOnly: true})
	if err != nil {
		return fmt.Errorf("开启 PostgreSQL 导出事务失败: %w", err)
	}
	defer tx.Rollback()
	var columns []string
	columns, err = listPostgresColumns(ctx, tx, options.Table)
	if err != nil {
		return err
	}
	quotedColumns := make([]string, 0, len(columns))
	for _, name := range columns {
		quotedColumns = append(quotedColumns, postgresQuoteIdent(name))
	}
	query := "SELECT " + strings.Join(quotedColumns, ", ") + " FROM " + postgresQuoteIdent(options.Table)
	if options.Where != "" {
		query += " WHERE " + options.Where
	}
	rows, err := tx.QueryContext(ctx, query)
	if err != nil {
		return fmt.Errorf("查询 PostgreSQL 表 %s 数据失败: %w", options.Table, err)
	}
	defer rows.Close()
	scanValues := make([]interface{}, len(columns))
	scanTargets := make([]interface{}, len(columns))
	for index := range scanValues {
		scanTargets[index] = &scanValues[index]
	}
	for rows.Next() {
		if err = rows.Scan(scanTargets...); err != nil {
			return fmt.Errorf("读取 PostgreSQL 表 %s 数据失败: %w", options.Table, err)
		}
		encodedValues := make([]string, len(scanValues))
		for index, value := range scanValues {
			encodedValues[index], err = formatPostgresValue(value)
			if err != nil {
				return fmt.Errorf("编码 PostgreSQL 表 %s 字段 %s 失败: %w", options.Table, columns[index], err)
			}
		}
		statement := "INSERT INTO " + postgresQuoteIdent(options.Table) + " (" +
			strings.Join(quotedColumns, ", ") + ") VALUES (" + strings.Join(encodedValues, ", ") + ");\n"
		if err = writeSQL(target, statement); err != nil {
			return err
		}
	}
	if err = rows.Err(); err != nil {
		return fmt.Errorf("遍历 PostgreSQL 表 %s 数据失败: %w", options.Table, err)
	}
	return tx.Commit()
}

// listPostgresColumns 查询可写入的字段，排除生成列，并保持稳定顺序。
func listPostgresColumns(ctx context.Context, tx *sql.Tx, table string) ([]string, error) {
	rows, err := tx.QueryContext(ctx, "SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 AND is_generated = 'NEVER' ORDER BY ordinal_position", table)
	if err != nil {
		return nil, fmt.Errorf("查询 PostgreSQL 表 %s 字段失败: %w", table, err)
	}
	defer rows.Close()
	columns := make([]string, 0)
	for rows.Next() {
		var name string
		if err = rows.Scan(&name); err != nil {
			return nil, fmt.Errorf("读取 PostgreSQL 表 %s 字段失败: %w", table, err)
		}
		columns = append(columns, name)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("遍历 PostgreSQL 表 %s 字段失败: %w", table, err)
	}
	if len(columns) == 0 {
		return nil, fmt.Errorf("PostgreSQL 表 %s 不存在或无可导出字段", table)
	}
	return columns, nil
}

// postgresQuoteIdent 包裹 PostgreSQL 标识符并转义其中的双引号。
func postgresQuoteIdent(value string) string {
	return `"` + strings.ReplaceAll(value, `"`, `""`) + `"`
}

// formatPostgresValue 将数据库驱动返回值编码为 PostgreSQL 字面量。
func formatPostgresValue(value interface{}) (string, error) {
	if value == nil {
		return "NULL", nil
	}
	switch item := value.(type) {
	case []byte:
		// PostgreSQL bytea 十六进制字面量，如 '\xDEADBEEF'。
		return `'\x` + hex.EncodeToString(item) + `'`, nil
	case string:
		return quotePostgresString(item), nil
	case time.Time:
		return quotePostgresString(item.Format("2006-01-02 15:04:05.999999")), nil
	case bool:
		if item {
			return "true", nil
		}
		return "false", nil
	case int64:
		return strconv.FormatInt(item, 10), nil
	case uint64:
		return strconv.FormatUint(item, 10), nil
	case int32:
		return strconv.FormatInt(int64(item), 10), nil
	case uint32:
		return strconv.FormatUint(uint64(item), 10), nil
	case int:
		return strconv.Itoa(item), nil
	case uint:
		return strconv.FormatUint(uint64(item), 10), nil
	case float32:
		return strconv.FormatFloat(float64(item), 'g', -1, 32), nil
	case float64:
		return strconv.FormatFloat(item, 'g', -1, 64), nil
	default:
		return quotePostgresString(fmt.Sprint(value)), nil
	}
}

// quotePostgresString 转义并包裹 PostgreSQL 字符串字面量。
// 默认 standard_conforming_strings=on，反斜杠为字面量，仅需转义单引号。
func quotePostgresString(value string) string {
	return "'" + strings.ReplaceAll(value, "'", "''") + "'"
}