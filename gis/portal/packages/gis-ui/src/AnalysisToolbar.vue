<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { Geometry } from 'geojson'
import { ElMessage } from 'element-plus'
import {
  renderAnalysisResult,
  renderFeatures,
  clearAnalysis,
  transformGeometry,
  type BaseLayerConfig,
  type DrawController,
  type FeatureItem,
  type MapAdapter,
} from '@zxg321/kratos-gis-core'
import type { LayerItem } from './LayerPanel.vue'

// 分析请求的几何载体：coordinates 承载完整 GeoJSON geometry 文本（与后端契约一致）。
export interface AnalysisGeometry {
  type: string
  coordinates: string
}

export interface OverlayQueryResponse {
  result: { list: FeatureItem[] }
}

// 由宿主（app 层）注入的分析 API 实现，保持组件库与后端 client 解耦。
export interface AnalysisApi {
  distance(geometry: AnalysisGeometry): Promise<{ meters: number }>
  area(geometry: AnalysisGeometry): Promise<{ square_meters: number }>
  buffer(geometry: AnalysisGeometry, distanceMeters: number): Promise<{ result: AnalysisGeometry }>
  within(layerId: number, geometry: AnalysisGeometry, limit?: number): Promise<OverlayQueryResponse>
  intersects(layerId: number, geometry: AnalysisGeometry, limit?: number): Promise<OverlayQueryResponse>
}

type Tool = 'distance' | 'area' | 'buffer' | 'within' | 'intersects'

const props = defineProps<{
  map: MapAdapter | null
  layers: LayerItem[]
  api: AnalysisApi
}>()

const emit = defineEmits<{
  (e: 'overlay-select', feature: Record<string, unknown>): void
}>()

const activeTool = ref<Tool | null>(null)
const bufferDist = ref(5000)
const targetLayerId = ref(0)
const resultText = ref('')
const overlayList = ref<FeatureItem[]>([])
const baseLayers = ref<BaseLayerConfig[]>([])
const currentBaseId = ref('')

const draw = ref<DrawController | null>(null)
let mapHandle: MapAdapter | null = null

watch(
  () => props.map,
  (m) => {
    if (!m) return
    mapHandle = m
    // 底图清单与切换入口：由 MapAdapter 提供（引擎无关）。
    baseLayers.value = m.listBaseLayers()
    currentBaseId.value = baseLayers.value[0]?.id ?? ''
    // 绘制控制器由 MapAdapter 创建（高德 MouseTool 实现）。
    draw.value = m.createDrawController()
    draw.value.onDraw((g) => {
      void onDrawing(g)
    })
  },
)

function changeBaseLayer(id: string) {
  if (!mapHandle) return
  const cfg = baseLayers.value.find((l) => l.id === id)
  if (cfg) {
    mapHandle.setBaseLayer(cfg)
    currentBaseId.value = id
  }
}

// 默认目标图层：优先选第一个可用图层。
watch(
  () => props.layers,
  (list) => {
    if (list.length > 0 && !list.some((l) => l.id === targetLayerId.value)) {
      targetLayerId.value = list[0].id
    }
  },
  { immediate: true },
)

const HINTS: Record<Tool, string> = {
  distance: '在地图上绘制折线以测量距离（双击结束）',
  area: '在地图上绘制多边形以测量面积（双击结束）',
  buffer: '在地图上单击绘制一个点，生成指定半径缓冲区',
  within: '在地图上绘制范围多边形，查询范围内的要素',
  intersects: '在地图上绘制范围多边形，查询与范围相交的要素',
}

function startTool(tool: Tool) {
  if (!draw.value) {
    ElMessage.warning('地图尚未就绪')
    return
  }
  if ((tool === 'within' || tool === 'intersects') && !targetLayerId.value) {
    ElMessage.warning('请先选择目标图层')
    return
  }
  clearAnalysisResult()
  activeTool.value = tool
  draw.value.clear()
  // 测距用折线、测积与叠加用多边形、缓冲用点。
  const mode = tool === 'distance' ? 'line' : tool === 'buffer' ? 'point' : 'polygon'
  draw.value.activate(mode)
  resultText.value = HINTS[tool]
}

