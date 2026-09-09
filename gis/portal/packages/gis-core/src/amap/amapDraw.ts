// 用高德 MouseTool 实现点/线/面绘制，产出 GeoJSON（GCJ02 度），由上层转 WGS84 后提交。
// 事件说明：高德 JSAPI v2 的 MouseTool 统一在绘制完成后触发 'draw' 事件，
// 事件参数 e.obj 为该次绘制的覆盖物对象（Marker / Polyline / Polygon），
// 依据 activate 传入的 mode 将其还原为对应 GeoJSON（官方示例采用同一事件）。
import type { Geometry } from 'geojson'
import type { DrawController, DrawMode } from '../adapter/types'
import { getAMap } from './amapOverlay'

export function createAMapDraw(map: any): DrawController {
  const AMap = getAMap()
  const tool = new AMap.MouseTool(map)

  let mode: DrawMode = 'none'
  let last: Geometry | null = null
  let cb: ((g: Geometry) => void) | null = null

  // 绘制完成统一处理：记录几何、退出绘制模式并清除临时覆盖物，随后触发 onDraw。
  const finishDraw = (geo: Geometry): void => {
    last = geo
    mode = 'none'
    tool.close(true)
    cb?.(geo)
  }

  // 高德 MouseTool 绘制完成事件（v2 文档：draw 事件，e.obj 为覆盖物对象）。
  tool.on('draw', (e: any) => {
    const obj = e?.obj
    if (!obj) return
    if (mode === 'point') {
      const pos = obj.getPosition?.()
      if (!pos) return
      finishDraw({ type: 'Point', coordinates: [pos.getLng(), pos.getLat()] })
    } else if (mode === 'line') {
      const path = obj.getPath?.() ?? []
      finishDraw({ type: 'LineString', coordinates: path.map((p: any) => [p.getLng(), p.getLat()]) })
    } else if (mode === 'polygon') {
      const path = obj.getPath?.() ?? []
      // Polygon.getPath 在带洞时为二维数组，MouseTool 绘制仅单环，此处做兼容处理。
      const rings = Array.isArray(path[0]) ? path : [path]
      finishDraw({ type: 'Polygon', coordinates: rings.map((ring: any[]) => ring.map((p: any) => [p.getLng(), p.getLat()])) })
    }
  })

  return {
    activate(m: DrawMode) {
      // 切换模式前关闭并清除上次绘制的临时覆盖物。
      tool.close(true)
      last = null
      mode = m
      if (m === 'none') return
      if (m === 'point') tool.marker()
      else if (m === 'line') tool.polyline()
      else tool.polygon()
    },
    getGeometry() {
      return last
    },
    clear() {
      last = null
      tool.close(true)
    },
    destroy() {
      tool.close(true)
    },
    onDraw(f) {
      cb = f
    },
  }
}
