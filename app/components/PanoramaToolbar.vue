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
    <template v-if="availableTimeline.length > 1">
      <div class="divider" />
      <div ref="tmRef" class="time-machine-wrap">
        <button class="tool-btn" @click.stop="isTmOpen = !isTmOpen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ currentDateLabel }}
        </button>
        <ul v-if="isTmOpen" class="time-machine-menu">
          <li
            v-for="entry in availableTimeline"
            :key="entry.pano"
            :class="{ active: isActiveDate(entry) }"
            @click="handleSelectDate(entry.pano)"
          >
            {{ formatDate(entry.date) }}
          </li>
        </ul>
      </div>
    </template>
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
import type { TimelineEntry } from '~/composables/useGoogleMaps'

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

// タイムマシン
const { availableTimeline, currentImageDate, switchTimeline } = useGoogleMaps()
const isTmOpen = ref(false)
const tmRef = ref<HTMLElement | null>(null)

function parseImageDate(imageDate: string): { year: number; month: number } {
  const [y, m] = imageDate.split('-')
  return { year: parseInt(y), month: parseInt(m) }
}

const currentDateLabel = computed(() => {
  if (!currentImageDate.value) return ''
  const { year, month } = parseImageDate(currentImageDate.value)
  return `${year}年${month}月`
})

function formatDate(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function isActiveDate(entry: TimelineEntry) {
  if (!currentImageDate.value) return false
  const { year, month } = parseImageDate(currentImageDate.value)
  return entry.date.getFullYear() === year && entry.date.getMonth() + 1 === month
}

function handleSelectDate(panoId: string) {
  switchTimeline(panoId)
  isTmOpen.value = false
}

function onWindowClick(e: MouseEvent) {
  if (!isTmOpen.value) return
  const target = e.target as Node | null
  if (target && tmRef.value?.contains(target)) return
  isTmOpen.value = false
}

onMounted(() => {
  window.addEventListener('click', onWindowClick)
})

onUnmounted(() => {
  window.removeEventListener('click', onWindowClick)
})
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

  .time-machine-wrap {
    position: relative;
  }

  .time-machine-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    padding: 5px 0;
    min-width: 120px;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
    list-style: none;
    max-height: 240px;
    overflow-y: auto;

    li {
      color: #666;
      cursor: pointer;
      padding: 6px 14px;
      font-size: 13px;
      white-space: nowrap;

      &:hover {
        background: #f4f4f4;
        color: #333;
      }

      &.active {
        color: #333;
        font-weight: 500;

        &::before {
          content: '\2713  ';
        }
      }
    }
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
