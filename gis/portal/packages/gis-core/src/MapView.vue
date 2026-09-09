<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createAMap, AMapAdapter } from './amap/AMapAdapter'
import type { MapAdapter } from './adapter/types'

const props = withDefaults(
  defineProps<{
    center?: [number, number]
    zoom?: number
  }>(),
  { center: () => [116.3913, 39.9075], zoom: 10 },
)

const emit = defineEmits<{
  (e: 'map-ready', map: MapAdapter): void
  (e: 'feature-click', feature: Record<string, unknown>): void
}>()

const container = ref<HTMLDivElement>()
let adapter: AMapAdapter | null = null

onMounted(async () => {
  if (!container.value) return
  const map = await createAMap(container.value, props.center, props.zoom)
  adapter = new AMapAdapter(map)
  adapter.on('map-ready', () => emit('map-ready', adapter!))
  emit('map-ready', adapter) // 高德 complete 即 ready
  // P0 占位：高德 overlay 无 queryRenderedFeatures，先尽力取点击 target 的 properties，
  // 取不到则给空对象；P1/P2 完善命中与 lngLat 字段。
  adapter.on('feature-click', (e) => {
    const ev = e as { target?: { getProperties?: () => Record<string, unknown> }; lnglat?: { toArray?: () => [number, number] } }
    const propsData = ev.target?.getProperties?.() ?? {}
    emit('feature-click', propsData)
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
