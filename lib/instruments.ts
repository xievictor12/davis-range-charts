/**
 * Practical professional compasses for writing at a keyboard.
 * Sounding pitches are MIDI note numbers, C4 = 60.
 * writtenShift is the semitones added to a sounding pitch to find the
 * written pitch on the piano. A Bb clarinet sounds a major 2nd lower, so
 * its written note sits two semitones higher than the key you played.
 * Extended registers are playable, and less ordinary.
 */

export type Family =
  | "voice"
  | "strings"
  | "woodwinds"
  | "brass"
  | "saxophones"
  | "percussion"
  | "keyboards"

export type Instrument = {
  id: string
  name: string
  family: Family
  soundingLow: number
  soundingHigh: number
  extendedLow?: number
  extendedHigh?: number
  writtenShift: number
  badge?: string
  detail?: string
  color: string
}

export const INSTRUMENTS: Instrument[] = [
  { id: "soprano", name: "Soprano", family: "voice", soundingLow: 60, soundingHigh: 84, writtenShift: 0, color: "#e07a5f" },
  { id: "mezzo", name: "Mezzo-soprano", family: "voice", soundingLow: 57, soundingHigh: 81, writtenShift: 0, color: "#ee9b78" },
  { id: "alto", name: "Alto", family: "voice", soundingLow: 53, soundingHigh: 77, writtenShift: 0, color: "#c4656a" },
  { id: "tenor", name: "Tenor", family: "voice", soundingLow: 48, soundingHigh: 72, writtenShift: 0, color: "#d4a276" },
  { id: "baritone", name: "Baritone", family: "voice", soundingLow: 43, soundingHigh: 67, writtenShift: 0, color: "#b08968" },
  { id: "bass-voice", name: "Bass", family: "voice", soundingLow: 40, soundingHigh: 64, writtenShift: 0, color: "#7f5539" },

  { id: "violin", name: "Violin", family: "strings", soundingLow: 55, soundingHigh: 100, extendedHigh: 103, writtenShift: 0, detail: "Harmonics and some players go past A7.", color: "#2a9d8f" },
  { id: "viola", name: "Viola", family: "strings", soundingLow: 48, soundingHigh: 88, writtenShift: 0, color: "#52b69a" },
  { id: "cello", name: "Cello", family: "strings", soundingLow: 36, soundingHigh: 84, writtenShift: 0, color: "#1a7a63" },
  { id: "bass", name: "Double bass", family: "strings", soundingLow: 28, soundingHigh: 67, extendedLow: 24, writtenShift: 12, badge: "8vb", detail: "Sounds an octave lower than written. C extension reaches C1.", color: "#145a56" },

  { id: "piccolo", name: "Piccolo", family: "woodwinds", soundingLow: 74, soundingHigh: 108, writtenShift: -12, badge: "8va", detail: "Sounds an octave higher than written.", color: "#d4e09b" },
  { id: "flute", name: "Flute", family: "woodwinds", soundingLow: 60, soundingHigh: 98, extendedLow: 59, writtenShift: 0, detail: "A B foot reaches B3.", color: "#a7c957" },
  { id: "alto-flute", name: "Alto flute", family: "woodwinds", soundingLow: 55, soundingHigh: 91, writtenShift: 5, badge: "G", detail: "Sounds a perfect 4th lower than written.", color: "#6a994e" },
  { id: "oboe", name: "Oboe", family: "woodwinds", soundingLow: 58, soundingHigh: 93, writtenShift: 0, color: "#c47b4a" },
  { id: "english-horn", name: "English horn", family: "woodwinds", soundingLow: 52, soundingHigh: 86, writtenShift: 7, badge: "F", detail: "Sounds a perfect 5th lower than written.", color: "#a35d3b" },
  { id: "clarinet", name: "Clarinet", family: "woodwinds", soundingLow: 50, soundingHigh: 94, writtenShift: 2, badge: "B♭", detail: "Bb clarinet. Sounds a major 2nd lower than written.", color: "#5b8e7d" },
  { id: "bass-clarinet", name: "Bass clarinet", family: "woodwinds", soundingLow: 38, soundingHigh: 82, writtenShift: 14, badge: "B♭", detail: "Sounds a major 9th lower than written.", color: "#3d6b5a" },
  { id: "bassoon", name: "Bassoon", family: "woodwinds", soundingLow: 34, soundingHigh: 75, writtenShift: 0, color: "#8c5a3c" },
  { id: "contrabassoon", name: "Contrabassoon", family: "woodwinds", soundingLow: 22, soundingHigh: 58, writtenShift: 12, badge: "8vb", detail: "Sounds an octave lower than written.", color: "#5c3d2e" },

  { id: "horn", name: "Horn", family: "brass", soundingLow: 35, soundingHigh: 77, writtenShift: 7, badge: "F", detail: "Sounds a perfect 5th lower. The bottom of this compass is pedal territory.", color: "#e9c46a" },
  { id: "trumpet", name: "Trumpet", family: "brass", soundingLow: 52, soundingHigh: 82, extendedHigh: 86, writtenShift: 2, badge: "B♭", detail: "Bb trumpet. Sounds a major 2nd lower than written.", color: "#f4a261" },
  { id: "trombone", name: "Trombone", family: "brass", soundingLow: 40, soundingHigh: 70, extendedHigh: 77, writtenShift: 0, detail: "Tenor trombone. F5 is a common professional top.", color: "#e76f51" },
  { id: "bass-trombone", name: "Bass trombone", family: "brass", soundingLow: 34, soundingHigh: 70, writtenShift: 0, detail: "Low Bb depends on the trigger.", color: "#c44536" },
  { id: "tuba", name: "Tuba", family: "brass", soundingLow: 26, soundingHigh: 65, writtenShift: 0, detail: "Orchestral tuba, written at concert pitch.", color: "#c48a2a" },

  { id: "soprano-sax", name: "Soprano sax", family: "saxophones", soundingLow: 56, soundingHigh: 87, writtenShift: 2, badge: "B♭", detail: "Sounds a major 2nd lower than written.", color: "#90b4ed" },
  { id: "alto-sax", name: "Alto sax", family: "saxophones", soundingLow: 49, soundingHigh: 80, writtenShift: 9, badge: "E♭", detail: "Sounds a major 6th lower than written.", color: "#6d9eeb" },
  { id: "tenor-sax", name: "Tenor sax", family: "saxophones", soundingLow: 44, soundingHigh: 75, writtenShift: 14, badge: "B♭", detail: "Sounds a major 9th lower than written.", color: "#4c7fd0" },
  { id: "bari-sax", name: "Baritone sax", family: "saxophones", soundingLow: 37, soundingHigh: 68, writtenShift: 21, badge: "E♭", detail: "Sounds an octave and a major 6th lower than written.", color: "#345a9e" },

  { id: "timpani", name: "Timpani", family: "percussion", soundingLow: 38, soundingHigh: 60, writtenShift: 0, detail: "A typical four-drum set, not one drum.", color: "#8d6a9f" },
  { id: "glockenspiel", name: "Glockenspiel", family: "percussion", soundingLow: 79, soundingHigh: 108, writtenShift: -24, badge: "15ma", detail: "Sounds two octaves higher than written.", color: "#c4b5fd" },
  { id: "xylophone", name: "Xylophone", family: "percussion", soundingLow: 77, soundingHigh: 108, writtenShift: -12, badge: "8va", detail: "Sounds an octave higher than written. 3½-octave instrument.", color: "#7c6fba" },
  { id: "vibraphone", name: "Vibraphone", family: "percussion", soundingLow: 53, soundingHigh: 89, writtenShift: 0, detail: "Three-octave vibraphone.", color: "#5b6ea6" },
  { id: "marimba", name: "Marimba", family: "percussion", soundingLow: 45, soundingHigh: 96, writtenShift: 0, detail: "4⅓-octave marimba. A 5-octave instrument reaches C2.", color: "#c4845a" },
  { id: "crotales", name: "Crotales", family: "percussion", soundingLow: 84, soundingHigh: 108, writtenShift: -24, badge: "15ma", detail: "Sounds two octaves higher than written.", color: "#e7d3b0" },
  { id: "chimes", name: "Chimes", family: "percussion", soundingLow: 60, soundingHigh: 77, writtenShift: 0, detail: "Tubular bells, concert pitch.", color: "#d6c6a5" },

  { id: "piano", name: "Piano", family: "keyboards", soundingLow: 21, soundingHigh: 108, writtenShift: 0, color: "#e7e5e4" },
  { id: "harp", name: "Harp", family: "keyboards", soundingLow: 23, soundingHigh: 102, writtenShift: 0, detail: "Concert harp, Cb1 to Gb7. Pedals supply the chromatic notes.", color: "#7eb8a2" },
  { id: "celesta", name: "Celesta", family: "keyboards", soundingLow: 72, soundingHigh: 120, writtenShift: -12, badge: "8va", detail: "Sounds an octave higher than written. The top sits above the piano.", color: "#f2d492" },
  { id: "harpsichord", name: "Harpsichord", family: "keyboards", soundingLow: 29, soundingHigh: 89, writtenShift: 0, detail: "A common five-octave compass, F1 to F6.", color: "#d6c4a8" },
  { id: "organ", name: "Organ manual", family: "keyboards", soundingLow: 36, soundingHigh: 96, writtenShift: 0, detail: "A typical manual compass. Pedal is separate.", color: "#9aa5b1" },
  { id: "organ-pedal", name: "Organ pedal", family: "keyboards", soundingLow: 36, soundingHigh: 67, writtenShift: 0, detail: "AGO pedalboard, C2 to G4.", color: "#6b7280" },
  { id: "guitar", name: "Guitar", family: "keyboards", soundingLow: 40, soundingHigh: 84, writtenShift: 12, badge: "8vb", detail: "Sounds an octave lower than written.", color: "#d08c60" },
]

