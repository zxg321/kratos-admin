import { useAuthStore } from '../store/auth'

// 通用请求封装：自动附带 Authorization 头与 JSON 序列化。
export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const auth = useAuthStore()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (auth.token) {
    headers.set('Authorization', `Bearer ${auth.token}`)
  }
  const res = await fetch(url, { ...options, headers })
  if (res.status === 401) {
    // token 缺失或过期：清理登录态并回到登录页。
    auth.clear()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    throw new Error('登录已过期，请重新登录')
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  }
  return res.json() as Promise<T>
}

export interface LayerItem {
  id: number
  name: string
  layerType: string
  style: string
  visible: boolean
  status: number
}

export interface FeatureItem {
  id: number
  layerId: number
  geometry: { type: string; coordinates: string } | undefined
  properties: string
}

// 图层 API
export const layerApi = {
  list: (status = 1) => request<{ list: LayerItem[] }>(`/api/v1/gis/admin/layer/list?status=${status}`),
}

// 要素 API
export const featureApi = {
  bbox: (layerId: number, bounds: { south: number; west: number; north: number; east: number }) =>
    request<{ list: FeatureItem[] }>(
      `/api/v1/gis/admin/feature/bbox?layer_id=${layerId}&south=${bounds.south}&west=${bounds.west}&north=${bounds.north}&east=${bounds.east}`,
    ),
}

// 分析接口（M2 空间分析）。coordinates 承载完整 GeoJSON geometry 文本。
export interface AnalysisGeometry {
  type: string
  coordinates: string
}

export interface OverlayQueryResponse {
  result: { list: FeatureItem[] }
}

export const analysisApi = {
  distance: (geometry: AnalysisGeometry) =>
    request<{ meters: number }>('/api/v1/gis/admin/analysis/distance', {
      method: 'POST',
      body: JSON.stringify({ geometry }),
    }),
  area: (geometry: AnalysisGeometry) =>
    request<{ square_meters: number }>('/api/v1/gis/admin/analysis/area', {
      method: 'POST',
      body: JSON.stringify({ geometry }),
    }),
  buffer: (geometry: AnalysisGeometry, distanceMeters: number) =>
    request<{ result: AnalysisGeometry }>('/api/v1/gis/admin/analysis/buffer', {
      method: 'POST',
      body: JSON.stringify({ geometry, distance_meters: distanceMeters }),
    }),
  within: (layerId: number, geometry: AnalysisGeometry, limit = 100) =>
    request<OverlayQueryResponse>('/api/v1/gis/admin/analysis/within', {
      method: 'POST',
      body: JSON.stringify({ query: { layer_id: layerId, geometry, limit } }),
    }),
  intersects: (layerId: number, geometry: AnalysisGeometry, limit = 100) =>
    request<OverlayQueryResponse>('/api/v1/gis/admin/analysis/intersects', {
      method: 'POST',
      body: JSON.stringify({ query: { layer_id: layerId, geometry, limit } }),
    }),
}
