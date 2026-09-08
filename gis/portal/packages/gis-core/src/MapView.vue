<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// M1 默认使用 OpenStreetMap 栅格底图（无需 key）；
// 正式环境按设计文档第 10 节替换为天地图/高德合规源。
const props = withDefaults(
  defineProps<{
    center?: [number, number]
    zoom?: number
    style?: string
  }>(),
  {
    center: () => [116.3913, 39.9075],
    zoom: 4,
    style: 'https://demotiles.maplibre.org/style.json',
  },
)

const emit = defineEmits<{
  (e: 'map-ready', map: maplibregl.Map): void
  (e: 'feature-click', feature: Record<string, unknown>): void
}>()

const container = ref<HTMLDivElement>()
let map: maplibregl.Map | undefined

onMounted(() => {
  if (!container.value) return
  map = new maplibregl.Map({
    container: container.value,
    center: props.center,
    zoom: props.zoom,
    style: props.style,
  })
  map.on('load', () => emit('map-ready', map!))
  map.on('click', (e) => {
    const features = map?.queryRenderedFeatures(e.point) ?? []
    if (features.length > 0) {
      emit('feature-click', features[0].properties as Record<string, unknown>)
    }
  })
})

watch(
  () => props.center,
  (c) => map?.flyTo({ center: c }),
)

onBeforeUnmount(() => {
  map?.remove()
  map = undefined
})

defineExpose({ getMap: () => map })
</script>

<template>
  <div ref="container" class="gis-map-view" />
</template>

<style scoped>
.gis-map-view {
  width: 100%;
  height: 100%;
}
</style>
