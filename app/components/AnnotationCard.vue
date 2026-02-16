<template>
  <div
    class="anno-card"
    :class="{ selected: isSelected }"
    @click="$emit('select')"
  >
    <div class="anno-card-top">
      <div class="pin-dot" :style="{ background: annotation.color }" />
      <div class="anno-info">
        <div class="anno-title">{{ annotation.title }}</div>
        <div class="anno-meta">{{ annotation.author }} · {{ annotation.time }}</div>
      </div>
    </div>
    <div v-if="annotation.desc" class="anno-desc">{{ annotation.desc }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Annotation } from '~/composables/useAnnotations'

defineProps<{
  annotation: Annotation
  isSelected: boolean
}>()

defineEmits<{
  select: []
}>()
</script>

<style scoped>
.anno-card {
  padding: 12px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;

  &:hover {
    background: var(--surface-hover);
    border-color: var(--border);
  }

  &.selected {
    background: var(--surface-hover);
    border-color: var(--accent);
  }

  .anno-card-top {
    display: flex;
    align-items: flex-start;
    gap: 10px;

    .pin-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .anno-info {
      flex: 1;
      min-width: 0;

      .anno-title {
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 4px;
        line-height: 1.4;
      }

      .anno-meta {
        font-size: 11px;
        color: var(--text-muted);
        font-family: var(--font-en);
      }
    }
  }

  .anno-desc {
    margin-top: 8px;
    padding-left: 20px;
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.6;
  }
}
</style>
