/** Scientific pitch, C4 = MIDI 60. */

const SHARP_NAMES = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const

const FLAT_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const

export function midiToName(midi: number, preferFlats = false): string {
  const pc = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  const name = (preferFlats ? FLAT_NAMES : SHARP_NAMES)[pc]
  return `${name}${octave}`
}

export function isBlackKey(midi: number): boolean {
  const pc = ((midi % 12) + 12) % 12
  return pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10
}

export type KeyWindowId = "88" | "76" | "61"

export type KeyWindow = {
  id: KeyWindowId
  label: string
  hint: string
  low: number
  high: number
}

export const KEY_WINDOWS: Record<KeyWindowId, KeyWindow> = {
  "88": { id: "88", label: "88", hint: "Full piano, A0 to C8", low: 21, high: 108 },
  "76": { id: "76", label: "76", hint: "E1 to G7", low: 28, high: 103 },
  "61": { id: "61", label: "61", hint: "C2 to C7", low: 36, high: 96 },
}

export function eachNote(window: KeyWindow): number[] {
  const notes: number[] = []
  for (let n = window.low; n <= window.high; n++) notes.push(n)
  return notes
}

export function whiteKeyCount(window: KeyWindow): number {
  let count = 0
  for (let n = window.low; n <= window.high; n++) {
    if (!isBlackKey(n)) count++
  }
  return count
}

export type Bounds = { left: number; right: number }

const BLACK_WIDTH_RATIO = 0.58

/** Horizontal placement of one key inside the visible keybed, from 0 to 1. */
export function keyBounds(midi: number, window: KeyWindow): Bounds | null {
  if (midi < window.low || midi > window.high) return null
  const whites = whiteKeyCount(window)
  if (whites === 0) return null

  if (isBlackKey(midi)) {
    let whitesBefore = 0
    for (let n = window.low; n < midi; n++) {
      if (!isBlackKey(n)) whitesBefore++
    }
    const boundary = whitesBefore / whites
    const width = BLACK_WIDTH_RATIO / whites
    return { left: boundary - width / 2, right: boundary + width / 2 }
  }

  let index = 0
  for (let n = window.low; n < midi; n++) {
    if (!isBlackKey(n)) index++
  }
  return { left: index / whites, right: (index + 1) / whites }
}

export function noteCenter(midi: number, window: KeyWindow): number | null {
  const bounds = keyBounds(midi, window)
  if (!bounds) return null
  return (bounds.left + bounds.right) / 2
}

export type RangePlacement = {
  left: number
  right: number
  clippedLeft: boolean
  clippedRight: boolean
}

/** Inclusive pitch span drawn across the visible keybed. Null when fully off-screen. */
export function rangePlacement(
  low: number,
  high: number,
  window: KeyWindow,
): RangePlacement | null {
  if (high < window.low || low > window.high || high < low) return null
  const visibleLow = Math.max(low, window.low)
  const visibleHigh = Math.min(high, window.high)
  const start = keyBounds(visibleLow, window)
  const end = keyBounds(visibleHigh, window)
  if (!start || !end) return null
  return {
    left: start.left,
    right: end.right,
    clippedLeft: low < window.low,
    clippedRight: high > window.high,
  }
}

export function prefersDarkInk(hex: string): boolean {
  const raw = hex.replace("#", "")
  const r = parseInt(raw.slice(0, 2), 16)
  const g = parseInt(raw.slice(2, 4), 16)
  const b = parseInt(raw.slice(4, 6), 16)
  const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return y > 0.62
}

export function joinList(items: string[]): string {
  if (items.length === 0) return ""
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`
}
