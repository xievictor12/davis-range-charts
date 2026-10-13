import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { describeFit } from "../lib/fit"
import { compass, getInstrument, GROUPS, INSTRUMENTS, instrumentsInGroup } from "../lib/instruments"
import {
  KEY_WINDOWS,
  eachNote,
  keyBounds,
  midiToName,
  prefersDarkInk,
  rangePlacement,
  whiteKeyCount,
} from "../lib/music"

describe("note names", () => {
  it("treats middle C as C4", () => {
    assert.equal(midiToName(60), "C4")
    assert.equal(midiToName(61), "C#4")
    assert.equal(midiToName(58, true), "Bb3")
  })
})

describe("keyboard geometry", () => {
  it("counts a full piano as 52 white keys and 88 notes", () => {
    assert.equal(whiteKeyCount(KEY_WINDOWS["88"]), 52)
    assert.equal(eachNote(KEY_WINDOWS["88"]).length, 88)
    assert.equal(eachNote(KEY_WINDOWS["76"]).length, 76)
    assert.equal(eachNote(KEY_WINDOWS["61"]).length, 61)
  })

  it("anchors A0 at the left and C8 at the right", () => {
    const piano = KEY_WINDOWS["88"]
    const low = keyBounds(21, piano)
    const high = keyBounds(108, piano)
    assert.ok(low)
    assert.ok(high)
    assert.equal(low.left, 0)
    assert.equal(high.right, 1)
  })

  it("clips a range that runs off the visible keyboard", () => {
    const placement = rangePlacement(10, 40, KEY_WINDOWS["61"])
    assert.ok(placement)
    assert.equal(placement.clippedLeft, true)
    assert.equal(placement.left, 0)
  })
})

describe("transposition", () => {
  it("places a Bb clarinet's written range a major 2nd above sounding pitch", () => {
    const clarinet = getInstrument("clarinet")
    const sounding = compass(clarinet, "sounding")
    const written = compass(clarinet, "written")
    assert.equal(sounding.low, 50)
    assert.equal(written.low, 52)
    assert.equal(midiToName(written.low), "E3")
    assert.equal(midiToName(written.high), "C7")
  })

  it("places horn in F a perfect 5th above sounding pitch", () => {
    const horn = getInstrument("horn")
    const written = compass(horn, "written")
    assert.equal(midiToName(written.low), "F#2")
    assert.equal(midiToName(written.high), "C6")
  })
})

describe("fit sentences", () => {
  it("names the instruments that can take a pitch", () => {
    const sentence = describeFit([67], [getInstrument("violin"), getInstrument("tuba")], "sounding")
    assert.match(sentence, /G4 fits Violin/)
    assert.doesNotMatch(sentence, /Tuba/)
  })

  it("says when a chord has no single owner", () => {
    const sentence = describeFit([36, 100], [getInstrument("violin"), getInstrument("cello")], "sounding")
    assert.match(sentence, /Nobody covers the whole chord/)
  })
})

describe("groups", () => {
  it("keeps every orchestra id pointed at a real instrument", () => {
    const orchestra = instrumentsInGroup("orchestra")
    assert.equal(orchestra.length, GROUPS[0].instrumentIds.length)
    assert.ok(INSTRUMENTS.every((instrument) => instrument.soundingHigh > instrument.soundingLow))
    assert.equal(prefersDarkInk("#e9c46a"), true)
    assert.equal(prefersDarkInk("#145a56"), false)
  })
})
