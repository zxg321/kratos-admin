// 高德实现：引擎无关契约 + AMap 内部操作。渲染/绘制完整逻辑在 P1/P2 填充。
import { load } from '@amap/amap-jsapi-loader'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { BBox, DrawController, MapAdapter, MapEventType, MapPlugin, OverlayStyle, FeatureClickEvent } from '../adapter/types'
import { renderGeoJSONToAMap, removeGroup, getOrCreateGroup, setAMapNamespace, setOverlayClickHandler } from './amapOverlay'
import { createAMapDraw } from './amapDraw'

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
  // 注入命名空间，供 overlay 渲染 / MouseTool 绘制按需取构造器（避免依赖 window.AMap）。
  setAMapNamespace(AMap)
  const map = new AMap.Map(container, {
    center,
    zoom,
    viewMode: '2D',
    mapStyle: 'amap://styles/whitemap',
  })
  return map
}

export class AMapAdapter implements MapAdapter {
  // feature-click 命中回调列表：由 overlay 点击（amapOverlay 注入）驱动，而非 map 原生 click。
  private featureClickCbs: Array<(e: FeatureClickEvent) => void> = []

  constructor(private map: any) {
    // 注入要素点击回调：overlay 命中时转发 properties 与 GCJ02 坐标。
    setOverlayClickHandler((properties, lngLat) => {
      this.featureClickCbs.forEach((cb) => cb({ lngLat, properties }))
    })
  }

  on(type: MapEventType, cb: (...args: never[]) => void): void {
    if (type === 'feature-click') {
      this.featureClickCbs.push(cb as (e: FeatureClickEvent) => void)
      return
    }
    const amapEvent = type === 'map-ready' ? 'complete' : 'moveend'
    this.map.on(amapEvent, cb as never)
  }

  off(type: MapEventType, cb: (...args: never[]) => void): void {
    if (type === 'feature-click') {
      this.featureClickCbs = this.featureClickCbs.filter((c) => c !== cb)
      return
    }
    const amapEvent = type === 'map-ready' ? 'complete' : 'moveend'
    this.map.off(amapEvent, cb as never)
  }

  // 返回当前视野 bounds（GCJ02 度），供 bbox 查询使用。
  getBounds(): BBox {
    const b = this.map.getBounds()
    return { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() }
  }

  // 渲染 GeoJSON：内部完成 WGS84→GCJ02 转换，同 key 覆盖重建。
  renderGeoJSON(key: string, data: FeatureCollection | Feature | Geometry, style?: OverlayStyle): void {
    renderGeoJSONToAMap(this.map, key, data, style)
  }

  remove(key: string): void {
    removeGroup(key)
  }

  setVisible(key: string, visible: boolean): void {
    getOrCreateGroup(this.map, key).groupSetVisible(visible)
  }

  createDrawController(): DrawController {
    return createAMapDraw(this.map)
  }

  addPlugin(p: MapPlugin): void {
    p.install(this)
  }

  destroy(): void {
    setOverlayClickHandler(null)
    this.map.destroy?.()
  }
}
