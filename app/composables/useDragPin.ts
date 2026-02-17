import { pixelToPov, povToPixel, computeDV, DEG2RAD } from '~/utils/geometry'
import type { Pov } from '~/utils/geometry'

export function useDragPin() {
  const isDragging = ref(false)
  const snappedPov = ref<Pov | null>(null)
  const dragPinStyle = ref<Record<string, string>>({})
  const dragPinScale = ref(1)
  const MIN_PITCH = -1

  let cleanupListeners: (() => void) | null = null

  function startDrag(
    e: MouseEvent,
    panorama: google.maps.StreetViewPanorama,
    svEl: HTMLElement,
    callbacks: {
      onShowGrid: () => void
      onHideGrid: () => void
      onDrop: (pov: Pov) => void
      onCancel: () => void
      onInvalidDrop: () => void
      getToolbarRect: () => DOMRect
    },
  ) {
    e.preventDefault()
    isDragging.value = true
    snappedPov.value = null

    dragPinStyle.value = {
      left: `${e.clientX}px`,
      top: `${e.clientY}px`,
      transform: 'translate(-50%, -50%)',
    }
    dragPinScale.value = 1

    callbacks.onShowGrid()

    function onMouseMove(ev: MouseEvent) {
      if (!isDragging.value) return

      const tbRect = callbacks.getToolbarRect()
      const nearToolbar =
        ev.clientX >= tbRect.left - 20 &&
        ev.clientX <= tbRect.right + 20 &&
        ev.clientY >= tbRect.top - 20 &&
        ev.clientY <= tbRect.bottom + 20

      if (nearToolbar) {
        dragPinStyle.value = {
          left: `${ev.clientX}px`,
          top: `${ev.clientY}px`,
          transform: 'translate(-50%, -50%)',
        }
        dragPinScale.value = 1
        snappedPov.value = null
        return
      }

      const svRect = svEl.getBoundingClientRect()
      const x = ev.clientX - svRect.left
      const y = ev.clientY - svRect.top

      if (x >= 0 && x <= svRect.width && y >= 0 && y <= svRect.height) {
        const pov = panorama.getPov()
        const zoom = panorama.getZoom() || 1
        const currentPov: Pov = { heading: pov.heading, pitch: pov.pitch }
        const cursorPov = pixelToPov(x, y, currentPov, svRect.width, svRect.height, zoom)

        const snapped: Pov = {
          heading: cursorPov.heading,
          pitch: Math.min(cursorPov.pitch, MIN_PITCH),
        }

        const screenPos = povToPixel(snapped, currentPov, svRect.width, svRect.height, zoom)
        if (screenPos) {
          snappedPov.value = snapped

          // 物理スケール計算
          const CAM_H = 2.5
          const REAL_HEIGHT = 1
          const PIN_H = 14
          const dist = CAM_H / Math.tan(Math.abs(snapped.pitch) * DEG2RAD)
          const dV = computeDV(svRect.width, svRect.height, zoom)
          const scale = (REAL_HEIGHT / Math.max(dist, 0.5) * dV) / PIN_H

          dragPinStyle.value = {
            left: `${svRect.left + screenPos.x}px`,
            top: `${svRect.top + screenPos.y}px`,
            transform: 'translate(-50%, -50%)',
          }
          dragPinScale.value = scale
        } else {
          dragPinStyle.value = {
            left: `${ev.clientX}px`,
            top: `${ev.clientY}px`,
            transform: 'translate(-50%, -50%)',
          }
          dragPinScale.value = 1
          snappedPov.value = null
        }
      } else {
        dragPinStyle.value = {
          left: `${ev.clientX}px`,
          top: `${ev.clientY}px`,
          transform: 'translate(-50%, -50%)',
        }
        dragPinScale.value = 1
        snappedPov.value = null
      }
    }

    function onMouseUp(ev: MouseEvent) {
      if (!isDragging.value) return

      const tbRect = callbacks.getToolbarRect()
      const onToolbar =
        ev.clientX >= tbRect.left &&
        ev.clientX <= tbRect.right &&
        ev.clientY >= tbRect.top - 20 &&
        ev.clientY <= tbRect.bottom + 20

      if (onToolbar) {
        callbacks.onCancel()
      } else if (snappedPov.value) {
        callbacks.onDrop(snappedPov.value)
      } else {
        callbacks.onInvalidDrop()
      }

      isDragging.value = false
      snappedPov.value = null
      callbacks.onHideGrid()

      if (cleanupListeners) {
        cleanupListeners()
        cleanupListeners = null
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    cleanupListeners = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }

  onUnmounted(() => {
    if (cleanupListeners) {
      cleanupListeners()
    }
  })

  return {
    isDragging: readonly(isDragging),
    snappedPov: readonly(snappedPov),
    dragPinStyle,
    dragPinScale,
    startDrag,
  }
}
