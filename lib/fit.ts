import { compass, type Instrument, type PitchMode } from "@/lib/instruments"
import { joinList, midiToName } from "@/lib/music"

export type FitZone = "core" | "edge" | "out"

export function zoneFor(note: number, low: number, high: number, coreLow: number, coreHigh: number): FitZone {
  if (note >= coreLow && note <= coreHigh) return "core"
  if (note >= low && note <= high) return "edge"
  return "out"
}

function noteNames(notes: number[]): string {
  return joinList(notes.map((note) => midiToName(note)))
}

export function describeFit(notes: number[], instruments: Instrument[], mode: PitchMode): string {
  const sorted = [...notes].sort((a, b) => a - b)
  if (sorted.length === 0) return ""

  const names = noteNames(sorted)
  const core: string[] = []
  const edge: string[] = []
  const partial: { name: string; notes: number[] }[] = []

  for (const instrument of instruments) {
    const span = compass(instrument, mode)
    const zones = sorted.map((note) => zoneFor(note, span.low, span.high, span.coreLow, span.coreHigh))
    if (zones.every((zone) => zone === "core")) core.push(instrument.name)
    else if (zones.every((zone) => zone !== "out")) edge.push(instrument.name)
    else {
      const hits = sorted.filter((note) => zoneFor(note, span.low, span.high, span.coreLow, span.coreHigh) !== "out")
      if (hits.length > 0) partial.push({ name: instrument.name, notes: hits })
    }
  }

  const verb = sorted.length === 1 ? "fits" : "all fit"

  if (core.length > 0 && edge.length === 0) {
    return `${names} ${verb} ${joinList(core)}.`
  }
  if (core.length > 0 || edge.length > 0) {
    const parts: string[] = []
    if (core.length > 0) parts.push(joinList(core))
    if (edge.length > 0) parts.push(`${joinList(edge)} in the extended register`)
    return `${names} ${verb} ${parts.join(", and ")}.`
  }
  if (sorted.length > 1 && partial.length > 0) {
    const best = [...partial].sort((a, b) => b.notes.length - a.notes.length)[0]
    return `Nobody covers the whole chord. ${best.name} has ${noteNames(best.notes)}.`
  }
  return `${names} sits outside everyone in this group.`
}
