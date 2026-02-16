import type { Pov } from '~/utils/geometry'

const INITIAL_PANO_ID = 'Dq7hFTpha83NZqC1d4L1IA'
const INITIAL_POV: Pov = { heading: 321.56, pitch: 0.13 }
const panorama = shallowRef<google.maps.StreetViewPanorama | null>(null)
const currentPov = ref<Pov>({ heading: 0, pitch: 0 })
const currentZoom = ref(1)
const isApiLoaded = ref(false)

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
      addressControl: false,
      showRoadLabels: false,
      motionTracking: false,
      motionTrackingControl: false,
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

    return pano
  }

  function resetView() {
    if (!panorama.value) return
    panorama.value.setPov(INITIAL_POV)
    panorama.value.setZoom(1)
  }

  return {
    panorama,
    currentPov,
    currentZoom,
    isApiLoaded,
    loadApi,
    initPanorama,
    resetView,
  }
}
