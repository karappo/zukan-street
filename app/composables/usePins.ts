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
}

export interface DraftPosition {
  pov: Pov
  color: string
}

const INITIAL_PANO_ID = 'Dq7hFTpha83NZqC1d4L1IA'

const demoPins: Pin[] = [
  {
    id: 'demo1',
    panoId: INITIAL_PANO_ID,
    lat: 34.16945,
    lng: 131.46710,
    originLat: null,
    originLng: null,
    heading: 321.5,
    pitch: 2.0,
    title: 'YCAM エントランス',
    desc: '山口情報芸術センターの正面入口。ガラス張りのファサードが特徴的なデザイン。',
    color: 'blue',
    author: '田中先生',
    time: '2分前',
  },
  {
    id: 'demo2',
    panoId: INITIAL_PANO_ID,
    lat: 34.16895,
    lng: 131.46680,
    originLat: null,
    originLng: null,
    heading: 280.0,
    pitch: 5.0,
    title: '駐車場入口',
    desc: '来館者用の駐車場はこちらから。',
    color: 'green',
    author: '田中先生',
    time: '5分前',
  },
  {
    id: 'demo3',
    panoId: INITIAL_PANO_ID,
    lat: 34.16935,
    lng: 131.46725,
    originLat: null,
    originLng: null,
    heading: 350.0,
    pitch: -3.0,
    title: '歩道のベンチ',
    desc: '休憩スペース。天気の良い日は外で休むのに最適。',
    color: 'yellow',
    author: '鈴木さん',
    time: '8分前',
  },
  {
    id: 'demo4',
    panoId: INITIAL_PANO_ID,
    lat: 34.16955,
    lng: 131.46740,
    originLat: null,
    originLng: null,
    heading: 10.0,
    pitch: 20.0,
    title: '屋上の設備',
    desc: '建物上部に設置された空調設備や通信アンテナが見える。',
    color: 'violet',
    author: '佐藤さん',
    time: '12分前',
  },
  {
    id: 'demo5',
    panoId: INITIAL_PANO_ID,
    lat: 34.16870,
    lng: 131.46690,
    originLat: null,
    originLng: null,
    heading: 240.0,
    pitch: 0.0,
    title: '交差点方向',
    desc: 'YCAMの南西側。中央公園方面への道路。',
    color: 'red',
    author: '田中先生',
    time: '15分前',
  },
]

const pins = ref<Pin[]>([])
const overlaysHidden = ref(false)
const selectedPinId = ref<string | null>(null)
const edittingPinId = ref<string | null>(null)
const draftPosition = ref<DraftPosition | null>(null)

export function usePins() {
  function loadDemoData() {
    pins.value = demoPins.map(a => ({ ...a }))
  }

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
    overlaysHidden,
    selectedPinId,
    edittingPinId,
    draftPosition,
    loadDemoData,
    setSelectedPinId,
    setEdittingPinId,
    setDraftPosition,
    addPin,
    updatePin,
    deletePin,
    setOriginForAll,
  }
}
