<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>アノテーション<span class="count">({{ annotations.length }})</span></h2>
    </div>
    <div class="sidebar-content">
      <AnnotationCard
        v-for="anno in annotations"
        :key="anno.id"
        :annotation="anno"
        :is-selected="selectedAnnoId === anno.id"
        @select="$emit('selectAnnotation', anno.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Annotation } from '~/composables/useAnnotations'

defineProps<{
  annotations: readonly Annotation[]
  selectedAnnoId: string | null
}>()

defineEmits<{
  selectAnnotation: [id: string]
}>()
</script>

<style scoped>
.sidebar {
  width: 100%;
  height: 100%;
  background: var(--surface);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;

    h2 {
      font-size: 14px;
      font-weight: 700;

      .count {
        color: var(--text-muted);
        font-weight: 400;
        margin-left: 6px;
      }
    }
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 2px;
    }
  }
}
</style>
