<template>
  <div
    v-if="position"
    class="sv-marker"
    :class="{ selected: isSelected, draft: isDraft, repositioning, dragging }"
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
        transformOrigin: 'center center',
      }"
      v-html="isDraft ? crossMarkerSVG(color) : markerSVG(color)"
    />
    <div class="marker-label">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
import { markerSVG, crossMarkerSVG } from '~/utils/markerSvg'

defineProps<{
  position: { x: number; y: number } | null
  scale: number
  opacity: number
  color: string
  title: string
  isSelected: boolean
  isDraft?: boolean
  repositioning?: boolean
  dragging?: boolean
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
  transform: translate(-50%, -50%);
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
    width: 14px;
    height: 14px;
    position: relative;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }

  .marker-label {
    position: absolute;
    bottom: -18px;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    backdrop-filter: blur(8px);
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s, bottom 0.15s;
  }

  &:hover .marker-label {
    opacity: 1;
    bottom: -34px;
  }

  &.repositioning {
    cursor: move;
    z-index: 25;

    .marker-pin {
      animation: dokkindokkin 0.4s infinite;
    }

    &.dragging .marker-label {
      display: none;
    }
  }
}

@keyframes dokkindokkin {
  0% { scale: 1.3; }
  100% { scale: 1.0; }
}
</style>
