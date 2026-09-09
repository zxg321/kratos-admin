import type maplibregl from 'maplibre-gl'

export { default as MapView } from './MapView.vue'
export * from './useMap'
export * from './useDraw'

// 统一地图实例类型：跨包（gis-core / gis-ui / portal）引用 Map 时均使用此导出，
// 避免各包各自解析 maplibre-gl 类型导致版本差异。
export type MapInstance = maplibregl.Map
