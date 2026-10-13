"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  CHARTS,
  FAMILIES,
  KEY_TOP_FRACTION,
  MIDDLE_C_FRACTION,
  chartFor,
  hasMode,
  keyClip,
  keyRect,
  type Chart,
  type PitchMode,
} from "@/lib/charts"
import { midiToName } from "@/lib/music"
import { noteOff, noteOn, silence, unlockAudio } from "@/lib/tone"

type MidiStatus =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "unsupported" }
  | { kind: "error"; message: string }
  | { kind: "ready"; names: string[] }

const COMPUTER_KEYS: Record<string, number> = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
}

function useMidi(onNote: (note: number, velocity: number, down: boolean) => void) {
  const onNoteRef = useRef(onNote)
  const [status, setStatus] = useState<MidiStatus>({ kind: "idle" })

  useEffect(() => {
    onNoteRef.current = onNote
  }, [onNote])

  const connect = useCallback(async () => {
    if (!("requestMIDIAccess" in navigator)) {
      setStatus({ kind: "unsupported" })
      return
    }
    setStatus({ kind: "pending" })
    try {
      const access = await navigator.requestMIDIAccess()
      const bind = () => {
        const names: string[] = []
        access.inputs.forEach((input) => {
          names.push(input.name || "MIDI keyboard")
          input.onmidimessage = (event) => {
            const data = event.data
            if (!data || data.length < 2) return
            const command = data[0] & 0xf0
            const note = data[1]
            const velocity = data.length > 2 ? data[2] : 0
            if (command === 0x90 && velocity > 0) onNoteRef.current(note, velocity, true)
            else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
              onNoteRef.current(note, velocity, false)
            }
          }
        })
        setStatus({ kind: "ready", names })
      }
      bind()
      access.onstatechange = bind
    } catch (error) {
      const message = error instanceof Error ? error.message : "The browser blocked MIDI."
      setStatus({ kind: "error", message })
    }
  }, [])

  return { status, connect }
}

