import type { Geometry } from 'geojson'
import type { DrawController, DrawMode, MapAdapter } from './adapter/types'

// 分析绘制模式：点/线/面/无（none 回到选择模式）。契约统一由 adapter/types 提供，
// 此处仅透传导出，避免与 adapter 重复声明导致 export * 歧义。
export type { DrawMode } from './adapter/types'

// 初始化地图绘制控制器。
// P0 骨架：真实绘制（高德 MouseTool 等）在 P2 实现，此处返回空控制器保持类型契约；
// onDraw 回调在 P2 由绘制控制器真正触发。
export function useDraw(map: MapAdapter): DrawController {
  return {
    activate(mode) {
      // P2 实现：切换高德绘制模式
    },
    getGeometry() {
      // P2 实现：返回最近一次绘制的几何
      return null
    },
    clear() {
      // P2 实现：清空绘制要素
    },
    destroy() {
      // P2 实现：移除绘制控件
    },
    onDraw(cb) {
      // P2 实现：注册绘制完成回调
    },
  }
}
