<template>
  <div class="app-layout">
    <Splitpanes class="main default-theme" @resize="handleSplitResize">
      <Pane class="pane-panorama" size="72" min-size="55">
        <ClientOnly>
          <StreetViewContainer
            ref="svContainer"
            :repositioning-pin-id="repositioningPinId"
            @select-pin="handleSelectPin"
            @open-composer="handleOpenComposer"
            @reposition-pin="handleRepositionPinCommit"
            @update-draft-position="handleUpdateDraftPosition"
          />
        </ClientOnly>
      </Pane>
      <Pane class="pane-sidebar" size="28" min-size="20">
        <Comments
          :pins="pins"
          :selected-pin-id="selectedPinId"
          :editting-pin-id="edittingPinId"
          :repositioning-pin-id="repositioningPinId"
          :draft-position="draftPosition"
          :composer-initial="composerInitial"
          @select-pin="handleSelectPin"
          @edit-pin="handleEditPin"
          @reposition-pin="handleRepositionPinStart"
          @delete-pin="handleDeletePin"
          @save-pin="handleSavePin"
          @cancel-composer="handleCancelComposer"
        />
      </Pane>
    </Splitpanes>
    <AppToast />
  </div>
</template>

<script setup lang="ts">
import { estimateDistance, destinationPoint } from '~/utils/geometry'
import type { Pov } from '~/utils/geometry'
import type { Pin } from '~/composables/usePins'

const {
  pins,
  selectedPinId,
  edittingPinId,
  draftPosition,
  setSelectedPinId,
  setEdittingPinId,
  setDraftPosition,
  addPin,
  updatePin,
  deletePin,
} = usePins()
const { showToast } = useToast()

const svContainer = ref<InstanceType<typeof import('~/components/StreetViewContainer.vue').default> | null>(null)
const repositioningPinId = ref<string | null>(null)
const composerInitial = ref<{ title: string; desc: string; color: string } | null>(null)

function handleSelectPin(id: string) {
  setSelectedPinId(id)
  const pin = pins.value.find(a => a.id === id)
  if (pin && svContainer.value) {
    svContainer.value.lookAtPin(pin)
  }
}

function handleOpenComposer(data: { pov: Pov; color: string }) {
  setDraftPosition(data)
  setEdittingPinId(null)
  composerInitial.value = {
    title: '',
    desc: '',
    color: data.color,
  }
}

function handleUpdateDraftPosition(data: { pov: Pov; color: string }) {
  if (!draftPosition.value) return
  setDraftPosition(data)
}

function handleSavePin(formData: { title: string; desc: string; color: string }) {
  if (!svContainer.value) return

  const panorama = useGoogleMaps().panorama.value
  if (!panorama) return

  const panoPos = panorama.getPosition()
  if (!panoPos) return

  const panoLat = panoPos.lat()
  const panoLng = panoPos.lng()

  if (edittingPinId.value) {
    updatePin(edittingPinId.value, {
      title: formData.title,
      desc: formData.desc,
      color: formData.color,
      time: 'たった今',
    })
    showToast('ピンを更新しました')
    setEdittingPinId(null)
    composerInitial.value = null
    return
  }

  if (!draftPosition.value) return

  const distance = estimateDistance(draftPosition.value.pov.pitch)
  const dest = destinationPoint(panoLat, panoLng, draftPosition.value.pov.heading, distance)

  const pin: Pin = {
    id: `pin_${Date.now()}`,
    panoId: panorama.getPano(),
    lat: dest.lat,
    lng: dest.lng,
    originLat: panoLat,
    originLng: panoLng,
    heading: draftPosition.value.pov.heading,
    pitch: draftPosition.value.pov.pitch,
    title: formData.title,
    desc: formData.desc,
    color: formData.color,
    author: 'あなた',
    time: 'たった今',
  }

  addPin(pin)
  showToast('ピンを追加しました')
  setDraftPosition(null)
  composerInitial.value = null
}

function handleCancelComposer() {
  setDraftPosition(null)
  setEdittingPinId(null)
  composerInitial.value = null
}

function handleEditPin(id: string) {
  const pin = pins.value.find(p => p.id === id)
  if (!pin) return
  setEdittingPinId(id)
  setDraftPosition(null)
  composerInitial.value = {
    title: pin.title,
    desc: pin.desc,
    color: pin.color,
  }
  setSelectedPinId(id)
}

function handleDeletePin(id: string) {
  if (!confirm('ほんとうに けしてよいですか？')) return
  deletePin(id)
  if (repositioningPinId.value === id) {
    repositioningPinId.value = null
  }
  showToast('ピンを削除しました')
}

function handleRepositionPinStart(id: string) {
  repositioningPinId.value = id
  setSelectedPinId(id)
  const pin = pins.value.find(p => p.id === id)
  if (pin && svContainer.value) {
    svContainer.value.lookAtPin(pin)
  }
  showToast('パノラマ上をクリックして新しい位置に再配置します')
}

function handleRepositionPinCommit(data: { id: string; pov: Pov }) {
  const panorama = useGoogleMaps().panorama.value
  if (!panorama) return
  const panoPos = panorama.getPosition()
  if (!panoPos) return
  const panoLat = panoPos.lat()
  const panoLng = panoPos.lng()
  const distance = estimateDistance(data.pov.pitch)
  const dest = destinationPoint(panoLat, panoLng, data.pov.heading, distance)

  updatePin(data.id, {
    lat: dest.lat,
    lng: dest.lng,
    originLat: panoLat,
    originLng: panoLng,
    heading: data.pov.heading,
    pitch: data.pov.pitch,
    time: 'たった今',
  })
  repositioningPinId.value = null
  showToast('ピンを再配置しました')
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
