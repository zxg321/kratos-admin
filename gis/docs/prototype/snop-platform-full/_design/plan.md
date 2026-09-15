# Build Plan · snop-platform-full 全量原型

> 契约：`_design/design-contract.md`（唯一开发依据）。全部 18 页 + 5 共享资产 + README。

## Phase 1 · 共享资产（串行，本会话完成）
| # | 文件 | 验证 |
|---|---|---|
| 1 | assets/styles.css | 复用 gis-platform-full 令牌 + 追加 login/手机壳/大屏/介质/Agent 会话样式 |
| 2 | assets/icons.js | 复用 + 追加 SNOP 所需图标（bot/network/flame/thermometer/qr-code 等） |
| 3 | assets/components.js | SNOP Shell：分组导航 15 项、介质切换器、六库状态、modal/drawer/toast |
| 4 | assets/mock.js | 12 域数据（layers/features/pipes/devices/collect/iot/alarm/dma/patrol/cnd/eam/sys/geagent/open） |
| 5 | assets/api.js | stub 键与页面一一对应 |

## Phase 2 · 页面（并行 subagent，每 agent 一批，读完契约+mock+api 后产出）
| 批 | 页面 | agent |
|---|---|---|
| A GIS 域 | map / layer / analysis / dma / report | agent-gis |
| B 感知域 | device / iot / alarm | agent-sense |
| C 作业经营 | patrol / cnd / eam | agent-ops |
| D 平台+工作台 | index / system / geagent / openapi | agent-platform |
| E 三端 | login / bigscreen / mobile | agent-ends |

## Phase 3 · 评审修复（本会话）
- 核查：Shell 接入 / nav 一致 / 零外链 / 交互五条最低要求 / api 键存在
- 产出 README.md + final report
