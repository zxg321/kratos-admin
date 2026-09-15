# Final Report · snop-platform-full 全量产品原型

> 交付日期：2026-09-14 · 方法：Superpowers 七阶段（澄清 → 契约 → 计划 → 共享层 → 5 并行 subagent 开发 → 双轮评审 → 修复交付）

## 交付物
- 18 个页面 + 5 个共享资产 + README + design-contract/plan/final_report/verify.py
- 覆盖 04-SNOP功能说明书 12 模块 113 项功能（F-X01~X03 迁移支撑为一次性工程项，不出原型页）
- 四端齐全：login / 管理后台 15 页（Shell）/ portal 工作台（index）/ 生产调度大屏（bigscreen）/ 移动端 uni-app（mobile）

## 质量验证
| 轮次 | 手段 | 结果 |
|---|---|---|
| 静态核查 | verify.py：Shell 结构/脚本顺序/mediaSlot/fid 标注/图标名 98 个/api 键 104 个/零外链/无 alert | 18/18 通过 |
| 运行时冒烟 | playwright-core + Edge 无头逐页加载，捕获 console.error 与 pageerror | 首轮 16 页报错 → 修复后 18/18 零报错 |
| 视觉抽查 | 截图 index/map/dma/mobile | 布局/令牌/信息密度合格 |

## 评审发现与修复（Critical）
1. **api 调用约定分裂**：部分页面用 `api('key')`，部分用 `api.key()`；原 Proxy 实现两者皆不支持（`api.layer.tree is not a function` / `api is not a function`）。
   修复：api.js 重写为延迟解析 Proxy（函数 target + get trap 递归拼接路径），两种约定全兼容；并修正 `alarm.get`/`feature.get`/`device.realtime` 的参数归一化（对象/位置参数均可）。
2. **favicon 404**：浏览器会话首个页面触发 favicon.ico 请求报 404。修复：全部页面补 `<link rel="icon" href="data:,">`。

## 遗留说明（Non-blocking）
- bigscreen/mobile/login 直接读 window.MOCK（契约允许的例外），其余 15 页严格走 api stub。
- system 备份恢复 mock 仅含 4 库行（snop_system/gis/iot/asset），页面顶部已标注六库备份说明；如需演示全六库，扩充 mock.backups 即可。
- 冒烟工具位于 `.workbuddy/pw-smoke/`（smoke.js 可重复执行），verify.py 位于 `_design/`。

## 变更记录
- **2026-09-15 · D7 语义修正**：用户澄清「介质 = 租户类别标识，燃气/供水/热力分属不同租户」。落地：components.js MEDIAS 增加 tenant 映射（燃气=燃气公司/供水=江南水司/热力=热力集团），切换器重定义为「租户类别（介质）切换」并在 chip 显示「租户 · 介质」；login.html 新增租户选择器（写入同一 localStorage，auth.login claims.tenant 联动）；index 欢迎条/积木配置租户名动态化；bigscreen chip 与说明条改为租户口径；16 页静态 chip 文案统一；契约/README 同步。回归：smoke 18/18 零报错 + verify 静态核查通过 + 截图抽查（login 租户选择、index 燃气租户联动）。
- **2026-09-15 · D7 单租户口径收口（修复"介质同时出现"）**：定位到单租户视图内多介质混排的 6 类问题并全部修复：
  1. **跨介质合计**：index/bigscreen KPI 原为三介质求和（1,286.4km / 12,483 台）→ 新增 `mock.summary.mediaKpis` 三租户各自指标，KPI 全量改取本租户（燃气 486.2km / 4,210 台…）。
  2. **介质分型卡三行并排** → 改为「本租户介质」单卡（仅本介质+租户名+说明）；模块宫格去掉跨介质数字，改中性描述。
  3. **列表跨介质混排** → api.js 增加集中收口 `sc()`：device/layer/feature/alarm/patrol(计划·工单·隐患·标定·开挖)/cnd(事故·抢险·物资·预案·演练)/eam(台账·维保·处置·采购)/iot.realtime/alarm.rule 共 22 个键默认只返回本租户介质；mock 补齐各介质自有数据（巡检工单 gas+2/heat+2、隐患 gas+1/heat+1、EAM 资产 gas+2/heat+2、告警规则/告警 gas+heat 补充）。
  4. **介质筛选控件** → 收敛为只读指示 `shell.tenantMediaSelect()`（"供水（本租户）"，不可跨介质筛选）。
  5. **顶栏切换器三按钮常显** → 改为折叠式下拉（默认只显示本租户），消除"每页都出现三种介质名"。
  6. **移动端/大屏直读 MOCK 未过滤** → mobile 设备/工单按本租户介质收敛；bigscreen 环图与产销对比改本租户口径。
  另修：bigscreen `bar()` 参数顺序错误导致产销条宽度为 NaN（静默缺陷）；eam 失效图标 `git-pull-request` → `git-merge`。
  验证：新增 `check_multimedia.js`（无头跨三租户逐页统计可见文本）→ **多介质同时出现（无）**；smoke 18/18 零报错；visual 抽查（燃气租户 index/layer）确认 KPI、图层树、授权角色、介质控件全部为本租户口径。`system.html`（平台底座跨租户管理）与 `login.html`（租户选择）为契约允许的例外。
