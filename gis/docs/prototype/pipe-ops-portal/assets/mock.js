/* PipeOps Portal · Mock 数据（字段对齐 gis 表与协议语义，中文业务文案）
 * 仅供原型演示，前端所有页面通过 api.js 调用，不直接触碰此处对象。 */
window.MOCK = (() => {
  const overlayTypes = {
    valve:'阀门', net_part:'管网构件', terminal:'采集终端', detection_meter:'探测仪器',
    flow_meter:'流量仪表', pressure_meter:'压力仪表', monitor_meter:'监测仪表',
    monitor_control:'监控设备', facility:'附属设施', fire_fighting:'消防设备',
    transmission:'输配设备', landmark:'地标'
  };
  // 点覆盖物（WGS84 经纬度示意值）
  const overlay = [
    {id:101,type:'valve',overlay_number:'FM-2024-0118',device_number:'DV-GS-0118',name:'城南路1号阀门',lat:31.23042,lng:121.47367,usage_state:1,app_class:6,spec:'DN400 蝶阀',ground_elevation:3.20,collect_worker:'张峰',check_worker:'李敏',updated_at:'2026-09-12 09:14'},
    {id:102,type:'valve',overlay_number:'FM-2024-0119',device_number:'DV-GS-0119',name:'华山路2号阀门',lat:31.23198,lng:121.48831,usage_state:1,app_class:6,spec:'DN300 闸阀',ground_elevation:3.05,collect_worker:'张峰',check_worker:'王芳',updated_at:'2026-09-12 09:31'},
    {id:201,type:'net_part',overlay_number:'PJ-2024-0203',device_number:'',name:'虹桥路三通',lat:31.22870,lng:121.48120,usage_state:1,app_class:5,spec:'DN500×300',ground_elevation:3.12,collect_worker:'刘洋',check_worker:'李敏',updated_at:'2026-09-11 16:02'},
    {id:202,type:'net_part',overlay_number:'PJ-2024-0211',device_number:'',name:'中山路弯头',lat:31.23390,lng:121.47540,usage_state:2,app_class:5,spec:'DN600 45°',ground_elevation:3.01,collect_worker:'刘洋',check_worker:'赵强',updated_at:'2026-09-11 16:18'},
    {id:305,type:'pressure_meter',overlay_number:'YY-2024-0406',device_number:'PT-GS-0406',name:'供水片区压力监测点',lat:31.23460,lng:121.48490,usage_state:1,app_class:3,spec:'0~1.6MPa 智能远传',ground_elevation:2.98,collect_worker:'周涛',check_worker:'王芳',updated_at:'2026-09-13 07:52'},
    {id:306,type:'flow_meter',overlay_number:'LL-2024-0407',device_number:'FT-GS-0407',name:'出厂区流量计',lat:31.22790,lng:121.47010,usage_state:1,app_class:3,spec:'DN200 电磁',ground_elevation:3.18,collect_worker:'周涛',check_worker:'赵强',updated_at:'2026-09-13 07:55'},
    {id:407,type:'monitor_meter',overlay_number:'WZ-2024-0502',device_number:'QC-GS-0502',name:'水源水浊度监测',lat:31.22640,lng:121.46730,usage_state:1,app_class:4,spec:'在线 0-100NTU',ground_elevation:3.30,collect_worker:'陈昊',check_worker:'李敏',updated_at:'2026-09-13 08:02'},
    {id:508,type:'transmission',overlay_number:'SD-2024-0601',device_number:'TR-GS-0601',name:'北环路输水装置',lat:31.23630,lng:121.47980,usage_state:1,app_class:2,spec:'DN800',ground_elevation:2.90,collect_worker:'陈昊',check_worker:'王芳',updated_at:'2026-09-10 15:44'},
    {id:602,type:'landmark',overlay_number:'DB-2024-0715',device_number:'',name:'市民广场标志点',lat:31.22950,lng:121.48780,usage_state:1,app_class:1,spec:'',ground_elevation:3.00,collect_worker:'刘洋',check_worker:'赵强',updated_at:'2026-09-09 10:20'},
    {id:701,type:'fire_fighting',overlay_number:'XF-2024-0803',device_number:'FH-GS-0803',name:'厂区消防栓',lat:31.22820,lng:121.47260,usage_state:1,app_class:7,spec:'SS100',ground_elevation:3.22,collect_worker:'周涛',check_worker:'李敏',updated_at:'2026-09-12 11:05'}
  ];
  // 管线（nodes 供 SVG 绘制；路径为管道节点连线）
  const pipes = [
    {id:1,pipe_number:'GG-2024-0001',category:'给水管道',spec:'DN500',usage_state:1,laying_way:'直埋',length:1250.4,start_point_code:'P001',end_point_code:'P102',
      nodes:[{code:'P001',lat:31.22640,lng:121.46730,z:0},{code:'P015',lat:31.22890,lng:121.47100,z:6},{code:'P030',lat:31.23042,lng:121.47367,z:-2},{code:'P052',lat:31.23360,lng:121.47790,z:4}]},
    {id:2,pipe_number:'GG-2024-0002',category:'给水管道',spec:'DN300',usage_state:1,laying_way:'沟槽',length:810.2,start_point_code:'P102',end_point_code:'P210',
      nodes:[{code:'P102',lat:31.23360,lng:121.47790,z:4},{code:'P140',lat:31.23460,lng:121.48490,z:-3},{code:'P210',lat:31.23630,lng:121.48940,z:7}]},
    {id:3,pipe_number:'GG-2024-0003',category:'输水管道',spec:'DN800',usage_state:1,laying_way:'管廊',length:2066.0,start_point_code:'P210',end_point_code:'P310',
      nodes:[{code:'P210',lat:31.23630,lng:121.48940,z:7},{code:'P250',lat:31.23810,lng:121.48550,z:1},{code:'P310',lat:31.23120,lng:121.48160,z:-5}]},
    {id:4,pipe_number:'GG-2024-0004',category:'配水管道',spec:'DN200',usage_state:2,laying_way:'直埋',length:412.8,start_point_code:'P310',end_point_code:'P380',
      nodes:[{code:'P310',lat:31.23120,lng:121.48160,z:-5},{code:'P350',lat:31.22940,lng:121.48010,z:2},{code:'P380',lat:31.22870,lng:121.48120,z:0}]},
    {id:5,pipe_number:'GG-2024-0005',category:'给水管道',spec:'DN400',usage_state:1,laying_way:'直埋',length:980.6,start_point_code:'P380',end_point_code:'P450',
      nodes:[{code:'P380',lat:31.22870,lng:121.48120,z:0},{code:'P410',lat:31.23080,lng:121.48840,z:3},{code:'P450',lat:31.22950,lng:121.48780,z:-1}]}
  ];
  const collectBatch = [
    {id:1,identifier:'CG-2026-08-0912',building_date:'2026-08-09',data_sources:'RTK 车载测绘',import_way:'P',pipe_number:0,point_number:46,status:'已导入',created_at:'2026-08-09 16:30'},
    {id:2,identifier:'CG-2026-08-2318',building_date:'2026-08-23',data_sources:'RTK 车载测绘',import_way:'L',pipe_number:28,point_number:0,status:'已生成',created_at:'2026-08-23 11:12'},
    {id:3,identifier:'CG-2026-09-0506',building_date:'2026-09-05',data_sources:'全站仪补测',import_way:'P',pipe_number:0,point_number:18,status:'待生成',created_at:'2026-09-05 15:47'},
    {id:4,identifier:'CG-2026-09-1207',building_date:'2026-09-12',data_sources:'CAD 图纸转换',import_way:'L',pipe_number:63,point_number:0,status:'待生成',created_at:'2026-09-12 09:26'}
  ];
  const collectPoint = [
    {id:1,batch_id:1,position:'P0001',code:'2026-P001',lat:31.22810,lng:121.47200,elevation:3.15,feature:'三通',spec:'DN400',building_area:'南一区',building_date:'2026-07-20'},
    {id:2,batch_id:1,position:'P0002',code:'2026-P002',lat:31.22930,lng:121.47480,elevation:3.02,feature:'阀门',spec:'DN200',building_area:'南一区',building_date:'2026-07-20'},
    {id:3,batch_id:3,position:'P0101',code:'2026-P101',lat:31.23310,lng:121.48620,elevation:2.95,feature:'弯头',spec:'DN300',building_area:'北二区',building_date:'2026-09-01'},
    {id:4,batch_id:3,position:'P0102',code:'2026-P102',lat:31.23420,lng:121.48760,elevation:2.88,feature:'三通',spec:'DN500',building_area:'北二区',building_date:'2026-09-01'}
  ];
  const alarmInfo = [
    {id:9001,overlay_number:'YY-2024-0406',alarm_type:'压力骤降',alarm_value:0.32,alarm_info:'出厂压力低于阈值 0.4MPa，疑似主管泄漏',level:'高',collect_time:'2026-09-13 07:42',is_report:1,status:'待研判'},
    {id:9002,overlay_number:'FM-2024-0118',alarm_type:'阀门异常关闭',alarm_value:0,alarm_info:'阀门行程传感器短时占位异常',level:'中',collect_time:'2026-09-13 06:18',is_report:1,status:'研判中'},
    {id:9003,overlay_number:'WZ-2024-0502',alarm_type:'浊度超标',alarm_value:4.8,alarm_info:'水源水浊度超过 4NTU 预警线',level:'中',collect_time:'2026-09-13 05:50',is_report:0,status:'已处理'},
    {id:9004,overlay_number:'GG-2024-0005',alarm_type:'夜间最小流量偏大',alarm_value:62.5,alarm_info:'夜间小时流量高于基线，疑似暗漏',level:'高',collect_time:'2026-09-13 03:12',is_report:1,status:'待研判'}
  ];
  const archiveAsset = [
    {id:1,asset_no:'ZB-2018-0007',name:'城南泵站 2# 离心泵',category:'机泵设备',status:'在运',install_date:'2018-05-12',warranty_end:'2028-05-12',last_case:'2026-08-20 例行维保'},
    {id:2,asset_no:'DT-2020-0012',name:'出厂区流量计',category:'计量仪表',status:'在运',install_date:'2020-09-01',warranty_end:'2030-09-01',last_case:'2026-09-01 检定合格'},
    {id:3,asset_no:'TZ-2016-0021',name:'中心调度阀台',category:'自控设备',status:'待检修',install_date:'2016-11-30',warranty_end:'2026-11-30',last_case:'2026-09-02 上报故障'},
    {id:4,asset_no:'GG-2015-0009',name:'DN800 输水干管',category:'输配管道',status:'在运',install_date:'2015-12-05',warranty_end:'',last_case:'2026-07-15 例行巡检'}
  ];
  const summary = {
    total_overlay: 1284, online_device: 486, active_pipe_km: 96.8, today_alarm: 7,
    unhandled_alarm: 3, offline_iot: 12, coverage: 96.2,
    pressure_trend: [0.62,0.60,0.58,0.59,0.61,0.60,0.57,0.52,0.47,0.51,0.55,0.56],
    flow_trend: [120,132,128,141,138,152,148,163,158,146,139,131],
    zonePressure: [
      {zone:'城东供水区',p:0.59,s:'正常'},{zone:'城西供水区',p:0.48,s:'注意'},{zone:'工业用水区',p:0.63,s:'正常'},{zone:'城南加压区',p:0.44,s:'告警'}
    ],
    alarmPie:[{k:'压力',v:31},{k:'流量',v:24},{k:'水质',v:14},{k:'阀门',v:12},{k:'其他',v:9}]
  };
  return { overlayTypes, overlay, pipes, collectBatch, collectPoint, alarmInfo, archiveAsset, summary };
})();