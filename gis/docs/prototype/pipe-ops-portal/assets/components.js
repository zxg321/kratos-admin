/* PipeOps Portal · 共享运行时（图标集 + App Shell 注入 + 通用组件）
 * 纯静态离线：图标内联 SVG，零外部依赖。所有页面只调用 new Shell(pageKey).mount()。 */
window.ICONS = {
  'layout-dashboard': '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  'map': '<path d="M14.1 6 20 3.5V16l-5.9 3L4 16V3.5l10.1 2.5z"/><path d="M14.1 6v13"/><path d="M4 3.5v13"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'folder-cog': '<path d="M10 4 8.5 2H2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4z"/><circle cx="12" cy="13" r="3"/><path d="M12 9v1M12 16v1M9.3 11.5l.7.7M14 14.8l.7.7M9.3 14.5l.7-.7M14 11.2l.7-.7"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'plus': '<path d="M12 5v14M5 12h14"/>',
  'trash-2': '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/>',
  'pencil': '<path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  'x': '<path d="M18 6 6 18M6 6l12 12"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'filter': '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  'upload': '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>',
  'check-circle': '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="m9 11 3 3L22 4"/>',
  'alert-triangle': '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.7 2.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.7-2.7L3 16"/><path d="M8 16H3v5"/>',
  'activity': '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  'layers': '<path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  'shield': '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.4 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'alert-octagon': '<path d="M7.86 2h8.3L22 7.86v8.3L16.14 22H7.86L2 16.14V7.86z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  'trending-down': '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  'gauge': '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  'radio': '<circle cx="12" cy="12" r="2"/><path d="M4.93 19.07a10 10 0 0 1 0-14.14"/><path d="M7.83 16.17a5.5 5.5 0 0 1 0-8.35"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M16.17 7.83a5.5 5.5 0 0 1 0 8.35"/>',
  'wifi': '<path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.8a15 15 0 0 1 20 0"/><path d="M12 20h.01"/>',
  'cpu': '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M9 2v2M2 9h2M2 15h2M22 9h-2M22 15h-2M9 22v-2M15 22v-2"/>',
  'zap': '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  'droplet': '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.12 2.12 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z"/>',
  'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  'clipboard-list': '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M8 11h8"/><path d="M8 15h8"/><path d="M8 19h5"/>',
  'bar-chart': '<path d="M3 3v18h18"/><path d="M8 17V9"/><path d="M13 17V5"/><path d="M18 17v-3"/>',
  'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'
};
const _stroke = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

window.Shell = class Shell {
  constructor(pageKey){ this.pageKey = pageKey; }
  icon(name){ return ICONS[name] ? _stroke + ICONS[name] + '</svg>' : ''; }
  esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  tag(cls, text){ return '<span class="tag '+(cls||'g')+'"><i></i>'+this.esc(text)+'</span>'; }

  navItems(){
    return [
      ['dashboard','运行监控大屏','layout-dashboard','01'],
      ['map','管网 GIS 图','map','02'],
      ['overlay','覆盖物管理','map-pin','03'],
      ['collect','采集管理','database','04'],
      ['alarm','告警中心','bell','05'],
      ['archive','设备档案','folder-cog','06'],
      ['settings','系统设置','settings','07']
    ];
  }

  mount(){
    const nav = document.getElementById('app-nav');
    if(!nav) return;
    const items = this.navItems().map(([key,label,ic,no]) =>
      `<a class="nav-item ${key===this.pageKey?'active':''}" data-nav="${key}" href="${key}.html" title="${label}">
        ${this.icon(ic)}<span>${label}</span><span class="nav-key">${no}</span></a>`).join('');
    nav.innerHTML =
      `<div class="nav-brand">${this.icon('droplet').replace('<svg','<svg style="width:20px;height:20px"')}
          <span><b>AquaNet</b><small>管网运维平台</small></span></div>
      <div class="nav-item" style="margin:6px 10px 4px;cursor:default;color:var(--text-faint);font-size:11px">功能导航</div>
      ${items}
      <div class="nav-sep"></div>
      <a class="nav-item" data-nav="settings" href="settings.html">${this.icon('shield')}<span>数据安全</span></a>
      <div class="nav-foot">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span class="dot"></span>
          <span class="code">PG 5455 · gis · 在线</span></div>
        <button class="btn btn-sm" id="themeBtn" style="width:100%;justify-content:center">
          ${this.icon('moon').replace('<svg','<svg style="width:14px;height:14px"')}<span>主题切换</span></button>
      </div>`;
    const tb = document.getElementById('themeBtn');
    if(tb) tb.addEventListener('click', ()=>{ document.documentElement.toggleAttribute('data-theme'); });
  }

  badge(n){ return '<span class="code" style="color:var(--text-faint)">'+n+'</span>'; }

  toast(msg, type){
    let t = document.querySelector('[data-toast]');
    if(!t){ t = document.createElement('div'); t.dataset.toast='1'; t.style.cssText =
      'position:fixed;left:50%;bottom:28px;transform:translate(-50%,16px);z-index:200;background:var(--surface);'+
      'border:1px solid var(--border);border-radius:10px;padding:10px 18px;box-shadow:var(--sh-lg);opacity:0;'+
      'transition:all .25s var(--ease);font-size:13px'; document.body.appendChild(t); }
    t.style.cssText = t.style.cssText.replace('opacity:0',''); // reset
    t.innerHTML = (type==='ok'?this.icon('check-circle'):type==='err'?this.icon('alert-triangle'):this.icon('info')) + msg;
    void t.offsetWidth; t.style.opacity='1'; t.style.transform='translate(-50%,0)';
    setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translate(-50%,16px)'; }, 2200);
  }

  // 通用模态：openModal(config) config {title, size, bodyHtml, footer?, onOk}
  openModal(cfg){
    const mask = document.createElement('div'); mask.className='mask';
    const icon = n=>this.icon(n);
    mask.innerHTML =
      `<div class="modal" style="width:${cfg.size||560}px">
        <div class="modal-head"><h3>${cfg.title}</h3><button class="iconbtn" data-close>${icon('x')}</button></div>
        <div class="modal-body">${cfg.bodyHtml}</div>
        ${cfg.footer===false?'':`<div class="modal-foot">
          <button class="btn" data-cancel>取消</button>
          <button class="btn btn-primary" data-ok>${cfg.okText||'确认'}</button></div>`}
      </div>`;
    document.body.appendChild(mask); requestAnimationFrame(()=>mask.classList.add('open'));
    mask.querySelector('[data-close],[data-cancel]')?.addEventListener('click',()=>this.closeModal(mask));
    if(cfg.onOk) mask.querySelector('[data-ok]')?.addEventListener('click', ()=>{ const r=cfg.onOk(); if(r!==false) this.closeModal(mask); });
    if(cfg.onMount) mask.querySelector('.modal').__onMount && setTimeout(()=>cfg.onMount?.(mask),0);
    window.__mask=mask; return mask;
  }
  closeModal(mask){ (mask||window.__mask)?.remove(); }
};