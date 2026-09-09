// 引擎无关的底图图层源描述。renderer（AMapAdapter 等）按 type 实例化对应底图 TileLayer，
// UI 层经 listBaseLayers/setBaseLayer 切换，不直接接触引擎细节。
export type BaseLayerType = 'vector' | 'satellite' | 'tianditu' | 'gaode'

// 底图源配置：id 唯一标识，type 决定 renderer 实例化方式，label 供 UI 展示。
export interface BaseLayerConfig {
  id: string
  type: BaseLayerType
  label: string
}

// 内置底图清单（引擎无关默认集）：MapView 默认提供、AMapAdapter.listBaseLayers 返回同一份，
// 宿主可传入自定义 baseLayers 覆盖默认集。
export const DEFAULT_BASE_LAYERS: BaseLayerConfig[] = [
  { id: 'vector', type: 'vector', label: '矢量' },
  { id: 'satellite', type: 'satellite', label: '影像' },
  { id: 'tianditu', type: 'tianditu', label: '天地图' },
]
