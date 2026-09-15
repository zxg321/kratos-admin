/* GIS Intel Ops Platform · API stub（Promise，模拟异步。页面只调用本层，不触碰 MOCK 对象） */
window.api = new Proxy({}, { get: (_, key) => (...args) =>
  new Promise(res => setTimeout(() => res(stub(key, args)), 180 + Math.random()*140))
});

function stub(key, args){
  const M = window.MOCK;
  const copy = o => o == null ? o : JSON.parse(JSON.stringify(o));
  const [p={}] = args;
  const kw = s => String(s||'').toLowerCase().includes((p.keyword||'').toLowerCase());

  /* —— S1 覆盖物 / 管线 / 图层 —— */
  if(key==='overlay.page'){ let l = M.overlay;
    if(p.type && p.type!=='all') l = l.filter(x=>x.type===p.type);
    if(p.usage_state != null && p.usage_state!=='all') l = l.filter(x=>String(x.usage_state)===String(p.usage_state));
    if(p.keyword) l = l.filter(x=>kw(x.overlay_number+x.name));
    return { list: copy(l), total: l.length }; }
  if(key==='overlay.list') return { list: copy(M.overlay) };
  if(key==='overlay.get'){ const [id]=args; return copy(M.overlay.find(o=>o.id===+id)); }
  if(key==='overlay.create') return { id: Date.now() };
  if(key==='overlay.update') return { ok:true };
  if(key==='overlay.delete'){ return { affected: p.ids ? p.ids.split(',').length : 0 }; }
  if(key==='pipe.list') return { list: copy(M.pipes) };
  if(key==='layer.tree') return { tree: copy(M.layerTree) };
  /* 空间分析：关阀影响 / 开挖影响 / 连通 / 拓扑 */
  if(key==='analysis.closeValve') return copy({
    valves:['FM-2024-0118','FM-2024-0119'],
    affected_pipes:['GG-2024-0001 (DN500)','GG-2024-0006 (DN300)'],
    affected_users:236, est_hours:4.5, affected_overlays:['YY-2024-0406','PJ-2024-0203'],
    render_nodes:['P030','P001','P460','P380'] });
  if(key==='analysis.excavation') return copy({ center:{lat:31.23042,lng:121.47367}, radius_m:120,
    affected_pipes:['GG-2024-0001 (DN500)'], affected_overlays:['FM-2024-0118','PJ-2024-0203'], render_nodes:['P030','P015','P052'] });
  if(key==='analysis.connectivity') return copy({ reachable:true, path:['P001','P015','P030','P052'], hops:3 });
  if(key==='analysis.topology') return copy({ issues:[ {type:'悬挂点',code:'P380'},{type:'重合点',code:'2026-P102'} ] });

  /* —— S2 采集 —— */
  if(key==='collect.batchPage'){ let l = M.collectBatch;
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.keyword) l = l.filter(x=>kw(x.identifier+x.data_sources));
    return { list: copy(l), total: l.length }; }
  if(key==='collect.pointPage'){ let l = M.collectPoint.filter(x=>!p.batch_id || x.batch_id===+p.batch_id);
    return { list: copy(l), total: l.length }; }
  if(key==='collect.check') return copy({ pass:86.4, issues:[{type:'重合点',code:'2026-P102'},{type:'悬挂点',code:'2026-P201'}] });
  if(key==='collect.generate'){ return { overlay_generated: p.batch_id===1?46:0, pipe_generated: p.batch_id===1?28:0 }; }

  /* —— S3 监测 / 告警 —— */
  if(key==='monitor.devicePage'){ let l = M.monitorDevices;
    if(p.biz && p.biz!=='all') l = l.filter(x=>x.biz===p.biz);
    if(p.state && p.state!=='all') l = l.filter(x=>x.state===p.state);
    if(p.keyword) l = l.filter(x=>kw(x.device_number+x.name));
    return { list: copy(l), total: l.length }; }
  if(key==='monitor.thresholdPage') return { list: copy(M.thresholdConfig), total: M.thresholdConfig.length };
  if(key==='monitor.thresholdSave') return { ok:true };
  if(key==='monitor.thresholdBatch') return { affected: p.count||12 };
  if(key==='monitor.realtime'){ const [num]=args;
    return copy({ device_number:num, ts:'2026-09-14 21:52:04',
      series:Array.from({length:12},(_,i)=>+(0.45+Math.sin(i/2)*0.12+Math.random()*0.05).toFixed(3)) }); }
  if(key==='monitor.aiForecast') return { list: copy(M.aiForecast) };
  if(key==='alarm.page'){ let l = M.alarmInfo;
    if(p.level && p.level!=='all') l = l.filter(x=>x.level===p.level);
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.keyword) l = l.filter(x=>kw(x.overlay_number+x.alarm_info));
    return { list: copy(l), total: l.length }; }
  if(key==='alarm.get'){ const [id]=args; return copy(M.alarmInfo.find(a=>a.id===+id)); }
  if(key==='alarm.handle') return { ok:true };
  if(key==='alarm.claim') return { ok:true };
  if(key==='alarm.dispatch') return { ok:true, order_no:'QX-2026-00'+(30+Math.floor(Math.random()*9)) };

  /* —— S4 巡检 —— */
  if(key==='patrol.orderPage'){ let l = M.patrolOrders;
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.keyword) l = l.filter(x=>kw(x.order_no+x.name+x.assignee));
    return { list: copy(l), total: l.length }; }
  if(key==='patrol.orderCreate') return { order_no:'XJ-2026-'+String(Date.now()).slice(-5) };
  if(key==='patrol.track') return copy(M.patrolTrack);
  if(key==='patrol.dangerPage'){ let l = M.hiddenDangers;
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.level && p.level!=='all') l = l.filter(x=>x.level===p.level);
    return { list: copy(l), total: l.length }; }
  if(key==='patrol.dangerReview') return { ok:true };
  if(key==='patrol.calibrationPage') return { list: copy(M.calibrations), total: M.calibrations.length };
  if(key==='patrol.stats') return copy({ month:'2026-09', orders_done:186, dangers:31, excavation:4, iot_alarm:57,
    recognition:{total:124, correct:112, rate:0.903},
    rank: copy(M.summary.patrolRank) });

  /* —— S5 应急 —— */
  if(key==='emergency.accidentPage'){ let l = M.accidents;
    if(p.level && p.level!=='all') l = l.filter(x=>x.level===p.level);
    if(p.keyword) l = l.filter(x=>kw(x.accident_no+x.title));
    return { list: copy(l), total: l.length }; }
  if(key==='emergency.accidentCreate') return { accident_no:'SG-2026-'+String(Date.now()).slice(-4) };
  if(key==='emergency.rescuePage'){ let l = M.rescueOrders;
    if(p.accident) l = l.filter(x=>x.accident===p.accident);
    return { list: copy(l), total: l.length }; }
  if(key==='emergency.rescueCreate') return { order_no:'QX-2026-'+String(Date.now()).slice(-4) };
  if(key==='emergency.materialPage') return { list: copy(M.materials), total: M.materials.length };
  if(key==='emergency.materialReceive') return { ok:true };
  if(key==='emergency.dutyPage') return { list: copy(M.dutyRoster), total: M.dutyRoster.length };
  if(key==='emergency.planPage') return { list: copy(M.emergencyPlans), total: M.emergencyPlans.length };
  if(key==='emergency.planRag'){ return copy({ answer:'依据《供水管网爆管应急处置预案 v3.2》§4.2：DN300 及以上爆管，先关闭上下游阀门隔离管段，' +
      '开启泄压，2 小时内完成关阀影响研判并通知受影响用户；抢修队 30 分钟内到场。', refs:['YA-2026-DN300 v3.2 §4.2','§5.1 抢修时限'] }); }
  if(key==='emergency.drillPage') return { list: copy(M.drills), total: M.drills.length };

  /* —— S6 资产 —— */
  if(key==='asset.page'){ let l = M.lifecycleAssets;
    if(p.category && p.category!=='all') l = l.filter(x=>x.category===p.category);
    if(p.status && p.status!=='all') l = l.filter(x=>x.status===p.status);
    if(p.keyword) l = l.filter(x=>kw(x.asset_no+x.name));
    return { list: copy(l), total: l.length }; }
  if(key==='asset.bpmPage'){ let l = M.bpmFlows;
    if(p.type && p.type!=='all') l = l.filter(x=>x.type===p.type);
    return { list: copy(l), total: l.length }; }
  if(key==='asset.bpmApprove') return { ok:true, node:'已流转至下一审批节点' };
  if(key==='asset.bpmReject') return { ok:true };
  if(key==='asset.transfer') return { bpm_no:'BPM-2026-'+String(Date.now()).slice(-4) };

  /* —— S7 系统 —— */
  if(key==='sys.userPage'){ let l = M.sysUsers;
    if(p.tenant && p.tenant!=='all') l = l.filter(x=>x.tenant===p.tenant);
    if(p.keyword) l = l.filter(x=>kw(x.username+x.name+x.role));
    return { list: copy(l), total: l.length }; }
  if(key==='sys.tenantPage') return { list: copy(M.tenants), total: M.tenants.length };
  if(key==='sys.dictPage'){ let l = M.dicts;
    if(p.type && p.type!=='all') l = l.filter(x=>x.type===p.type);
    return { list: copy(l), total: l.length }; }
  if(key==='sys.logPage') return { list: copy(M.auditLogs), total: M.auditLogs.length };

  /* —— S10 政企对接 —— */
  if(key==='open.appPage') return { list: copy(M.openApps), total: M.openApps.length };
  if(key==='open.appCreate') return { app_id:'gis_open_'+String(Date.now()).slice(-3) };
  if(key==='open.logPage'){ let l = M.openLogs;
    if(p.app_id && p.app_id!=='all') l = l.filter(x=>x.app===p.app_id);
    return { list: copy(l), total: l.length }; }
  if(key==='open.regenerateKey') return { secret:'sk_live_'+Math.random().toString(36).slice(2,14) };

  /* —— 总览 —— */
  if(key==='dashboard.summary') return copy(M.summary);

  return {};
}
