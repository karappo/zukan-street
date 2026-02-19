import type { Pov } from '~/utils/geometry'

export interface TimelineEntry { pano: string; date: Date }

const INITIAL_PANO_ID = 'Dq7hFTpha83NZqC1d4L1IA'
const INITIAL_POV: Pov = { heading: 321.56, pitch: 0.13 }
const panorama = shallowRef<google.maps.StreetViewPanorama | null>(null)
const currentPov = ref<Pov>({ heading: 0, pitch: 0 })
const currentZoom = ref(1)
const isApiLoaded = ref(false)
const currentImageDate = ref<string | null>(null)
const availableTimeline = ref<TimelineEntry[]>([])

export function useGoogleMaps() {
  function loadApi(apiKey: string): Promise<void> {
    return new Promise((resolve) => {
      if (window.google?.maps) {
        isApiLoaded.value = true
        resolve()
        return
      }

      ;(window as any).__initGoogleMaps = () => {
        isApiLoaded.value = true
        resolve()
      }

      useHead({
        script: [
          {
            src: `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__initGoogleMaps`,
            async: true,
            defer: true,
          },
        ],
      })
    })
  }

  function initPanorama(el: HTMLElement) {
    const pano = new google.maps.StreetViewPanorama(el, {
      pano: INITIAL_PANO_ID,
      pov: INITIAL_POV,
      zoom: 1,
      fullscreenControl: false,
      addressControl: false,
      showRoadLabels: false,
      motionTracking: false,
      motionTrackingControl: false,
      imageDateControl: true,
      panControl: false,
      zoomControl: false,
    })

    panorama.value = pano
    // 初期表示時にもオーバーレイ計算が正しい値を使えるように同期する
    const initialPov = pano.getPov()
    currentPov.value = { heading: initialPov.heading, pitch: initialPov.pitch }
    currentZoom.value = pano.getZoom() || 1

    pano.addListener('pov_changed', () => {
      const pov = pano.getPov()
      currentPov.value = { heading: pov.heading, pitch: pov.pitch }
    })
    pano.addListener('zoom_changed', () => {
      currentZoom.value = pano.getZoom() || 1
    })

    const svService = new google.maps.StreetViewService()
    function fetchImageDate() {
      const panoId = pano.getPano()
      if (!panoId) return
      svService.getPanorama({ pano: panoId }, (data, status) => {
        if (status === google.maps.StreetViewStatus.OK && data?.imageDate) {
          currentImageDate.value = data.imageDate
          // undocumented time 配列からタイムライン情報を抽出
          const timeArr = (data as any).time
          if (Array.isArray(timeArr)) {
            availableTimeline.value = timeArr
              .map((entry: any) => {
                const panoId = entry?.pano
                // ミニファイでプロパティ名が変わりうるため instanceof Date で探す
                const dateVal = Object.values(entry || {}).find(v => v instanceof Date) as Date | undefined
                return panoId && dateVal ? { pano: panoId, date: dateVal } : null
              })
              .filter((e): e is TimelineEntry => e !== null)
              .sort((a, b) => b.date.getTime() - a.date.getTime())
          } else {
            availableTimeline.value = []
          }
        } else {
          currentImageDate.value = null
          availableTimeline.value = []
        }
      })
    }
    fetchImageDate()
    pano.addListener('pano_changed', fetchImageDate)

    return pano
  }

  function resetView() {
    if (!panorama.value) return
    panorama.value.setPov(INITIAL_POV)
    panorama.value.setZoom(1)
  }

  function switchTimeline(panoId: string) {
    if (!panorama.value) return
    panorama.value.setPano(panoId)
  }

  return {
    panorama,
    currentPov,
    currentZoom,
    currentImageDate,
    availableTimeline,
    isApiLoaded,
    loadApi,
    initPanorama,
    resetView,
    switchTimeline,
  }
}
