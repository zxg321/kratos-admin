export { default as MapView } from './MapView.vue'
export * from './adapter'
export * from './useMap'
export * from './useDraw'
// Canvas 自绘覆盖物骨架：吸附/选区动画等后续业务按需接入。
export * from './amap/canvasOverlay'

// 统一地图实例类型：替换原 maplibregl.Map。UI 层经此引用 adapter。
export type { MapAdapter } from './adapter/types'
