"""PG 迁移 SQL 语法与方言校验器。

在无数据库的情况下校验 `backend/migration/assets/*/postgres/**/*.up.sql`，
复刻 kratos-kit migration/record.go 的 `splitPostgresStatements` 行级拆分约定，
逐条用 libpg_query (pglast) 解析，并对已知 MySQL 方言缺陷做启发式拦截，
防止 BOM、`\"` 转义、NULL 写 NOT NULL 列、反引号等回归。

用法:
    python scripts/validate_pg_migration.py [迁移目录]
    默认扫描 backend/migration/assets 下全部 postgres 版本的 *.up.sql。
退出码: 0 通过；1 任一文件校验失败。
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from pglast import parse_sql

# 迁移资源根目录（相对仓库根）。
DEFAULT_ROOT = Path(__file__).resolve().parents[1] / "backend" / "migration" / "assets"

# 与 record.go 保持一致：跳过空行与 -- 注释行，其余按行视为一条语句。
COMMENT_RE = re.compile(r"^\s*--")

# 已知 MySQL 方言残留 / 错误写法（在 PG 文件中一律拒绝）。
DIALECT_RULES: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("反引号标识符(MySQL 风格)", re.compile(r"`")),
    ("INSERT IGNORE(MySQL)", re.compile(r"\bINSERT\s+IGNORE\b", re.IGNORECASE)),
    ("GET_LOCK/RELEASE_LOCK(MySQL)", re.compile(r"\b(?:GET_LOCK|RELEASE_LOCK)\s*\(", re.IGNORECASE)),
    ("CREATE TABLE ... LIKE 结构(MySQL)", re.compile(r"\bCREATE\s+TABLE\b[^;]*\bLIKE\b", re.IGNORECASE)),
    ("ALTER TABLE ... COMMENT = (MySQL 表注释)", re.compile(r"\bCOMMENT\s*=", re.IGNORECASE)),
    # MySQL 转义反斜杠引号，PG json 列不接受。
    ("MySQL 转义引号 \\\"", re.compile(r'\\"')),
    # 元组末位写 NULL（softDelete DeletedAt 为 not null，应写 0）。
    (", NULL) 结尾(应写 0)", re.compile(r",\s*NULL\)\s*(?:ON\s+CONFLICT)?")),
)


def split_statements(text: str) -> list[str]:
    """复刻 record.go splitPostgresStatements：按行拆分，忽略空行与注释行。"""
    statements: list[str] = []
    for raw in text.split("\n"):
        line = raw.strip()
        if not line or COMMENT_RE.match(line):
            continue
        statements.append(line)
    return statements


def check_file(path: Path) -> list[str]:
    """校验单个 SQL 文件，返回错误消息列表（空即通过）。"""
    errors: list[str] = []
    raw = path.read_bytes()
    # 1) 禁止 UTF-8 BOM。
    if raw.startswith(b"\xef\xbb\xbf"):
        errors.append("文件包含 UTF-8 BOM，会导致首行 SQL 解析失败")
    text = raw.decode("utf-8")
    # 2) 方言启发式拦截。
    for name, pattern in DIALECT_RULES:
        if pattern.search(text):
            errors.append(f"发现 {name}")
    # 3) 逐行拆分并逐条解析，复刻迁移执行约定。
    for idx, line in enumerate(split_statements(text), start=1):
        try:
            parse_sql(line)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"行 {idx} 语法错误: {str(exc)[:160]}")
    return errors


def main() -> int:
    args = parser.parse_args()
    root = Path(args.directory).resolve()
    if not root.is_dir():
        print(f"迁移资源根目录不存在: {root}", file=sys.stderr)
        return 2
    files = sorted(root.glob("*/postgres/*.up.sql"))
    if not files:
        print(f"未找到 postgres 迁移 SQL: {root}", file=sys.stderr)
        return 2
    failed = 0
    for file in files:
        errors = check_file(file)
        rel = file.relative_to(root)
        if errors:
            failed += 1
            print(f"[FAIL] {rel}")
            for error in errors:
                print(f"       - {error}")
        else:
            print(f"[ OK ] {rel}")
    if failed:
        print(f"\n{failed}/{len(files)} 个 PG 迁移文件校验失败。")
        return 1
    print(f"\n全部 {len(files)} 个 PG 迁移文件校验通过。")
    return 0


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("directory", nargs="?", default=str(DEFAULT_ROOT), help="迁移资源根目录(默认 backend/migration/assets)")

if __name__ == "__main__":
    sys.exit(main())