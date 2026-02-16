<template>
  <div class="streetview-wrap">
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
        :is-selected="marker.id === selectedAnnoId"
        @select="handleSelectAnnotation(marker.id)"
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
  getAnnotationPov,
  computeDistance,
  computeDV,
  povToPixel,
  estimateDistance,
  destinationPoint,
  DEG2RAD,
} from '~/utils/geometry'
import type { Pov } from '~/utils/geometry'
import type { Annotation } from '~/composables/useAnnotations'

const emit = defineEmits<{
  selectAnnotation: [id: string]
  openModal: [data: { pov: Pov; color: string }]
}>()

const config = useRuntimeConfig()
const { showToast } = useToast()

// Google Maps
const svRef = ref<HTMLElement | null>(null)
const { panorama, currentPov, currentZoom, loadApi, initPanorama, resetView } = useGoogleMaps()

// Annotations
const { annotations, selectedAnnoId, overlaysHidden, setOriginForAll } = useAnnotations()

// Three.js Grid
const threeGrid = useThreeGrid()

// Pano transition
let currentPanoId: string | null = null
let panoTransitionTimer: ReturnType<typeof setTimeout> | null = null

// Drag color
const currentDragColor = ref('#ef4444')

// ── マーカーデータの計算 ──
const PIN_HEIGHT = 40
const REAL_HEIGHT = 1
const MIN_PX = 2

interface MarkerDatum {
  id: string
  position: { x: number; y: number } | null
  scale: number
  opacity: number
  color: string
  title: string
}

const markerData = computed<MarkerDatum[]>(() => {
  if (overlaysHidden.value || !panorama.value) return []

  const panoPos = panorama.value.getPosition()
  if (!panoPos) return []

  const panoLat = panoPos.lat()
  const panoLng = panoPos.lng()
  const pov = currentPov.value
  const zoom = currentZoom.value

  const el = svRef.value
  if (!el) return []

  const w = el.offsetWidth
  const h = el.offsetHeight
  const dV = computeDV(w, h, zoom)
  const MAX_DISTANCE = REAL_HEIGHT * dV / MIN_PX
  const FADE_START = MAX_DISTANCE * 0.6

  return annotations.value.map((anno) => {
    const distance = computeDistance(panoLat, panoLng, anno.lat, anno.lng)

    if (distance > MAX_DISTANCE) {
      return { id: anno.id, position: null, scale: 1, opacity: 0, color: anno.color, title: anno.title }
    }

    const annoPov = getAnnotationPov(anno, panoLat, panoLng)
    const pos = povToPixel(annoPov, pov, w, h, zoom)

    if (!pos) {
      return { id: anno.id, position: null, scale: 1, opacity: 0, color: anno.color, title: anno.title }
    }

    const screenPx = REAL_HEIGHT / Math.max(distance, 0.5) * dV
    const scale = screenPx / PIN_HEIGHT
    const opacity = distance > FADE_START
      ? 1 - (distance - FADE_START) / (MAX_DISTANCE - FADE_START)
      : 1

    return { id: anno.id, position: pos, scale, opacity, color: anno.color, title: anno.title }
  })
})

// ── 初期化 ──
onMounted(async () => {
  await loadApi(config.public.googleMapsApiKey)

  if (!svRef.value) return
  const pano = initPanorama(svRef.value)

  // パノラマ移動時: オーバーレイを隠し、移動完了後に再表示
  pano.addListener('pano_changed', () => {
    const newPanoId = pano.getPano()
    if (currentPanoId && newPanoId !== currentPanoId) {
      overlaysHidden.value = true
      if (panoTransitionTimer) clearTimeout(panoTransitionTimer)
      panoTransitionTimer = setTimeout(() => {
        overlaysHidden.value = false
        panoTransitionTimer = null
      }, 600)
    }
    currentPanoId = newPanoId
  })

  // 初回位置確定時にデモアノテーションのoriginを設定
  google.maps.event.addListenerOnce(pano, 'pano_changed', () => {
    currentPanoId = pano.getPano()
    const initPos = pano.getPosition()
    if (initPos) {
      setOriginForAll(initPos.lat(), initPos.lng())
    }
  })

  // Three.js Grid 初期化
  await threeGrid.initGridRenderer(
    svRef.value.parentElement!,
    svRef.value.offsetWidth,
    svRef.value.offsetHeight,
  )

  // グリッドのPOV/ズーム同期
  pano.addListener('pov_changed', () => {
    if (!threeGrid.gridVisible.value) return
    threeGrid.syncGridCamera(currentPov.value, currentZoom.value, svRef.value!.offsetWidth, svRef.value!.offsetHeight)
    threeGrid.renderGrid()
  })
  pano.addListener('zoom_changed', () => {
    if (!threeGrid.gridVisible.value) return
    threeGrid.syncGridCamera(currentPov.value, currentZoom.value, svRef.value!.offsetWidth, svRef.value!.offsetHeight)
    threeGrid.renderGrid()
  })

  // リサイズ
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  threeGrid.disposeGrid()
  if (panoTransitionTimer) clearTimeout(panoTransitionTimer)
})

function handleResize() {
  if (!svRef.value) return
  const w = svRef.value.offsetWidth
  const h = svRef.value.offsetHeight
  threeGrid.resizeGrid(w, h)
}

function handleSelectAnnotation(id: string) {
  emit('selectAnnotation', id)
}

function handleShowGrid() {
  if (!svRef.value) return
  threeGrid.showGroundGrid(
    currentPov.value,
    currentZoom.value,
    svRef.value.offsetWidth,
    svRef.value.offsetHeight,
  )
}

function handleHideGrid() {
  threeGrid.hideGroundGrid()
}

function handleDrop(pov: Pov) {
  currentDragColor.value = '#ef4444'
  emit('openModal', { pov, color: currentDragColor.value })
}

// 親から呼ばれるカメラ移動メソッド
function lookAtAnnotation(anno: Annotation) {
  if (!panorama.value) return
  const panoPos = panorama.value.getPosition()
  if (!panoPos) return
  const pov = getAnnotationPov(anno, panoPos.lat(), panoPos.lng())
  panorama.value.setPov(pov)
}

defineExpose({ lookAtAnnotation })
</script>

<style scoped>
.streetview-wrap {
  flex: 1;
  position: relative;

  .streetview-pano {
    width: 100%;
    height: 100%;
  }

  .marker-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 10;
  }

  :deep(.grid-canvas) {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    visibility: hidden;
  }
}
</style>
