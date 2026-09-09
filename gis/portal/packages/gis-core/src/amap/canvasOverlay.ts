// 高德 Canvas 自绘覆盖物骨架：独立 <canvas> 绝对定位叠加在地图容器之上（高于底图、不拦截事件），
// 坐标经 map.lngLatToContainer 从经纬度投影为容器像素。借鉴 GISMap CanvasMarker 的
// lngLatToContainer + requestAnimationFrame 思路，以引擎无关 drawFn 承载具体绘制
// （吸附框/选区高亮等动画由后续业务按需注入），本模块不接入具体业务，仅提供通用能力。
import { getAMap } from './amapOverlay'

export interface AMapCanvasOverlayHandle {
  /** 高德自定义 Overlay 实例（可 setMap(null) 卸载或手动 draw() 重绘）。 */
  overlay: any
  /** 覆盖 canvas（宿主可直接改样式/挂事件，但不建议拦截指针事件）。 */
  canvas: HTMLCanvasElement
}

// 创建叠加在地图上的全屏 canvas 覆盖物。
// drawFn 在地图变换（平移/缩放，高德自动触发 overlay.draw）与动画帧中被调用；
// toScreen 把经纬度投影为容器像素坐标，供 drawFn 绘制吸附框、高亮等。
export function createAMapCanvasOverlay(
  map: any,
  id: string,
  drawFn: (ctx: CanvasRenderingContext2D, toScreen: (lng: number, lat: number) => [number, number]) => void,
): AMapCanvasOverlayHandle {
  const AMap = getAMap()
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'pointer-events:none;position:absolute;left:0;top:0;z-index:500'
  canvas.dataset.gisOverlayId = id

  const onAdd = (): void => {
    map.getContainer().appendChild(canvas)
  }
  const onRemove = (): void => {
    canvas.remove()
  }
  // 地图变换时重投影并重绘（高德 v2 的 Overlay.draw 在平移/缩放时自动调用）。
  const draw = (): void => {
    const size = map.getSize()
    canvas.width = size.width
    canvas.height = size.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const toScreen = (lng: number, lat: number): [number, number] => {
      const p = map.lngLatToContainer(new AMap.LngLat(lng, lat))
      return [p.x, p.y]
    }
    drawFn(ctx, toScreen)
  }

  // 兼容高德 v1.4/v2 的自定义 Overlay 构造：优先 AMap.Overlay.extend（两者均支持），
  // 兜底 new AMap.Overlay(options)（v1.4 亦接受 onAdd/onRemove/draw 钩子）。
  let overlay: any
  if (typeof AMap.Overlay.extend === 'function') {
    const CustomOverlay = AMap.Overlay.extend({ onAdd, onRemove, draw })
    overlay = new CustomOverlay()
  } else {
    overlay = new AMap.Overlay({ onAdd, onRemove, draw })
  }
  overlay.setMap(map)

  return { overlay, canvas }
}

// 简易动画循环：requestAnimationFrame 驱动，仅当 getDirty() 为 true 时执行 onDraw，
// 避免无变化时反复重绘（防刷屏）。onDraw 由宿主决定重绘内容（通常为 overlay.draw()）。
// 返回停止函数，需在组件卸载时调用以释放动画帧。
export function startCanvasAnim(
  _map: any,
  overlay: any,
  onDraw: () => void,
  getDirty: () => boolean,
): () => void {
  let raf = 0
  let running = true
  const tick = (): void => {
    if (!running) return
    if (getDirty()) onDraw()
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => {
    running = false
    cancelAnimationFrame(raf)
  }
}
