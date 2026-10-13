type Voice = {
  osc: OscillatorNode
  gain: GainNode
}

let context: AudioContext | null = null
const voices = new Map<number, Voice>()

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  const AudioCtx = window.AudioContext
  if (!AudioCtx) return null
  context ??= new AudioCtx()
  if (context.state === "suspended") void context.resume()
  return context
}

/** Call from a click or key press so later MIDI notes can sound. */
export function unlockAudio() {
  audioContext()
}

function stopNow(voice: Voice) {
  voice.osc.onended = null
  try {
    voice.osc.stop()
  } catch {
    // Already stopped.
  }
  voice.osc.disconnect()
  voice.gain.disconnect()
}

/** Hold a sine at this pitch until noteOff. Playing it again replaces the previous one. */
export function noteOn(midi: number, velocity = 100) {
  const audio = audioContext()
  if (!audio) return
  const previous = voices.get(midi)
  if (previous) {
    voices.delete(midi)
    stopNow(previous)
  }

  const now = audio.currentTime
  const freq = 440 * 2 ** ((midi - 69) / 12)
  const level = Math.max(0.0008, Math.min(0.2, (velocity / 127) * 0.18))

  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(level, now + 0.012)
  gain.connect(audio.destination)

  const osc = audio.createOscillator()
  osc.type = "sine"
  osc.frequency.value = freq
  osc.connect(gain)
  osc.start(now)
  voices.set(midi, { osc, gain })
}

/** Release the sine for this pitch. */
export function noteOff(midi: number) {
  const audio = context
  const voice = voices.get(midi)
  if (!audio || !voice) return
  voices.delete(midi)
  const now = audio.currentTime
  const current = Math.max(voice.gain.gain.value, 0.0001)
  voice.gain.gain.cancelScheduledValues(now)
  voice.gain.gain.setValueAtTime(current, now)
  voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)
  voice.osc.stop(now + 0.07)
  voice.osc.onended = () => {
    voice.osc.disconnect()
    voice.gain.disconnect()
  }
}

export function silence() {
  for (const midi of [...voices.keys()]) noteOff(midi)
}
