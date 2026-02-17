import { resolvePinColor } from '~/utils/pinColor'

export function markerSVG(color: string): string {
  const c = resolvePinColor(color)
  return `<svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7.5" cy="7.5" r="3.5" fill="none" stroke="${c}" stroke-width="3" />
  </svg>`
}

export function crossMarkerSVG(color: string): string {
  const c = resolvePinColor(color)
  return `<svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="3" y1="3" x2="12" y2="12" stroke="${c}" stroke-width="3" stroke-linecap="round" />
    <line x1="12" y1="3" x2="3" y2="12" stroke="${c}" stroke-width="3" stroke-linecap="round" />
  </svg>`
}
