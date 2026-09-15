/* SNOP · API stub（Promise，模拟异步。页面只调用本层，不触碰 MOCK 对象）
 * 兼容两种调用约定：api('device.page',{...}) 与 api.device.page({...}) */
(function(){
  function makeApi(path){
    const fn = function(...args){
      let key, callArgs;
      if (path.length === 0) { key = args.shift(); callArgs = args; }
      else { key = path.join('.'); callArgs = args; }
      return new Promise(res => setTimeout(() => res(stub(key, callArgs)), 160 + Math.random()*140));
    };
    return new Proxy(fn, {
      get(_, k){
        if (typeof k !== 'string' || k === 'then' || k === 'catch' || k === 'finally'
            || k === 'constructor' || k === 'toJSON' || k === 'inspect') return undefined;
        return makeApi(path.concat(k));
      }
    });
  }
  window.api = makeApi([]);
})();

function stub(key, args){
  const M = window.MOCK;
  const copy = o => o == null ? o : JSON.parse(JSON.stringify(o));
  const [p={}] = args;
  const kw = s => String(s||'').toLowerCase().includes((p.keyword||'').toLowerCase());

  /* D7 单租户口径集中收口：介质 = 租户类别标识，一个租户只能看到本租户介质的数据。
   * 未显式传 media 时按当前演示租户（localStorage snop_media，默认供水）过滤；x.media 缺省视为租户自有数据。 */
  const curMedia = () => (typeof localStorage !== 'undefined' && localStorage.getItem('snop_media')) || 'water';
  const sc = (list) => { const m = (p && p.media) || curMedia();
    return m === 'all' ? list : list.filter(x => x.media == null || x.media === m); };

  /* —— 通用 —— */
  if(key==='dashboard.summary') return copy(M.summary);

  /* —— GIS 图层与要素 —— */
  if(key==='layer.tree') return { list: copy(M.layers) };
  if(key==='layer.page'){ let l = sc(M.layers);
    if(p.media && p.media!=='all') l = l.filter(x=>x.media===p.media);
    if(p.cls && p.cls!=='all') l = l.filter(x=>x.cls===p.cls);
    if(p.keyword) l = l.filter(x=>kw(x.name));
    return { list: copy(l), total: l.length }; }
  if(key==='layer.save') return { ok:true };
  if(key==='layer.delete') return { ok:true };
  if(key==='layer.grant') return { ok:true, roles:p.roles||[] };
  if(key==='feature.page'){ let l = sc(M.features);
    if(p.cls && p.cls!=='all') l = l.filter(x=>x.cls===p.cls);
    if(p.media && p.media!=='all') l = l.filter(x=>x.media===p.media);
    if(p.keyword) l = l.filter(x=>kw(x.code+x.name));
    return { list: copy(l), total: l.length }; }
  if(key==='feature.get'){ const a0=args[0]; const id = typeof a0==='object'&&a0 ? a0.id : a0; return copy(M.features.find(f=>f.id===+id)); }
  if(key==='feature.create') return { id: Date.now() };
  if(key==='feature.update') return { ok:true };
  if(key==='feature.delete') return { ok:true };
  if(key==='feature.history') return { list:[
    {ver:3,by:'admin',ts:'2026-09-12 10:20',note:'属性修正：埋深 1.6→1.8m'},
    {ver:2,by:'zhangjc',ts:'2026-08-30 14:02',note:'几何纠偏（坐标 ETL 回写）'},
    {ver:1,by:'etl',ts:'2026-07-01 02:00',note:'JSON 坐标→geometry 初始化入库'} ] };
  if(key==='pipe.list') return { list: copy(M.pipes) };

  /* —— 空间分析 —— */
  if(key==='analysis.closeValve') return copy({
    valves:['FM-2024-0118','FM-2024-0119'], affected_pipes:['GS-2024-0001 (DN800 引出段)','GS-2024-0006 (DN300)'],
    affected_users:236, est_hours:4.5, notices:236, render_nodes:['P030','P001','P460','P380'],
    perf:{ db:'PostGIS bbox 预筛 38ms', graph:'内存图遍历 6ms', total:'44ms (<2s 达标)' } });
  if(key==='analysis.excavation') return copy({ center:{lat:31.23042,lng:121.47367}, radius_m:120,
    depth:2.6, ground:4.1, spec:'DN300', affected_pipes:['GS-2024-0006 (DN300) 1.2m'],
    affected_overlays:['FM-2024-0118','XF-2024-0158'], stat:{pipes:2,valves:2,hydrants:1,meters:0} });
  if(key==='analysis.connectivity') return copy({ result:'CONNECTED', path:['P001','P015','P030','P052'], hops:3,
    tolerance:'0.05m', perf:'11ms' });
  if(key==='analysis.topology') return copy({ issues:[
    {type:'悬挂点',code:'P380',desc:'仅连接 1 条管线'},{type:'重合点',code:'2026-P102 / 2026-P103',desc:'间距 0.01m'} ] });
  if(key==='analysis.graphic') return copy({ mode:'polygon', pipes:14, valves:9, meters:5, length_m:3820 });
  if(key==='analysis.buffer') return copy({ radius_m:p.radius||100, area:31415, pipes:6, valves:4 });
  if(key==='analysis.measure') return copy({ distance_m:1268.4, area_m2: null });
  if(key==='analysis.export') return { file:'analysis_result_20260914.xlsx', rows:42 };

  /* —— DMA —— */
  if(key==='dma.zonePage'){ let l = M.dmaZones;
    if(p.level && p.level!=='all') l = l.filter(x=>x.level===p.level);
    if(p.keyword) l = l.filter(x=>kw(x.name));
    return { list: copy(l), total: l.length }; }
  if(key==='dma.sixStep') return copy(M.dmaSixStep);
  if(key==='dma.diagnose') return copy({ zone:'江南 DMA 二区', diff:'2540 m³/日', verdict:'输差异常',
    judge:['阈值判据：漏损率 10.0% > 9% 基线','趋势判据：近 7 日持续上行'], advice:'启动六步法第 4 步主动检漏' });
  if(key==='dma.simulate') return copy(M.dmaSim);
  if(key==='dma.report') return { file:'DMA漏损六步法报告_202609.pdf' };

  /* —— 统计报表 —— */
  if(key==='report.catalog') return { list: copy(M.reportCatalog) };
  if(key==='report.run'){ const m=p.media||'water'; /* D7 单租户口径：按本租户介质折算，不返回跨介质合计 */
    const share=m==='water'?612.8/1286.4 : m==='gas'?486.2/1286.4 : 187.4/1286.4;
    return copy({ name:p.name||'管线长度统计', media:{[m]:(M.pipeLenByMedia[m]||0)},
      mats:M.pipeLenByMat.map(([k,v])=>[k, +(v*share).toFixed(1)]) }); }
  if(key==='report.export') return { file:'RPT_'+String(p.name||'report')+'_20260914.xlsx' };

  /* —— 设备与采集 —— */
  if(key==='device.page'){ let l = sc(M.devices);
    if(p.cls && p.cls!=='all') l = l.filter(x=>x.cls===p.cls);
    if(p.media && p.media!=='all') l = l.filter(x=>x.media===p.media);
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.keyword) l = l.filter(x=>kw(x.code+x.name));
    return { list: copy(l), total: l.length }; }
  if(key==='device.correct') return { ok:true, log:'纠偏记录已写入 _history' };
  if(key==='device.history') return { list:[
    {ver:2,by:'admin',ts:'2026-09-01 09:12',note:'坐标批量纠偏 +0.00004°'},
    {ver:1,by:'etl',ts:'2026-07-01 02:00',note:'2.0 库迁移入库'} ] };
  if(key==='device.import') return { total:p.count||128, ok:117, fail:11, fail_table:'collect_import_fail' };
  if(key==='device.realtime'){ const a0=args[0]; const code = typeof a0==='string' ? a0 : (a0 && a0.code); return copy({ device:code, ts:'22:05:12',
    series:Array.from({length:12},(_,i)=>+(0.45+Math.sin(i/2)*0.12+Math.random()*0.05).toFixed(3)) }); }
  if(key==='device.curve') return copy({ series:['本机','去年同期'], points:24 });
  if(key==='device.thresholdBatch') return { affected: p.count||18 };
  if(key==='collect.batchPage'){ let l = M.collectBatches;
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.keyword) l = l.filter(x=>kw(x.identifier));
    return { list: copy(l), total: l.length }; }
  if(key==='collect.pointPage'){ let l = M.collectPoints.filter(x=>!p.batch_id || x.batch_id===+p.batch_id);
    return { list: copy(l), total: l.length }; }
  if(key==='collect.check') return copy({ pass:86.4, issues:[{type:'重合点',code:'2026-P102'},{type:'悬挂点',code:'P380'}] });
  if(key==='collect.generate') return { feature_generated: p.batch_id===1?46:0 };

  /* —— IoT —— */
  if(key==='iot.adapterPage'){ let l = M.iotAdapters;
    if(p.mode && p.mode!=='all') l = l.filter(x=>String(x.mode).includes(p.mode));
    return { list: copy(l), total: l.length }; }
  if(key==='iot.adapterToggle') return { ok:true };
  if(key==='iot.realtime'){ let l=M.iotRealtime; if(p.media && p.media!=='all') l=l.filter(x=>x.media===p.media); return { list: copy(l) }; }
  if(key==='iot.offlineStats') return copy(M.offlineDevices);
  if(key==='iot.granular') return copy(M.granular);

  /* —— 报警 —— */
  if(key==='alarm.page'){ let l = sc(M.alarms);
    if(p.level && p.level!=='all') l = l.filter(x=>x.level===p.level);
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.media && p.media!=='all') l = l.filter(x=>x.media===p.media);
    if(p.keyword) l = l.filter(x=>kw(x.code+x.device));
    return { list: copy(l), total: l.length }; }
  if(key==='alarm.get'){ const a0=args[0]; const id = typeof a0==='object'&&a0 ? a0.id : a0; return copy(M.alarms.find(a=>a.id===+id)); }
  if(key==='alarm.claim') return { ok:true };
  if(key==='alarm.handle') return { ok:true, order_no:'QX-2026-09'+(30+Math.floor(Math.random()*9)) };
  if(key==='alarm.close') return { ok:true };
  if(key==='alarm.rulePage'){ const l=sc(M.alarmRules); return { list: copy(l), total: l.length }; }
  if(key==='alarm.ruleSave') return { ok:true };
  if(key==='alarm.stats') return copy({ byType:{'越限':38,'离线':11,'设备异常':8},
    byLevel:{'I':2,'II':9,'III':46}, trend:M.summary.alarmTrend7d });

  /* —— 巡检 —— */
  if(key==='patrol.planPage'){ const l=sc(M.patrolPlans); return { list: copy(l), total: l.length }; }
  if(key==='patrol.orderPage'){ let l = sc(M.patrolOrders);
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.type && p.type!=='all') l = l.filter(x=>x.type===p.type);
    if(p.keyword) l = l.filter(x=>kw(x.order_no+x.name+x.assignee));
    return { list: copy(l), total: l.length }; }
  if(key==='patrol.orderCreate') return { order_no:'XJ-2026-'+String(Date.now()).slice(-5) };
  if(key==='patrol.track') return copy(M.patrolTrack);
  if(key==='patrol.dangerPage'){ let l = sc(M.hiddenDangers);
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.level && p.level!=='all') l = l.filter(x=>x.level===p.level);
    return { list: copy(l), total: l.length }; }
  if(key==='patrol.dangerReview') return { ok:true };
  if(key==='patrol.calibrationPage'){ const l=sc(M.calibrations); return { list: copy(l), total: l.length }; }
  if(key==='patrol.stats') return copy(M.patrolStats);
  if(key==='patrol.excavationPage'){ const l=sc(M.excavations); return { list: copy(l), total: l.length }; }

  /* —— 指挥调度 —— */
  if(key==='cnd.accidentPage'){ let l = sc(M.cndAccidents);
    if(p.level && p.level!=='all') l = l.filter(x=>x.level===p.level);
    if(p.keyword) l = l.filter(x=>kw(x.accident_no+x.title));
    return { list: copy(l), total: l.length }; }
  if(key==='cnd.accidentCreate') return { accident_no:'SG-2026-'+String(Date.now()).slice(-4) };
  if(key==='cnd.rescuePage'){ const l=sc(M.cndRescues); return { list: copy(l), total: l.length }; }
  if(key==='cnd.rescueCreate') return { order_no:'QX-2026-'+String(Date.now()).slice(-4) };
  if(key==='cnd.materialPage'){ const l=sc(M.cndMaterials); return { list: copy(l), total: l.length }; }
  if(key==='cnd.materialReceive') return { ok:true };
  if(key==='cnd.dutyPage') return { list: copy(M.cndDuty), total: M.cndDuty.length };
  if(key==='cnd.planPage'){ const l=sc(M.cndPlans); return { list: copy(l), total: l.length }; }
  if(key==='cnd.planRag'){ return copy({ answer:'依据《供水管网爆管应急处置预案 v3.2》§4.2：DN300 及以上爆管，先关闭上下游阀门隔离管段，开启泄压，2 小时内完成关阀影响研判并通知受影响用户；抢修队 30 分钟内到场。', refs:['YA-2026-DN300 v3.2 §4.2','§5.1 抢修时限'] }); }
  if(key==='cnd.drillPage'){ const l=sc(M.cndDrills); return { list: copy(l), total: l.length }; }
  if(key==='cnd.reportGen') return { file:'SG-2026-0930_事故评估报告.docx', sections: copy(M.cndReport.sections) };

  /* —— EAM —— */
  if(key==='eam.assetPage'){ let l = sc(M.eamAssets);
    if(p.category && p.category!=='all') l = l.filter(x=>x.category===p.category);
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.keyword) l = l.filter(x=>kw(x.asset_no+x.name));
    return { list: copy(l), total: l.length }; }
  if(key==='eam.maintPage'){ const l=sc(M.eamMaint); return { list: copy(l), total: l.length }; }
  if(key==='eam.disposalPage'){ let l = sc(M.eamDisposal);
    if(p.type && p.type!=='all') l = l.filter(x=>x.type===p.type);
    return { list: copy(l), total: l.length }; }
  if(key==='eam.disposalCreate') return { bpm_no:'BPM-2026-'+String(Date.now()).slice(-4) };
  if(key==='eam.bpmApprove') return { ok:true, node:'已流转至下一审批节点' };
  if(key==='eam.bpmReject') return { ok:true };
  if(key==='eam.purchasePage'){ const l=sc(M.eamPurchase); return { list: copy(l), total: l.length }; }
  if(key==='eam.brandPage') return { list: copy(M.eamBrands), total: M.eamBrands.length };

  /* —— 平台底座 —— */
  if(key==='sys.userPage'){ let l = M.sysUsers;
    if(p.tenant && p.tenant!=='all') l = l.filter(x=>x.tenant===p.tenant);
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.keyword) l = l.filter(x=>kw(x.username+x.name+x.role));
    return { list: copy(l), total: l.length }; }
  if(key==='sys.rolePage') return { list: copy(M.sysRoles), total: M.sysRoles.length };
  if(key==='sys.roleMatrix') return copy(M.roleMatrix);
  if(key==='sys.menuPage') return { list: copy(M.sysMenus), total: M.sysMenus.length };
  if(key==='sys.tenantPage') return { list: copy(M.tenants), total: M.tenants.length };
  if(key==='sys.dictPage'){ let l = M.dicts;
    if(p.domain && p.domain!=='all') l = l.filter(x=>x.domain===p.domain);
    return { list: copy(l), total: l.length }; }
  if(key==='sys.filePage') return { list: copy(M.files), total: M.files.length };
  if(key==='sys.msgPage') return { list: copy(M.messages), total: M.messages.length };
  if(key==='sys.auditPage'){ let l = M.auditLogs;
    if(p.result && p.result!=='all') l = l.filter(x=>x.result===p.result);
    return { list: copy(l), total: l.length }; }
  if(key==='sys.jobPage') return { list: copy(M.jobs), total: M.jobs.length };
  if(key==='sys.backupPage') return { list: copy(M.backups), total: M.backups.length };
  if(key==='sys.sessionPage') return { list: copy(M.sessions), total: M.sessions.length };

  /* —— Geo-Agent —— */
  if(key==='agent.tools') return { list: copy(M.agentTools) };
  if(key==='agent.session') return { list: copy(M.agentSession) };
  if(key==='agent.chat'){ return { msg:{ role:'bot',
    text:'已调用 <b>valve_turnoff</b> 工具：关闭 FM-2024-0118 / FM-2024-0119，影响管段 2 条、用户 <b>236 户</b>、预计 4.5h。需要我生成关阀通知单吗？' },
    tool:{ name:'valve_turnoff', desc:'内存图遍历 6ms + PostGIS bbox 预筛 38ms，黄金用例对拍 47/47 通过' } }; }

  /* —— 开放平台 —— */
  if(key==='open.appPage') return { list: copy(M.openApps), total: M.openApps.length };
  if(key==='open.appCreate') return { app_id:'snop_open_'+String(Date.now()).slice(-4) };
  if(key==='open.logPage'){ let l = M.openLogs;
    if(p.app && p.app!=='all') l = l.filter(x=>x.app===p.app);
    return { list: copy(l), total: l.length }; }
  if(key==='open.regenerateKey') return { secret:'sk_live_'+Math.random().toString(36).slice(2,14) };
  if(key==='open.ssoPage') return { list: copy(M.sso), total: M.sso.length };

  /* —— 登录 —— */
  if(key==='auth.captcha') return { code:'7X4K' };
  if(key==='auth.login') return p.password==='wrong'
    ? { ok:false, msg:'密码错误，剩余 4 次尝试（5 次锁定）' }
    : { ok:true, token:'jwt.*', claims:{ tenant:(p && p.tenant_name) || '江南水司', media:(p && p.tenant) || 'water',
        roles:['监测值班员'], client_type:p.client||'admin' } };
  if(key==='auth.mfa') return { ok:true };

  return {};
}
