-- GIS 图层表
CREATE TABLE IF NOT EXISTS `gis_layer` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图层ID',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  `name` VARCHAR(128) NOT NULL COMMENT '图层名称',
  `layer_type` VARCHAR(16) NOT NULL DEFAULT 'point' COMMENT '图层类型: point/line/polygon',
  `style` JSON NOT NULL COMMENT '样式配置',
  `visible` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否可见: 1是/0否',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态: 1启用/0停用',
  `created_by` BIGINT NOT NULL DEFAULT 0 COMMENT '创建人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_name` (`tenant_id`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='GIS图层';

-- GIS 要素表（空间索引 + SRID 4326）
CREATE TABLE IF NOT EXISTS `gis_feature` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '要素ID',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  `layer_id` BIGINT UNSIGNED NOT NULL COMMENT '图层ID',
  `geometry` GEOMETRY NOT NULL SRID 4326 COMMENT '几何（WGS84）',
  `properties` JSON NOT NULL COMMENT '属性配置',
  `created_by` BIGINT NOT NULL DEFAULT 0 COMMENT '创建人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_layer_id` (`layer_id`),
  SPATIAL KEY `idx_geometry` (`geometry`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='GIS要素';

-- GIS 图层授权表（独立权限模型核心）
CREATE TABLE IF NOT EXISTS `gis_layer_permission` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  `layer_id` BIGINT UNSIGNED NOT NULL COMMENT '图层ID',
  `subject_type` VARCHAR(16) NOT NULL DEFAULT 'role' COMMENT '主体类型: role/user',
  `subject_id` BIGINT NOT NULL COMMENT '主体ID',
  `perm_level` VARCHAR(16) NOT NULL DEFAULT 'view' COMMENT '权限级别: view/edit/admin',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_layer_subject` (`layer_id`, `subject_type`, `subject_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='GIS图层授权';
