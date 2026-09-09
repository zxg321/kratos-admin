import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { MapAdapter } from './adapter/types'

// FeatureForm 与 GIS 后端 feature.proto 对齐（ts-proto 生成后由 gis-api 包导出）。
export interface FeatureItem {
  id: number
  layerId: number
  geometry: { type: string; coordinates: string } | undefined
  properties: string
}

// 要素集合转 GeoJSON FeatureCollection。
// 注意：后端 Geometry.coordinates 承载的是完整 GeoJSON geometry 文本（如 {"type":"Point","coordinates":[...]}），
// 而非裸坐标数组，解析后直接作为 Feature.geometry 使用。
export function toGeoJSON(items: FeatureItem[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: items
      .map((it) => {
        let geometry: Geometry | null = null
        if (it.geometry?.coordinates) {
          try {
            const parsed = JSON.parse(it.geometry.coordinates) as { type?: string; coordinates?: unknown }
            if (parsed && typeof parsed.type === 'string' && parsed.type) {
              geometry = parsed as unknown as Geometry
            }
          } catch {
            geometry = null
          }
        }
        return { item: it, geometry }
      })
      .filter((x) => x.geometry !== null)
      .map(({ item: it, geometry }) => ({
        type: 'Feature',
        id: it.id,
        geometry: geometry as Geometry,
        properties: safeParse(it.properties),
      })),
  }
}

// 向地图添加/更新要素图层。P0 起由 adapter.renderGeoJSON 统一渲染
// （内部完成 WGS84→GCJ02 与样式映射，P1 实现）。
export function renderFeatures(
  map: MapAdapter,
  sourceId: string,
  layerId: string,
  items: FeatureItem[],
): void {
  map.renderGeoJSON(sourceId, toGeoJSON(items), { pointColor: '#3b82f6' })
}

function safeParse(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || '{}') as Record<string, unknown>
  } catch {
    return {}
  }
}

// 分析结果渲染：样式交由 adapter 内部按几何类型自适应（P1 实现）。
export function renderAnalysisResult(
  map: MapAdapter,
  sourceId: string,
  layerId: string,
  data: FeatureCollection | Feature | Geometry,
): void {
  map.renderGeoJSON(sourceId, data, {
    fillColor: '#ef4444',
    strokeColor: '#dc2626',
    strokeWidth: 2,
    pointColor: '#ef4444',
  })
}

// 移除指定 key 的覆盖物（用于清空分析结果）。
export function clearAnalysis(map: MapAdapter, sourceId: string): void {
  map.remove(sourceId)
}
