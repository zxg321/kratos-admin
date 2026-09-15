/* SNOP 智慧能源运营管理一体化平台 · 共享运行时（App Shell + 租户类别切换 + 通用组件）
 * 纯静态离线。页面只调用 new Shell(pageKey).mount()，严禁自写导航。 */
(function(){
const _stroke = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const icon = n => window.ICONS[n] ? _stroke + window.ICONS[n] + '</svg>' : '';

/* D7 介质分型语义（2026-09-15 澄清）：介质 = 租户类别标识。
 * 燃气/供水/热力分属不同租户（企业），租户决定介质，同租户内不切换介质。
 * 顶栏切换器是演示辅助：切换 = 切换演示租户身份，介质随之确定。 */
const MEDIAS = {
  gas:  { label:'燃气', tenant:'燃气公司', color:'#F59E0B', icon:'flame' },
  water:{ label:'供水', tenant:'江南水司', color:'#2FB8C9', icon:'droplet' },
  heat: { label:'热力', tenant:'热力集团', color:'#FB923C', icon:'thermometer' }
};
window.SNOP_MEDIAS = MEDIAS;   /* 页面可读取当前租户类别映射（label/tenant/color） */

window.Shell = class Shell {
  constructor(pageKey){ this.pageKey = pageKey; }
  icon(name){ return icon(name); }
  ic(name, style){ const s = _stroke + (window.ICONS[name]||'') + '</svg>';
    return style ? s.replace('<svg', '<svg style="'+style+'"') : s; }
  esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  tag(cls, text, pulse){ return '<span class="tag '+(cls||'g')+(pulse?' pulse':'')+'"><i></i>'+this.esc(text)+'</span>'; }

  /* 当前租户类别（介质） */
  static media(){ return localStorage.getItem('snop_media') || 'water'; }
  media(){ return Shell.media(); }
  mediaInfo(){ return MEDIAS[Shell.media()] || MEDIAS.water; }
  tenantName(){ return this.mediaInfo().tenant; }
  /* D7 单租户口径：过滤出当前租户介质的数据（跨介质数据不得同时呈现） */
  scopeByMedia(list, key){ const m = this.media(); return (list||[]).filter(x => !x || x[key||'media'] == null || x[key||'media'] === m); }
  /* D7：把"介质筛选"控件收敛为本租户介质只读指示（一个租户只有一种介质，介质不是筛选维度） */
  tenantMediaSelect(elOrId){
    const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
    if(!el) return;
    const m = this.media(), info = MEDIAS[m] || MEDIAS.water;
    el.innerHTML = `<option value="${m}">${info.label}（本租户 · ${info.tenant}）</option>`;
    el.value = m; el.disabled = true;
    el.title = 'D7 介质 = 租户类别标识：同一租户仅一种介质，不可跨介质筛选';
  }

  navGroups(){
    return [
      ['总览', [
        ['dashboard','运营工作台','layout-dashboard','01']
      ]],
      ['GIS 域 · snop_gis', [
        ['map','管网一张图','map','02'],
        ['layer','图层与要素','layers','03'],
        ['analysis','空间分析','crosshair','04'],
        ['dma','DMA 计量漏损','target','05'],
        ['report','统计报表','bar-chart','06']
      ]],
      ['感知域 · snop_gis/iot', [
        ['device','设备与采集','gauge','07'],
        ['iot','IoT 接入','radio','08'],
        ['alarm','报警管理','bell','09',3]
      ]],
      ['作业域 · snop_patrol/cnd', [
        ['patrol','巡检作业','clipboard-list','10'],
        ['cnd','指挥调度','siren','11']
      ]],
      ['经营域 · snop_asset', [
        ['eam','EAM 资产','package','12']
      ]],
      ['平台 · snop_system', [
        ['system','平台底座','settings','13'],
        ['geagent','Geo-Agent','bot','14'],
        ['openapi','开放平台','link','15']
      ]]
    ];
  }

  mount(){
    const nav = document.getElementById('app-nav');
    if(!nav) return;
    const groups = this.navGroups().map(([gname, items]) => {
      const its = items.map(([key,label,icm,no,badge]) =>
        `<a class="nav-item ${key===this.pageKey?'active':''}" data-nav="${key}" href="${key}.html" title="${label}">
          ${this.ic(icm)}<span>${label}</span>${badge?'<span class="nav-badge">'+badge+'</span>':'<span class="nav-key">'+no+'</span>'}</a>`).join('');
      return `<div class="nav-group">${gname}</div>${its}`;
    }).join('');
    nav.innerHTML =
      `<div class="nav-brand"><span class="nav-mark">${this.ic('network')}</span>
          <span><b>SNOP</b><small>智慧能源运营管理平台</small></span></div>
      ${groups}
      <div class="nav-sep"></div>
      <a class="nav-item" href="bigscreen.html" target="_blank">${this.ic('monitor')}<span>生产调度大屏</span><span class="nav-key">V1</span></a>
      <a class="nav-item" href="mobile.html" target="_blank">${this.ic('smartphone')}<span>移动作业端</span><span class="nav-key">V6</span></a>
      <a class="nav-item" href="login.html">${this.ic('log-in')}<span>重新登录</span><span class="nav-key">S1</span></a>
      <div class="nav-foot">
        <div class="dbs" title="D6 六库分库">
          <span>system</span><span>gis</span><span>patrol</span>
          <span>iot</span><span>cnd</span><span>asset</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span class="dot"></span>
          <span class="code">PostGIS ×2 · Timescale · AMap 在线</span></div>
        <button class="btn btn-sm" id="themeBtn" style="width:100%;justify-content:center">
          ${this.ic('moon','width:14px;height:14px')}<span>主题切换</span></button>
      </div>`;
    const tb = document.getElementById('themeBtn');
    if(tb) tb.addEventListener('click', ()=>{ document.documentElement.toggleAttribute('data-theme'); });
    this.applyMediaVar();
  }

  /* 顶部租户切换器（折叠式下拉：默认只显示本租户，展开后才出现其他演示租户，避免单页同时出现多介质）
   * 页面 topbar 放 <span id="mediaSlot"></span> */
  mountMediaSwitch(slotId){
    const slot = document.getElementById(slotId || 'mediaSlot');
    if(!slot) return;
    const cur = this.media();
    slot.className = 'media-pick-wrap';
    slot.title = 'D7 介质 = 租户类别标识：燃气/供水/热力分属不同租户，切换即切换演示租户';
    slot.innerHTML =
      `<span class="media-pick-ic">${this.ic((MEDIAS[cur]||MEDIAS.water).icon)}</span>
       <select class="select media-pick" id="tenantPick">
         ${Object.entries(MEDIAS).map(([k,m]) =>
           `<option value="${k}" ${k===cur?'selected':''}>${m.tenant} · ${m.label}</option>`).join('')}
       </select>`;
    const sel = slot.querySelector('#tenantPick');
    if(sel) sel.addEventListener('change', ()=> this.setMedia(sel.value));
    this.applyMediaVar();
  }

  setMedia(key){
    if(!MEDIAS[key]) return;
    localStorage.setItem('snop_media', key);
    this.applyMediaVar();
    document.dispatchEvent(new CustomEvent('mediachange', { detail: key }));
    document.dispatchEvent(new CustomEvent('tenantchange', { detail: MEDIAS[key].tenant }));
  }

  applyMediaVar(){
    const m = this.mediaInfo();
    const r = document.documentElement.style;
    r.setProperty('--media', m.color);
    r.setProperty('--media-soft', m.color + '24');
    const chip = document.getElementById('mediaChip');
    if(chip) chip.innerHTML = `<i></i>${m.tenant} · ${m.label}`;
  }

  toast(msg, type){
    let t = document.querySelector('[data-toast]');
    if(!t){ t = document.createElement('div'); t.dataset.toast='1'; t.style.cssText =
      'position:fixed;left:50%;bottom:28px;transform:translate(-50%,16px);z-index:200;background:var(--surface);'+
      'border:1px solid var(--border);border-radius:10px;padding:10px 18px;box-shadow:var(--sh-lg);opacity:0;'+
      'transition:all .25s var(--ease);font-size:13px;display:flex;gap:8px;align-items:center'; document.body.appendChild(t); }
    t.innerHTML = (type==='ok'?this.ic('check-circle'):type==='err'?this.ic('alert-triangle'):this.ic('info')) +
      '<span>'+this.esc(msg)+'</span>';
    void t.offsetWidth; t.style.opacity='1'; t.style.transform='translate(-50%,0)';
    clearTimeout(t.__tm);
    t.__tm = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translate(-50%,16px)'; }, 2200);
  }

  /* 通用模态：openModal({title,size,bodyHtml,okText,onOk,footer:false}) */
  openModal(cfg){
    const mask = document.createElement('div'); mask.className='mask';
    mask.innerHTML =
      `<div class="modal" style="width:${cfg.size||560}px">
        <div class="modal-head"><h3>${cfg.title}</h3><button class="iconbtn" data-close>${this.ic('x')}</button></div>
        <div class="modal-body">${cfg.bodyHtml}</div>
        ${cfg.footer===false?'':`<div class="modal-foot">
          <button class="btn" data-cancel>取消</button>
          <button class="btn btn-primary" data-ok>${cfg.okText||'确认'}</button></div>`}
      </div>`;
    document.body.appendChild(mask); requestAnimationFrame(()=>mask.classList.add('open'));
    mask.querySelector('[data-close]').addEventListener('click',()=>this.closeModal(mask));
    mask.querySelector('[data-cancel]')?.addEventListener('click',()=>this.closeModal(mask));
    if(cfg.onOk) mask.querySelector('[data-ok]')?.addEventListener('click', ()=>{ const r=cfg.onOk(mask); if(r!==false) this.closeModal(mask); });
    if(cfg.onMount) setTimeout(()=>cfg.onMount(mask),0);
    return mask;
  }
  closeModal(mask){ (mask||document.querySelector('.mask'))?.remove(); }

  /* 右侧抽屉：openDrawer({title, bodyHtml, footerHtml}) */
  openDrawer(cfg){
    document.querySelector('.drawer-mask')?.remove(); document.querySelector('.drawer')?.remove();
    const m = document.createElement('div'); m.className='drawer-mask';
    const d = document.createElement('div'); d.className='drawer';
    d.innerHTML = `<div class="drawer-head"><h3>${cfg.title}</h3><button class="iconbtn" data-close>${this.ic('x')}</button></div>
      <div class="drawer-body">${cfg.bodyHtml}</div>
      ${cfg.footerHtml?`<div class="drawer-foot">${cfg.footerHtml}</div>`:''}`;
    document.body.appendChild(m); document.body.appendChild(d);
    requestAnimationFrame(()=>{ m.classList.add('open'); d.classList.add('open'); });
    const close = ()=>{ m.classList.remove('open'); d.classList.remove('open'); setTimeout(()=>{m.remove();d.remove();},220); };
    m.addEventListener('click', close);
    d.querySelector('[data-close]').addEventListener('click', close);
    return d;
  }

  emptyHtml(text){
    return `<div class="empty">${this.ic('info')}<span>${text||'暂无数据'}</span></div>`;
  }
};
})();
