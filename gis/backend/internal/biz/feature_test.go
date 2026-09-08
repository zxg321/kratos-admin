package biz

import (
	"testing"
)

func TestValidateGeoJSON(t *testing.T) {
	if err := validateGeoJSON(`{"type":"Point","coordinates":[116.39,39.9]}`); err != nil {
		t.Fatalf("合法 GeoJSON 不应报错: %v", err)
	}
	if err := validateGeoJSON(`not-json`); err == nil {
		t.Fatal("非法 GeoJSON 应报错")
	}
	if err := validateGeoJSON(`{"coordinates":[]}`); err == nil {
		t.Fatal("缺 type 的 GeoJSON 应报错")
	}
}

func TestParseIDs(t *testing.T) {
	got := parseIDs("1,2,3,,abc,-1")
	if len(got) != 3 || got[0] != 1 || got[2] != 3 {
		t.Fatalf("parseIDs 结果不符: %v", got)
	}
}
