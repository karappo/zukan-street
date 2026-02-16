export function markerSVG(color: string): string {
  return `<svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
    <circle cx="16" cy="14" r="6" fill="white" fill-opacity="0.9"/>
  </svg>`
}
