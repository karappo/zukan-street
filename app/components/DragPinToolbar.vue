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
          transformOrigin: 'bottom center',
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

const currentColor = computed(() => props.selectedColor || '#ef4444')

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
  background: rgba(26, 29, 39, 0.92);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  border-radius: 14px;
  z-index: 50;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  .tool-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--text-muted);
    font-family: var(--font-ja);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;

    &:hover {
      background: var(--surface-hover);
      color: var(--text);
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
  gap: 6px;
  padding: 4px 10px 4px 6px;
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
    width: 20px;
    height: 25px;

    :deep(svg) {
      filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
      width: 100%;
      height: 100%;
    }
  }
}

.drag-pin-hint {
  font-size: 13px;
  color: var(--text-muted);
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
    width: 32px;
    height: 40px;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
