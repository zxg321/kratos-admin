-- 管网域（管线/点覆盖物/采集/告警）表初始化
-- 说明：
--   1. 本文件对应管网域 P0 协议：OverlayService/PipeService/CollectService/AlarmService，
--      字段与 gis/admin/v1/{overlay,pipe,collect,alarm}.proto 对齐。
--   2. geometry 列使用类型修饰符 geometry(Point/LineString,4326) 直接约束 SRID（WGS84）。
--   3. point 类覆盖物收敛为统一表 gis_overlay，overlay_type 区分类型，
--      类型特有字段（材质/井室/压力/量程/防护等级等）落入 properties JSONB。
--   4. 脚本整体幂等（IF NOT EXISTS），可重复执行。

-- 输配管道
CREATE TABLE IF NOT EXISTS gis_pipe (
  id                     BIGSERIAL PRIMARY KEY,
  tenant_id              BIGINT NOT NULL DEFAULT 1,
  pipe_number            VARCHAR(100) NOT NULL,
  geometry               geometry(LineString,4326) NOT NULL,
  specification          VARCHAR(100),
  category               VARCHAR(100),
  pressure_rating        VARCHAR(100),
  color                  VARCHAR(100),
  length                 NUMERIC(16,6),
  display_level          INTEGER NOT NULL DEFAULT 5,
  usage_state            SMALLINT NOT NULL DEFAULT 1,
  laying_way             VARCHAR(100),
  laying_section         VARCHAR(200),
  regional_division      VARCHAR(100),
  facility               VARCHAR(100),
  start_ground_elevation NUMERIC(16,6),
  end_ground_elevation   NUMERIC(16,6),
  start_burial_depth     NUMERIC(16,6),
  end_burial_depth       NUMERIC(16,6),
  flow_switch            SMALLINT NOT NULL DEFAULT 0,
  image_and_text_url     TEXT,
  start_point_code       VARCHAR(100),
  end_point_code         VARCHAR(100),
  collect_batch_id       BIGINT NOT NULL DEFAULT 0,
  created_by             BIGINT NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  gis_pipe IS '输配管道';
COMMENT ON COLUMN gis_pipe.id                     IS '管道ID';
COMMENT ON COLUMN gis_pipe.tenant_id              IS '租户ID';
COMMENT ON COLUMN gis_pipe.pipe_number            IS '管道编号';
COMMENT ON COLUMN gis_pipe.geometry               IS '几何（WGS84，SRID 4326，线）';
COMMENT ON COLUMN gis_pipe.specification          IS '公称口径';
COMMENT ON COLUMN gis_pipe.category               IS '管道种类';
COMMENT ON COLUMN gis_pipe.pressure_rating        IS '压力等级';
COMMENT ON COLUMN gis_pipe.color                  IS '管道色彩';
COMMENT ON COLUMN gis_pipe.length                 IS '管道长度(m)';
COMMENT ON COLUMN gis_pipe.display_level          IS '显示等级';
COMMENT ON COLUMN gis_pipe.usage_state            IS '使用状态: 1在用/2备用/3停用';
COMMENT ON COLUMN gis_pipe.laying_way             IS '铺设方式';
COMMENT ON COLUMN gis_pipe.laying_section         IS '铺设路段';
COMMENT ON COLUMN gis_pipe.regional_division      IS '区域划分';
COMMENT ON COLUMN gis_pipe.facility               IS '附属设施';
COMMENT ON COLUMN gis_pipe.start_ground_elevation IS '起点地面高程(m)';
COMMENT ON COLUMN gis_pipe.end_ground_elevation   IS '终点地面高程(m)';
COMMENT ON COLUMN gis_pipe.start_burial_depth     IS '起点埋深(m)';
COMMENT ON COLUMN gis_pipe.end_burial_depth       IS '终点埋深(m)';
COMMENT ON COLUMN gis_pipe.flow_switch            IS '流向切换: 0起点/1终点';
COMMENT ON COLUMN gis_pipe.image_and_text_url     IS '图文URL(逗号分隔)';
COMMENT ON COLUMN gis_pipe.start_point_code       IS '起点管点编号';
COMMENT ON COLUMN gis_pipe.end_point_code         IS '终点管点编号';
COMMENT ON COLUMN gis_pipe.collect_batch_id       IS '采集批次ID';
COMMENT ON COLUMN gis_pipe.created_by             IS '创建人ID';
COMMENT ON COLUMN gis_pipe.created_at             IS '创建时间';
COMMENT ON COLUMN gis_pipe.updated_at             IS '更新时间';
CREATE INDEX IF NOT EXISTS idx_gis_pipe_tenant_num ON gis_pipe (tenant_id, pipe_number);
CREATE INDEX IF NOT EXISTS idx_gis_pipe_geom ON gis_pipe USING GIST (geometry);

-- 管点（构造管线/校核用）
CREATE TABLE IF NOT EXISTS gis_pipe_point (
  id               BIGSERIAL PRIMARY KEY,
  tenant_id        BIGINT NOT NULL DEFAULT 1,
  pipe_id          BIGINT NOT NULL DEFAULT 0,
  code             VARCHAR(100),
  geometry         geometry(Point,4326) NOT NULL,
  burial_depth     NUMERIC(16,6),
  ground_elevation NUMERIC(16,6),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  gis_pipe_point IS '输配管道管点';
COMMENT ON COLUMN gis_pipe_point.id               IS '管点ID';
COMMENT ON COLUMN gis_pipe_point.tenant_id        IS '租户ID';
COMMENT ON COLUMN gis_pipe_point.pipe_id          IS '管道ID';
COMMENT ON COLUMN gis_pipe_point.code             IS '管点编号';
COMMENT ON COLUMN gis_pipe_point.geometry         IS '点几何（WGS84，SRID 4326）';
COMMENT ON COLUMN gis_pipe_point.burial_depth     IS '埋深(m)';
COMMENT ON COLUMN gis_pipe_point.ground_elevation IS '高程(m)';
COMMENT ON COLUMN gis_pipe_point.created_at       IS '创建时间';
COMMENT ON COLUMN gis_pipe_point.updated_at       IS '更新时间';
CREATE INDEX IF NOT EXISTS idx_gis_pipe_point_pipe ON gis_pipe_point (pipe_id);
CREATE INDEX IF NOT EXISTS idx_gis_pipe_point_geom ON gis_pipe_point USING GIST (geometry);

-- 点覆盖物（统一表，overlay_type 区分；特有属性入 properties JSONB）
CREATE TABLE IF NOT EXISTS gis_overlay (
  id                BIGSERIAL PRIMARY KEY,
  tenant_id         BIGINT NOT NULL DEFAULT 1,
  overlay_type      VARCHAR(32) NOT NULL,
  overlay_number    VARCHAR(100) NOT NULL,
  device_number     VARCHAR(100),
  name              VARCHAR(200),
  geometry          geometry(Point,4326) NOT NULL,
  device_category   VARCHAR(100),
  specification     VARCHAR(100),
  device_type       VARCHAR(100),
  display_level     INTEGER NOT NULL DEFAULT 5,
  usage_state       SMALLINT NOT NULL DEFAULT 1,
  app_class         SMALLINT NOT NULL DEFAULT 0,
  data_sources      VARCHAR(100),
  facility          VARCHAR(100),
  ground_elevation  NUMERIC(16,6),
  accessory_device  VARCHAR(100),
  properties        JSONB NOT NULL DEFAULT '{}'::jsonb,
  collect_point_id  BIGINT NOT NULL DEFAULT 0,
  collect_worker    VARCHAR(100),
  check_worker      VARCHAR(100),
  image_and_text_url TEXT,
  is_temporary      BOOLEAN NOT NULL DEFAULT FALSE,
  created_by        BIGINT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  gis_overlay IS '点覆盖物（阀门/构件/终端/仪表/监控/设施/消防/输配/地标）';
COMMENT ON COLUMN gis_overlay.id                IS '覆盖物ID';
COMMENT ON COLUMN gis_overlay.tenant_id         IS '租户ID';
COMMENT ON COLUMN gis_overlay.overlay_type      IS '覆盖物类型: valve/net_part/terminal/detection_meter/flow_meter/pressure_meter/monitor_meter/monitor_control/facility/fire_fighting/transmission/landmark';
COMMENT ON COLUMN gis_overlay.overlay_number    IS '覆盖物/系统编号';
COMMENT ON COLUMN gis_overlay.device_number     IS '设备编号';
COMMENT ON COLUMN gis_overlay.name              IS '名称/地标名';
COMMENT ON COLUMN gis_overlay.geometry          IS '点几何（WGS84，SRID 4326）';
COMMENT ON COLUMN gis_overlay.device_category   IS '设备种类';
COMMENT ON COLUMN gis_overlay.specification     IS '型号规格/口径';
COMMENT ON COLUMN gis_overlay.device_type       IS '设备类型';
COMMENT ON COLUMN gis_overlay.display_level     IS '显示等级';
COMMENT ON COLUMN gis_overlay.usage_state       IS '使用状态: 1在用/2备用/3停用';
COMMENT ON COLUMN gis_overlay.app_class         IS '应用分类';
COMMENT ON COLUMN gis_overlay.data_sources      IS '数据来源';
COMMENT ON COLUMN gis_overlay.facility          IS '附属设施';
COMMENT ON COLUMN gis_overlay.ground_elevation  IS '地面高程(m)';
COMMENT ON COLUMN gis_overlay.accessory_device  IS '附属设备';
COMMENT ON COLUMN gis_overlay.properties        IS '类型特有属性(材质/井室/压力/量程/防护等级等)';
COMMENT ON COLUMN gis_overlay.collect_point_id  IS '关联采集点位ID';
COMMENT ON COLUMN gis_overlay.collect_worker    IS '采集人员';
COMMENT ON COLUMN gis_overlay.check_worker      IS '校核人员';
COMMENT ON COLUMN gis_overlay.image_and_text_url IS '图文URL(逗号分隔)';
COMMENT ON COLUMN gis_overlay.is_temporary      IS '是否临时';
COMMENT ON COLUMN gis_overlay.created_by        IS '创建人ID';
COMMENT ON COLUMN gis_overlay.created_at        IS '创建时间';
COMMENT ON COLUMN gis_overlay.updated_at        IS '更新时间';
CREATE UNIQUE INDEX IF NOT EXISTS uk_gis_overlay_num ON gis_overlay (tenant_id, overlay_type, overlay_number);
CREATE INDEX IF NOT EXISTS idx_gis_overlay_type ON gis_overlay (tenant_id, overlay_type);
CREATE INDEX IF NOT EXISTS idx_gis_overlay_geom ON gis_overlay USING GIST (geometry);

-- 采集批次
CREATE TABLE IF NOT EXISTS gis_collect_batch (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     BIGINT NOT NULL DEFAULT 1,
  identifier    VARCHAR(100) NOT NULL,
  building_date DATE,
  data_sources  VARCHAR(100),
  file_name     VARCHAR(255),
  file_path     VARCHAR(500),
  import_way    CHAR(1) NOT NULL DEFAULT 'P',
  pipe_number   INTEGER NOT NULL DEFAULT 0,
  point_number  INTEGER NOT NULL DEFAULT 0,
  created_by    BIGINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  gis_collect_batch IS '采集批次';
COMMENT ON COLUMN gis_collect_batch.id            IS '批次ID';
COMMENT ON COLUMN gis_collect_batch.tenant_id     IS '租户ID';
COMMENT ON COLUMN gis_collect_batch.identifier    IS '采集标识符';
COMMENT ON COLUMN gis_collect_batch.building_date IS '采集日期';
COMMENT ON COLUMN gis_collect_batch.data_sources  IS '数据来源(RTK/CAD)';
COMMENT ON COLUMN gis_collect_batch.file_name     IS '文件名';
COMMENT ON COLUMN gis_collect_batch.file_path     IS '文件路径';
COMMENT ON COLUMN gis_collect_batch.import_way    IS '导入方式: P点位/L管线';
COMMENT ON COLUMN gis_collect_batch.pipe_number   IS '管线数量';
COMMENT ON COLUMN gis_collect_batch.point_number  IS '点位数量';
COMMENT ON COLUMN gis_collect_batch.created_by    IS '创建人ID';
COMMENT ON COLUMN gis_collect_batch.created_at    IS '创建时间';
COMMENT ON COLUMN gis_collect_batch.updated_at    IS '更新时间';
CREATE UNIQUE INDEX IF NOT EXISTS uk_gis_collect_batch_idn ON gis_collect_batch (tenant_id, identifier);

-- 采集点
CREATE TABLE IF NOT EXISTS gis_collect_point (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     BIGINT NOT NULL DEFAULT 1,
  batch_id      BIGINT NOT NULL DEFAULT 0,
  position      VARCHAR(100),
  geometry      geometry(Point,4326) NOT NULL,
  elevation     NUMERIC(16,6),
  feature       VARCHAR(100),
  specification VARCHAR(100),
  building_area VARCHAR(100),
  building_date DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  gis_collect_point IS '采集点';
COMMENT ON COLUMN gis_collect_point.id            IS '点位ID';
COMMENT ON COLUMN gis_collect_point.tenant_id     IS '租户ID';
COMMENT ON COLUMN gis_collect_point.batch_id      IS '批次ID';
COMMENT ON COLUMN gis_collect_point.position      IS '点位标识';
COMMENT ON COLUMN gis_collect_point.geometry      IS '点几何（WGS84，SRID 4326）';
COMMENT ON COLUMN gis_collect_point.elevation     IS '高程(m)';
COMMENT ON COLUMN gis_collect_point.feature       IS '特征';
COMMENT ON COLUMN gis_collect_point.specification IS '口径(mm)';
COMMENT ON COLUMN gis_collect_point.building_area IS '建筑区域';
COMMENT ON COLUMN gis_collect_point.building_date IS '建筑日期';
COMMENT ON COLUMN gis_collect_point.created_at    IS '创建时间';
COMMENT ON COLUMN gis_collect_point.updated_at    IS '更新时间';
CREATE INDEX IF NOT EXISTS idx_gis_collect_point_batch ON gis_collect_point (batch_id);
CREATE INDEX IF NOT EXISTS idx_gis_collect_point_geom ON gis_collect_point USING GIST (geometry);

-- 告警配置
CREATE TABLE IF NOT EXISTS gis_alarm_config (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     BIGINT NOT NULL DEFAULT 1,
  overlay_number VARCHAR(100) NOT NULL,
  config_info   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  gis_alarm_config IS '告警配置';
COMMENT ON COLUMN gis_alarm_config.id             IS '配置ID';
COMMENT ON COLUMN gis_alarm_config.tenant_id      IS '租户ID';
COMMENT ON COLUMN gis_alarm_config.overlay_number IS '覆盖物/系统编号';
COMMENT ON COLUMN gis_alarm_config.config_info    IS '告警配置 JSON';
COMMENT ON COLUMN gis_alarm_config.created_at     IS '创建时间';
COMMENT ON COLUMN gis_alarm_config.updated_at     IS '更新时间';
CREATE UNIQUE INDEX IF NOT EXISTS uk_gis_alarm_config_num ON gis_alarm_config (tenant_id, overlay_number);

-- 告警信息
CREATE TABLE IF NOT EXISTS gis_alarm_info (
  id             BIGSERIAL PRIMARY KEY,
  tenant_id      BIGINT NOT NULL DEFAULT 1,
  overlay_number VARCHAR(100),
  alarm_type     VARCHAR(64),
  alarm_value    NUMERIC(16,6),
  alarm_info     TEXT,
  remark         VARCHAR(500),
  collect_time   TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_report      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  gis_alarm_info IS '告警信息';
COMMENT ON COLUMN gis_alarm_info.id             IS '告警ID';
COMMENT ON COLUMN gis_alarm_info.tenant_id      IS '租户ID';
COMMENT ON COLUMN gis_alarm_info.overlay_number IS '覆盖物/系统编号';
COMMENT ON COLUMN gis_alarm_info.alarm_type     IS '告警类型';
COMMENT ON COLUMN gis_alarm_info.alarm_value    IS '告警值(对应协议 alarm_valve)';
COMMENT ON COLUMN gis_alarm_info.alarm_info     IS '告警内容';
COMMENT ON COLUMN gis_alarm_info.remark         IS '备注';
COMMENT ON COLUMN gis_alarm_info.collect_time   IS '采集时间';
COMMENT ON COLUMN gis_alarm_info.is_report      IS '是否上报';
COMMENT ON COLUMN gis_alarm_info.created_at     IS '创建时间';
CREATE INDEX IF NOT EXISTS idx_gis_alarm_info_num ON gis_alarm_info (overlay_number, alarm_type);
CREATE INDEX IF NOT EXISTS idx_gis_alarm_info_time ON gis_alarm_info (created_at);