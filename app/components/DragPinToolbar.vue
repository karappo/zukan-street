<template>
  <div ref="toolbarRef" class="toolbar">
    <div
      class="drag-pin-area"
      @mousedown="handleMouseDown"
    >
      <div class="marker-pin" v-html="markerSVG(currentColor)" />
      <div class="drag-pin-hint">ピンを追加</div>
    </div>
    <div class="divider" />
    <button class="tool-btn" @click="$emit('reset')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
      初期位置に戻る
    </button>
  </div>

  <!-- ドラッグ中のフローティングピン -->
  <Teleport to="body">
    <div
      v-if="isDragging"
      class="floating-pin"
      :style="dragPinStyle"
    >
      <div
        class="marker-pin"
        :style="{
          transform: `scale(${dragPinScale})`,
          transformOrigin: 'center center',
        }"
        v-html="markerSVG(currentColor)"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { markerSVG } from '~/utils/markerSvg'
import type { Pov } from '~/utils/geometry'

const props = defineProps<{
  panorama: google.maps.StreetViewPanorama | null
  svEl: HTMLElement | null
  selectedColor: string
}>()

const emit = defineEmits<{
  reset: []
  drop: [pov: Pov]
  showGrid: []
  hideGrid: []
  invalidDrop: []
}>()

const toolbarRef = ref<HTMLElement | null>(null)
const { isDragging, dragPinStyle, dragPinScale, startDrag } = useDragPin()

const currentColor = computed(() => props.selectedColor || 'red')

function handleMouseDown(e: MouseEvent) {
  if (!props.panorama || !props.svEl) return

  startDrag(e, props.panorama, props.svEl, {
    onShowGrid: () => emit('showGrid'),
    onHideGrid: () => emit('hideGrid'),
    onDrop: (pov: Pov) => emit('drop', pov),
    onCancel: () => {},
    onInvalidDrop: () => emit('invalidDrop'),
    getToolbarRect: () => toolbarRef.value!.getBoundingClientRect(),
  })
}
</script>

<style scoped>
.toolbar {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border);
  border-radius: 14px;
  z-index: 50;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);

  .tool-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: #666;
    font-family: var(--font-ja);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;

    &:hover {
      background: #f4f4f4;
      color: #333;
    }

    svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
  }

  .divider {
    width: 1px;
    height: 24px;
    background: var(--border);
    margin: 0 4px;
  }
}

.drag-pin-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 10px 4px 6px;
  min-height: 32px;
  border-radius: var(--radius);
  cursor: grab;
  user-select: none;
  transition: all 0.2s;

  &:hover {
    background: var(--surface-hover);
    transform: translateY(-2px);

    .drag-pin-hint {
      color: var(--text);
    }
  }

  &:active {
    cursor: grabbing;
  }

  .marker-pin {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;

    :deep(svg) {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}

.drag-pin-hint {
  font-size: 13px;
  line-height: 1;
  color: #666;
  pointer-events: none;
  white-space: nowrap;
  transition: color 0.15s;
}

.floating-pin {
  position: fixed;
  z-index: 1000;
  cursor: grabbing;
  pointer-events: none;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));

  .marker-pin {
    width: 15px;
    height: 15px;

    :deep(svg) {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