async function onDrawing(geoGCJ: Geometry) {
  const tool = activeTool.value
  if (!tool || !draw.value || !mapHandle) return
  draw.value.activate('none')
  draw.value.clear()
  activeTool.value = null
  // 绘制几何为 GCJ02（高德坐标系），提交后端前转 WGS84（与后端 WGS84 契约一致）。
  const geo = transformGeometry(geoGCJ, 'gcj2wgs')
  const payload: AnalysisGeometry = { type: geo.type, coordinates: JSON.stringify(geo) }
  try {
    if (tool === 'distance') {
      const r = await props.api.distance(payload)
      resultText.value = `距离：${(r.meters / 1000).toFixed(2)} km`
    } else if (tool === 'area') {
      const r = await props.api.area(payload)
      resultText.value = r.square_meters >= 1e6
        ? `面积：${(r.square_meters / 1e6).toFixed(3)} km²`
        : `面积：${r.square_meters.toFixed(0)} m²`
    } else if (tool === 'buffer') {
      const r = await props.api.buffer(payload, bufferDist.value)
      const geo = JSON.parse(r.result.coordinates) as Geometry
      renderAnalysisResult(mapHandle, 'analysis-result', 'analysis-result-style', geo)
      resultText.value = `缓冲区已生成：半径 ${(bufferDist.value / 1000).toFixed(2)} km`
    } else {
      const r = tool === 'within'
        ? await props.api.within(targetLayerId.value, payload)
        : await props.api.intersects(targetLayerId.value, payload)
      const items = r.result?.list ?? []
      overlayList.value = items
      renderFeatures(mapHandle, 'analysis-overlay', 'analysis-overlay-style', items)
      resultText.value = `${tool === 'within' ? '范围内' : '相交'}命中 ${items.length} 个要素`
    }
  } catch (e) {
    resultText.value = `分析失败：${(e as Error).message}`
  }
}

function clearAnalysisResult() {
  activeTool.value = null
  draw.value?.activate('none')
  resultText.value = ''
  overlayList.value = []
  if (mapHandle) {
    clearAnalysis(mapHandle, 'analysis-result')
    clearAnalysis(mapHandle, 'analysis-overlay')
  }
}

function onOverlayItemClick(item: FeatureItem) {
  let propsData: Record<string, unknown> = {}
  try {
    propsData = JSON.parse(item.properties || '{}') as Record<string, unknown>
  } catch {
    propsData = {}
  }
  emit('overlay-select', propsData)
}

onBeforeUnmount(() => {
  draw.value?.destroy()
  draw.value = null
})
</script>

<template>
  <div class="analysis-toolbar">
    <el-button-group>
      <el-button size="small" :type="activeTool === 'distance' ? 'primary' : ''" @click="startTool('distance')">
        测距
      </el-button>
      <el-button size="small" :type="activeTool === 'area' ? 'primary' : ''" @click="startTool('area')">
        测积
      </el-button>
      <el-button size="small" :type="activeTool === 'buffer' ? 'primary' : ''" @click="startTool('buffer')">
        缓冲
      </el-button>
      <el-button size="small" :type="activeTool === 'within' ? 'primary' : ''" @click="startTool('within')">
        叠加·内
      </el-button>
      <el-button size="small" :type="activeTool === 'intersects' ? 'primary' : ''" @click="startTool('intersects')">
        叠加·交
      </el-button>
      <el-button size="small" @click="clearAnalysisResult">清空</el-button>
    </el-button-group>

    <div class="params">
      <span class="param-label">底图</span>
      <el-select :model-value="currentBaseId" size="small" placeholder="底图" style="width: 110px" @change="changeBaseLayer">
        <el-option v-for="b in baseLayers" :key="b.id" :label="b.label" :value="b.id" />
      </el-select>
    </div>

    <div v-if="activeTool === 'buffer' || activeTool === 'within' || activeTool === 'intersects'" class="params">
      <template v-if="activeTool === 'buffer'">
        <span class="param-label">缓冲(米)</span>
        <el-input-number v-model="bufferDist" :min="1" :max="1000000" size="small" :step="1000" />
      </template>
      <template v-else>
        <span class="param-label">目标图层</span>
        <el-select v-model="targetLayerId" size="small" placeholder="选择图层" style="width: 140px">
          <el-option v-for="l in layers" :key="l.id" :label="l.name" :value="l.id" />
        </el-select>
      </template>
    </div>

    <div v-if="resultText" class="result-text">{{ resultText }}</div>

    <div v-if="overlayList.length" class="overlay-list">
      <div
        v-for="f in overlayList"
        :key="f.id"
        class="overlay-item"
        @click="onOverlayItemClick(f)"
      >
        {{ f.properties ? ((JSON.parse(f.properties) as Record<string, unknown>).name ?? `要素#${f.id}`) : `要素#${f.id}` }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-toolbar {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  max-width: calc(100% - 40px);
}
.params {
  display: flex;
  align-items: center;
  gap: 6px;
}
.param-label {
  font-size: 12px;
  color: #606266;
}
.result-text {
  font-size: 12px;
  color: #303133;
  background: #f4f4f5;
  border-radius: 4px;
  padding: 3px 8px;
  white-space: nowrap;
}
.overlay-list {
  display: flex;
  gap: 4px;
}
.overlay-item {
  font-size: 12px;
  padding: 3px 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  cursor: pointer;
}
.overlay-item:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}
</style>
