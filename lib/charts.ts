/** Geometry measured from the uploaded full-bleed charts (14692×2542). */

export const IMAGE_WIDTH = 14692
export const IMAGE_HEIGHT = 2542
const KEY_TOP = 1632
const WHITE_BOTTOM = 2448
const BLACK_BOTTOM = 2100

/** Left edges of the 52 white keys, plus the right edge of C8. */
const WHITE_EDGES = [
  34, 323, 614, 864, 1164, 1452, 1745, 2036, 2326, 2619, 2889, 3167, 3458, 3748, 4039, 4329, 4619,
  4876, 5161, 5455, 5745, 6036, 6326, 6572, 6842, 7123, 7417, 7705, 7995, 8286, 8581, 8842, 9133,
  9420, 9705, 9989, 10273, 10508, 10761, 11055, 11345, 11626, 11920, 12202, 12432, 12686, 12973,
  13258, 13549, 13833, 14120, 14402, 14609,
]

const WHITE_PITCH_CLASSES = new Set([0, 2, 4, 5, 7, 9, 11])

export type PitchMode = "written" | "sounding"

export type Chart = {
  id: string
  family: string
  label: string
  mode: PitchMode
  src: string
}

export const CHARTS: Chart[] = [
  { id: "strings-written", family: "strings", label: "Strings", mode: "written", src: "/charts/strings-written.webp" },
  { id: "voice-written", family: "voice", label: "Voice", mode: "written", src: "/charts/voice-written.webp" },
  { id: "flutes-written", family: "flutes", label: "Flutes", mode: "written", src: "/charts/flutes-written.webp" },
  { id: "flutes-sounding", family: "flutes", label: "Flutes", mode: "sounding", src: "/charts/flutes-sounding.webp" },
  { id: "clarinets-written", family: "clarinets", label: "Clarinets", mode: "written", src: "/charts/clarinets-written.webp" },
  { id: "clarinets-sounding", family: "clarinets", label: "Clarinets", mode: "sounding", src: "/charts/clarinets-sounding.webp" },
  { id: "winds-written", family: "winds", label: "Winds", mode: "written", src: "/charts/winds-written.webp" },
  { id: "winds-sounding", family: "winds", label: "Winds", mode: "sounding", src: "/charts/winds-sounding.webp" },
  { id: "saxophones-written", family: "saxophones", label: "Saxophones", mode: "written", src: "/charts/saxophones-written.webp" },
  { id: "saxophones-sounding", family: "saxophones", label: "Saxophones", mode: "sounding", src: "/charts/saxophones-sounding.webp" },
  { id: "brass-written", family: "brass", label: "Brass", mode: "written", src: "/charts/brass-written.webp" },
  { id: "brass-sounding", family: "brass", label: "Brass", mode: "sounding", src: "/charts/brass-sounding.webp" },
  { id: "percussion-written", family: "percussion", label: "Percussion", mode: "written", src: "/charts/percussion-written.webp" },
  { id: "percussion-sounding", family: "percussion", label: "Percussion", mode: "sounding", src: "/charts/percussion-sounding.webp" },
  { id: "keyboards-written", family: "keyboards", label: "Keyboards", mode: "written", src: "/charts/keyboards-written.webp" },
  { id: "keyboards-sounding", family: "keyboards", label: "Keyboards", mode: "sounding", src: "/charts/keyboards-sounding.webp" },
  { id: "guitars-written", family: "guitars", label: "Guitars", mode: "written", src: "/charts/guitars-written.webp" },
  { id: "guitars-sounding", family: "guitars", label: "Guitars", mode: "sounding", src: "/charts/guitars-sounding.webp" },
  { id: "others-written", family: "others", label: "Others", mode: "written", src: "/charts/others-written.webp" },
  { id: "others-sounding", family: "others", label: "Others", mode: "sounding", src: "/charts/others-sounding.webp" },
]

export const FAMILIES = CHARTS.filter((chart, index) => CHARTS.findIndex((item) => item.family === chart.family) === index)

export function chartFor(family: string, mode: PitchMode): Chart {
  return (
    CHARTS.find((chart) => chart.family === family && chart.mode === mode) ??
    CHARTS.find((chart) => chart.family === family) ??
    CHARTS[0]
  )
}

export function hasMode(family: string, mode: PitchMode): boolean {
  return CHARTS.some((chart) => chart.family === family && chart.mode === mode)
}

