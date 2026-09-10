package backup

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

// PostgresConn 描述 PostgreSQL 备份/恢复所需的连接信息。
type PostgresConn struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

// ParsePostgresDSN 解析 PostgreSQL 键值连接串（libpq DSN 子集）。
// 形如: host=127.0.0.1 user=postgre password=postgre dbname=kratos_admin port=5455 sslmode=disable TimeZone=Asia/Shanghai
// 仅解析备份/恢复需要的主机、端口、用户、密码、库名，其余键忽略。
func ParsePostgresDSN(dsn string) (*PostgresConn, error) {
	conn := &PostgresConn{Host: "127.0.0.1", Port: "5432"}
	fields, err := splitPostgresDSN(dsn)
	if err != nil {
		return nil, err
	}
	for key, value := range fields {
		switch strings.ToLower(key) {
		case "host", "hostaddr":
			conn.Host = value
		case "port":
			conn.Port = value
		case "user":
			conn.User = value
		case "password":
			conn.Password = value
		case "dbname":
			conn.DBName = value
		}
	}
	if conn.DBName == "" {
		return nil, fmt.Errorf("PostgreSQL 连接串缺少 dbname")
	}
	return conn, nil
}

// splitPostgresDSN 将键=值 的连接串解析为映射，值允许使用双引号。
func splitPostgresDSN(dsn string) (map[string]string, error) {
	fields := make(map[string]string)
	key := strings.Builder{}
	value := strings.Builder{}
	inValue := false
	quoted := false
	inKey := true
	for i := 0; i < len(dsn); i++ {
		char := dsn[i]
		switch {
		case inKey:
			if char == '=' {
				inKey = false
				inValue = true
			} else if char == ' ' || char == '\t' {
				// 忽略额外的分隔空白
			} else {
				key.WriteByte(char)
			}
		case inValue:
			if !quoted && (char == ' ' || char == '\t') {
				fields[strings.TrimSpace(key.String())] = value.String()
				key.Reset()
				value.Reset()
				inValue = false
				inKey = true
			} else if char == '"' {
				quoted = !quoted
			} else {
				value.WriteByte(char)
			}
		}
	}
	if inKey && key.Len() > 0 && value.Len() == 0 {
		return nil, fmt.Errorf("PostgreSQL 连接串存在未赋值的键: %s", key.String())
	}
	if inValue {
		fields[strings.TrimSpace(key.String())] = value.String()
	}
	return fields, nil
}

// DumpPostgres 使用 pg_dump 将数据库导出为普通 SQL 文件。
func DumpPostgres(ctx context.Context, conn *PostgresConn, output string) error {
	if conn == nil {
		return fmt.Errorf("PostgreSQL 连接为空")
	}
	if !CommandAvailable(PgDumpCommand) {
		return fmt.Errorf("%s 命令不可用，无法执行 PostgreSQL 备份", PgDumpCommand)
	}
	args := []string{
		"--host=" + conn.Host, "--port=" + conn.Port, "--username=" + conn.User,
		"--dbname=" + conn.DBName,
		"--no-owner", "--no-privileges", "--format=plain", "--file=" + output,
	}
	command := exec.CommandContext(ctx, PgDumpCommand, args...)
	command.Env = append(os.Environ(), "PGPASSWORD="+conn.Password)
	if outputBytes, err := command.CombinedOutput(); err != nil {
		return fmt.Errorf("执行 pg_dump 失败: %s; %w", firstLine(outputBytes), err)
	}
	return nil
}

// RestorePostgres 使用 psql 将 SQL 文件导入目标数据库。
func RestorePostgres(ctx context.Context, conn *PostgresConn, database, sqlPath string) error {
	if conn == nil {
		return fmt.Errorf("PostgreSQL 连接为空")
	}
	if !CommandAvailable(PsqlCommand) {
		return fmt.Errorf("%s 命令不可用，无法执行 PostgreSQL 恢复", PsqlCommand)
	}
	if database == "" {
		database = conn.DBName
	}
	args := []string{
		"--host=" + conn.Host, "--port=" + conn.Port, "--username=" + conn.User,
		"--dbname=" + database,
		"--set=ON_ERROR_STOP=1", "--quiet", "--file=" + sqlPath,
	}
	command := exec.CommandContext(ctx, PsqlCommand, args...)
	command.Env = append(os.Environ(), "PGPASSWORD="+conn.Password)
	var stderr bytes.Buffer
	command.Stderr = &stderr
	if err := command.Run(); err != nil {
		return fmt.Errorf("执行 psql 恢复失败: %s; %w", firstLine(stderr.Bytes()), err)
	}
	return nil
}

func firstLine(data []byte) string {
	line := strings.TrimSpace(string(data))
	if index := strings.IndexByte(line, '\n'); index >= 0 {
		line = line[:index]
	}
	if len(line) > 300 {
		return line[:300]
	}
	return line
}