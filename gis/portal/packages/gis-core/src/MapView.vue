<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createAMap, AMapAdapter } from './amap/AMapAdapter'
import type { MapAdapter, FeatureClickEvent, BaseLayerConfig } from './adapter/types'
import { DEFAULT_BASE_LAYERS } from './adapter/layers'

const props = withDefaults(
  defineProps<{
    center?: [number, number]
    zoom?: number
    // 底图清单：默认提供高德矢量/影像/天地图三项；宿主可传入自定义 baseLayers 覆盖默认集。
    baseLayers?: BaseLayerConfig[]
  }>(),
  { center: () => [116.3913, 39.9075], zoom: 10, baseLayers: () => DEFAULT_BASE_LAYERS },
)

const emit = defineEmits<{
  (e: 'map-ready', map: MapAdapter): void
  (e: 'feature-click', feature: Record<string, unknown>): void
}>()

const container = ref<HTMLDivElement>()
let adapter: AMapAdapter | null = null

// map-ready 后应用默认底图（取 baseLayers 第一项），保证宿主拿到 adapter 时底图已就绪。
function applyDefaultBaseLayer(): void {
  const first = props.baseLayers[0]
  if (first) adapter?.setBaseLayer(first)
}

onMounted(async () => {
  if (!container.value) return
  const map = await createAMap(container.value, props.center, props.zoom)
  adapter = new AMapAdapter(map)
  adapter.on('map-ready', () => {
    applyDefaultBaseLayer()
    emit('map-ready', adapter!)
  })
  // 高德 complete 即 ready
  // feature-click 由 overlay 命中驱动（amapOverlay 注入回调），事件结构为 { lngLat, properties }。
  adapter.on('feature-click', (e) => {
    const ev = e as FeatureClickEvent
    emit('feature-click', ev.properties)
  })
})

watch(
  () => props.center,
  (c) => adapter && (adapter as unknown as { map: any }).map.setCenter(c),
)

onBeforeUnmount(() => {
  adapter?.destroy()
  adapter = null
})

defineExpose({ getAdapter: () => adapter })
</script>

<template>
  <div ref="container" class="gis-map-view" :style="{ width: '100%', height: '100%' }" />
</template>
