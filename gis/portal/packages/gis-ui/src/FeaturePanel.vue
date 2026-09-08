<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ properties: Record<string, unknown> | null }>()

const rows = computed(() =>
  Object.entries(props.properties ?? {}).map(([key, value]) => ({ key, value })),
)
</script>

<template>
  <div class="feature-panel">
    <template v-if="rows.length">
      <div v-for="row in rows" :key="`prop:${row.key}`" class="prop-row">
        <span class="prop-key">{{ row.key }}</span>
        <span class="prop-value">{{ row.value }}</span>
      </div>
    </template>
    <el-empty v-else description="点击地图要素查看属性" :image-size="60" />
  </div>
</template>

<style scoped>
.feature-panel {
  padding: 8px;
}
.prop-row {
  display: flex;
  gap: 8px;
  padding: 6px 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
}
.prop-key {
  color: var(--el-text-color-secondary);
  min-width: 80px;
}
.prop-value {
  word-break: break-all;
}
</style>
