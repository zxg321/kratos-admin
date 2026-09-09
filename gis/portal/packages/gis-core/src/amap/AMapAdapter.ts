// 高德实现：引擎无关契约 + AMap 内部操作。渲染/绘制完整逻辑在 P1/P2 填充。
import { load } from '@amap/amap-jsapi-loader'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { BBox, DrawController, MapAdapter, MapEventType, MapPlugin, OverlayStyle } from '../adapter/types'

export const AMAP_KEY = import.meta.env.VITE_AMAP_KEY as string
export const AMAP_VERSION = '2.0'

/** 异步加载高德 JSAPI 并初始化容器，返回封装好的 AMap Instance handle. */
export async function createAMap(container: HTMLElement, center: [number, number], zoom: number): Promise<any> {
  // load 返回的 AMap 即高德 JSAPI 命名空间（含 AMap.Map 等构造器）。
  const AMap = await load({
    key: AMAP_KEY,
    version: AMAP_VERSION,
    plugins: ['AMap.MouseTool', 'AMap.ControlBar', 'AMap.Scale'],
  })
  const map = new AMap.Map(container, {
    center,
    zoom,
    viewMode: '2D',
    mapStyle: 'amap://styles/whitemap',
  })
  return map
}

export class AMapAdapter implements MapAdapter {
  constructor(private map: any) {}

  on(type: MapEventType, cb: (...args: never[]) => void): void {
    const amapEvent = type === 'map-ready' ? 'complete'
      : type === 'feature-click' ? 'click'
      : type === 'moveend' ? 'moveend' : 'click'
    this.map.on(amapEvent, cb as never)
  }

  off(type: MapEventType, cb: (...args: never[]) => void): void {
    const amapEvent = type === 'feature-click' ? 'click' : type === 'moveend' ? 'moveend' : 'complete'
    this.map.off(amapEvent, cb as never)
  }

  // P1 之前返回示例 bounds；后续阶段用真实 camera 计算（GCJ02）。
  getBounds(): BBox {
    const b = this.map.getBounds()
    return { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() }
  }

  renderGeoJSON(key: string, data: FeatureCollection | Feature | Geometry, style?: OverlayStyle): void {
    // P1 实现：WGS84→GCJ02 后转为 AMap overlay，记录到 this.overlays[key]
    // 骨架阶段仅占位，保证类型契约通过。
    throw new Error('renderGeoJSON 待 P1 实现')
  }

  remove(key: string): void {
    // P1 实现
  }

  setVisible(key: string, visible: boolean): void {
    // P1 实现
  }

  createDrawController(): DrawController {
    throw new Error('createDrawController 待 P2 实现')
  }

  addPlugin(p: MapPlugin): void {
    p.install(this)
  }

  destroy(): void {
    this.map.destroy?.()
  }
}
