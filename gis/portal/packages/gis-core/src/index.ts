export { default as MapView } from './MapView.vue'
export * from './adapter'
export * from './useMap'
export * from './useDraw'

// 统一地图实例类型：替换原 maplibregl.Map。UI 层经此引用 adapter。
export type { MapAdapter } from './adapter/types'