const BY_ID = new Map(INSTRUMENTS.map((instrument) => [instrument.id, instrument]))

export function getInstrument(id: string): Instrument {
  const instrument = BY_ID.get(id)
  if (!instrument) throw new Error(`Unknown instrument: ${id}`)
  return instrument
}

export type Group = {
  id: string
  label: string
  blurb: string
  instrumentIds: string[]
}

const ORCHESTRA = [
  "violin",
  "viola",
  "cello",
  "bass",
  "piccolo",
  "flute",
  "oboe",
  "clarinet",
  "bassoon",
  "horn",
  "trumpet",
  "trombone",
  "tuba",
  "timpani",
  "harp",
]

function familyIds(family: Family): string[] {
  return INSTRUMENTS.filter((instrument) => instrument.family === family).map((instrument) => instrument.id)
}

export const GROUPS: Group[] = [
  {
    id: "orchestra",
    label: "Orchestra",
    blurb: "Strings, the core winds and brass, timpani, and harp.",
    instrumentIds: ORCHESTRA,
  },
  {
    id: "voice",
    label: "Voice",
    blurb: "Choral and operatic practical ranges.",
    instrumentIds: familyIds("voice"),
  },
  {
    id: "strings",
    label: "Strings",
    blurb: "Violin, viola, cello, and double bass.",
    instrumentIds: familyIds("strings"),
  },
  {
    id: "woodwinds",
    label: "Woodwinds",
    blurb: "Flutes, double reeds, clarinets, and bassoons.",
    instrumentIds: familyIds("woodwinds"),
  },
  {
    id: "brass",
    label: "Brass",
    blurb: "Horn, trumpets, trombones, and tuba.",
    instrumentIds: familyIds("brass"),
  },
  {
    id: "saxophones",
    label: "Saxophones",
    blurb: "Soprano, alto, tenor, and baritone.",
    instrumentIds: familyIds("saxophones"),
  },
  {
    id: "percussion",
    label: "Percussion",
    blurb: "Pitched percussion you can line up with the piano.",
    instrumentIds: familyIds("percussion"),
  },
  {
    id: "keyboards",
    label: "Keyboards",
    blurb: "Piano, harp, celesta, organ, harpsichord, and guitar.",
    instrumentIds: familyIds("keyboards"),
  },
]

export function instrumentsInGroup(groupId: string): Instrument[] {
  const group = GROUPS.find((item) => item.id === groupId) ?? GROUPS[0]
  return group.instrumentIds.map((id) => getInstrument(id))
}

export type PitchMode = "sounding" | "written"

export type Compass = {
  low: number
  high: number
  coreLow: number
  coreHigh: number
}

export function compass(instrument: Instrument, mode: PitchMode): Compass {
  const shift = mode === "written" ? instrument.writtenShift : 0
  const coreLow = instrument.soundingLow + shift
  const coreHigh = instrument.soundingHigh + shift
  return {
    coreLow,
    coreHigh,
    low: (instrument.extendedLow ?? instrument.soundingLow) + shift,
    high: (instrument.extendedHigh ?? instrument.soundingHigh) + shift,
  }
}
