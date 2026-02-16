export const EARTH_RADIUS = 6371000 // meters
export const DEG2RAD = Math.PI / 180
export const RAD2DEG = 180 / Math.PI

export interface LatLng {
  lat: number
  lng: number
}

export interface Pov {
  heading: number
  pitch: number
}

export function computeBearing(fromLat: number, fromLng: number, toLat: number, toLng: number): number {
  const lat1 = fromLat * DEG2RAD
  const lat2 = toLat * DEG2RAD
  const dLng = (toLng - fromLng) * DEG2RAD

  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  const bearing = Math.atan2(y, x) * RAD2DEG

  return (bearing + 360) % 360
}

export function computeDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * DEG2RAD
  const dLng = (lng2 - lng1) * DEG2RAD
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG2RAD) * Math.cos(lat2 * DEG2RAD) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * 現在のパノラマ位置からアノテーションの lat/lng への heading/pitch を計算する。
 * pitch は距離の変化に応じて再計算される（同じ高さの点を指し続けるため）。
 */
export function getAnnotationPov(
  anno: { lat: number; lng: number; pitch: number; originLat?: number | null; originLng?: number | null },
  panoLat: number,
  panoLng: number,
): Pov {
  const heading = computeBearing(panoLat, panoLng, anno.lat, anno.lng)

  if (anno.originLat != null && anno.originLng != null) {
    const d0 = computeDistance(anno.originLat, anno.originLng, anno.lat, anno.lng)
    const d1 = computeDistance(panoLat, panoLng, anno.lat, anno.lng)
    if (d0 > 0.1) {
      const h = d0 * Math.tan(anno.pitch * DEG2RAD)
      const pitch = Math.atan2(h, d1) * RAD2DEG
      return { heading, pitch }
    }
  }

  return { heading, pitch: anno.pitch }
}

/**
 * heading/pitch → スクリーンピクセル座標
 */
export function povToPixel(
  targetPov: Pov,
  currentPov: Pov,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
): { x: number; y: number } | null {
  const fov = 180 / Math.pow(2, zoom)

  const hFov = fov * DEG2RAD
  const vFov = 2 * Math.atan(Math.tan(hFov / 2) * (canvasHeight / canvasWidth))

  const dH = (canvasWidth / 2) / Math.tan(hFov / 2)
  const dV = (canvasHeight / 2) / Math.tan(vFov / 2)

  const tH = targetPov.heading * DEG2RAD
  const tP = targetPov.pitch * DEG2RAD
  const cH = currentPov.heading * DEG2RAD
  const cP = currentPov.pitch * DEG2RAD

  const tx = Math.cos(tP) * Math.sin(tH - cH)
  const ty = Math.cos(tP) * Math.cos(tH - cH) * Math.sin(cP) - Math.sin(tP) * Math.cos(cP)
  const tz = Math.cos(tP) * Math.cos(tH - cH) * Math.cos(cP) + Math.sin(tP) * Math.sin(cP)

  if (tz < 0.01) return null

  const px = (tx / tz) * dH + canvasWidth / 2
  const py = (ty / tz) * dV + canvasHeight / 2

  if (px < -50 || px > canvasWidth + 50 || py < -50 || py > canvasHeight + 50) return null

  return { x: px, y: py }
}

/**
 * スクリーンピクセル座標 → heading/pitch
 */
export function pixelToPov(
  x: number,
  y: number,
  currentPov: Pov,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
): Pov {
  const fov = 180 / Math.pow(2, zoom)

  const hFov = fov * DEG2RAD
  const dH = (canvasWidth / 2) / Math.tan(hFov / 2)

  const cH = currentPov.heading * DEG2RAD
  const cP = currentPov.pitch * DEG2RAD

  const sx = x - canvasWidth / 2
  const sy = y - canvasHeight / 2

  const vx = sx
  const vy = sy
  const vz = dH
  const len = Math.sqrt(vx * vx + vy * vy + vz * vz)

  const nx = vx / len
  const ny = vy / len
  const nz = vz / len

  const rx = nx
  const ry = ny * Math.cos(cP) - nz * Math.sin(cP)
  const rz = ny * Math.sin(cP) + nz * Math.cos(cP)

  const heading = (Math.atan2(rx, rz) * RAD2DEG + currentPov.heading + 360) % 360
  const pitch = Math.asin(Math.max(-1, Math.min(1, -ry))) * RAD2DEG

  return { heading, pitch }
}

/**
 * 垂直焦点距離 dV を計算する
 */
export function computeDV(canvasWidth: number, canvasHeight: number, zoom: number): number {
  const hFov = (180 / Math.pow(2, zoom)) * DEG2RAD
  const vFov = 2 * Math.atan(Math.tan(hFov / 2) * (canvasHeight / canvasWidth))
  return (canvasHeight / 2) / Math.tan(vFov / 2)
}

/**
 * pitch 角度から推定距離を計算する
 */
export function estimateDistance(pitch: number): number {
  const CAMERA_HEIGHT = 2.5
  const absPitch = Math.abs(pitch)

  if (absPitch < 1) {
    return 100
  } else if (pitch < 0) {
    return Math.min(100, Math.max(5, CAMERA_HEIGHT / Math.tan(absPitch * DEG2RAD)))
  } else {
    const ABOVE_CAM_HEIGHT = 5
    return Math.min(100, Math.max(5, ABOVE_CAM_HEIGHT / Math.tan(absPitch * DEG2RAD)))
  }
}

/**
 * panoの位置 + heading/pitch/距離 → 世界座標 (lat, lng) を計算
 */
export function destinationPoint(
  lat: number,
  lng: number,
  bearing: number,
  distance: number,
): LatLng {
  const bearingRad = bearing * DEG2RAD
  const lat1 = lat * DEG2RAD
  const lng1 = lng * DEG2RAD
  const angularDist = distance / EARTH_RADIUS

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDist) +
    Math.cos(lat1) * Math.sin(angularDist) * Math.cos(bearingRad),
  )
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDist) * Math.cos(lat1),
      Math.cos(angularDist) - Math.sin(lat1) * Math.sin(lat2),
    )

  return { lat: lat2 * RAD2DEG, lng: lng2 * RAD2DEG }
}
