<script setup lang="ts">
export interface LayerItem {
  id: number
  name: string
  layerType: string
  visible: boolean
  status: number
}

defineProps<{ layers: LayerItem[] }>()

const emit = defineEmits<{
  (e: 'select', layer: LayerItem): void
  (e: 'toggle-visible', layer: LayerItem): void
}>()
</script>

<template>
  <div class="layer-panel">
    <div
      v-for="layer in layers"
      :key="`layer:${layer.id}`"
      class="layer-item"
      @click="emit('select', layer)"
    >
      <el-checkbox
        :model-value="layer.visible"
        @click.stop="emit('toggle-visible', layer)"
      />
      <span class="layer-name">{{ layer.name }}</span>
      <el-tag size="small" :type="layer.layerType === 'point' ? 'primary' : 'success'">
        {{ layer.layerType }}
      </el-tag>
    </div>
  </div>
</template>

<style scoped>
.layer-panel {
  padding: 8px;
}
.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.layer-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
