/* SNOP · 全量 Mock 数据（字段对齐 snop_* / gis_ / patrol_ / iot_ / cnd_ / eam_ / sys_ 实体，中文业务文案）
 * 介质字段 media: gas 燃气 / water 供水 / heat 热力（D7 多介质分型） */
window.MOCK = {

  /* —— 运营工作台（index / F-V03/V04） —— */
  summary: {
    date:'2026-09-14',
    kpis:{
      pipe_km: 1286.4, devices: 12483, alarms_open: 27, alarms_level1: 2,
      patrol_today: 46, patrol_done: 39, dma_loss: 8.62, energy_yoy: -3.4,
      online_rate: 0.982, workorder_open: 18, accident_today: 0, iot_qps: 412
    },
    /* D7 单租户口径：每个租户只有其介质的数据，页面按当前租户取用，不得跨介质求和 */
    mediaKpis:{
      water:{ tenant:'江南水司', pipe_km:612.8, devices:6203, alarms_open:14, alarms_level1:1,
              patrol_today:26, patrol_done:22, dma_loss:8.62, online_rate:0.984, workorder_open:11, iot_qps:238, accident_today:0, energy_yoy:-2.8 },
      gas:  { tenant:'燃气公司', pipe_km:486.2, devices:4210, alarms_open:9,  alarms_level1:1,
              patrol_today:14, patrol_done:12, dma_loss:5.41, online_rate:0.981, workorder_open:5,  iot_qps:128, accident_today:0, energy_yoy:-4.1 },
      heat: { tenant:'热力集团', pipe_km:187.4, devices:2070, alarms_open:4,  alarms_level1:0,
              patrol_today:6,  patrol_done:5,  dma_loss:11.24, online_rate:0.976, workorder_open:2, iot_qps:46,  accident_today:0, energy_yoy:-3.9 }
    },
    trend7d:[62,58,71,66,74,69,77],
    alarmTrend7d:[14,11,17,9,12,15,8],
    mediaBreakdown:{ gas:{pipe_km:486.2,devices:4210,alarms:9}, water:{pipe_km:612.8,devices:6203,alarms:14}, heat:{pipe_km:187.4,devices:2070,alarms:4} },
    todos:[
      {id:1,title:'DN300 爆管告警待认领',src:'报警管理',level:'danger',time:'21:47'},
      {id:2,title:'9 月巡检计划审批待办',src:'巡检作业',level:'warn',time:'20:12'},
      {id:3,title:'压力表 PR-0311 阈值越限复核',src:'设备与采集',level:'warn',time:'19:05'},
      {id:4,title:'调拨单 BPM-2026-0918 待审批',src:'EAM 资产',level:'',time:'18:40'},
      {id:5,title:'DMA 梅花山区输差异常诊断',src:'DMA 计量漏损',level:'warn',time:'17:22'}
    ],
    eventLoop:[
      {t:'21:47:12',txt:'IoT 上行：流量表 FM-2024-0118 瞬时流量 0 (离线疑似)',lv:'d'},
      {t:'21:47:15',txt:'规则引擎生成 I 级告警 AL-2026-0918-07',lv:'d'},
      {t:'21:47:18',txt:'SSE 推送至值班台 / 大屏 / 移动端',lv:'a'},
      {t:'21:52:30',txt:'值班员认领并创建抢险工单 QX-2026-0930',lv:'w'},
      {t:'21:58:02',txt:'Geo-Agent 建议执行关阀分析（影响 236 户）',lv:'p'},
      {t:'22:01:44',txt:'关阀分析完成，影响管段 2 条，短信通知已发送',lv:'s'}
    ],
    /* 模块宫格：cnt 用中性描述，避免跨介质合计数字出现在单租户视图中（D7） */
    modules:[
      {key:'map',name:'管网一张图',desc:'AMap · 18-20 级清晰',cnt:'图层分级加载'},
      {key:'analysis',name:'空间分析',desc:'五类分析 MCP 注册',cnt:'9 算法'},
      {key:'dma',name:'DMA 计量漏损',desc:'六步法 · 输差诊断',cnt:'分区计量'},
      {key:'device',name:'设备与采集',desc:'设备主数据',cnt:'12 类设备'},
      {key:'iot',name:'IoT 接入',desc:'厂商适配器插件化',cnt:'8 厂商'},
      {key:'alarm',name:'报警管理',desc:'规则引擎 · 闭环',cnt:'阈值规则'},
      {key:'patrol',name:'巡检作业',desc:'工单状态机',cnt:'计划/执行'},
      {key:'cnd',name:'指挥调度',desc:'接报-抢险-评估',cnt:'应急预案'},
      {key:'eam',name:'EAM 资产',desc:'全生命周期 BPM',cnt:'资产台账'}
    ]
  },

  /* —— 图层与要素（layer / F-G02~G04,G13） —— */
  layers:[
    {id:1,name:'输水管线',media:'water',cls:'pipe',visible:true,order:1,zoom:'10-20',auth:['调度员','管理员'],cnt:412},
    {id:2,name:'配水管线',media:'water',cls:'pipe',visible:true,order:2,zoom:'12-20',auth:['调度员','管理员','巡检员'],cnt:1866},
    {id:3,name:'燃气管线-中压',media:'gas',cls:'pipe',visible:true,order:3,zoom:'11-20',auth:['燃气专员','管理员'],cnt:704},
    {id:4,name:'热力管网',media:'heat',cls:'pipe',visible:false,order:4,zoom:'12-20',auth:['热力专员','管理员'],cnt:231},
    {id:5,name:'阀门',media:'water',cls:'valve',visible:true,order:5,zoom:'14-20',auth:[],cnt:3218},
    {id:6,name:'消火栓',media:'water',cls:'facility',visible:true,order:6,zoom:'15-20',auth:[],cnt:1587},
    {id:7,name:'流量计',media:'water',cls:'meter',visible:true,order:7,zoom:'14-20',auth:['调度员'],cnt:642},
    {id:8,name:'压力表',media:'gas',cls:'meter',visible:true,order:8,zoom:'14-20',auth:['燃气专员'],cnt:486},
    {id:9,name:'调压站',media:'gas',cls:'facility',visible:true,order:9,zoom:'13-20',auth:['燃气专员'],cnt:58},
    {id:10,name:'换热站',media:'heat',cls:'facility',visible:false,order:10,zoom:'13-20',auth:['热力专员'],cnt:24},
    {id:11,name:'彩色标注',media:'water',cls:'mark',visible:true,order:11,zoom:'12-20',auth:[],cnt:326},
    {id:12,name:'地标',media:'water',cls:'landmark',visible:true,order:12,zoom:'10-20',auth:[],cnt:94}
  ],
  features:[
    {id:1,cls:'pipe',code:'GS-2024-0001',name:'过江输水干线',media:'water',dn:'DN800',material:'球墨铸铁',length_m:2360,depth:2.4,status:'在用'},
    {id:2,cls:'pipe',code:'GS-2024-0006',name:'解放路配水管',media:'water',dn:'DN300',material:'PE',length_m:1180,depth:1.6,status:'在用'},
    {id:3,cls:'valve',code:'FM-2024-0118',name:'滨江路 DN500 阀门',media:'water',dn:'DN500',material:'闸阀',length_m:0,depth:1.8,status:'开启'},
    {id:4,cls:'valve',code:'FM-2024-0119',name:'解放路 DN300 阀门',media:'water',dn:'DN300',material:'蝶阀',length_m:0,depth:1.5,status:'开启'},
    {id:5,cls:'meter',code:'FL-2026-0042',name:'工业园区流量计',media:'water',dn:'DN400',material:'电磁流量计',length_m:0,depth:0,status:'在线'},
    {id:6,cls:'meter',code:'PR-2026-0311',name:'梅花山压力表',media:'gas',dn:'-',material:'压力变送器',length_m:0,depth:0,status:'在线'},
    {id:7,cls:'facility',code:'XF-2024-0158',name:'人民广场消火栓',media:'water',dn:'DN150',material:'地上式',length_m:0,depth:0,status:'完好'},
    {id:8,cls:'facility',code:'TY-2026-009',name:'高新调压站',media:'gas',dn:'-',material:'调压柜',length_m:0,depth:0,status:'运行'},
    {id:9,cls:'mark',code:'BJ-2026-077',name:'施工提示标注',media:'water',dn:'-',material:'文字标注',length_m:0,depth:0,status:'显示'},
    {id:10,cls:'landmark',code:'DB-2025-012',name:'市政府地标',media:'water',dn:'-',material:'图标',length_m:0,depth:0,status:'显示'},
    {id:11,cls:'pipe',code:'RQ-2025-0102',name:'燃气中压环线',media:'gas',dn:'DN200',material:'PE',length_m:980,depth:1.2,status:'在用'},
    {id:12,cls:'pipe',code:'RL-2025-0031',name:'热力主管网',media:'heat',dn:'DN600',material:'预制保温管',length_m:1520,depth:1.9,status:'在用'}
  ],
  pipes:[
    {code:'GS-2024-0001',dn:'DN800',material:'球墨铸铁',length_m:2360,media:'water',depth:2.4,year:2019},
    {code:'GS-2024-0006',dn:'DN300',material:'PE',length_m:1180,media:'water',depth:1.6,year:2021},
    {code:'RQ-2025-0102',dn:'DN200',material:'PE',length_m:980,media:'gas',depth:1.2,year:2022},
    {code:'RL-2025-0031',dn:'DN600',material:'预制保温管',length_m:1520,media:'heat',depth:1.9,year:2020}
  ],

  /* —— 空间分析（analysis / F-A01~A10） —— */
  goldenCases:{ total:47, passed:47, last_run:'2026-09-14 20:00', scope:['关阀分析','连通性','拓扑','开挖','DMA'] },

  /* —— 设备与采集（device / F-D01~D10） —— */
  devices:[
    {id:1,cls:'流量计',code:'FL-2026-0042',name:'工业园区流量计',media:'water',region:'江南片区',status:'在线',install:'2023-06-12',calib:'2026-08-30'},
    {id:2,cls:'流量计',code:'FL-2026-0043',name:'滨江大道流量计',media:'water',region:'江北片区',status:'在线',install:'2023-06-12',calib:'2026-08-30'},
    {id:3,cls:'压力表',code:'PR-2026-0311',name:'梅花山燃气压力表',media:'gas',region:'梅花山片区',status:'在线',install:'2024-01-18',calib:'2026-09-01'},
    {id:4,cls:'压力表',code:'PR-2026-0312',name:'解放路供水压力表',media:'water',region:'解放路片区',status:'离线',install:'2022-11-03',calib:'2026-06-15'},
    {id:5,cls:'检测表',code:'JC-2025-0077',name:'地下车库甲烷检测',media:'gas',region:'中心片区',status:'在线',install:'2025-03-22',calib:'2026-07-20'},
    {id:6,cls:'监测表',code:'JC-2025-0102',name:'热力井温度监测',media:'heat',region:'高新区',status:'在线',install:'2025-05-30',calib:'2026-08-11'},
    {id:7,cls:'阀门',code:'FM-2024-0118',name:'滨江路 DN500 阀门',media:'water',region:'江北片区',status:'开启',install:'2019-04-02',calib:'2026-05-19'},
    {id:8,cls:'采集终端',code:'RTU-2025-021',name:'江南分区 RTU',media:'water',region:'江南片区',status:'在线',install:'2025-08-14',calib:'-'},
    {id:9,cls:'消防设备',code:'XF-2024-0158',name:'人民广场消火栓',media:'water',region:'中心片区',status:'完好',install:'2020-09-09',calib:'2026-04-01'},
    {id:10,cls:'输配设备',code:'SP-2023-066',name:'高新调压站机组',media:'gas',region:'高新区',status:'运行',install:'2023-10-01',calib:'2026-08-25'},
    {id:11,cls:'大用户表',code:'DG-2024-118',name:'钢厂大用户水表',media:'water',region:'江南片区',status:'在线',install:'2024-02-28',calib:'2026-06-30'},
    {id:12,cls:'监控设备',code:'CM-2025-043',name:'过江管段监控',media:'water',region:'江北片区',status:'在线',install:'2025-01-15',calib:'-'}
  ],
  collectBatches:[
    {id:1,identifier:'CJ-2026-0901',source:'RTK',count:46,pass:0.864,status:'已入库',created:'2026-09-01',operator:'张测量'},
    {id:2,identifier:'CJ-2026-0905',source:'CAD',count:128,pass:0.912,status:'质检中',created:'2026-09-05',operator:'李测绘'},
    {id:3,identifier:'CJ-2026-0910',source:'RTK',count:34,pass:0.941,status:'待质检',created:'2026-09-10',operator:'张测量'},
    {id:4,identifier:'CJ-2026-0912',source:'手工',count:12,pass:1.0,status:'已入库',created:'2026-09-12',operator:'王录入'}
  ],
  collectPoints:[
    {id:1,batch_id:1,code:'P030',type:'管点',x:116.397128,y:39.916527,check:'通过'},
    {id:2,batch_id:1,code:'P015',type:'管点',x:116.398212,y:39.917334,check:'通过'},
    {id:3,batch_id:1,code:'P380',type:'管点',x:116.399455,y:39.918001,check:'悬挂点'},
    {id:4,batch_id:1,code:'2026-P102',type:'管点',x:116.397128,y:39.916527,check:'重合点'},
    {id:5,batch_id:1,code:'L001',type:'管线',x:0,y:0,check:'通过'}
  ],
  granular:{ realtime:'921 m³/h', hourly:[812,845,890,902,867,855], daily:19842, monthly:592300 },

  /* —— IoT（iot / F-I01~I09） —— */
  iotAdapters:[
    {id:1,vendor:'brt',name:'BRT 协议',mode:'MQTT + HTTP轮询',devices:3260,state:'运行',qps:120,broker:'mqtt://b1:1883'},
    {id:2,vendor:'cangnan',name:'苍南仪表',mode:'MQTT',devices:2140,state:'运行',qps:86,broker:'mqtt://b1:1883'},
    {id:3,vendor:'fangtang',name:'方塘物联',mode:'MQTT',devices:1802,state:'运行',qps:64,broker:'mqtt://b2:1883'},
    {id:4,vendor:'gaxc',name:'高新传感',mode:'MQTT',devices:1420,state:'运行',qps:52,broker:'mqtt://b2:1883'},
    {id:5,vendor:'rongsu',name:'容苏科技',mode:'MQTT',devices:1290,state:'运行',qps:41,broker:'mqtt://b3:1883'},
    {id:6,vendor:'tianhui',name:'天汇智联',mode:'HTTP轮询',devices:940,state:'运行',qps:28,broker:'-'},
    {id:7,vendor:'xianwei',name:'先为水表',mode:'HTTP轮询',devices:816,state:'降级',qps:12,broker:'-'},
    {id:8,vendor:'demo',name:'演示模拟器',mode:'MQTT',devices:815,state:'运行',qps:9,broker:'mqtt://b3:1883'}
  ],
  iotRealtime:[
    {device:'FL-2026-0042',metric:'瞬时流量',value:'921',unit:'m³/h',ts:'22:01:44',state:'正常',media:'water'},
    {device:'FL-2026-0042',metric:'累计流量',value:'19842',unit:'m³',ts:'22:01:44',state:'正常',media:'water'},
    {device:'PR-2026-0311',metric:'管道压力',value:'0.42',unit:'MPa',ts:'22:01:41',state:'预警',media:'gas'},
    {device:'PR-2026-0312',metric:'管道压力',value:'-',unit:'MPa',ts:'21:12:00',state:'离线',media:'water'},
    {device:'JC-2025-0077',metric:'甲烷浓度',value:'0.8',unit:'%LEL',ts:'22:01:38',state:'正常',media:'gas'},
    {device:'JC-2025-0102',metric:'供水温度',value:'68.5',unit:'℃',ts:'22:01:40',state:'正常',media:'heat'},
    {device:'DG-2024-118',metric:'瞬时流量',value:'156',unit:'m³/h',ts:'22:01:35',state:'正常',media:'water'}
  ],
  offlineDevices:{ total:12483, offline:41, suspect:7 },

  /* —— 报警管理（alarm / F-L01~L06） —— */
  alarmRules:[
    {id:1,metric:'管道压力',op:'低于',threshold:'0.15 MPa',duration:'≥5 min',media:'water',enabled:true},
    {id:2,metric:'管道压力',op:'高于',threshold:'0.60 MPa',duration:'≥3 min',media:'water',enabled:true},
    {id:3,metric:'甲烷浓度',op:'高于',threshold:'5 %LEL',duration:'≥1 min',media:'gas',enabled:true},
    {id:4,metric:'瞬时流量',op:'等于',threshold:'0 m³/h',duration:'≥30 min',media:'water',enabled:true},
    {id:5,metric:'离线时长',op:'高于',threshold:'60 min',duration:'-',media:'heat',enabled:false},
    {id:6,metric:'供水温度',op:'低于',threshold:'55 ℃',duration:'≥15 min',media:'heat',enabled:true},
    {id:7,metric:'瞬时流量',op:'高于',threshold:'1400 m³/h',duration:'≥10 min',media:'water',enabled:true},
    {id:8,metric:'管道压力',op:'低于',threshold:'0.10 MPa',duration:'≥5 min',media:'gas',enabled:true}
  ],
  alarms:[
    {id:1,code:'AL-2026-0918-07',level:'I',device:'FM-2024-0118',metric:'瞬时流量',value:'0 m³/h',threshold:'0 持续 30min',status:'unhandled',ts:'2026-09-14 21:47',type:'设备异常',media:'water'},
    {id:2,code:'AL-2026-0918-06',level:'II',device:'PR-2026-0311',metric:'管道压力',value:'0.42 MPa',threshold:'>0.60 持续 3min',status:'claimed',ts:'2026-09-14 20:31',type:'越限',media:'gas'},
    {id:3,code:'AL-2026-0918-05',level:'II',device:'PR-2026-0312',metric:'离线',value:'61 min',threshold:'>60 min',status:'processing',ts:'2026-09-14 20:12',type:'离线',media:'water'},
    {id:4,code:'AL-2026-0918-04',level:'III',device:'FL-2026-0043',metric:'瞬时流量',value:'1482 m³/h',threshold:'>1400 持续 10min',status:'closed',ts:'2026-09-14 16:40',type:'越限',media:'water'},
    {id:5,code:'AL-2026-0918-03',level:'III',device:'JC-2025-0077',metric:'甲烷浓度',value:'3.2 %LEL',threshold:'>5 %LEL',status:'closed',ts:'2026-09-14 14:22',type:'越限',media:'gas'},
    {id:6,code:'AL-2026-0917-22',level:'II',device:'JC-2025-0102',metric:'供水温度',value:'51 ℃',threshold:'<55 持续 15min',status:'closed',ts:'2026-09-13 09:05',type:'越限',media:'heat'},
    {id:7,code:'AL-2026-0918-02',level:'II',device:'PR-2026-0314',metric:'管道压力',value:'0.08 MPa',threshold:'<0.10 持续 5min',status:'unhandled',ts:'2026-09-14 22:12',type:'越限',media:'gas'},
    {id:8,code:'AL-2026-0918-01',level:'III',device:'RT-2026-007',metric:'回水温度',value:'42 ℃',threshold:'<45 持续 20min',status:'claimed',ts:'2026-09-14 21:30',type:'越限',media:'heat'},
    {id:9,code:'AL-2026-0917-19',level:'III',device:'RT-2026-008',metric:'离线',value:'75 min',threshold:'>60 min',status:'closed',ts:'2026-09-13 18:20',type:'离线',media:'heat'}
  ],

  /* —— DMA 计量漏损（dma / F-M01~M06） —— */
  dmaZones:[
    {id:1,name:'江南 DMA 一区',parent:'-',supply:38200,sale:34980,loss:8.43,level:'一级',meters:12},
    {id:2,name:'江南 DMA 二区',parent:'-',supply:25400,sale:22860,loss:10.0,level:'一级',meters:9},
    {id:3,name:'梅花山分区',parent:'江南 DMA 二区',supply:9800,sale:8730,loss:10.92,level:'二级',meters:5},
    {id:4,name:'解放路分区',parent:'-',supply:44100,sale:40770,loss:7.55,level:'一级',meters:15},
    {id:5,name:'高新区分区',parent:'-',supply:18600,sale:17420,loss:6.34,level:'一级',meters:8},
    {id:6,name:'过江支线',parent:'解放路分区',supply:6200,sale:5480,loss:11.61,level:'二级',meters:4}
  ],
  dmaSixStep:[
    {step:1,name:'供水量核对',status:'done',result:'水司供水量与 DMA 入口合计偏差 0.8%，通过'},
    {step:2,name:'最小夜间流量分析',status:'done',result:'MNF 32.6 m³/h，占时供水量 8.5%，偏高'},
    {step:3,name:'压力管理',status:'done',result:'平均压力 0.38 MPa，建议分区降压 0.02 MPa'},
    {step:4,name:'主动检漏',status:'current',result:' listening rod 法布置 12 点，发现疑似漏点 2 处'},
    {step:5,name:'维修修复',status:'todo',result:'待生成维修工单'},
    {step:6,name:'效果评估',status:'todo',result:'修复后复测 MNF 预期降至 18 m³/h'}
  ],
  dmaSim:{ mnf:32.6, forecast:18.2, save_daily:'344 m³/日', save_year:'12.6 万 m³/年' },

  /* —— 巡检（patrol / F-P01~P12） —— */
  patrolPlans:[
    {id:1,name:'9 月江北管网巡检',area:'江北片区',cycle:'每周',days:'周一/周四',owner:'陈巡检',progress:0.72,media:'water'},
    {id:2,name:'中压管线月检',area:'高新区',cycle:'每月',days:'1-5 日',owner:'周安检',progress:0.45,media:'gas'},
    {id:3,name:'热力井季度普查',area:'高新区',cycle:'每季',days:'Q3',owner:'吴热力',progress:0.90,media:'heat'}
  ],
  patrolOrders:[
    {id:1,order_no:'XJ-2026-0930',name:'江北片区例行巡检',type:'计划巡检',assignee:'陈巡检',status:'executing',plan:'2026-09-14 09:00',points:24,done:17,media:'water'},
    {id:2,order_no:'XJ-2026-0929',name:'调压站专项特巡',type:'专项巡检',assignee:'周安检',status:'executing',plan:'2026-09-14 14:00',points:8,done:8,media:'gas'},
    {id:3,order_no:'XJ-2026-0928',name:'滨江路阀门普查',type:'计划巡检',assignee:'刘巡检',status:'pending',plan:'2026-09-15 09:00',points:32,done:0,media:'water'},
    {id:4,order_no:'XJ-2026-0925',name:'梅花山隐患复查',type:'处置工单',assignee:'陈巡检',status:'done',plan:'2026-09-12 10:00',points:6,done:6,media:'water'},
    {id:5,order_no:'XJ-2026-0922',name:'过江管段护线巡检',type:'计划巡检',assignee:'刘巡检',status:'paused',plan:'2026-09-11 09:00',points:12,done:5,media:'water'},
    {id:6,order_no:'QX-2026-0930',name:'DN300 管道泄漏抢修配合',type:'抢险配合',assignee:'赵抢险',status:'executing',plan:'2026-09-14 22:10',points:4,done:1,media:'water'},
    {id:7,order_no:'XJ-2026-0927',name:'中压管线阀室巡查',type:'计划巡检',assignee:'周安检',status:'executing',plan:'2026-09-14 09:30',points:18,done:11,media:'gas'},
    {id:8,order_no:'XJ-2026-0926',name:'调压站消防设施检查',type:'专项巡检',assignee:'周安检',status:'pending',plan:'2026-09-15 14:00',points:6,done:0,media:'gas'},
    {id:9,order_no:'XJ-2026-0924',name:'供热首站设备巡检',type:'计划巡检',assignee:'吴热力',status:'executing',plan:'2026-09-14 08:30',points:14,done:9,media:'heat'},
    {id:10,order_no:'XJ-2026-0923',name:'热力井温度普查',type:'计划巡检',assignee:'吴热力',status:'pending',plan:'2026-09-16 09:00',points:22,done:0,media:'heat'}
  ],
  hiddenDangers:[
    {id:1,code:'YH-2026-077',loc:'梅花山路与解放路交叉口',level:'重大',status:'整改中',reporter:'周安检',ts:'2026-09-10',desc:'调压柜周边施工堆载，安全距离不足',media:'gas'},
    {id:2,code:'YH-2026-076',loc:'滨江路 K3+200',level:'一般',status:'待定级',reporter:'陈巡检',ts:'2026-09-13',desc:'阀门井盖破损，存在坠落风险',media:'water'},
    {id:3,code:'YH-2026-071',loc:'工业园南门',level:'一般',status:'已闭环',reporter:'刘巡检',ts:'2026-09-05',desc:'消火栓渗漏',media:'water'},
    {id:4,code:'YH-2026-069',loc:'热力井 W-118',level:'重大',status:'整改中',reporter:'吴热力',ts:'2026-09-08',desc:'井内积水超过警戒线',media:'heat'},
    {id:5,code:'YH-2026-074',loc:'中压管线 K5+100',level:'较大',status:'整改中',reporter:'周安检',ts:'2026-09-11',desc:'阀室放散管标识缺失',media:'gas'},
    {id:6,code:'YH-2026-072',loc:'供热支线 W-203',level:'一般',status:'待定级',reporter:'吴热力',ts:'2026-09-12',desc:'补偿器保温层破损',media:'heat'}
  ],
  patrolTrack:{ staff:'陈巡检', date:'2026-09-14', km:6.8, points:17, span:'09:02-16:40', media:'water',
    pts:[[39.9052,116.3921],[39.9068,116.3948],[39.9081,116.3975],[39.9095,116.3992],[39.9102,116.4021],[39.9118,116.4044],[39.9131,116.4068],[39.9145,116.4085],[39.9157,116.4102],[39.9169,116.4128]] },
  calibrations:[
    {id:1,code:'BD-2026-0311',device:'PR-2026-0311',type:'压力标定',status:'待审核',apply:'2026-09-12',reviewer:'-',media:'gas'},
    {id:2,code:'BD-2026-0310',device:'FL-2026-0042',type:'流量标定',status:'已审核',apply:'2026-09-08',reviewer:'王主管',media:'water'},
    {id:3,code:'BD-2026-0309',device:'JC-2025-0077',type:'检测标定',status:'已审核',apply:'2026-09-02',reviewer:'王主管',media:'gas'}
  ],
  patrolStats:{ month:'2026-09', orders_done:186, dangers:31, excavation:4, iot_alarm:57, hours:1284,
    recognition:{total:124, correct:112, rate:0.903},
    rank:[{name:'陈巡检',score:98.2,orders:42},{name:'周安检',score:96.8,orders:38},{name:'刘巡检',score:95.1,orders:35},{name:'吴热力',score:93.5,orders:31}] },
  excavations:[
    {id:1,code:'WK-2026-018',loc:'解放路 K2+100',company:'市政三公司',status:'监护中',start:'2026-09-12',near:'DN300 配水管 1.2m',media:'water'},
    {id:2,code:'WK-2026-017',loc:'梅山路东延',company:'城投建设',status:'已完工',start:'2026-09-02',near:'中压燃气管 2.0m',media:'gas'}
  ],

  /* —— 指挥调度（cnd / F-C01~C08） —— */
  cndAccidents:[
    {id:1,accident_no:'SG-2026-0930',title:'DN300 供水管爆管',level:'II',source:'值守电话',loc:'解放路 K3+500',status:'处置中',ts:'2026-09-14 21:50',reporter:'值班台',media:'water'},
    {id:2,accident_no:'SG-2026-0901',title:'燃气泄漏（已排除）',level:'III',source:'移动端上报',loc:'梅花山路',status:'已归档',ts:'2026-09-01 10:12',reporter:'周安检',media:'gas'},
    {id:3,accident_no:'SG-2026-0821',title:'热力井冒汽',level:'III',source:'AI 视频识别',loc:'高新区 W 区',status:'已归档',ts:'2026-08-21 15:30',reporter:'视频告警',media:'heat'}
  ],
  cndRescues:[
    {id:1,order_no:'QX-2026-0930',accident:'SG-2026-0930',team:'抢险一班',leader:'赵抢险',members:8,status:'处置中',start:'2026-09-14 21:58',eta:'22:28',media:'water'},
    {id:2,order_no:'QX-2026-0901',accident:'SG-2026-0901',team:'抢险二班',leader:'钱应急',members:6,status:'已完成',start:'2026-09-01 10:40',eta:'11:10',media:'gas'}
  ],
  cndMaterials:[
    {id:1,name:'DN300 球墨管',store:'中心仓库',stock:12,unit:'根',safe:4,media:'water'},
    {id:2,name:'DN300 盲板',store:'中心仓库',stock:6,unit:'块',safe:2,media:'water'},
    {id:3,name:'快干水泥',store:'江南分库',stock:40,unit:'袋',safe:10,media:'water'},
    {id:4,name:'防爆照明组',store:'中心仓库',stock:8,unit:'套',safe:3,media:'gas'},
    {id:5,name:'气体检测仪',store:'江北分库',stock:5,unit:'台',safe:2,media:'gas'}
  ],
  cndDuty:[
    {id:1,shift:'夜班',leader:'孙值班',members:'孙值班/郑调度/李接线',span:'20:00-08:00',date:'2026-09-14'},
    {id:2,shift:'白班',leader:'何值班',members:'何值班/冯调度/许接线',span:'08:00-20:00',date:'2026-09-15'}
  ],
  cndPlans:[
    {id:1,name:'供水管网爆管应急处置预案',ver:'v3.2',type:'供水',updated:'2026-08-30',org:'调度中心/抢险班',media:'water'},
    {id:2,name:'燃气泄漏专项应急预案',ver:'v2.1',type:'燃气',updated:'2026-07-12',org:'燃气部/消防联动',media:'gas'},
    {id:3,name:'高温热网故障应急预案',ver:'v1.8',type:'热力',updated:'2026-06-20',org:'热力部',media:'heat'}
  ],
  cndDrills:[
    {id:1,name:'秋季管道泄漏应急演练',date:'2026-09-20',type:'实战',status:'筹备中',score:'-',media:'water'},
    {id:2,name:'燃气泄漏桌面推演',date:'2026-08-15',type:'桌面',status:'已完成',score:92,media:'gas'},
    {id:3,name:'高温热网演练',date:'2026-07-10',type:'实战',status:'已完成',score:88,media:'heat'}
  ],
  cndReport:{ accident:'SG-2026-0930', template:'II 级事故评估报告模板', sections:['事故经过','响应时效','处置措施','物资消耗','损失评估','改进建议'] },

  /* —— EAM 资产（eam / F-E01~E06） —— */
  eamAssets:[
    {id:1,asset_no:'ZC-2024-1188',name:'电磁流量计 EMF-400',category:'计量设备',status:'在用',org:'江南水司',gis:'FL-2026-0042',buy:'2024-06-01',value:48000,media:'water'},
    {id:2,asset_no:'ZC-2024-1189',name:'压力变送器 PT-310',category:'计量设备',status:'在用',org:'燃气公司',gis:'PR-2026-0311',buy:'2024-06-01',value:12600,media:'gas'},
    {id:3,asset_no:'ZC-2023-0956',name:'闸阀 Z45X-500',category:'管阀配件',status:'在用',org:'江北水司',gis:'FM-2024-0118',buy:'2023-03-15',value:22000,media:'water'},
    {id:4,asset_no:'ZC-2022-0711',name:'老式水表批次',category:'计量设备',status:'待报废',org:'江南水司',gis:'-',buy:'2022-01-10',value:9600,media:'water'},
    {id:5,asset_no:'ZC-2025-0301',name:'换热站监控终端',category:'自控设备',status:'在用',org:'热力集团',gis:'RTU-2025-021',buy:'2025-08-01',value:15600,media:'heat'},
    {id:6,asset_no:'ZC-2024-1203',name:'调压柜 RTZ-200',category:'输配设备',status:'在用',org:'燃气公司',gis:'TY-2026-009',buy:'2024-09-10',value:86000,media:'gas'},
    {id:7,asset_no:'ZC-2024-1204',name:'调压器备件包',category:'管阀配件',status:'在用',org:'燃气公司',gis:'-',buy:'2024-09-10',value:12800,media:'gas'},
    {id:8,asset_no:'ZC-2023-0802',name:'板式换热器 BR0.5',category:'换热设备',status:'在用',org:'热力集团',gis:'-',buy:'2023-11-05',value:158000,media:'heat'},
    {id:9,asset_no:'ZC-2023-0803',name:'循环泵组 PH-200',category:'自控设备',status:'维保中',org:'热力集团',gis:'-',buy:'2023-11-05',value:64000,media:'heat'}
  ],
  eamMaint:[
    {id:1,asset:'ZC-2024-1188',plan:'半年度保养',next:'2026-10-01',last:'2026-04-01',status:'待执行',media:'water'},
    {id:2,asset:'ZC-2023-0956',plan:'季度润滑',next:'2026-09-28',last:'2026-06-28',status:'待执行',media:'water'},
    {id:3,asset:'ZC-2022-0711',plan:'-',next:'-',last:'-',status:'已停止',media:'water'}
  ],
  eamDisposal:[
    {id:1,bpm_no:'BPM-2026-0918',type:'调拨',asset:'ZC-2024-1189',from:'燃气公司',to:'江北燃气',status:'审批中',node:'分管副总',media:'gas'},
    {id:2,bpm_no:'BPM-2026-0911',type:'报废',asset:'ZC-2022-0711',from:'江南水司',to:'-',status:'审批中',node:'资产委员会',media:'water'},
    {id:3,bpm_no:'BPM-2026-0887',type:'变卖',asset:'ZC-2021-0512',from:'江南水司',to:'-',status:'已完成',node:'已归档',media:'water'},
    {id:4,bpm_no:'BPM-2026-0876',type:'改装',asset:'ZC-2023-0956',from:'江北水司',to:'-',status:'已完成',node:'已归档',media:'water'}
  ],
  eamPurchase:[
    {id:1,po_no:'PO-2026-0912',supplier:'苍南仪表股份',items:'DN15-25 智能水表 ×2000',amount:396000,status:'已入库',check:'验收合格',media:'water'},
    {id:2,po_no:'PO-2026-0905',supplier:'天汇智联科技',items:'RTU 终端 ×50',amount:78000,status:'验收中',check:'-',media:'heat'}
  ],
  eamBrands:[
    {id:1,name:'苍南仪表',type:'水表/流量计',contact:'0577-6888xxxx',level:'战略'},
    {id:2,name:'天汇智联',type:'RTU/网关',contact:'021-5588xxxx',level:'优选'},
    {id:3,name:'新兴铸管',type:'球墨铸铁管',contact:'0311-8788xxxx',level:'战略'}
  ],

  /* —— 平台底座（system / F-S04~S15,S17） —— */
  sysUsers:[
    {id:1,username:'admin',name:'超管',role:'超级管理员',tenant:'全部租户',client:'四端',status:'启用',last:'2026-09-14 22:00'},
    {id:2,username:'zhangjc',name:'张监测',role:'监测值班员',tenant:'江南水司',client:'管理后台/移动端',status:'启用',last:'2026-09-14 21:30'},
    {id:3,username:'chenxj',name:'陈巡检',role:'巡检外业',tenant:'江南水司',client:'移动端',status:'启用',last:'2026-09-14 16:40'},
    {id:4,username:'zhouaj',name:'周安检',role:'巡检外业',tenant:'燃气公司',client:'移动端',status:'启用',last:'2026-09-14 15:12'},
    {id:5,username:'lisw',name:'李领导',role:'决策领导',tenant:'集团本部',client:'大屏/portal',status:'启用',last:'2026-09-14 09:20'},
    {id:6,username:'wukeji',name:'吴技术（停用）',role:'数据生产',tenant:'测绘队',client:'管理后台',status:'禁用',last:'2026-08-30 18:00'}
  ],
  sysRoles:[
    {id:1,name:'超级管理员',users:1,menus:'全部',api:'全部',data:'跨租户'},
    {id:2,name:'监测值班员',users:12,menus:'工作台/设备/报警/大屏',api:'只读+处置',data:'本租户'},
    {id:3,name:'巡检外业',users:86,menus:'移动端全部',api:'工单/上报',data:'本人'},
    {id:4,name:'决策领导',users:5,menus:'工作台/大屏/报表',api:'只读',data:'本租户'}
  ],
  roleMatrix:{ role:'监测值班员',
    rows:[['运营工作台','✓','✓','—','—'],['管网一张图','✓','✓','—','—'],['设备与采集','✓','✓','✓','—'],['报警管理','✓','✓','✓','✓'],['DMA 计量漏损','✓','—','—','—'],['平台底座','—','—','—','—']] },
  sysMenus:[
    {id:1,type:'admin',name:'管理后台菜单树',items:15},
    {id:2,type:'portal',name:'portal 工作台菜单',items:9},
    {id:3,type:'app',name:'移动端菜单',items:6},
    {id:4,type:'dashboard',name:'大屏专用菜单',items:3}
  ],
  tenants:[
    {id:1,name:'江南水司',type:'供水',pkg:'企业版',users:238,devices:6203,expire:'2027-06-30',status:'正常'},
    {id:2,name:'燃气公司',type:'燃气',pkg:'企业版',users:121,devices:4210,expire:'2027-03-15',status:'正常'},
    {id:3,name:'热力集团',type:'热力',pkg:'标准版',users:86,devices:2070,expire:'2026-12-31',status:'临期'},
    {id:4,name:'集团本部',type:'混合',pkg:'旗舰版',users:45,devices:0,expire:'2029-01-01',status:'正常'}
  ],
  dictDomains:['snop_system','snop_gis','snop_patrol','snop_iot','snop_cnd','snop_asset'],
  dicts:[
    {id:1,domain:'snop_gis',type:'介质类型',items:'燃气/供水/热力',cnt:3},
    {id:2,domain:'snop_gis',type:'管材材质',items:'球墨铸铁/PE/钢管/预制保温管…',cnt:12},
    {id:3,domain:'snop_gis',type:'公称口径',items:'DN100~DN1200',cnt:14},
    {id:4,domain:'snop_iot',type:'厂商编码',items:'brt/cangnan/fangtang/gaxc…',cnt:8},
    {id:5,domain:'snop_patrol',type:'隐患等级',items:'重大/较大/一般',cnt:3},
    {id:6,domain:'snop_cnd',type:'事故等级',items:'I/II/III',cnt:3},
    {id:7,domain:'snop_asset',type:'资产类别',items:'计量设备/管阀配件/自控设备…',cnt:9},
    {id:8,domain:'snop_system',type:'客户端类型',items:'admin/portal/app/dashboard',cnt:4}
  ],
  auditLogs:[
    {id:1,user:'admin',action:'修改报警规则 AR-1 阈值',ip:'10.8.0.2',ts:'2026-09-14 21:05',result:'成功'},
    {id:2,user:'zhangjc',action:'认领告警 AL-2026-0918-06',ip:'10.8.0.35',ts:'2026-09-14 20:33',result:'成功'},
    {id:3,user:'chenxj',action:'移动端上报隐患 YH-2026-077',ip:'59.61.x.x',ts:'2026-09-14 16:44',result:'成功'},
    {id:4,user:'unknown',action:'登录失败（密码错误 ×5 已锁定）',ip:'222.77.x.x',ts:'2026-09-14 03:12',result:'拒绝'},
    {id:5,user:'admin',action:'导出统计报表 RPT-12',ip:'10.8.0.2',ts:'2026-09-13 18:20',result:'成功'}
  ],
  jobs:[
    {id:1,name:'离线设备判定',cron:'*/5 * * * *',last:'22:00',state:'运行'},
    {id:2,name:'DMA 产销日结',cron:'0 1 * * *',last:'01:00',state:'运行'},
    {id:3,name:'审计日志清理',cron:'0 3 1 * *',last:'09-01',state:'运行'},
    {id:4,name:'六库备份',cron:'0 2 * * *',last:'02:00',state:'运行'}
  ],
  backups:[
    {id:1,database:'snop_system',size:'2.1 GB',at:'2026-09-14 02:00',verify:'通过',keep:'30 天'},
    {id:2,database:'snop_gis',size:'18.4 GB',at:'2026-09-14 02:10',verify:'通过',keep:'30 天'},
    {id:3,database:'snop_iot',size:'46.8 GB',at:'2026-09-14 02:30',verify:'通过',keep:'14 天'},
    {id:4,database:'snop_asset',size:'1.2 GB',at:'2026-09-14 02:40',verify:'通过',keep:'30 天'}
  ],
  files:[
    {id:1,name:'爆管现场照片_01.jpg',biz:'告警取证',size:'2.4 MB',by:'赵抢险',ts:'2026-09-14 22:15'},
    {id:2,name:'CJ-2026-0905 导入.xlsx',biz:'采集导入',size:'860 KB',by:'李测绘',ts:'2026-09-05 10:02'},
    {id:3,name:'DMA 六步法报告.pdf',biz:'DMA 报告',size:'1.1 MB',by:'系统生成',ts:'2026-09-13 18:00'},
    {id:4,name:'预案 v3.2.docx',biz:'应急预案',size:'3.8 MB',by:'孙值班',ts:'2026-08-30 14:20'}
  ],
  messages:[
    {id:1,title:'I 级告警：FM-2024-0118 瞬时流量为 0',type:'告警',read:false,ts:'21:47'},
    {id:2,title:'巡检工单 XJ-2026-0930 已派发给你',type:'待办',read:false,ts:'21:52'},
    {id:3,title:'DMA 梅花山分区输差超阈值',type:'预警',read:false,ts:'17:22'},
    {id:4,title:'9 月绩效统计已生成',type:'公告',read:true,ts:'09:00'}
  ],
  sessions:[
    {id:1,user:'admin',client:'管理后台',ip:'10.8.0.2',login:'2026-09-14 08:30',expire:'空闲 28:00 / 绝对 11:30'},
    {id:2,user:'zhangjc',client:'管理后台',ip:'10.8.0.35',login:'2026-09-14 20:10',expire:'空闲 29:10 / 绝对 11:50'},
    {id:3,user:'chenxj',client:'移动端',ip:'59.61.x.x',login:'2026-09-14 08:52',expire:'空闲 27:05 / 绝对 15:08'}
  ],

  /* —— Geo-Agent（geagent / F-S16） —— */
  agentTools:[
    {name:'valve_turnoff',desc:'关阀分析：给定关断点，返回受影响管段/用户/时长',calls:128},
    {name:'pipe_connectivity',desc:'连通性分析：管段连通/孤立判定',calls:96},
    {name:'topology_assay',desc:'拓扑分析：悬挂点/重合点/断点检测',calls:74},
    {name:'excavation_assay',desc:'开挖分析：埋深/高程/周边设施统计',calls:61},
    {name:'graphic_assay',desc:'图形分析：矩形/多边形/圆框选统计',calls:143},
    {name:'dma_water_balance',desc:'DMA 产销差统计与输差诊断',calls:87}
  ],
  agentSession:[
    {role:'user',text:'解放路 K3+500 管道泄漏，帮我评估关阀方案，影响多少用户？'},
    {role:'tool',tool:'excavation_assay',desc:'定位泄漏点，检索周边 120m 设施：DN300 管线 ×1、阀门 ×2、消火栓 ×1'},
    {role:'tool',tool:'valve_turnoff',desc:'推荐关闭 FM-2024-0118 / FM-2024-0119，影响管段 2 条、用户 236 户，预计 4.5h'},
    {role:'bot',text:'建议方案：<b>关闭 FM-2024-0118（DN500）与 FM-2024-0119（DN300）</b>。<br>影响：管段 2 条（含过江干线引出段），用户 <b>236 户</b>，预计恢复 <b>4.5 小时</b>。<br>已生成关阀通知单，可一键推送短信/移动端。是否需要我起草抢险工单？'},
    {role:'user',text:'好，生成工单并通知受影响用户。'},
    {role:'tool',tool:'sys.dispatch',desc:'创建 QX-2026-0930（已联动 cnd 域），短信模板 TPL-08 已发送 236 条'}
  ],

  /* —— 开放平台（openapi / F-S18/S19） —— */
  openApps:[
    {id:1,app:'szj_city',name:'市智慧城管对接',scope:'push_zy / push_zy_pipe_bim',ips:'10.20.1.0/24',status:'启用',created:'2026-06-01'},
    {id:2,app:'hy_bpm',name:'海云汇 BPM 工单',scope:'workorder.create / callback',ips:'47.98.x.x',status:'启用',created:'2026-03-15'},
    {id:3,app:'demo_3rd',name:'演示第三方',scope:'device.readonly',ips:'-',status:'停用',created:'2026-01-20'}
  ],
  openLogs:[
    {id:1,app:'szj_city',op:'push_zy.pipe',ip:'10.20.1.11',ts:'2026-09-14 22:00:05',ms:120,code:200},
    {id:2,app:'hy_bpm',op:'workorder.create',ip:'47.98.1.2',ts:'2026-09-14 21:58:44',ms:86,code:200},
    {id:3,app:'demo_3rd',op:'device.list',ip:'112.4.x.x',ts:'2026-09-14 21:40:01',ms:0,code:401},
    {id:4,app:'szj_city',op:'push_zy.bim',ip:'10.20.1.11',ts:'2026-09-14 20:00:11',ms:640,code:200}
  ],
  sso:[
    {id:1,name:'CAS 单点登录',type:'CAS 3.0',state:'已配置',note:'1.0 foreign 承接'},
    {id:2,name:'海云汇 OAuth2',type:'OAuth2',state:'适配器就绪',note:'P2'}
  ],

  /* —— 统计报表（report / F-G15） —— */
  reportCatalog:[
    {id:1,name:'管线长度统计',unit:'km',dim:'介质/材质/口径',chart:'bar'},
    {id:2,name:'管线年度增长',unit:'km',dim:'年份',chart:'line'},
    {id:3,name:'管点数量统计',unit:'个',dim:'类型/区域',chart:'bar'},
    {id:4,name:'阀门规格分布',unit:'台',dim:'口径',chart:'pie'},
    {id:5,name:'设备在线率月报',unit:'%',dim:'月',chart:'line'},
    {id:6,name:'告警类型月度统计',unit:'条',dim:'类型/等级',chart:'stack'},
    {id:7,name:'巡检完成率月报',unit:'%',dim:'部门',chart:'bar'},
    {id:8,name:'隐患整改时效',unit:'天',dim:'等级',chart:'bar'},
    {id:9,name:'DMA 漏损率排名',unit:'%',dim:'分区',chart:'bar'},
    {id:10,name:'新装工程统计',unit:'件',dim:'月',chart:'line'},
    {id:11,name:'抢修工单统计',unit:'单',dim:'类型',chart:'pie'},
    {id:12,name:'资产折旧台账',unit:'万元',dim:'类别',chart:'bar'}
  ],
  pipeLenByMedia:{ water:612.8, gas:486.2, heat:187.4 },
  pipeLenByMat:[['球墨铸铁',412],['PE',296],['钢管',268],['预制保温管',187],['其他',123]]
};
