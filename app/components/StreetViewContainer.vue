<template>
  <div class="streetview-wrap" :class="{ repositioning: Boolean(repositioningPinId) }">
    <div ref="svRef" class="streetview-pano" />
    <div class="marker-overlay">
      <MarkerOverlay
        v-for="marker in markerData"
        :key="marker.id"
        :position="marker.position"
        :scale="marker.scale"
        :opacity="marker.opacity"
        :color="marker.color"
        :title="marker.title"
        :is-selected="marker.id === selectedPinId || marker.isDraft"
        :is-draft="marker.isDraft"
        @select="handleSelectPin(marker.id)"
        @drag-start="handleMarkerDragStart(marker, $event)"
      />
    </div>
    <DragPinToolbar
      :panorama="panorama"
      :sv-el="svRef"
      :selected-color="currentDragColor"
      @reset="resetView"
      @drop="handleDrop"
      @show-grid="handleShowGrid"
      @hide-grid="handleHideGrid"
      @invalid-drop="showToast('パノラマ上にピンをドラッグしてください')"
    />
  </div>
</template>

<script setup lang="ts">
import {
  getPinPov,
  computeDistance,
  computeDV,
  povToPixel,
  pixelToPov,
  estimateDistance,
  destinationPoint,
} from '~/utils/geometry'
import type { Pov } from '~/utils/geometry'
import type { Pin } from '~/composables/usePins'

const props = defineProps<{
  repositioningPinId: string | null
}>()

const emit = defineEmits<{
  selectPin: [id: string]
  openComposer: [data: { pov: Pov; color: string }]
  repositionPin: [data: { id: string; pov: Pov }]
  updateDraftPosition: [data: { pov: Pov; color: string }]
}>()

const config = useRuntimeConfig()
const { showToast } = useToast()

// Google Maps
const svRef = ref<HTMLElement | null>(null)
const { panorama, currentPov, currentZoom, loadApi, initPanorama, resetView } = useGoogleMaps()

// Pins
const { pins, selectedPinId, draftPosition, overlaysHidden, setOriginForAll } = usePins()

// Three.js Grid
const threeGrid = useThreeGrid()
const viewport = ref({ w: 0, h: 0 })
let resizeObserver: ResizeObserver | null = null

// Pano transition
let currentPanoId: string | null = null
let panoTransitionTimer: ReturnType<typeof setTimeout> | null = null
const panoStateVersion = ref(0)
let draggingDraft = false
let panoramaMouseDownPos: { x: number; y: number } | null = null
const PANORAMA_DRAG_THRESHOLD_PX = 6

// Drag color
const currentDragColor = ref('red')

// ── マーカーデータの計算 ──
const PIN_HEIGHT = 14
const REAL_HEIGHT = 1
const MIN_PX = 2

interface MarkerDatum {
  id: string
  position: { x: number; y: number } | null
  scale: number
  opacity: number
  color: string
  title: string
  isDraft?: boolean
}

const markerData = computed<MarkerDatum[]>(() => {
  void panoStateVersion.value
  if (overlaysHidden.value || !panorama.value) return []

  const pov = currentPov.value
  const zoom = currentZoom.value

  const w = viewport.value.w
  const h = viewport.value.h
  if (w <= 0 || h <= 0) return []

  const panoPos = panorama.value.getPosition()
  if (!panoPos) {
    const markers = pins.value.map((pin) => {
      const pos = povToPixel(
        { heading: pin.heading, pitch: pin.pitch },
        pov,
        w,
        h,
        zoom,
      )
      return {
        id: pin.id,
        position: pos,
        scale: 1,
        opacity: pos ? 1 : 0,
        color: pin.color,
        title: pin.title,
      }
    })
    if (draftPosition.value) {
      const draftPos = povToPixel(
        draftPosition.value.pov,
        pov,
        w,
        h,
        zoom,
      )
      markers.push({
        id: '__draft__',
        position: draftPos,
        scale: 1,
        opacity: draftPos ? 1 : 0,
        color: draftPosition.value.color,
        title: '保存前のピン',
        isDraft: true,
      })
    }
    return markers
  }

  const panoLat = panoPos.lat()
  const panoLng = panoPos.lng()

  const dV = computeDV(w, h, zoom)
  const MAX_DISTANCE = REAL_HEIGHT * dV / MIN_PX
  const FADE_START = MAX_DISTANCE * 0.6

  const settledMarkers = pins.value.map((pin) => {
    const distance = computeDistance(panoLat, panoLng, pin.lat, pin.lng)

    if (distance > MAX_DISTANCE) {
      return { id: pin.id, position: null, scale: 1, opacity: 0, color: pin.color, title: pin.title }
    }

    const pinPov = getPinPov(pin, panoLat, panoLng)
    const pos = povToPixel(pinPov, pov, w, h, zoom)

    if (!pos) {
      return { id: pin.id, position: null, scale: 1, opacity: 0, color: pin.color, title: pin.title }
    }

    const screenPx = REAL_HEIGHT / Math.max(distance, 0.5) * dV
    const scale = screenPx / PIN_HEIGHT
    const opacity = distance > FADE_START
      ? 1 - (distance - FADE_START) / (MAX_DISTANCE - FADE_START)
      : 1

    return { id: pin.id, position: pos, scale, opacity, color: pin.color, title: pin.title }
  })

  if (!draftPosition.value) return settledMarkers

  const draftPos = povToPixel(
    draftPosition.value.pov,
    pov,
    w,
    h,
    zoom,
  )
  const draftDistance = estimateDistance(draftPosition.value.pov.pitch)
  const draftScreenPx = REAL_HEIGHT / Math.max(draftDistance, 0.5) * dV
  const draftScale = draftScreenPx / PIN_HEIGHT
  settledMarkers.push({
    id: '__draft__',
    position: draftPos,
    scale: draftScale,
    opacity: draftPos ? 1 : 0,
    color: draftPosition.value.color,
    title: '保存前のピン',
    isDraft: true,
  })

  return settledMarkers
})

