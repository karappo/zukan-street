<template>
  <div
    v-if="position"
    class="sv-marker"
    :class="{ selected: isSelected, draft: isDraft }"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      opacity,
    }"
    @click.stop="$emit('select')"
    @mousedown.stop="$emit('dragStart', $event)"
  >
    <div
      class="marker-pin"
      :style="{
        transform: `scale(${scale})`,
        transformOrigin: 'bottom center',
      }"
      v-html="markerSVG(color)"
    />
    <div class="marker-label">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
import { markerSVG } from '~/utils/markerSvg'

defineProps<{
  position: { x: number; y: number } | null
  scale: number
  opacity: number
  color: string
  title: string
  isSelected: boolean
  isDraft?: boolean
}>()

defineEmits<{
  select: []
  dragStart: [event: MouseEvent]
}>()
</script>

<style scoped>
.sv-marker {
  position: absolute;
  cursor: pointer;
  pointer-events: auto;
  transform: translate(-50%, -100%);
  transition: transform 0.15s ease;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
  z-index: 10;

  &:hover {
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6));
    z-index: 20;
  }

  &.draft {
    cursor: grab;
    z-index: 25;
  }

  &.draft:active {
    cursor: grabbing;
  }

  .marker-pin {
    width: 32px;
    height: 40px;
    position: relative;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }

  .marker-label {
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(26, 29, 39, 0.92);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s, bottom 0.15s;
  }

  &:hover .marker-label {
    opacity: 1;
    bottom: -30px;
  }
}
</style>
