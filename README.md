# Rangebench

The range charts you uploaded, shown one sheet at a time on a landscape iPad. Switch families from the top row. Written and Sounding swap to the matching sheet when both were in the set. Strings and Voice only have a written sheet here.

The whole 88-key sheet is on screen, sitting along the bottom. **Zoom** enlarges it so you can read a range, and you drag sideways from there. Swipe up or down on the sheet, or use the arrows, for the next chart.

Notes you play draw a line through the ranges and light the whole printed key. A connected keyboard, and the letter keys, hold a sine wave until the note is released. Letter keys play from C4. Z and X move that octave.

## Run it

```bash
npm install
python3 scripts/prepare-charts.py
npm run dev
```

Open [http://127.0.0.1:38471](http://127.0.0.1:38471). Use that host or `localhost`. Other hostnames need to be listed in `allowedDevOrigins` in `next.config.ts`, or the page will paint and then ignore clicks.

`prepare-charts.py` reads the original PNGs from `assets/` and writes screen-sized copies to `public/charts/`. Those pictures stay on this machine. They are not committed.

```bash
npm test
npm run lint
```

## MIDI

Chrome and Edge on a computer can see a USB keyboard. Tap **MIDI**, then connect it.

Safari on iPad cannot. The sheets still swipe and scroll there. For a real keyboard on iPad, open this page in the Web MIDI Browser app.
