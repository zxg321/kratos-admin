/* PipeOps Portal · API stub（Promise，模拟异步。前端只调用本层，不触碰 MOCK 对象） */
window.api = new Proxy({}, { get: (_, key) => (...args) =>
  new Promise(res => setTimeout(() => res(stub(key, args)), 200 + Math.random()*150))
});

function stub(key, args){
  const M = window.MOCK;
  const copy = o => o == null ? o : JSON.parse(JSON.stringify(o));
  /* —— 覆盖物 —— */
  if(key==='overlay.page'){ const [p={}] = args; let l = M.overlay;
    if(p.type && p.type!=='all') l = l.filter(x=>x.type===p.type);
    if(p.usage_state != null) l = l.filter(x=>x.usage_state===(+p.usage_state));
    if(p.keyword) l = l.filter(x=>String(x.overlay_number+x.name).toLowerCase().includes(p.keyword.toLowerCase()));
    return { list: copy(l), total: l.length }; }
  if(key==='overlay.list') return { list: copy(M.overlay) };
  if(key==='overlay.bbox') return { list: copy(M.overlay) };
  if(key==='overlay.get'){ const [id]=args; return copy(M.overlay.find(o=>o.id===+id)); }
  if(key==='overlay.create') return { id: Date.now() };
  if(key==='overlay.update') return { ok:true };
  if(key==='overlay.delete') return { affected: args[0]['ids'] ? args[0].ids.split(',').length : 0 };
  /* —— 管线 —— */
  if(key==='pipe.page') return { list: copy(M.pipes), total: M.pipes.length };
  if(key==='pipe.analysis') return { affected_overlay_numbers:['FM-2024-0118','YY-2024-0406','FM-2024-0119'] };
  /* —— 采集 —— */
  if(key==='collect.batchPage') return { list: copy(M.collectBatch), total: M.collectBatch.length };
  if(key==='collect.pointPage'){ const [p={}] = args;
    const l = M.collectPoint.filter(x=>!p.batch_id || x.batch_id===+p.batch_id);
    return { list: copy(l), total: l.length }; }
  if(key==='collect.generate') return { overlay_generated: (args[0]&&args[0].batch_id===3?18:46), pipe_generated: 0, skipped:[] };
  /* —— 告警 —— */
  if(key==='alarm.page'){ const [p={}] = args; let l = M.alarmInfo;
    if(p.level && p.level!=='all') l = l.filter(x=>x.level===p.level);
    if(p.type && p.type!=='all') l = l.filter(x=>x.alarm_type===p.type);
    return { list: copy(l), total: l.length }; }
  if(key==='alarm.handle') return { ok:true };
  /* —— 设备档案 —— */
  if(key==='archive.page') return { list: copy(M.archiveAsset), total: M.archiveAsset.length };
  /* —— 大盘 —— */
  if(key==='dashboard.summary') return copy(M.summary);
  return {};
}