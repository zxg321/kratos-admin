<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { MapView, renderFeatures, transformBBox, type MapAdapter, type FeatureItem } from '@liujitcn/kratos-gis-core'
import { LayerPanel, FeaturePanel, AnalysisToolbar, type AnalysisApi } from '@liujitcn/kratos-gis-ui'
import type { LayerItem } from '@liujitcn/kratos-gis-ui'
import { layerApi, featureApi, analysisApi } from '../api/client'

const layers = ref<LayerItem[]>([])
const selectedLayer = ref<LayerItem | null>(null)
const features = ref<FeatureItem[]>([])
const selectedProps = ref<Record<string, unknown> | null>(null)
const mapRef = ref<InstanceType<typeof MapView>>()
// 地图实例用 shallowRef：避免 ref 的 UnwrapRef 深解包导致跨包类型不兼容。
const map = shallowRef<MapAdapter | null>(null)

async function loadLayers() {
  const res = await layerApi.list(1)
  layers.value = res.list
  if (res.list.length > 0) {
    selectLayer(res.list[0])
  }
}

async function selectLayer(layer: LayerItem) {
  selectedLayer.value = layer
  selectedProps.value = null
  await loadFeatures(layer)
}

async function loadFeatures(layer: LayerItem) {
  const m = map.value
  if (!m) return
  // getBounds 返回 GCJ02（高德坐标系），后端 bbox 契约为 WGS84，先转换再查询。
  const gcjBBox = m.getBounds()
  const wgs = transformBBox(gcjBBox, 'gcj2wgs')
  const res = await featureApi.bbox(layer.id, {
    south: wgs.south,
    west: wgs.west,
    north: wgs.north,
    east: wgs.east,
  })
  features.value = res.list
  renderFeatures(m, `layer-${layer.id}`, `layer-${layer.id}`, res.list)
}

function toggleVisible(layer: LayerItem) {
  layer.visible = !layer.visible
  const m = map.value
  if (!m) return
  // 渲染/显隐统一使用同一 key（renderFeatures 的 sourceId 即渲染 key）。
  m.setVisible(`layer-${layer.id}`, layer.visible)
}

function onMapReady(m: MapAdapter) {
  map.value = m
  m.on('moveend', () => {
    if (selectedLayer.value) void loadFeatures(selectedLayer.value)
  })
  void loadLayers()
}

function onFeatureClick(feature: Record<string, unknown>) {
  selectedProps.value = feature
}

onMounted(() => {
  if (selectedLayer.value) void loadFeatures(selectedLayer.value)
})
</script>

<template>
  <div class="workbench">
    <aside class="panel layer-panel-wrap">
      <h3>图层</h3>
      <LayerPanel :layers="layers" @select="selectLayer" @toggle-visible="toggleVisible" />
    </aside>
    <main class="map-wrap">
      <AnalysisToolbar :map="map" :layers="layers" :api="analysisApi as AnalysisApi" @overlay-select="onFeatureClick" />
      <MapView ref="mapRef" @map-ready="onMapReady" @feature-click="onFeatureClick" />
    </main>
    <aside class="panel feature-panel-wrap">
      <h3>要素属性</h3>
      <FeaturePanel :properties="selectedProps" />
    </aside>
  </div>
</template>

<style scoped>
.workbench {
  display: flex;
  height: 100vh;
}
.panel {
  width: 280px;
  background: #fff;
  border-right: 1px solid var(--el-border-color);
  overflow: auto;
}
.panel h3 {
  margin: 0;
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.feature-panel-wrap {
  border-right: none;
  border-left: 1px solid var(--el-border-color);
}
.map-wrap {
  flex: 1;
  position: relative;
}
</style>
