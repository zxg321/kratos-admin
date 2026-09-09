-- GIS 独立库 gis 初始化（PostGIS，SRID 4326 WGS84）
-- 说明：
--   1. geometry 列使用类型修饰符 geometry(Geometry,4326) 直接约束 SRID，
--      不再调用 AddGeometryColumn，避免与建表列重复定义。
--   2. properties/style 使用 JSONB；gorm 写入 string 时由应用层 SQL 显式 ::jsonb 转换。
--   3. 脚本整体幂等（IF NOT EXISTS），可由模块在启动时重复执行。
--   4. Apache AGE 扩展已独立启用（age 1.7.0），图分析建图（create_graph）延后到 P4-7。

-- GIS 图层表
CREATE TABLE IF NOT EXISTS gis_layer (
  id           BIGSERIAL PRIMARY KEY,
  tenant_id    BIGINT NOT NULL DEFAULT 1,
  name         VARCHAR(128) NOT NULL,
  layer_type   VARCHAR(16) NOT NULL DEFAULT 'point',
  style        JSONB NOT NULL DEFAULT '{}'::jsonb,
  visible      BOOLEAN NOT NULL DEFAULT TRUE,
  status       INTEGER NOT NULL DEFAULT 1,
  created_by   BIGINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  gis_layer IS 'GIS图层';
COMMENT ON COLUMN gis_layer.id         IS '图层ID';
COMMENT ON COLUMN gis_layer.tenant_id  IS '租户ID';
COMMENT ON COLUMN gis_layer.name       IS '图层名称';
COMMENT ON COLUMN gis_layer.layer_type IS '图层类型: point/line/polygon';
COMMENT ON COLUMN gis_layer.style      IS '样式配置';
COMMENT ON COLUMN gis_layer.visible    IS '是否可见: 1是/0否';
COMMENT ON COLUMN gis_layer.status     IS '状态: 1启用/0停用';
COMMENT ON COLUMN gis_layer.created_by IS '创建人ID';
COMMENT ON COLUMN gis_layer.created_at IS '创建时间';
COMMENT ON COLUMN gis_layer.updated_at IS '更新时间';
CREATE INDEX IF NOT EXISTS idx_gis_layer_tenant_name ON gis_layer (tenant_id, name);

-- GIS 要素表（geometry 为 PostGIS geometry，SRID 4326，GiST 空间索引）
CREATE TABLE IF NOT EXISTS gis_feature (
  id         BIGSERIAL PRIMARY KEY,
  tenant_id  BIGINT NOT NULL DEFAULT 1,
  layer_id   BIGINT NOT NULL,
  geometry   geometry(Geometry,4326) NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  gis_feature IS 'GIS要素';
COMMENT ON COLUMN gis_feature.id         IS '要素ID';
COMMENT ON COLUMN gis_feature.tenant_id  IS '租户ID';
COMMENT ON COLUMN gis_feature.layer_id   IS '图层ID';
COMMENT ON COLUMN gis_feature.geometry   IS '几何（WGS84，SRID 4326）';
COMMENT ON COLUMN gis_feature.properties IS '属性配置';
COMMENT ON COLUMN gis_feature.created_by IS '创建人ID';
COMMENT ON COLUMN gis_feature.created_at IS '创建时间';
COMMENT ON COLUMN gis_feature.updated_at IS '更新时间';
CREATE INDEX IF NOT EXISTS idx_gis_feature_layer ON gis_feature (layer_id);
CREATE INDEX IF NOT EXISTS idx_gis_feature_geom ON gis_feature USING GIST (geometry);

-- GIS 图层授权表（独立权限模型核心）
CREATE TABLE IF NOT EXISTS gis_layer_permission (
  id           BIGSERIAL PRIMARY KEY,
  tenant_id    BIGINT NOT NULL DEFAULT 1,
  layer_id     BIGINT NOT NULL,
  subject_type VARCHAR(16) NOT NULL DEFAULT 'role',
  subject_id   BIGINT NOT NULL,
  perm_level   VARCHAR(16) NOT NULL DEFAULT 'view',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  gis_layer_permission IS 'GIS图层授权';
COMMENT ON COLUMN gis_layer_permission.id           IS 'ID';
COMMENT ON COLUMN gis_layer_permission.tenant_id    IS '租户ID';
COMMENT ON COLUMN gis_layer_permission.layer_id     IS '图层ID';
COMMENT ON COLUMN gis_layer_permission.subject_type IS '主体类型: role/user';
COMMENT ON COLUMN gis_layer_permission.subject_id   IS '主体ID';
COMMENT ON COLUMN gis_layer_permission.perm_level   IS '权限级别: view/edit/admin';
COMMENT ON COLUMN gis_layer_permission.created_at   IS '创建时间';
COMMENT ON COLUMN gis_layer_permission.updated_at   IS '更新时间';
CREATE UNIQUE INDEX IF NOT EXISTS uk_gis_layer_subject ON gis_layer_permission (layer_id, subject_type, subject_id);
