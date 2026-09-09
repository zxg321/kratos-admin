// 引擎无关地图契约。UI 层及各阶段仅依赖本文件，不得直接 import maplibre/amap。
import type { FeatureCollection, Feature, Geometry } from 'geojson'
import type { BaseLayerConfig } from './layers'
// 底图配置随契约一起透传，UI 层统一从 adapter/types 取类型。
export type { BaseLayerConfig } from './layers'

// 地理边界（度，WGS84 经纬度）。前后端统一 WGS84 原子语义。
export interface BBox { south: number; west: number; north: number; east: number }

// 覆盖物/图层显隐与样式（引擎无关的轻量描述，renderer 内部按其取色）。
export interface OverlayStyle {
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
  pointColor?: string
}

// 事件类型：与现有 map-ready / feature-click / moveend 对齐。
export type MapEventType = 'map-ready' | 'feature-click' | 'moveend'

export interface FeatureClickEvent {
  lngLat: [number, number]
  properties: Record<string, unknown>
}

// 绘制模式：与现有 DrawMode 对齐。
export type DrawMode = 'point' | 'line' | 'polygon' | 'none'

export interface DrawController {
  activate(mode: DrawMode): void
  getGeometry(): Geometry | null
  clear(): void
  destroy(): void
  // 绘制完成回调（替代原 map.on('draw.create', ...)）
  onDraw(cb: (g: Geometry) => void): void
}

// 插件注入接口：借鉴 GISMap 的 install(map) 模式。
export interface MapPlugin {
  id: symbol
  install(map: MapAdapter): void
}

export interface MapAdapter {
  on(type: MapEventType, cb: (...args: never[]) => void): void
  off(type: MapEventType, cb: (...args: never[]) => void): void
  // 返回当前视野 bounds（GCJ02 度，适配层内部已由 WGS84 转换，供 bbox 查询使用）
  getBounds(): BBox
  // 渲染 GeoJSON（内部完成 WGS84→GCJ02 转换）
  renderGeoJSON(key: string, data: FeatureCollection | Feature | Geometry, style?: OverlayStyle): void
  remove(key: string): void
  setVisible(key: string, visible: boolean): void
  createDrawController(): DrawController
  addPlugin(p: MapPlugin): void
  // 切换底图：renderer 按 config.type 实例化对应 TileLayer（高德矢量/影像/天地图等）。
  setBaseLayer(config: BaseLayerConfig): void
  // 返回当前 renderer 支持的内置底图清单（引擎无关，供 UI 渲染切换入口）。
  listBaseLayers(): BaseLayerConfig[]
  destroy(): void
}