// ── 初期化 ──
onMounted(async () => {
  await loadApi(config.public.googleMapsApiKey)

  if (!svRef.value) return
  await waitForViewportReady()
  const pano = initPanorama(svRef.value)

  // パノラマ移動時: オーバーレイを隠し、移動完了後に再表示
  pano.addListener('pano_changed', () => {
    panoStateVersion.value++
    const newPanoId = pano.getPano()
    if (currentPanoId && newPanoId !== currentPanoId) {
      hideOverlaysTemporarily()
    }
    currentPanoId = newPanoId
  })

  // 初回位置確定時にデモアノテーションのoriginを設定
  google.maps.event.addListenerOnce(pano, 'pano_changed', () => {
    panoStateVersion.value++
    currentPanoId = pano.getPano()
    const initPos = pano.getPosition()
    if (initPos) {
      setOriginForAll(initPos.lat(), initPos.lng())
    }
  })
  pano.addListener('position_changed', () => {
    panoStateVersion.value++
  })

  // Three.js Grid 初期化
  await threeGrid.initGridRenderer(
    svRef.value.parentElement || svRef.value,
    Math.max(viewport.value.w, 1),
    Math.max(viewport.value.h, 1),
  )

  // グリッドのPOV/ズーム同期
  pano.addListener('pov_changed', () => {
    if (!threeGrid.gridVisible.value) return
    if (viewport.value.w <= 0 || viewport.value.h <= 0) return
    threeGrid.syncGridCamera(currentPov.value, currentZoom.value, viewport.value.w, viewport.value.h)
    threeGrid.renderGrid()
  })
  pano.addListener('zoom_changed', () => {
    if (!threeGrid.gridVisible.value) return
    if (viewport.value.w <= 0 || viewport.value.h <= 0) return
    threeGrid.syncGridCamera(currentPov.value, currentZoom.value, viewport.value.w, viewport.value.h)
    threeGrid.renderGrid()
  })

  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      syncViewportSize()
      if (viewport.value.w <= 0 || viewport.value.h <= 0) return
      threeGrid.resizeGrid(viewport.value.w, viewport.value.h)
      if (threeGrid.gridVisible.value) {
        threeGrid.syncGridCamera(currentPov.value, currentZoom.value, viewport.value.w, viewport.value.h)
        threeGrid.renderGrid()
      }
    })
    resizeObserver.observe(svRef.value)
  }

  // リサイズフォールバック
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  resizeObserver?.disconnect()
  resizeObserver = null
  threeGrid.disposeGrid()
  handleDraftMouseUp()
  if (panoTransitionTimer) clearTimeout(panoTransitionTimer)
})

function handleResize() {
  syncViewportSize()
  if (viewport.value.w <= 0 || viewport.value.h <= 0) return
  threeGrid.resizeGrid(viewport.value.w, viewport.value.h)
}

function handleSelectPin(id: string) {
  if (id === '__draft__') return
  emit('selectPin', id)
}

function handleShowGrid() {
  if (viewport.value.w <= 0 || viewport.value.h <= 0) return
  threeGrid.showGroundGrid(
    currentPov.value,
    currentZoom.value,
    viewport.value.w,
    viewport.value.h,
  )
}

