# -*- coding: utf-8 -*-
"""SNOP 原型全量静态核查：文件齐全 / Shell 结构 / api 键匹配 / 图标名存在 / 外链 / alert-prompt"""
import re, os, json, sys

BASE = r'D:\www\go\kratos-admin\gis\docs\prototype\snop-platform-full'
PAGES = ['login.html','index.html','map.html','layer.html','analysis.html','dma.html','report.html',
         'device.html','iot.html','alarm.html','patrol.html','cnd.html','eam.html','system.html',
         'geagent.html','openapi.html','bigscreen.html','mobile.html']
SHELL_PAGES = {'index.html','map.html','layer.html','analysis.html','dma.html','report.html',
               'device.html','iot.html','alarm.html','patrol.html','cnd.html','eam.html','system.html',
               'geagent.html','openapi.html'}

def read(p):
    with open(os.path.join(BASE, p), encoding='utf-8') as f: return f.read()

# --- 资产事实 ---
icons_js = read('assets/icons.js')
icon_keys = set(re.findall(r"^\s*'([\w-]+)':", icons_js, re.M))
api_js = read('assets/api.js')
api_keys = set(re.findall(r"key==='([\w.]+)'", api_js))

report = []
issues = 0

for p in PAGES:
    fp = os.path.join(BASE, p)
    if not os.path.exists(fp):
        report.append(f'[MISS] {p} 不存在'); issues += 1; continue
    html = read(p)
    probs = []

    # 外链（排除 SVG namespace 与 license 常见误报）
    urls = re.findall(r'(?:src|href)\s*=\s*["\'](?:https?:)?//[^"\']+["\']', html)
    urls += re.findall(r'url\((?:https?:)?//[^)]+\)', html)
    ext = [u for u in urls if 'www.w3.org' not in u]
    if ext: probs.append('外链: ' + '; '.join(ext[:3]))

    if 'alert(' in html or 'prompt(' in html: probs.append('使用 alert/prompt')

    # api 键
    used = set(re.findall(r"api\.(\w[\w.]*)\s*\(", html)) | set(re.findall(r"api\('([\w.]+)'", html))
    # api Proxy 用法: window.api.xxx( 或 api.xxx( —— Proxy get 任意键都合法，但 stub 未实现的键返回 {}，列为 warning
    unknown = sorted(k for k in used if k not in api_keys)
    if unknown: probs.append('api 未实现键: ' + ','.join(unknown))

    # 图标名
    ic_used = set(re.findall(r"\.ic\('([\w-]+)'", html)) | set(re.findall(r"shell\.icon\('([\w-]+)'", html)) \
            | set(re.findall(r"ICONS\['([\w-]+)'\]", html)) | set(re.findall(r"data-icon=\"([\w-]+)\"", html))
    # 模板字符串里的 ic(`name`) 少见，忽略
    bad_ic = sorted(i for i in ic_used if i not in icon_keys)
    if bad_ic: probs.append('图标不存在: ' + ','.join(bad_ic))

    if p in SHELL_PAGES:
        for token, label in [('<aside class="app-nav" id="app-nav"','nav'),
                             ('new Shell(','shell-init'),
                             ('assets/styles.css','css'),
                             ('assets/icons.js','icons'),
                             ('assets/components.js','components'),
                             ('assets/mock.js','mock'),
                             ('assets/api.js','api')]:
            if token not in html: probs.append(f'缺少 {label}')
        if 'mountMediaSwitch' not in html: probs.append('缺少介质切换 mountMediaSwitch')
        if 'mediaSlot' not in html: probs.append('缺少 mediaSlot')
        if 'class="fid"' not in html: probs.append('缺少 fid F-编号标注')
    else:
        for token, label in [('assets/styles.css','css'), ('assets/icons.js','icons')]:
            if token not in html: probs.append(f'缺少 {label}')

    status = 'OK' if not probs else 'ISSUE'
    if probs: issues += 1
    report.append(f'[{status}] {p} ({len(html)//1024}KB)' + ('' if not probs else '\n      - ' + '\n      - '.join(probs)))

# components/mock/api 自检
for f in ['assets/styles.css','assets/icons.js','assets/components.js','assets/mock.js','assets/api.js']:
    if not os.path.exists(os.path.join(BASE, f)):
        report.append(f'[MISS] {f}'); issues += 1

print('\n'.join(report))
print(f'\n== api.js stub 键数量: {len(api_keys)} ==')
print(f'== 图标数量: {len(icon_keys)} ==')
print(f'\n== 结果: {len(PAGES)} 页, {issues} 个文件有问题 ==')