export function Desk() {
  const [family, setFamily] = useState(FAMILIES[0].family)
  const [mode, setMode] = useState<PitchMode>("written")
  const [zoomed, setZoomed] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [live, setLive] = useState<Map<number, number>>(new Map())
  const [octave, setOctave] = useState(4)
  const [midiOpen, setMidiOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const place = useRef<"c4" | number>("c4")
  const swipe = useRef<{ x: number; y: number; scroll: number } | null>(null)
  const soundOnRef = useRef(soundOn)

  useEffect(() => {
    soundOnRef.current = soundOn
    if (!soundOn) silence()
  }, [soundOn])

  useEffect(() => () => silence(), [])

  const chart = chartFor(family, mode)
  const chartIndex = CHARTS.findIndex((item) => item.id === chart.id)

  const setLiveNote = useCallback((note: number, velocity: number, down: boolean) => {
    setLive((current) => {
      if (down) {
        if (current.get(note) === velocity) return current
        const next = new Map(current)
        next.set(note, velocity)
        return next
      }
      if (!current.has(note)) return current
      const next = new Map(current)
      next.delete(note)
      return next
    })
    if (down) {
      if (soundOnRef.current) noteOn(note, velocity)
    } else {
      noteOff(note)
    }
  }, [])

  const { status, connect } = useMidi(setLiveNote)

  const rememberPlace = useCallback(() => {
    const el = scroller.current
    if (!el || !zoomed) return
    const max = el.scrollWidth - el.clientWidth
    place.current = max > 0 ? el.scrollLeft / max : 0
  }, [zoomed])

  const showChart = useCallback(
    (next: Chart) => {
      if (next.id === chart.id) return
      rememberPlace()
      setFailed(false)
      setFamily(next.family)
      setMode(next.mode)
    },
    [chart.id, rememberPlace],
  )

  const stepChart = useCallback(
    (direction: number) => {
      const next = CHARTS[(chartIndex + direction + CHARTS.length) % CHARTS.length]
      showChart(next)
    },
    [chartIndex, showChart],
  )

  const chooseFamily = useCallback(
    (nextFamily: string) => {
      const next = chartFor(nextFamily, mode)
      showChart(next)
    },
    [mode, showChart],
  )

  const chooseMode = useCallback(
    (nextMode: PitchMode) => {
      if (!hasMode(family, nextMode)) return
      showChart(chartFor(family, nextMode))
    },
    [family, showChart],
  )

  useEffect(() => {
    const neighbors = [CHARTS[chartIndex - 1], CHARTS[chartIndex + 1]]
    for (const neighbor of neighbors) {
      if (!neighbor) continue
      const image = new Image()
      image.src = neighbor.src
    }
  }, [chartIndex])

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest("input, textarea")) return
      if (event.key === "ArrowRight") {
        event.preventDefault()
        stepChart(1)
        return
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        stepChart(-1)
        return
      }
      if (event.key === "z" || event.key === "Z") {
        setOctave((value) => Math.max(1, value - 1))
        return
      }
      if (event.key === "x" || event.key === "X") {
        setOctave((value) => Math.min(7, value + 1))
        return
      }
      const semitone = COMPUTER_KEYS[event.key.toLowerCase()]
      if (semitone === undefined || event.repeat) return
      const note = 12 * (octave + 1) + semitone
      setLiveNote(note, 96, true)
    }
    const up = (event: KeyboardEvent) => {
      const semitone = COMPUTER_KEYS[event.key.toLowerCase()]
      if (semitone === undefined) return
      setLiveNote(12 * (octave + 1) + semitone, 0, false)
    }
    document.addEventListener("keydown", down)
    document.addEventListener("keyup", up)
    return () => {
      document.removeEventListener("keydown", down)
      document.removeEventListener("keyup", up)
    }
  }, [octave, setLiveNote, stepChart])

  const placeChart = useCallback(() => {
    const el = scroller.current
    if (!el || !zoomed) return
    const max = el.scrollWidth - el.clientWidth
    if (place.current === "c4") {
      el.scrollLeft = MIDDLE_C_FRACTION * el.scrollWidth - el.clientWidth / 2
    } else {
      el.scrollLeft = place.current * max
    }
  }, [zoomed])

  useEffect(() => {
    if (!zoomed) return
    const frame = requestAnimationFrame(() => placeChart())
    return () => cancelAnimationFrame(frame)
  }, [zoomed, placeChart])

  const notes = [...live.keys()].sort((a, b) => a - b)
  const midiLabel =
    status.kind === "ready"
      ? status.names.length > 0
        ? "Listening"
        : "No keyboard"
      : status.kind === "pending"
        ? "Connecting"
        : "MIDI"

  return (
    <main className="flex h-dvh flex-col bg-background text-foreground">
      <header className="shrink-0 border-b border-border px-2 pt-[max(0.35rem,env(safe-area-inset-top))] pb-1.5 sm:px-3">
        <div className="flex items-center gap-1.5">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Previous chart" onClick={() => stepChart(-1)}>
            <Chevron direction="left" />
          </Button>
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FAMILIES.map((item) => (
              <Button
                key={item.family}
                type="button"
                size="sm"
                variant={item.family === family ? "default" : "ghost"}
                className="shrink-0"
                aria-pressed={item.family === family}
                onClick={() => chooseFamily(item.family)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Next chart" onClick={() => stepChart(1)}>
            <Chevron direction="right" />
          </Button>
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-border p-0.5" role="group" aria-label="Written or sounding">
            {(["written", "sounding"] as const).map((item) => {
              const available = hasMode(family, item)
              return (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={chart.mode === item ? "default" : "ghost"}
                  aria-pressed={chart.mode === item}
                  disabled={!available}
                  title={available ? undefined : "That version was not in the uploaded set"}
                  onClick={() => chooseMode(item)}
                >
                  {item === "written" ? "Written" : "Sounding"}
                </Button>
              )
            })}
          </div>
          <Button type="button" size="sm" variant={zoomed ? "default" : "outline"} aria-pressed={zoomed} onClick={() => setZoomed((value) => !value)}>
            {zoomed ? "Whole keyboard" : "Zoom"}
          </Button>
          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground" aria-live="polite">
            {notes.length > 0
              ? notes.map((note) => midiToName(note)).join("  ")
              : zoomed
                ? "Drag sideways along the keys. Swipe up for the next chart."
                : "All 88 keys are on screen. Swipe up for the next chart."}
          </p>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-pressed={soundOn}
            onClick={() => {
              unlockAudio()
              setSoundOn((value) => !value)
            }}
          >
            {soundOn ? "Sound" : "Muted"}
          </Button>
          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant={status.kind === "ready" && status.names.length > 0 ? "default" : "outline"}
              aria-expanded={midiOpen}
              onClick={() => setMidiOpen((value) => !value)}
            >
              {midiLabel}
            </Button>
            {midiOpen ? (
              <MidiPanel
                status={status}
                onConnect={() => {
                  unlockAudio()
                  void connect()
                }}
                onClose={() => setMidiOpen(false)}
              />
            ) : null}
          </div>
        </div>
      </header>

      <div
        ref={scroller}
        className={`min-h-0 flex-1 pb-[env(safe-area-inset-bottom)] ${
          zoomed ? "overflow-x-auto overflow-y-hidden" : "flex flex-col justify-end overflow-hidden"
        }`}
        onPointerDown={(event) => {
          swipe.current = { x: event.clientX, y: event.clientY, scroll: event.currentTarget.scrollLeft }
        }}
        onPointerUp={(event) => {
          if (!swipe.current) return
          const dx = event.clientX - swipe.current.x
          const dy = event.clientY - swipe.current.y
          const scrolled = Math.abs(event.currentTarget.scrollLeft - swipe.current.scroll) > 8
          swipe.current = null
          if (scrolled) return
          if (Math.abs(dy) > 64 && Math.abs(dy) > Math.abs(dx) * 1.4) stepChart(dy < 0 ? 1 : -1)
        }}
        onPointerCancel={() => {
          swipe.current = null
        }}
      >
        <div className={`relative ${zoomed ? "inline-block h-full" : "w-full"}`}>
          {/* The chart file is the uploaded sheet, not a redraw. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={chart.id}
            src={chart.src}
            alt={`${chart.label} ${chart.mode} range chart`}
            draggable={false}
            onLoad={() => {
              requestAnimationFrame(() => placeChart())
            }}
            onError={() => setFailed(true)}
            className={`select-none ${zoomed ? "h-full w-auto max-w-none" : "h-auto w-full"}`}
          />
          {notes.map((note) => {
            const rect = keyRect(note)
            if (!rect) return null
            const clip = keyClip(note)
            return (
              <div key={note}>
                <span
                  className="pointer-events-none absolute w-0.5 -translate-x-1/2 bg-[#f6c945]"
                  style={{ left: `${rect.center * 100}%`, top: 0, height: `${KEY_TOP_FRACTION * 100}%` }}
                />
                <span
                  className={`keylight pointer-events-none absolute bg-[#f6c945]/55 ${
                    clip ? "" : "shadow-[inset_0_0_0_1px_rgba(90,60,0,0.28)]"
                  }`}
                  style={{
                    left: `${rect.left * 100}%`,
                    top: `${rect.top * 100}%`,
                    width: `${rect.width * 100}%`,
                    height: `${rect.height * 100}%`,
                    clipPath: clip ?? undefined,
                  }}
                />
              </div>
            )
          })}
        </div>
        {failed ? (
          <p className="p-6 text-sm text-muted-foreground">This chart file did not load. Run scripts/prepare-charts.py from the uploaded sheets.</p>
        ) : null}
      </div>
    </main>
  )
}

function MidiPanel({
  status,
  onConnect,
  onClose,
}: {
  status: MidiStatus
  onConnect: () => void
  onClose: () => void
}) {
  return (
    <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-border bg-popover p-3 text-left text-sm text-popover-foreground shadow-xl">
      {status.kind === "unsupported" ? (
        <p>
          This browser can&apos;t see a MIDI keyboard. That includes Safari on iPad. Use Chrome or Edge on a computer,
          or the Web MIDI Browser app on iPad. The chart is still here to read.
        </p>
      ) : null}
      {status.kind === "idle" || status.kind === "pending" ? (
        <div className="space-y-2">
          <p>Plug in a USB keyboard, then connect it. The notes you play light up on the printed keys.</p>
          <Button type="button" size="sm" onClick={onConnect} disabled={status.kind === "pending"}>
            {status.kind === "pending" ? "Waiting for permission" : "Connect keyboard"}
          </Button>
        </div>
      ) : null}
      {status.kind === "error" ? (
        <div className="space-y-2">
          <p>{status.message} Allow MIDI in the address bar, then try again.</p>
          <Button type="button" size="sm" onClick={onConnect}>
            Try again
          </Button>
        </div>
      ) : null}
      {status.kind === "ready" ? (
        <div className="space-y-2">
          {status.names.length > 0 ? (
            <ul className="space-y-1">
              {status.names.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : (
            <p>No keyboard is plugged in yet. Connect one, then refresh the list.</p>
          )}
          <Button type="button" size="sm" variant="outline" onClick={onConnect}>
            Refresh
          </Button>
        </div>
      ) : null}
      <button type="button" className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:underline" onClick={onClose}>
        Close
      </button>
    </div>
  )
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={direction === "left" ? "M10 3 L5 8 L10 13" : "M6 3 L11 8 L6 13"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
