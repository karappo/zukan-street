import type { Pov } from '~/utils/geometry'

export interface Pin {
  id: string
  panoId: string
  lat: number
  lng: number
  originLat: number | null
  originLng: number | null
  heading: number
  pitch: number
  title: string
  desc: string
  color: string
  author: string
  time: string
  imageDate: string | null
}

export interface DraftPosition {
  pov: Pov
  color: string
}

const pins = ref<Pin[]>([])
const overlaysHidden = ref(false)
const selectedPinId = ref<string | null>(null)
const edittingPinId = ref<string | null>(null)
const draftPosition = ref<DraftPosition | null>(null)
const { currentImageDate } = useGoogleMaps()
const filteredPins = computed(() => {
  const date = currentImageDate.value
  if (!date) return pins.value
  return pins.value.filter(p => p.imageDate === null || p.imageDate === date)
})

export function usePins() {
  function setSelectedPinId(id: string | null) {
    selectedPinId.value = id
  }

  function setEdittingPinId(id: string | null) {
    edittingPinId.value = id
  }

  function setDraftPosition(value: DraftPosition | null) {
    draftPosition.value = value
  }

  function addPin(pin: Pin) {
    pins.value.push(pin)
  }

  function updatePin(id: string, patch: Partial<Pin>) {
    const idx = pins.value.findIndex(a => a.id === id)
    if (idx < 0) return
    pins.value[idx] = {
      ...pins.value[idx],
      ...patch,
      id: pins.value[idx].id,
    }
  }

  function deletePin(id: string) {
    const idx = pins.value.findIndex(a => a.id === id)
    if (idx < 0) return
    pins.value.splice(idx, 1)
    if (selectedPinId.value === id) {
      selectedPinId.value = null
    }
    if (edittingPinId.value === id) {
      edittingPinId.value = null
    }
  }

  function setOriginForAll(lat: number, lng: number) {
    pins.value.forEach((a) => {
      if (a.originLat == null) {
        a.originLat = lat
        a.originLng = lng
      }
    })
  }

  return {
    pins: readonly(pins),
    filteredPins: readonly(filteredPins),
    overlaysHidden,
    selectedPinId,
    edittingPinId,
    draftPosition,
    setSelectedPinId,
    setEdittingPinId,
    setDraftPosition,
    addPin,
    updatePin,
    deletePin,
    setOriginForAll,
  }
}
