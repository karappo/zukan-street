<template>
  <div class="app-layout">
    <Splitpanes class="main default-theme" @resize="handleSplitResize">
      <Pane class="pane-panorama" size="72" min-size="55">
        <ClientOnly>
          <StreetViewContainer
            ref="svContainer"
            @select-annotation="handleSelectAnnotation"
            @open-modal="handleOpenModal"
          />
        </ClientOnly>
      </Pane>
      <Pane class="pane-sidebar" size="28" min-size="20">
        <AnnotationSidebar
          :annotations="annotations"
          :selected-anno-id="selectedAnnoId"
          @select-annotation="handleSelectAnnotation"
        />
      </Pane>
    </Splitpanes>
    <AnnotationModal
      v-model:open="modalOpen"
      @save="handleSaveAnnotation"
    />
    <AppToast />
  </div>
</template>

<script setup lang="ts">
import { estimateDistance, destinationPoint } from '~/utils/geometry'
import type { Pov } from '~/utils/geometry'
import type { Annotation } from '~/composables/useAnnotations'

const { annotations, selectedAnnoId, selectAnnotation, addAnnotation, loadDemoData } = useAnnotations()
const { showToast } = useToast()

const svContainer = ref<InstanceType<typeof import('~/components/StreetViewContainer.vue').default> | null>(null)
const modalOpen = ref(false)
let pendingDrop: { pov: Pov; color: string } | null = null

// デモデータロード
loadDemoData()

function handleSelectAnnotation(id: string) {
  selectAnnotation(id)
  const anno = annotations.value.find(a => a.id === id)
  if (anno && svContainer.value) {
    svContainer.value.lookAtAnnotation(anno)
  }
}

function handleOpenModal(data: { pov: Pov; color: string }) {
  pendingDrop = data
  modalOpen.value = true
}

function handleSaveAnnotation(formData: { title: string; desc: string; color: string }) {
  if (!pendingDrop) return
  if (!svContainer.value) return

  const panorama = useGoogleMaps().panorama.value
  if (!panorama) return

  const panoPos = panorama.getPosition()
  if (!panoPos) return

  const panoLat = panoPos.lat()
  const panoLng = panoPos.lng()

  const distance = estimateDistance(pendingDrop.pov.pitch)
  const dest = destinationPoint(panoLat, panoLng, pendingDrop.pov.heading, distance)

  const anno: Annotation = {
    id: `anno_${Date.now()}`,
    panoId: panorama.getPano(),
    lat: dest.lat,
    lng: dest.lng,
    originLat: panoLat,
    originLng: panoLng,
    heading: pendingDrop.pov.heading,
    pitch: pendingDrop.pov.pitch,
    title: formData.title,
    desc: formData.desc,
    color: formData.color,
    author: 'あなた',
    time: 'たった今',
  }

  addAnnotation(anno)
  showToast('ピンを追加しました')
  pendingDrop = null
}

function handleSplitResize() {
  window.dispatchEvent(new Event('resize'))
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main {
  flex: 1;
  overflow: hidden;
  height: 100%;
}

.main :deep(.splitpanes__splitter) {
  background: var(--border);
  border-left: 0;
  border-right: 0;
}

.main :deep(.splitpanes__pane) {
  transition: none !important;
}

.pane-panorama {
  min-width: 0;
  height: 100%;
}

.pane-sidebar {
  min-width: 280px;
}
</style>
