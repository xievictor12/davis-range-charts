import assert from "node:assert/strict"
import { afterEach, describe, it } from "node:test"
import { noteOff, noteOn, silence } from "../lib/tone"

type FakeOsc = {
  type: string
  frequency: { value: number }
  onended: (() => void) | null
  stopped: boolean
  connect: () => void
  disconnect: () => void
  start: () => void
  stop: () => void
}

const oscillators: FakeOsc[] = []

class FakeParam {
  value = 0
  setValueAtTime(value: number) {
    this.value = value
  }
  exponentialRampToValueAtTime(value: number) {
    this.value = value
  }
  cancelScheduledValues() {}
}

class FakeAudioContext {
  state = "running"
  currentTime = 0
  destination = {}
  resume() {
    this.state = "running"
    return Promise.resolve()
  }
  createGain() {
    return { gain: new FakeParam(), connect() {}, disconnect() {} }
  }
  createOscillator() {
    const osc: FakeOsc = {
      type: "",
      frequency: { value: 0 },
      onended: null,
      stopped: false,
      connect() {},
      disconnect() {},
      start() {},
      stop() {
        this.stopped = true
      },
    }
    oscillators.push(osc)
    return osc
  }
}

Object.assign(globalThis, { window: { AudioContext: FakeAudioContext } })

describe("sine instrument", () => {
  afterEach(() => {
    silence()
    oscillators.length = 0
  })

  it("holds a sine at the played pitch until the note is released", () => {
    noteOn(69, 100)
    assert.equal(oscillators.length, 1)
    assert.equal(oscillators[0].type, "sine")
    assert.equal(oscillators[0].frequency.value, 440)
    assert.equal(oscillators[0].stopped, false)

    noteOff(69)
    assert.equal(oscillators[0].stopped, true)
  })

  it("replaces a held note instead of stacking a second sine", () => {
    noteOn(60, 80)
    noteOn(60, 80)
    assert.equal(oscillators.length, 2)
    assert.equal(oscillators[0].stopped, true)
    assert.equal(oscillators[1].stopped, false)
    assert.ok(Math.abs(oscillators[1].frequency.value - 261.6255653005986) < 0.001)
  })
})
