import type maplibregl from 'maplibre-gl'

// FeatureForm 与 GIS 后端 feature.proto 对齐（ts-proto 生成后由 gis-api 包导出）。
export interface FeatureItem {
  id: number
  layerId: number
  geometry: { type: string; coordinates: string } | undefined
  properties: string
}

// 要素集合转 GeoJSON FeatureCollection。
export function toGeoJSON(items: FeatureItem[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: items
      .map((it) => {
        let coordinates: unknown = null
        if (it.geometry?.coordinates) {
          try {
            coordinates = JSON.parse(it.geometry.coordinates)
          } catch {
            coordinates = null
          }
        }
        return { item: it, coordinates }
      })
      .filter((x) => x.coordinates !== null)
      .map(({ item: it, coordinates }) => ({
        type: 'Feature',
        id: it.id,
        geometry: { type: it.geometry!.type, coordinates } as GeoJSON.Geometry,
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
