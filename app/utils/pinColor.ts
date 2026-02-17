export type PinColorName =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'gray'

const PIN_COLOR_NAMES = new Set<PinColorName>([
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'indigo',
  'violet',
  'gray',
])

export function resolvePinColor(color: string): string {
  if (!color) return 'var(--pin-color-red)'
  if (PIN_COLOR_NAMES.has(color as PinColorName)) {
    return `var(--pin-color-${color})`
  }
  return color
}

export function normalizePinColor(color: string | null | undefined): PinColorName {
  if (!color) return 'red'
  const value = color.trim().toLowerCase()
  if (PIN_COLOR_NAMES.has(value as PinColorName)) {
    return value as PinColorName
  }
  const hexMap: Record<string, PinColorName> = {
    '#ef4444': 'red',
    '#ff033e': 'red',
    '#ffb05b': 'orange',
    '#eab308': 'yellow',
    '#ffff01': 'yellow',
    '#22c55e': 'green',
    '#14ae00': 'green',
    '#3b82f6': 'blue',
    '#00c8ff': 'blue',
    '#0000ff': 'indigo',
    '#a855f7': 'violet',
    '#f433fb': 'violet',
    '#848484': 'gray',
  }
  return hexMap[value] || 'red'
}
