-- 管网域表回滚（丢弃 P0 迁移创建的表）
DROP TABLE IF EXISTS gis_alarm_info, gis_alarm_config, gis_collect_point, gis_collect_batch, gis_overlay, gis_pipe_point, gis_pipe CASCADE;