function handleHideGrid() {
  threeGrid.hideGroundGrid()
}

function handleDrop(pov: Pov) {
  currentDragColor.value = 'red'
  emit('openComposer', { pov, color: currentDragColor.value })
}

// 親から呼ばれるカメラ移動メソッド
function lookAtPin(pin: Pin) {
  if (!panorama.value) return
  const panoPos = panorama.value.getPosition()
  if (!panoPos) return
  const pov = getPinPov(pin, panoPos.lat(), panoPos.lng())
  panorama.value.setPov(pov)
}

defineExpose({ lookAtPin })

function syncViewportSize() {
  if (!svRef.value) return
  const rect = svRef.value.getBoundingClientRect()
  viewport.value = {
    w: Math.round(rect.width),
    h: Math.round(rect.height),
  }
}

async function waitForViewportReady() {
  for (let i = 0; i < 30; i++) {
    await nextTick()
    syncViewportSize()
    if (viewport.value.w > 0 && viewport.value.h > 0) return
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

onMounted(() => {
  if (!svRef.value) return
  svRef.value.addEventListener('mousedown', handlePanoramaMouseDown, true)
  svRef.value.addEventListener('click', handlePanoramaClick, true)
})

onUnmounted(() => {
  svRef.value?.removeEventListener('mousedown', handlePanoramaMouseDown, true)
  svRef.value?.removeEventListener('click', handlePanoramaClick, true)
})

function handlePanoramaMouseDown(e: MouseEvent) {
  panoramaMouseDownPos = { x: e.clientX, y: e.clientY }
}

function handlePanoramaClick(e: MouseEvent) {
  if (isPanoramaDragClick(e)) return
  if (!props.repositioningPinId) {
    hideOverlaysTemporarily()
    return
  }
  if (!svRef.value || !panorama.value) return
  const rect = svRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  if (x < 0 || x > rect.width || y < 0 || y > rect.height) return
  const pov = pixelToPov(
    x,
    y,
    currentPov.value,
    Math.max(rect.width, 1),
    Math.max(rect.height, 1),
    currentZoom.value,
  )
  emit('repositionPin', { id: props.repositioningPinId, pov })
}

function isPanoramaDragClick(e: MouseEvent) {
  if (!panoramaMouseDownPos) return false
  const dx = e.clientX - panoramaMouseDownPos.x
  const dy = e.clientY - panoramaMouseDownPos.y
  panoramaMouseDownPos = null
  return (dx * dx + dy * dy) > (PANORAMA_DRAG_THRESHOLD_PX * PANORAMA_DRAG_THRESHOLD_PX)
}

function hideOverlaysTemporarily() {
  overlaysHidden.value = true
  if (panoTransitionTimer) clearTimeout(panoTransitionTimer)
  panoTransitionTimer = setTimeout(() => {
    overlaysHidden.value = false
    panoTransitionTimer = null
  }, 600)
}

function handleMarkerDragStart(marker: MarkerDatum, e: MouseEvent) {
  if (!marker.isDraft || !draftPosition.value) return
  if (!svRef.value || !panorama.value) return
  e.preventDefault()
  draggingDraft = true
  handleShowGrid()
  document.addEventListener('mousemove', handleDraftMouseMove)
  document.addEventListener('mouseup', handleDraftMouseUp)
}

function handleDraftMouseMove(e: MouseEvent) {
  if (!draggingDraft) return
  if (!svRef.value) return
  const rect = svRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  if (x < 0 || x > rect.width || y < 0 || y > rect.height) return
  const pov = pixelToPov(
    x,
    y,
    currentPov.value,
    Math.max(rect.width, 1),
    Math.max(rect.height, 1),
    currentZoom.value,
  )
  const snappedPov: Pov = {
    heading: pov.heading,
    pitch: Math.min(pov.pitch, -1),
  }
  emit('updateDraftPosition', {
    pov: snappedPov,
    color: draftPosition.value?.color || 'red',
  })
}

function handleDraftMouseUp() {
  if (!draggingDraft) return
  draggingDraft = false
  handleHideGrid()
  document.removeEventListener('mousemove', handleDraftMouseMove)
  document.removeEventListener('mouseup', handleDraftMouseUp)
}
</script>

<style scoped>
.streetview-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
  position: relative;
  isolation: isolate;

  .streetview-pano {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .marker-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 20;
  }

  :deep(.grid-canvas) {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    visibility: hidden;
  }

  &.repositioning {
    cursor: crosshair;
  }
}
</style>
