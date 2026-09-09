import type maplibregl from 'maplibre-gl'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

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

// 向地图添加/更新要素图层。source 已存在则 setData，否则新增。
export function renderFeatures(
  map: maplibregl.Map,
  sourceId: string,
  layerId: string,
  items: FeatureItem[],
): void {
  const data = toGeoJSON(items)
  if (map.getSource(sourceId)) {
    ;(map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(data)
    return
  }
  map.addSource(sourceId, { type: 'geojson', data })
  map.addLayer({
    id: layerId,
    type: 'circle',
    source: sourceId,
    paint: { 'circle-radius': 6, 'circle-color': '#3b82f6' },
  })
}

function safeParse(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || '{}') as Record<string, unknown>
  } catch {
    return {}
  }
}

// 分析结果渲染：按几何类型自适应样式（点=红圆、线=红线、面=半透明红填充+描边）。
// source 已存在则 setData 增量更新，否则新建 source 与图层。
export function renderAnalysisResult(
  map: maplibregl.Map,
  sourceId: string,
  layerId: string,
  data: FeatureCollection | Feature | Geometry,
): void {
  // bare Geometry 需包装为 Feature 才能交给 GeoJSON source。
  const payload = data.type === 'FeatureCollection' || data.type === 'Feature'
    ? data
    : { type: 'Feature' as const, geometry: data, properties: {} }
  const existing = map.getSource(sourceId)
  if (existing) {
    ;(existing as maplibregl.GeoJSONSource).setData(payload)
    return
  }
  map.addSource(sourceId, { type: 'geojson', data: payload })
  const gtype = payload.type === 'Feature' ? payload.geometry?.type : payload.features[0]?.geometry?.type
  if (gtype === 'Point') {
    map.addLayer({
      id: layerId,
      type: 'circle',
      source: sourceId,
      paint: { 'circle-radius': 7, 'circle-color': '#ef4444', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 },
    })
  } else if (gtype === 'LineString') {
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      paint: { 'line-color': '#ef4444', 'line-width': 3 },
    })
  } else {
    map.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.35 },
    })
    map.addLayer({
      id: `${layerId}-stroke`,
      type: 'line',
      source: sourceId,
      paint: { 'line-color': '#dc2626', 'line-width': 2 },
    })
  }
}

// 移除指定 source 及其全部关联图层（用于清空分析结果）。
export function clearAnalysis(map: maplibregl.Map, sourceId: string): void {
  if (!map.getSource(sourceId)) return
  for (const layer of map.getStyle().layers) {
    // Background 等图层无 source 属性，需类型守卫过滤。
    if ('source' in layer && layer.source === sourceId) map.removeLayer(layer.id)
  }
  map.removeSource(sourceId)
}
