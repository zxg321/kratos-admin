/* GIS Intel Ops Platform · 全量 Mock 数据（字段对齐 PRD 数据实体 gis_* / cnd_* / patrol_* / bpm_*）
 * 仅供原型演示；页面一律通过 api.js 调用，禁止直接读 window.MOCK。 */
window.MOCK = (() => {
  /* ========== S1 管网一张图 ========== */
  const overlayTypes = {
    valve:'阀门', net_part:'管网构件', terminal:'采集终端', detection_meter:'探测仪器',
    flow_meter:'流量仪表', pressure_meter:'压力仪表', monitor_meter:'监测仪表',
    monitor_control:'监控设备', facility:'附属设施', fire_fighting:'消防设备',
    transmission:'输配设备', landmark:'地标'
  };
  const overlay = [
    {id:101,type:'valve',overlay_number:'FM-2024-0118',device_number:'DV-GS-0118',name:'城南路1号阀门',lat:31.23042,lng:121.47367,usage_state:1,app_class:6,spec:'DN400 蝶阀',ground_elevation:3.20,collect_worker:'张峰',check_worker:'李敏',updated_at:'2026-09-12 09:14'},
    {id:102,type:'valve',overlay_number:'FM-2024-0119',device_number:'DV-GS-0119',name:'华山路2号阀门',lat:31.23198,lng:121.48831,usage_state:1,app_class:6,spec:'DN300 闸阀',ground_elevation:3.05,collect_worker:'张峰',check_worker:'王芳',updated_at:'2026-09-12 09:31'},
    {id:103,type:'valve',overlay_number:'FM-2024-0121',device_number:'DV-GS-0121',name:'望江路5号阀门',lat:31.22910,lng:121.47910,usage_state:2,app_class:6,spec:'DN200 排气阀',ground_elevation:3.11,collect_worker:'张峰',check_worker:'李敏',updated_at:'2026-09-10 14:22'},
    {id:201,type:'net_part',overlay_number:'PJ-2024-0203',device_number:'',name:'虹桥路三通',lat:31.22870,lng:121.48120,usage_state:1,app_class:5,spec:'DN500×300',ground_elevation:3.12,collect_worker:'刘洋',check_worker:'李敏',updated_at:'2026-09-11 16:02'},
    {id:202,type:'net_part',overlay_number:'PJ-2024-0211',device_number:'',name:'中山路弯头',lat:31.23390,lng:121.47540,usage_state:2,app_class:5,spec:'DN600 45°',ground_elevation:3.01,collect_worker:'刘洋',check_worker:'赵强',updated_at:'2026-09-11 16:18'},
    {id:203,type:'net_part',overlay_number:'PJ-2024-0218',device_number:'',name:'滨江大道四通',lat:31.23520,lng:121.48210,usage_state:1,app_class:5,spec:'DN800×400',ground_elevation:2.96,collect_worker:'刘洋',check_worker:'王芳',updated_at:'2026-09-08 10:44'},
    {id:305,type:'pressure_meter',overlay_number:'YY-2024-0406',device_number:'PT-GS-0406',name:'供水片区压力监测点',lat:31.23460,lng:121.48490,usage_state:1,app_class:3,spec:'0~1.6MPa 智能远传',ground_elevation:2.98,collect_worker:'周涛',check_worker:'王芳',updated_at:'2026-09-13 07:52'},
    {id:306,type:'flow_meter',overlay_number:'LL-2024-0407',device_number:'FT-GS-0407',name:'出厂区流量计',lat:31.22790,lng:121.47010,usage_state:1,app_class:3,spec:'DN200 电磁',ground_elevation:3.18,collect_worker:'周涛',check_worker:'赵强',updated_at:'2026-09-13 07:55'},
    {id:307,type:'flow_meter',overlay_number:'LL-2024-0411',device_number:'FT-GS-0411',name:'城西分区计量流量计',lat:31.23210,lng:121.46510,usage_state:1,app_class:3,spec:'DN300 电磁',ground_elevation:3.08,collect_worker:'周涛',check_worker:'赵强',updated_at:'2026-09-13 07:58'},
    {id:407,type:'monitor_meter',overlay_number:'WZ-2024-0502',device_number:'QC-GS-0502',name:'水源水浊度监测',lat:31.22640,lng:121.46730,usage_state:1,app_class:4,spec:'在线 0-100NTU',ground_elevation:3.30,collect_worker:'陈昊',check_worker:'李敏',updated_at:'2026-09-13 08:02'},
    {id:408,type:'detection_meter',overlay_number:'TC-2024-0506',device_number:'DT-GS-0506',name:'燃气管线泄漏探测点',lat:31.23010,lng:121.48630,usage_state:1,app_class:4,spec:'LEL 0-100%LEL',ground_elevation:3.02,collect_worker:'陈昊',check_worker:'李敏',updated_at:'2026-09-13 08:05'},
    {id:508,type:'transmission',overlay_number:'SD-2024-0601',device_number:'TR-GS-0601',name:'北环路输水装置',lat:31.23630,lng:121.47980,usage_state:1,app_class:2,spec:'DN800',ground_elevation:2.90,collect_worker:'陈昊',check_worker:'王芳',updated_at:'2026-09-10 15:44'},
    {id:602,type:'landmark',overlay_number:'DB-2024-0715',device_number:'',name:'市民广场标志点',lat:31.22950,lng:121.48780,usage_state:1,app_class:1,spec:'',ground_elevation:3.00,collect_worker:'刘洋',check_worker:'赵强',updated_at:'2026-09-09 10:20'},
    {id:701,type:'fire_fighting',overlay_number:'XF-2024-0803',device_number:'FH-GS-0803',name:'厂区消防栓',lat:31.22820,lng:121.47260,usage_state:1,app_class:7,spec:'SS100',ground_elevation:3.22,collect_worker:'周涛',check_worker:'李敏',updated_at:'2026-09-12 11:05'},
    {id:702,type:'facility',overlay_number:'SS-2024-0901',device_number:'',name:'城南加压泵站',lat:31.22560,lng:121.47640,usage_state:1,app_class:2,spec:'2×450kW',ground_elevation:3.40,collect_worker:'周涛',check_worker:'王芳',updated_at:'2026-09-06 09:30'},
    {id:703,type:'monitor_control',overlay_number:'JK-2024-1002',device_number:'MC-GS-1002',name:'泵站视频监控',lat:31.22580,lng:121.47700,usage_state:1,app_class:2,spec:'枪机 4MP',ground_elevation:3.35,collect_worker:'陈昊',check_worker:'李敏',updated_at:'2026-09-12 18:10'}
  ];
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
      nodes:[{code:'P380',lat:31.22870,lng:121.48120,z:0},{code:'P410',lat:31.23080,lng:121.48840,z:3},{code:'P450',lat:31.22950,lng:121.48780,z:-1}]},
    {id:6,pipe_number:'GG-2024-0006',category:'给水管道',spec:'DN300',usage_state:1,laying_way:'顶管',length:660.0,start_point_code:'P001',end_point_code:'P380',
      nodes:[{code:'P001',lat:31.22640,lng:121.46730,z:0},{code:'P460',lat:31.22610,lng:121.47400,z:5},{code:'P380',lat:31.22870,lng:121.48120,z:0}]}
  ];
  /* 图层树（S1-PR01/04） */
  const layerTree = [
    {id:'L-pipe',name:'管线图层',open:true,children:[
      {id:'L-pipe-gs',name:'给水管道',on:true,count:318},{id:'L-pipe-ss',name:'输水管道',on:true,count:24},
      {id:'L-pipe-ps',name:'配水管道',on:true,count:156},{id:'L-pipe-rq',name:'燃气管道',on:false,count:88}]},
    {id:'L-ovl',name:'覆盖物图层',open:true,children:[
      {id:'L-ovl-valve',name:'阀门',on:true,count:412},{id:'L-ovl-meter',name:'仪表类',on:true,count:266},
      {id:'L-ovl-fac',name:'附属设施',on:true,count:74},{id:'L-ovl-fire',name:'消防设备',on:true,count:132},
      {id:'L-ovl-mark',name:'地标/色标',on:false,count:58}]},
    {id:'L-biz',name:'业务图层',open:true,children:[
      {id:'L-biz-alarm',name:'实时告警',on:true,count:3},{id:'L-biz-patrol',name:'巡检轨迹',on:true,count:6},
      {id:'L-biz-excav',name:'开挖作业区',on:true,count:2},{id:'L-biz-dma',name:'DMA 分区',on:false,count:12}]}
  ];

  /* ========== S2 采集作业与成果入库 ========== */
  const collectBatch = [
    {id:1,identifier:'CG-2026-08-0912',building_date:'2026-08-09',data_sources:'RTK 车载测绘',import_way:'P',pipe_number:28,point_number:46,status:'已入库',check_pass:98.2,topo_issues:0,created_at:'2026-08-09 16:30'},
    {id:2,identifier:'CG-2026-08-2318',building_date:'2026-08-23',data_sources:'RTK 车载测绘',import_way:'L',pipe_number:0,point_number:32,status:'质检中',check_pass:86.4,topo_issues:3,created_at:'2026-08-23 11:12'},
    {id:3,identifier:'CG-2026-09-0506',building_date:'2026-09-05',data_sources:'全站仪补测',import_way:'P',pipe_number:0,point_number:18,status:'待质检',check_pass:0,topo_issues:0,created_at:'2026-09-05 15:47'},
    {id:4,identifier:'CG-2026-09-1207',building_date:'2026-09-12',data_sources:'CAD 图纸转换',import_way:'L',pipe_number:63,point_number:0,status:'空间校验中',check_pass:0,topo_issues:5,created_at:'2026-09-12 09:26'},
    {id:5,identifier:'CG-2026-09-1311',building_date:'2026-09-13',data_sources:'RTK 手持机',import_way:'P',pipe_number:0,point_number:24,status:'待质检',check_pass:0,topo_issues:1,created_at:'2026-09-13 08:41'}
  ];
  const collectPoint = [
    {id:1,batch_id:1,position:'P0001',code:'2026-P001',lat:31.22810,lng:121.47200,elevation:3.15,feature:'三通',spec:'DN400',building_area:'南一区',building_date:'2026-07-20',check:'通过'},
    {id:2,batch_id:1,position:'P0002',code:'2026-P002',lat:31.22930,lng:121.47480,elevation:3.02,feature:'阀门',spec:'DN200',building_area:'南一区',building_date:'2026-07-20',check:'通过'},
    {id:3,batch_id:2,position:'P0101',code:'2026-P101',lat:31.23310,lng:121.48620,elevation:2.95,feature:'弯头',spec:'DN300',building_area:'北二区',building_date:'2026-09-01',check:'通过'},
    {id:4,batch_id:2,position:'P0102',code:'2026-P102',lat:31.23311,lng:121.48621,elevation:2.95,feature:'弯头',spec:'DN300',building_area:'北二区',building_date:'2026-09-01',check:'重合点'},
    {id:5,batch_id:4,position:'P0201',code:'2026-P201',lat:31.23090,lng:121.48330,elevation:2.88,feature:'三通',spec:'DN500',building_area:'北二区',building_date:'2026-09-10',check:'悬挂点'}
  ];

  /* ========== S3 智能监测告警 ========== */
  const monitorDevices = [
    {id:1,device_number:'PT-GS-0406',name:'供水片区压力监测点',category:'压力仪表',biz:'供水',online:1,metric:'压力',value:0.32,unit:'MPa',threshold:'0.40~0.75',updated_at:'2026-09-14 21:52:04',state:'告警'},
    {id:2,device_number:'FT-GS-0407',name:'出厂区流量计',category:'流量仪表',biz:'供水',online:1,metric:'瞬时流量',value:862.5,unit:'m³/h',threshold:'0~1200',updated_at:'2026-09-14 21:52:01',state:'正常'},
    {id:3,device_number:'FT-GS-0411',name:'城西分区计量流量计',category:'流量仪表',biz:'供水',online:1,metric:'夜间最小流量',value:62.5,unit:'m³/h',threshold:'<40',updated_at:'2026-09-14 21:51:48',state:'告警'},
    {id:4,device_number:'QC-GS-0502',name:'水源水浊度监测',category:'监测仪表',biz:'水质',online:1,metric:'浊度',value:4.8,unit:'NTU',threshold:'<3.0',updated_at:'2026-09-14 21:50:12',state:'预警'},
    {id:5,device_number:'DT-GS-0506',name:'燃气管线泄漏探测点',category:'探测仪器',biz:'燃气',online:1,metric:'LEL',value:2.1,unit:'%LEL',threshold:'<10',updated_at:'2026-09-14 21:52:10',state:'正常'},
    {id:6,device_number:'PT-GS-0412',name:'工业用水区压力监测点',category:'压力仪表',biz:'供水',online:1,metric:'压力',value:0.63,unit:'MPa',threshold:'0.40~0.75',updated_at:'2026-09-14 21:52:06',state:'正常'},
    {id:7,device_number:'LL-GS-0418',name:'城南加压区电磁流量计',category:'流量仪表',biz:'供水',online:0,metric:'瞬时流量',value:'--',unit:'m³/h',threshold:'0~800',updated_at:'2026-09-14 19:32:44',state:'离线'},
    {id:8,device_number:'WZ-GS-0508',name:'二水厂余氯监测',category:'监测仪表',biz:'水质',online:1,metric:'余氯',value:0.55,unit:'mg/L',threshold:'0.3~0.8',updated_at:'2026-09-14 21:49:30',state:'正常'},
    {id:9,device_number:'MC-GS-1002',name:'泵站视频监控',category:'监控设备',biz:'安防',online:1,metric:'码流',value:4.2,unit:'Mbps',threshold:'-',updated_at:'2026-09-14 21:52:00',state:'正常'},
    {id:10,device_number:'DT-GS-0511',name:'管廊甲烷探测点',category:'探测仪器',biz:'燃气',online:1,metric:'甲烷',value:8.6,unit:'%LEL',threshold:'<10',updated_at:'2026-09-14 21:52:12',state:'预警'}
  ];
  const thresholdConfig = [
    {id:1,device_number:'PT-GS-0406',rule:'压力上下限',config:{lower:0.40,upper:0.75,unit:'MPa'},offline_min:15,level:'高',enabled:true},
    {id:2,device_number:'FT-GS-0411',rule:'夜间最小流量',config:{upper:40,unit:'m³/h',window:'02:00-04:00'},offline_min:15,level:'高',enabled:true},
    {id:3,device_number:'QC-GS-0502',rule:'浊度上限',config:{upper:3.0,unit:'NTU'},offline_min:30,level:'中',enabled:true},
    {id:4,device_number:'DT-GS-0506',rule:'LEL 上限',config:{upper:10,unit:'%LEL'},offline_min:10,level:'高',enabled:true},
    {id:5,device_number:'WZ-GS-0508',rule:'余氯区间',config:{lower:0.3,upper:0.8,unit:'mg/L'},offline_min:30,level:'中',enabled:false},
    {id:6,device_number:'LL-GS-0418',rule:'流量区间',config:{lower:50,upper:800,unit:'m³/h'},offline_min:15,level:'中',enabled:true}
  ];
  const aiForecast = [
    {id:1,device_number:'FT-GS-0411',type:'暗漏预测',probability:0.87,eta:'约 45 分钟后',basis:'夜间最小流量连续 6 日抬升 + 压力趋势下降',advice:'建议调度城西 DMA 夜间最小流量分析工单，安排听漏复测'},
    {id:2,device_number:'PT-GS-0406',type:'欠压风险',probability:0.72,eta:'约 30 分钟后',basis:'压力 0.32MPa 低于下限且持续下行，主阀状态异常',advice:'建议核查 FM-2024-0118 阀门行程，必要时启动关阀分析'},
    {id:3,device_number:'DT-GS-0511',type:'浓度抬升',probability:0.45,eta:'约 2 小时后',basis:'甲烷浓度缓升，通风设备停机 40min',advice:'建议派发巡检核实通风联动'}
  ];
  const alarmInfo = [
    {id:9001,overlay_number:'YY-2024-0406',alarm_type:'压力超下限',alarm_value:0.32,alarm_info:'出厂压力低于阈值 0.40MPa，疑似主管泄漏',level:'高',collect_time:'2026-09-14 21:42',is_report:1,status:'待研判',ai_tag:'关联 FT-GS-0411 暗漏预测'},
    {id:9002,overlay_number:'FM-2024-0118',alarm_type:'阀门异常关闭',alarm_value:0,alarm_info:'阀门行程传感器短时占位异常',level:'中',collect_time:'2026-09-14 06:18',is_report:1,status:'研判中',ai_tag:''},
    {id:9003,overlay_number:'WZ-2024-0502',alarm_type:'浊度超标',alarm_value:4.8,alarm_info:'水源水浊度超过 3.0NTU 预警线',level:'中',collect_time:'2026-09-14 05:50',is_report:0,status:'已处理',ai_tag:''},
    {id:9004,overlay_number:'LL-2024-0411',alarm_type:'夜间最小流量偏大',alarm_value:62.5,alarm_info:'夜间小时流量高于基线 40m³/h，疑似暗漏',level:'高',collect_time:'2026-09-14 03:12',is_report:1,status:'已派单',ai_tag:'AI 预测置信度 0.87'},
    {id:9005,overlay_number:'DT-2024-0511',alarm_type:'甲烷浓度预警',alarm_value:8.6,alarm_info:'管廊甲烷浓度接近 10%LEL 上限',level:'高',collect_time:'2026-09-14 21:38',is_report:1,status:'待研判',ai_tag:'通风联动建议'},
    {id:9006,overlay_number:'LL-GS-0418',alarm_type:'设备离线',alarm_value:0,alarm_info:'心跳超时 140 分钟，判定离线',level:'低',collect_time:'2026-09-14 19:33',is_report:0,status:'已认领',ai_tag:''}
  ];

  /* ========== S4 巡检作业 ========== */
  const patrolOrders = [
    {id:1,order_no:'XJ-2026-0914-01',name:'城南片区日常巡检',region:'南一区',type:'日常巡检',assignee:'张峰',phone:'138****2043',plan_date:'2026-09-14',points:18,done:12,status:'执行中',progress:67},
    {id:2,order_no:'XJ-2026-0914-02',name:'城西 DMA 夜间听漏复测',region:'城西供水区',type:'专项巡检',assignee:'刘洋',phone:'139****1187',plan_date:'2026-09-14',points:6,done:2,status:'执行中',progress:33},
    {id:3,order_no:'XJ-2026-0913-08',name:'北环路输水干管巡查',region:'北二区',type:'日常巡检',assignee:'周涛',phone:'137****9921',plan_date:'2026-09-13',points:14,done:14,status:'已完成',progress:100},
    {id:4,order_no:'XJ-2026-0915-01',name:'管廊甲烷探测专项核查',region:'管廊段',type:'专项巡检',assignee:'陈昊',phone:'136****5530',plan_date:'2026-09-15',points:4,done:0,status:'待领取',progress:0},
    {id:5,order_no:'XJ-2026-0912-05',name:'厂区消防设施月检',region:'厂区',type:'周期巡检',assignee:'王芳',phone:'135****7412',plan_date:'2026-09-12',points:9,done:9,status:'已完成',progress:100}
  ];
  const hiddenDangers = [
    {id:1,danger_no:'YH-2026-0031',location:'望江路与中山路交叉口',type:'管线占压',level:'高',reporter:'张峰',report_time:'2026-09-13 10:24',status:'待复核',ai_recognized:true,desc:'AI 巡检识别：管线上方违规堆放建材，占压长度约 6m'},
    {id:2,danger_no:'YH-2026-0029',location:'城西 DMA 计量井',type:'井盖破损',level:'中',reporter:'刘洋',report_time:'2026-09-12 15:02',status:'处置中',ai_recognized:false,desc:'现场照片确认铸铁井盖破裂，存在坠井风险'},
    {id:3,danger_no:'YH-2026-0027',location:'滨江大道四通井室',type:'积水渗漏',level:'中',reporter:'周涛',report_time:'2026-09-11 09:40',status:'已闭环',ai_recognized:true,desc:'AI 识别井室积水后现场复核，已安排抽排并修复渗点'},
    {id:4,danger_no:'YH-2026-0033',location:'城南加压泵站围栏',type:'安防隐患',level:'低',reporter:'王芳',report_time:'2026-09-14 08:15',status:'待派单',ai_recognized:false,desc:'围栏侧倾，视频监控补盲'}
  ];
  const patrolTrack = [
    {staff:'张峰',order:'XJ-2026-0914-01',km:6.8,duration:'3h12m',points_done:12,points_total:18,status:'进行中',
     pts:[[31.22820,121.47260],[31.22910,121.47420],[31.23042,121.47367],[31.23120,121.47580],[31.23198,121.47810],[31.23260,121.48040]]},
    {staff:'刘洋',order:'XJ-2026-0914-02',km:3.1,duration:'1h48m',points_done:2,points_total:6,status:'进行中',
     pts:[[31.23210,121.46510],[31.23140,121.46680],[31.23080,121.46890]]}
  ];
  const calibrations = [
    {id:1,task_no:'BD-2026-0088',device:'FT-GS-0407 出厂区流量计',type:'周期标定',plan_date:'2026-09-16',assignee:'周涛',status:'待审核'},
    {id:2,task_no:'BD-2026-0086',device:'PT-GS-0406 压力变送器',type:'异常标定',plan_date:'2026-09-14',assignee:'张峰',status:'执行中'},
    {id:3,task_no:'BD-2026-0081',device:'QC-GS-0502 浊度仪',type:'周期标定',plan_date:'2026-09-10',assignee:'陈昊',status:'已通过'}
  ];

  /* ========== S5 应急指挥调度 ========== */
  const accidents = [
    {id:1,accident_no:'SG-2026-0021',title:'城西供水区疑似 DN300 暗漏',level:'Ⅱ级',source:'监测告警联动',report_time:'2026-09-14 21:45',reporter:'值班室-吴敏',location:'城西 DMA 计量井段',status:'指挥派单中',closed_loop:'接报→研判→派单',involved:'刘洋/抢修1班/应急供水车 2 台'},
    {id:2,accident_no:'SG-2026-0019',title:'管廊段甲烷浓度抬升事件',level:'Ⅲ级',source:'值守巡检',report_time:'2026-09-14 21:40',reporter:'陈昊',location:'管廊段 K2+300',status:'处置中',closed_loop:'接报→派单→处置',involved:'抢修2班/通风组'},
    {id:3,accident_no:'SG-2026-0017',title:'滨江大道施工挖断 DN400',level:'Ⅰ级',source:'移动端上报',report_time:'2026-09-12 14:22',reporter:'外部施工方',location:'滨江大道与中山路交叉口',status:'已完成',closed_loop:'全闭环+复盘',involved:'全员联动/2 台抢险车'}
  ];
  const rescueOrders = [
    {id:1,order_no:'QX-2026-0033',accident:'SG-2026-0021',team:'抢修1班',leader:'赵强',vehicle:'应急抢险车-01',assign_time:'2026-09-14 21:52',status:'已领取',eta:'22:15'},
    {id:2,order_no:'QX-2026-0034',accident:'SG-2026-0021',team:'应急供水组',leader:'孙立',vehicle:'应急供水车-02',assign_time:'2026-09-14 21:55',status:'待领取',eta:'-'},
    {id:3,order_no:'QX-2026-0031',accident:'SG-2026-0019',team:'通风组',leader:'钱进',vehicle:'工程车-03',assign_time:'2026-09-14 21:47',status:'处置中',eta:'-'}
  ];
  const materials = [
    {id:1,mat_no:'WZ-DN300',name:'DN300 球墨铸铁管',spec:'6m/根',store:'中心仓库',stock:24,unit:'根',safe_stock:10,state:'正常'},
    {id:2,mat_no:'WZ-FM400',name:'DN400 蝶阀',spec:'含法兰',store:'中心仓库',stock:4,unit:'台',safe_stock:4,state:'低于安全库存'},
    {id:3,mat_no:'WZ-PUMP',name:'潜水排污泵',spec:'15kW',store:'南区分库',stock:6,unit:'台',safe_stock:3,state:'正常'},
    {id:4,mat_no:'WZ-PIPE-CLAMP',name:'哈夫节抱箍',spec:'DN200-600',store:'中心仓库',stock:12,unit:'套',safe_stock:8,state:'正常'}
  ];
  const dutyRoster = [
    {id:1,date:'2026-09-14',shift:'夜班(20:00-08:00)',leader:'吴敏',members:'赵强/钱进/孙立',phone:'021-6*******',status:'在岗'},
    {id:2,date:'2026-09-15',shift:'白班(08:00-20:00)',leader:'李建国',members:'周涛/王芳/刘洋',phone:'021-6*******',status:'待值班'}
  ];
  const emergencyPlans = [
    {id:1,plan_no:'YA-2026-DN300',name:'供水管网爆管应急处置预案',version:'v3.2',level:'Ⅰ/Ⅱ级',updated:'2026-08-30',drill_count:4,status:'已发布'},
    {id:2,plan_no:'YA-2026-RQ',name:'燃气泄漏应急处置预案',version:'v2.7',level:'Ⅰ级',updated:'2026-07-12',drill_count:2,status:'已发布'},
    {id:3,plan_no:'YA-2026-FS',name:'防汛防台专项应急预案',version:'v4.0',level:'Ⅱ级',updated:'2026-06-01',drill_count:6,status:'已发布'}
  ];
  const drills = [
    {id:1,drill_no:'YL-2026-006',plan:'YA-2026-DN300',name:'爆管应急联合演练',date:'2026-09-20',org:'调度中心/抢修1班',status:'筹备中'},
    {id:2,drill_no:'YL-2026-005',plan:'YA-2026-FS',name:'防汛应急桌面推演',date:'2026-08-18',org:'全员',status:'已复盘',score:92}
  ];

  /* ========== S6 设备资产全生命周期 ========== */
  const lifecycleAssets = [
    {id:1,asset_no:'ZB-2018-0007',name:'城南泵站 2# 离心泵',category:'机泵设备',area:'城南加压区',status:'在用',install_date:'2018-05-12',warranty_end:'2028-05-12',last_case:'2026-08-20 例行维保',bpm:'-'},
    {id:2,asset_no:'DT-2020-0012',name:'出厂区流量计',category:'计量仪表',area:'出厂区',status:'在用',install_date:'2020-09-01',warranty_end:'2030-09-01',last_case:'2026-09-01 检定合格',bpm:'-'},
    {id:3,asset_no:'TZ-2016-0021',name:'中心调度阀台',category:'自控设备',area:'调度中心',status:'待检修',install_date:'2016-11-30',warranty_end:'2026-11-30',last_case:'2026-09-02 上报故障',bpm:'BPM-改装审批中'},
    {id:4,asset_no:'GG-2015-0009',name:'DN800 输水干管',category:'输配管道',area:'北二区',status:'在用',install_date:'2015-12-05',warranty_end:'-',last_case:'2026-07-15 例行巡检',bpm:'-'},
    {id:5,asset_no:'BZ-2012-0003',name:'老城加压泵 1#',category:'机泵设备',area:'老城区',status:'报废审批中',install_date:'2012-03-18',warranty_end:'-',last_case:'2026-09-05 报废申请',bpm:'BPM-报废审批中'},
    {id:6,asset_no:'DT-2014-0006',name:'旧式机械水表批次',category:'计量仪表',area:'老城区',status:'已变卖',install_date:'2014-06-01',warranty_end:'-',last_case:'2026-08-22 变卖处置完成',bpm:'BPM-已归档'}
  ];
  const bpmFlows = [
    {id:1,bpm_no:'BPM-2026-0101',type:'设备调拨',title:'DN300 电磁流量计 调拨 城西→城南',applyer:'孙立',apply_time:'2026-09-14 09:20',node:'设备科长审批',status:'审批中'},
    {id:2,bpm_no:'BPM-2026-0098',type:'改装改造',title:'中心调度阀台 PLC 升级改造',applyer:'李建国',apply_time:'2026-09-12 14:05',node:'分管领导审批',status:'审批中'},
    {id:3,bpm_no:'BPM-2026-0091',type:'设备报废',title:'老城加压泵 1# 报废处置',applyer:'王芳',apply_time:'2026-09-05 10:40',node:'财务复核',status:'审批中'},
    {id:4,bpm_no:'BPM-2026-0086',type:'设备变卖',title:'旧式机械水表批次 变卖',applyer:'赵强',apply_time:'2026-08-18 11:15',node:'已归档',status:'已完成'}
  ];

  /* ========== S7 系统管理与租户 ========== */
  const sysUsers = [
    {id:1,username:'super',name:'超级管理员',role:'超级管理员',tenant:'平台运营方',last_login:'2026-09-14 21:30',status:'正常'},
    {id:2,username:'lijg',name:'李建国',role:'调度主管',tenant:'市自来水公司',last_login:'2026-09-14 20:12',status:'正常'},
    {id:3,username:'zhangf',name:'张峰',role:'巡检员',tenant:'市自来水公司',last_login:'2026-09-14 18:44',status:'正常'},
    {id:4,username:'sunl',name:'孙立',role:'资产管理员',tenant:'市自来水公司',last_login:'2026-09-14 16:02',status:'正常'},
    {id:5,username:'wumin',name:'吴敏',role:'监测值班员',tenant:'市自来水公司',last_login:'2026-09-14 21:50',status:'正常'},
    {id:6,username:'qh_gs',name:'青禾燃气（租户）',role:'租户管理员',tenant:'青禾燃气',last_login:'2026-09-13 15:31',status:'停用'}
  ];
  const tenants = [
    {id:1,code:'platform',name:'平台运营方',pkg:'全量版',users:12,quota:'不限',data_scope:'全部数据',status:'正常'},
    {id:2,code:'zls',name:'市自来水公司',pkg:'专业版',users:286,quota:'300 用户',data_scope:'供水域',status:'正常'},
    {id:3,code:'qh_gas',name:'青禾燃气',pkg:'标准版',users:54,quota:'80 用户',data_scope:'燃气域',status:'停用'},
    {id:4,code:'twy',name:'太仓水务',pkg:'专业版',users:97,quota:'120 用户',data_scope:'供水+排水',status:'正常'}
  ];
  const dicts = [
    {id:1,type:'设备类型',code:'flow_meter',label:'流量仪表',scope:'全域',updated:'2026-08-12'},
    {id:2,type:'设备类型',code:'pressure_meter',label:'压力仪表',scope:'全域',updated:'2026-08-12'},
    {id:3,type:'公称口径',code:'DN300',label:'DN300',scope:'管网域',updated:'2026-07-02'},
    {id:4,type:'告警等级',code:'high',label:'高',scope:'监测域',updated:'2026-06-18'},
    {id:5,type:'隐患类型',code:'occupy',label:'管线占压',scope:'巡检域',updated:'2026-09-01'}
  ];
  const auditLogs = [
    {id:1,time:'2026-09-14 21:52:10',user:'wumin',action:'告警研判',target:'SG-2026-0021',ip:'10.8.12.44',result:'成功'},
    {id:2,time:'2026-09-14 21:30:02',user:'super',action:'阈值批量下发',target:'12 台设备',ip:'10.8.12.10',result:'成功'},
    {id:3,time:'2026-09-14 20:12:44',user:'lijg',action:'工单派发',target:'QX-2026-0033',ip:'10.8.12.61',result:'成功'},
    {id:4,time:'2026-09-14 18:02:19',user:'qh_gs',action:'登录',target:'- -',ip:'58.34.**.**',result:'拒绝(停用)'}
  ];

  /* ========== S10 政企对接与开放 API ========== */
  const openApps = [
    {id:1,app_id:'gis_open_001',name:'市政监管数据推送',type:'数据推送',scopes:'push_zy / push_zy_pipe_bim',qps:100,status:'已启用',created:'2026-03-01',calls_30d:184233},
    {id:2,app_id:'gis_open_002',name:'第三方 BPM 工单对接',type:'工单对接',scopes:'process-instance / task',qps:50,status:'已启用',created:'2026-05-12',calls_30d:38211},
    {id:3,app_id:'gis_open_003',name:'政务公开查询',type:'公开查询',scopes:'public/pipe / public/asset',qps:20,status:'审核中',created:'2026-09-10',calls_30d:0}
  ];
  const openLogs = [
    {id:1,time:'2026-09-14 21:52:30',app:'gis_open_001',api:'POST /open/v1/push_zy/pipe',code:200,latency:'128ms',ip:'10.9.4.21'},
    {id:2,time:'2026-09-14 21:51:02',app:'gis_open_002',api:'POST /open/v1/process-instance/createNew',code:200,latency:'96ms',ip:'10.9.4.33'},
    {id:3,time:'2026-09-14 21:48:44',app:'gis_open_002',api:'POST /open/v1/task/approve',code:200,latency:'81ms',ip:'10.9.4.33'},
    {id:4,time:'2026-09-14 21:44:10',app:'gis_open_001',api:'POST /open/v1/push_zy_pipe_bim',code:401,latency:'6ms',ip:'203.0.113.7'}
  ];

  /* ========== S8 大屏汇总 ========== */
  const summary = {
    total_overlay: 1284, online_device: 486, offline_device: 12, active_pipe_km: 96.8,
    today_alarm: 7, unhandled_alarm: 3, patrol_active: 2, hidden_danger_open: 3,
    emergency_open: 2, coverage: 96.2, response_rate: 98.6, ai_forecast: 3,
    pressure_trend: [0.62,0.60,0.58,0.59,0.61,0.60,0.57,0.52,0.47,0.51,0.55,0.56],
    flow_trend: [120,132,128,141,138,152,148,163,158,146,139,131],
    alarm_trend: [12,9,14,7,11,8,6,9,13,7,5,7],
    zonePressure: [
      {zone:'城东供水区',p:0.59,s:'正常'},{zone:'城西供水区',p:0.48,s:'注意'},
      {zone:'工业用水区',p:0.63,s:'正常'},{zone:'城南加压区',p:0.44,s:'告警'}
    ],
    alarmPie:[{k:'压力',v:31},{k:'流量',v:24},{k:'水质',v:14},{k:'阀门',v:12},{k:'其他',v:9}],
    patrolRank:[{name:'周涛',score:98,done:44},{name:'张峰',score:95,done:41},{name:'刘洋',score:91,done:38},{name:'王芳',score:88,done:35}]
  };

  return { overlayTypes, overlay, pipes, layerTree, collectBatch, collectPoint,
    monitorDevices, thresholdConfig, aiForecast, alarmInfo,
    patrolOrders, hiddenDangers, patrolTrack, calibrations,
    accidents, rescueOrders, materials, dutyRoster, emergencyPlans, drills,
    lifecycleAssets, bpmFlows,
    sysUsers, tenants, dicts, auditLogs,
    openApps, openLogs, summary };
})();
