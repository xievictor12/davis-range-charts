import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { CHARTS, chartFor, hasMode, keyClip, keyFills, keyRect } from "../lib/charts"

describe("uploaded charts", () => {
  it("pairs written and sounding sheets when both were uploaded", () => {
    assert.equal(chartFor("brass", "written").id, "brass-written")
    assert.equal(chartFor("brass", "sounding").id, "brass-sounding")
    assert.equal(hasMode("strings", "sounding"), false)
    assert.equal(chartFor("strings", "sounding").id, "strings-written")
    assert.equal(CHARTS.length, 20)
  })

  it("lands middle C on the printed C4 key", () => {
    const c4 = keyRect(60)
    const a0 = keyRect(21)
    const c8 = keyRect(108)
    const csharp = keyRect(61)
    assert.ok(c4 && a0 && c8 && csharp)
    assert.ok(c4.center > 0.44 && c4.center < 0.47)
    assert.ok(a0.left < 0.01)
    assert.ok(c8.left + c8.width > 0.99)
    assert.ok(csharp.center > c4.left + c4.width * 0.7 && csharp.center < c4.left + c4.width * 1.3)
  })

  it("lights the whole white key and the whole black key", () => {
    const c4 = keyRect(60)
    const csharp = keyRect(61)
    assert.ok(c4 && csharp)
    assert.ok(c4.top + c4.height > 0.95)
    assert.ok(csharp.top + csharp.height < c4.top + c4.height - 0.08)
    assert.ok(csharp.height > 0.15)

    const fills = keyFills(60)
    assert.equal(fills.length, 2)
    const [shoulder, body] = fills
    assert.ok(shoulder.width < body.width)
    assert.ok(Math.abs(shoulder.left + shoulder.width - (body.left + body.width)) > 0.001)
    assert.ok(Math.abs(shoulder.top + shoulder.height - body.top) < 0.0001)
    assert.ok(Math.abs(body.top + body.height - (c4.top + c4.height)) < 0.0001)
    assert.equal(keyFills(61).length, 1)
    assert.match(keyClip(60) ?? "", /^polygon\(/)
    assert.equal(keyClip(61), null)
  })
})