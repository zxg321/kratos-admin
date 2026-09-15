/* GIS Intel Ops Platform · 共享运行时（App Shell 注入 + 通用组件）
 * 纯静态离线。页面只调用 new Shell(pageKey).mount()，严禁自写导航。 */
(function(){
const _stroke = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const icon = n => window.ICONS[n] ? _stroke + window.ICONS[n] + '</svg>' : '';

window.Shell = class Shell {
  constructor(pageKey){ this.pageKey = pageKey; }
  icon(name){ return icon(name); }
  ic(name, style){ const s = _stroke + (window.ICONS[name]||'') + '</svg>';
    return style ? s.replace('<svg', '<svg style="'+style+'"') : s; }
  esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  tag(cls, text, pulse){ return '<span class="tag '+(cls||'g')+(pulse?' pulse':'')+'"><i></i>'+this.esc(text)+'</span>'; }

  navItems(){
    return [
      ['dashboard','运行总览','layout-dashboard','01'],
      ['map','管网一张图','map','02'],
      ['overlay','覆盖物','map-pin','03'],
      ['collect','采集入库','database','04'],
      ['monitor','智能监测','radio','05'],
      ['alarm','告警中心','bell','06',3],
      ['patrol','巡检作业','clipboard-list','07'],
      ['emergency','应急指挥','siren','08'],
      ['asset','资产生命周期','package','09'],
      ['system','系统管理','settings','10'],
      ['openapi','政企对接','link','11']
    ];
  }

  mount(){
    const nav = document.getElementById('app-nav');
    if(!nav) return;
    const items = this.navItems().map(([key,label,icm,no,badge]) =>
      `<a class="nav-item ${key===this.pageKey?'active':''}" data-nav="${key}" href="${key}.html" title="${label}">
        ${this.ic(icm)}<span>${label}</span>${badge?'<span class="nav-badge">'+badge+'</span>':'<span class="nav-key">'+no+'</span>'}</a>`).join('');
    nav.innerHTML =
      `<div class="nav-brand"><span class="nav-mark">${this.ic('droplet')}</span>
          <span><b>GIS Intel Ops</b><small>管网智能运维一体化平台</small></span></div>
      <div class="nav-group">业务导航</div>
      ${items}
      <div class="nav-sep"></div>
      <a class="nav-item" href="bigscreen.html" target="_blank">${this.ic('monitor')}<span>态势大屏</span><span class="nav-key">S8</span></a>
      <a class="nav-item" href="mobile.html" target="_blank">${this.ic('smartphone')}<span>移动作业端</span><span class="nav-key">S9</span></a>
      <div class="nav-foot">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span class="dot"></span>
          <span class="code">PG/PostGIS · NATS · 在线</span></div>
        <button class="btn btn-sm" id="themeBtn" style="width:100%;justify-content:center">
          ${this.ic('moon','width:14px;height:14px')}<span>主题切换</span></button>
      </div>`;
    const tb = document.getElementById('themeBtn');
    if(tb) tb.addEventListener('click', ()=>{ document.documentElement.toggleAttribute('data-theme'); });
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

  /* 运行总览/页面通用：绑定表格空态 */
  emptyHtml(text){
    return `<div class="empty">${this.ic('info')}<span>${text||'暂无数据'}</span></div>`;
  }
};
})();
