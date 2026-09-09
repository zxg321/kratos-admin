// 坐标转换：仅做 WGS84 <-> GCJ02 互转。所有 GCJ02 展示/提交均经由此模块。
// 禁止在其他文件直接实现坐标偏转，保持单一可信来源。
import gcoord from 'gcoord'
import type { Geometry, Position } from 'geojson'
import type { BBox } from './types'

export type CoordMode = 'wgs2gcj' | 'gcj2wgs'

export function wgs84ToGcj02(lng: number, lat: number): [number, number] {
  return gcoord.transform([lng, lat] as [number, number], gcoord.WGS84, gcoord.GCJ02)
}

export function gcj02ToWgs84(lng: number, lat: number): [number, number] {
  return gcoord.transform([lng, lat] as [number, number], gcoord.GCJ02, gcoord.WGS84)
}

// 边界转换：GCJ/WGS 互转为非线性映射，单纯转换西南/东北两角可能漏边，
// 故对四角分别转换后取 min/max 保证包围盒覆盖完整。
export function transformBBox(bbox: BBox, mode: CoordMode): BBox {
  const fn = mode === 'wgs2gcj' ? wgs84ToGcj02 : gcj02ToWgs84
  const sw = fn(bbox.west, bbox.south)
  const ne = fn(bbox.east, bbox.north)
  const se = fn(bbox.east, bbox.south)
  const nw = fn(bbox.west, bbox.north)
  const lngs = [sw[0], ne[0], se[0], nw[0]]
  const lats = [sw[1], ne[1], se[1], nw[1]]
  return {
    south: Math.min(...lats),
    west: Math.min(...lngs),
    north: Math.max(...lats),
    east: Math.max(...lngs),
  }
}

// 递归节点转坐标；嵌套（含 Polygon rings / MultiXxx 各级）通用。
function mapPosition(pos: Position, fn: (l: number, a: number) => [number, number]): Position {
  if (Array.isArray(pos[0])) {
    return (pos as unknown as Position[]).map((p) => mapPosition(p, fn)) as unknown as Position
  }
  const [x, y] = fn(pos[0], pos[1])
  return [x, y]
}

// 几何整体转换：保持 GeoJSON 结构不变，仅坐标数组按 mode 偏转。
export function transformGeometry(geo: Geometry, mode: CoordMode): Geometry {
  const fn = mode === 'wgs2gcj' ? wgs84ToGcj02 : gcj02ToWgs84
  switch (geo.type) {
    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
      // 以上类型的 coordinates 均为（嵌套）坐标数组，统一走递归转换。
      return { ...geo, coordinates: mapPosition(geo.coordinates as unknown as Position, fn) }
    case 'GeometryCollection':
      // GeometryCollection 无 coordinates，递归处理子几何。
      return { ...geo, geometries: geo.geometries.map((g) => transformGeometry(g, mode)) }
    default:
      return geo
  }
}
