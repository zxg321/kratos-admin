import type { MapAdapter } from './adapter/types'

export { default as MapView } from './MapView.vue'
export * from './adapter'
export * from './useMap'
export * from './useDraw'
// Canvas 自绘覆盖物骨架：吸附/选区动画等后续业务按需接入。
export * from './amap/canvasOverlay'

// 集中安装内置插件（measure/draw/snap/selector）。借鉴 GISMap MapContainer 的 install 注入：
// 通过 adapter.addPlugin 注册，具体插件实现由后续业务模块（P5-1/P5-2 及分析模块）填充，
// 此处保留为显式扩展点，不做任何运行时副作用。
export function installBuiltinPlugins(_adapter: MapAdapter): void {
  // 预留注册位：各内置插件实现后在此依次 adapter.addPlugin(plugin) 注册。
}

// 统一地图实例类型：替换原 maplibregl.Map。UI 层经此引用 adapter。
export type { MapAdapter } from './adapter/types'