export function isWhiteMidi(midi: number): boolean {
  return WHITE_PITCH_CLASSES.has(((midi % 12) + 12) % 12)
}

function whitesBefore(midi: number): number {
  let count = 0
  for (let note = 21; note < midi; note += 1) {
    if (isWhiteMidi(note)) count += 1
  }
  return count
}

export type KeyRect = { left: number; top: number; width: number; height: number; center: number }

function blackKeyWidth(boundaryIndex: number): number {
  const prev = WHITE_EDGES[boundaryIndex - 1]
  const boundary = WHITE_EDGES[boundaryIndex]
  const next = WHITE_EDGES[boundaryIndex + 1]
  if (prev === undefined || boundary === undefined || next === undefined) return 0
  return Math.min(boundary - prev, next - boundary) * 0.62
}

/** Fractions of the chart image, for overlaying a played note on the printed keyboard. */
export function keyRect(midi: number): KeyRect | null {
  if (midi < 21 || midi > 108) return null
  const top = KEY_TOP / IMAGE_HEIGHT
  if (isWhiteMidi(midi)) {
    const index = whitesBefore(midi)
    const left = WHITE_EDGES[index] / IMAGE_WIDTH
    const right = WHITE_EDGES[index + 1] / IMAGE_WIDTH
    const bottom = WHITE_BOTTOM / IMAGE_HEIGHT
    return { left, top, width: right - left, height: bottom - top, center: (left + right) / 2 }
  }
  const boundaryIndex = whitesBefore(midi)
  const boundary = WHITE_EDGES[boundaryIndex] / IMAGE_WIDTH
  const width = blackKeyWidth(boundaryIndex) / IMAGE_WIDTH
  const left = boundary - width / 2
  const bottom = BLACK_BOTTOM / IMAGE_HEIGHT
  return { left, top, width, height: bottom - top, center: boundary }
}

/**
 * Painted pieces of a played key. White keys are the visible key: full width
 * below the black keys, and only the exposed shoulders beside them.
 */
export function keyFills(midi: number): KeyRect[] {
  const box = keyRect(midi)
  if (!box) return []
  if (!isWhiteMidi(midi)) return [box]

  const index = whitesBefore(midi)
  const left = WHITE_EDGES[index]
  const right = WHITE_EDGES[index + 1]
  const pitch = ((midi % 12) + 12) % 12
  const leftCut = midi > 21 && pitch !== 0 && pitch !== 5 ? blackKeyWidth(index) / 2 : 0
  const rightCut = midi < 108 && pitch !== 4 && pitch !== 11 ? blackKeyWidth(index + 1) / 2 : 0
  const top = KEY_TOP / IMAGE_HEIGHT
  const neck = BLACK_BOTTOM / IMAGE_HEIGHT
  const bottom = WHITE_BOTTOM / IMAGE_HEIGHT
  const upperLeft = (left + leftCut) / IMAGE_WIDTH
  const upperRight = (right - rightCut) / IMAGE_WIDTH
  const fills: KeyRect[] = []
  if (upperRight > upperLeft) {
    fills.push({
      left: upperLeft,
      top,
      width: upperRight - upperLeft,
      height: neck - top,
      center: (upperLeft + upperRight) / 2,
    })
  }
  fills.push({
    left: left / IMAGE_WIDTH,
    top: neck,
    width: (right - left) / IMAGE_WIDTH,
    height: bottom - neck,
    center: (left + right) / 2 / IMAGE_WIDTH,
  })
  return fills
}

/** Clip the white-key bounding box down to the visible key, so the light does not cover black keys. */
export function keyClip(midi: number): string | null {
  const box = keyRect(midi)
  const fills = keyFills(midi)
  if (!box || fills.length < 2) return null
  const [shoulder, body] = fills
  const x = (value: number) => ((value - box.left) / box.width) * 100
  const y = (value: number) => ((value - box.top) / box.height) * 100
  const neck = y(body.top)
  const shoulderLeft = x(shoulder.left)
  const shoulderRight = x(shoulder.left + shoulder.width)
  return `polygon(${shoulderLeft}% 0%, ${shoulderRight}% 0%, ${shoulderRight}% ${neck}%, 100% ${neck}%, 100% 100%, 0% 100%, 0% ${neck}%, ${shoulderLeft}% ${neck}%)`
}

export const MIDDLE_C_FRACTION = ((6572 + 6842) / 2) / IMAGE_WIDTH
export const KEY_TOP_FRACTION = KEY_TOP / IMAGE_HEIGHT
