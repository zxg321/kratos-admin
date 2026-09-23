package backup

import (
	"testing"
	"time"
)

func TestFormatPostgresValue(t *testing.T) {
	tests := []struct {
		name  string
		value interface{}
		want  string
	}{
		{name: "nil", value: nil, want: "NULL"},
		{name: "string", value: "it's", want: "'it''s'"},
		{name: "int64", value: int64(42), want: "42"},
		{name: "uint64", value: uint64(9), want: "9"},
		{name: "float64", value: 3.5, want: "3.5"},
		{name: "bool true", value: true, want: "true"},
		{name: "bool false", value: false, want: "false"},
		{name: "time", value: time.Date(2026, 9, 10, 8, 30, 0, 500000000, time.UTC), want: "'2026-09-10 08:30:00.5'"},
		{name: "bytea", value: []byte{0xde, 0xad}, want: `'\xdead'`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := formatPostgresValue(tt.value)
			if err != nil {
				t.Fatalf("formatPostgresValue(%v) 返回错误: %v", tt.value, err)
			}
			if got != tt.want {
				t.Errorf("formatPostgresValue(%v) = %q, want %q", tt.value, got, tt.want)
			}
		})
	}
}

func TestQuotePostgresString(t *testing.T) {
	if got := quotePostgresString(`a'bc`); got != `'a''bc'` {
		t.Errorf("quotePostgresString(a'bc) = %q, want %q", got, `'a''bc'`)
	}
}

func TestPostgresQuoteIdent(t *testing.T) {
	if got := postgresQuoteIdent(`we"ird`); got != `"we""ird"` {
		t.Errorf("postgresQuoteIdent(we\"ird) = %q, want %q", got, `"we""ird"`)
	}
}