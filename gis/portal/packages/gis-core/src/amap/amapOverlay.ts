// 将 WGS84 GeoJSON 渲染为高德 overlay。渲染前统一 WGS84→GCJ02 偏转。
// AMap 命名空间由 createAMap（AMapAdapter）加载后经 setAMapNamespace 注入，
// 避免依赖 window.AMap 全局；要素点击命中经 setOverlayClickHandler 由 adapter 注入回调。
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { transformGeometry } from '../adapter/coord'
import type { OverlayStyle } from '../adapter/types'

/** 要素点击回调：转发该要素 properties 与点击坐标（GCJ02 度）。 */
export type OverlayClickHandler = (properties: Record<string, unknown>, lngLat: [number, number]) => void

// 模块级 AMap 命名空间（单地图场景；由 AMapAdapter.createAMap 注入）。
let AMapNS: any
export function setAMapNamespace(ns: any): void {
  AMapNS = ns
}
// 取 AMap 命名空间（供本模块渲染与 amapDraw 的 MouseTool 共用）。
export function getAMap(): any {
  if (AMapNS) return AMapNS
  // 兜底：某些场景（如直接引用高德脚本）AMap 挂载在 window 上。
  const g = (window as { AMap?: any }).AMap
  if (g) return g
  throw new Error('AMap 命名空间未初始化，请先调用 setAMapNamespace')
}

// 要素点击回调（由 AMapAdapter 注入）。
let overlayClickHandler: OverlayClickHandler | null = null
export function setOverlayClickHandler(h: OverlayClickHandler | null): void {
  overlayClickHandler = h
}

export interface AMapOverlay {
  clear(): void
  show(b: boolean): void
}

// key -> overlay 集合（Marker/Polyline/Polygon），负责统一移除与显隐。
class OverlayGroup {
  private stack: any[] = []
  constructor(private map: any) {}
  get empty(): boolean {
    return this.stack.length === 0
  }
  push(o: any): void {
    this.stack.push(o)
  }
  clear(): void {
    this.stack.forEach((o) => o.setMap?.(null))
    this.stack = []
  }
  show(b: boolean): void {
    this.stack.forEach((o) => o.setMap?.(b ? this.map : null))
  }
  groupSetVisible(b: boolean): void {
    this.show(b)
  }
}

const registry = new Map<string, OverlayGroup>()

function asFeatures(data: FeatureCollection | Feature | Geometry): Feature[] {
  if (data.type === 'FeatureCollection') return (data as FeatureCollection).features
  if (data.type === 'Feature') return [data as Feature]
  return [{ type: 'Feature', geometry: data as Geometry, properties: {} }]
}

// 按 key 取 group；不存在则创建（key 与 map 绑定，重复渲染同一 key 复用 group）。
export function getOrCreateGroup(map: any, key: string): OverlayGroup {
  let group = registry.get(key)
  if (!group) {
    group = new OverlayGroup(map)
    registry.set(key, group)
  }
  return group
}

export function removeGroup(key: string): void {
  registry.get(key)?.clear()
  registry.delete(key)
}

// 渲染入口：data 为 WGS84，内部转 GCJ02 后添加 overlay；同 key 先清再建（覆盖语义）。
export function renderGeoJSONToAMap(
  map: any,
  key: string,
  data: FeatureCollection | Feature | Geometry,
  style?: OverlayStyle,
): void {
  const AMap = getAMap()
  const group = getOrCreateGroup(map, key)
  group.clear()

  const fill = style?.fillColor ?? '#3b82f6'
  const stroke = style?.strokeColor ?? '#ef4444'
  const strokeWeight = style?.strokeWidth ?? 2

  for (const f of asFeatures(data)) {
    const geo = transformGeometry(f.geometry as Geometry, 'wgs2gcj')
    const props = (f.properties ?? {}) as Record<string, unknown>

    let overlay: any
    if (geo.type === 'Point') {
      const [x, y] = geo.coordinates as [number, number]
      const pointColor = style?.pointColor ?? '#3b82f6'
      // 高德 Marker 无直接 fillColor，用 content 渲染带色圆点。
      const content = `<div style="width:10px;height:10px;border-radius:50%;background:${pointColor};border:2px solid #fff;box-shadow:0 0 2px rgba(0,0,0,.4)"></div>`
      overlay = new AMap.Marker({ position: [x, y], map, content, anchor: 'center' })
    } else if (geo.type === 'LineString') {
      const path = (geo.coordinates as [number, number][]).map(([x, y]) => [x, y])
      overlay = new AMap.Polyline({ map, path, strokeColor: stroke, strokeWeight })
    } else if (geo.type === 'Polygon') {
      const paths = (geo.coordinates as [number, number][][]).map((ring) => ring.map(([x, y]) => [x, y]))
      overlay = new AMap.Polygon({ map, path: paths, fillColor: fill, fillOpacity: 0.35, strokeColor: stroke, strokeWeight })
    } else {
      // MultiXxx / GeometryCollection 暂不渲染（当前 gis 分析均为单几何）。
      continue
    }

    // 要素点击命中：把该要素 properties 与点击坐标转发给 adapter 注入的回调。
    overlay.setProperties?.(props)
    overlay.on('click', (e: any) => {
      const p = e?.lnglat
      const lngLat: [number, number] = p ? [p.getLng(), p.getLat()] : [0, 0]
      overlayClickHandler?.(props, lngLat)
    })
    group.push(overlay)
  }
}
