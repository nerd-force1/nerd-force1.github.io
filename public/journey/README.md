# Journey assets

## `rack-poster.avif`

The static rack, shown to everyone the live scene does not run for: SSR output,
`prefers-reduced-motion: reduce`, `Save-Data`, no WebGL2, or an unreadable palette. That is
not a rare path — it is every crawler, every reduced-motion visitor, and the first paint of
every visit.

**It is a screenshot of the scene, never a drawing.** Regenerate it whenever the rack
geometry, materials, lighting, palette or camera change, or it will quietly show a rack the
site no longer has.

### Where the current file came from

Captured from the **visual harness** — a standalone page that renders the identical scene
(same geometry constants as `rack.geometry.ts`, same materials, lights, camera and bloom as
`rack-scene.ts`, hues hardcoded to the same token values) under headless Firefox. The harness
exists because the scene's look was tuned frame-by-frame there; its output and the live
scene's output are the same picture as long as the two stay in step. **That is the trap:** the
harness is a twin, not the site — if `rack-scene.ts` changes and the harness does not, a
regenerated poster silently diverges from the live scene. When in doubt, capture from the live
page instead (below).

### To regenerate headlessly (works even under snap Firefox)

Snap Firefox's AppArmor confinement blocks WebDriver/BiDi automation (puppeteer et al. never
get a debug port), but plain `firefox --headless --screenshot` works. Two extra tricks are
required, both because headless screenshot-mode never *presents* a WebGL frame:

1. The page must hold its `load` event until the scene has rendered — a `<script type="module">`
   with top-level `await` does this.
2. The rendered frame must be read back and baked into a plain `<img>`
   (`canvas.toDataURL()` with `preserveDrawingBuffer: true`, then swap the canvas for the img) —
   the raster always includes DOM images, but a WebGL canvas that was never composited
   screenshots as black.

Then:

```bash
firefox --headless --no-remote --profile "$(mktemp -d)" --window-size=1600,1000 \
  --screenshot poster.png http://localhost:<harness-port>/
# no avif encoder ships with the OS; sharp does it:
node -e "require('sharp')('poster.png').avif({quality:55}).toFile('rack-poster.avif')"
```

The dark frame compresses to well under 20kB.

### To regenerate from the live page (devtools, by hand)

With `npm start` running, the homepage open, reduced-motion off, and the page **scrolled to
the rack section** (the scene's exposure follows scroll — at the top of the page the canvas
is deliberately black):

```
copy(document.querySelector('nf-rack-scene canvas').toDataURL('image/png'))
```

> **`toDataURL` on a WebGL canvas returns a blank image** unless the context was created with
> `preserveDrawingBuffer: true`. Set it temporarily in `rack-scene.ts`, then **remove it** —
> leaving it on costs a buffer copy per frame for every visitor, to serve a one-off capture.

Save the payload, `base64 -d` to PNG, convert with sharp as above.

## Phase 2 (not yet present)

`hall.avif` and `hall-depth.png` belong here when the hall lands. The hall's generation
brief carries one hard requirement, and it is not art direction: **the upper third must
be dark.** The logo's "1" is knocked out (alpha 0, see `brand/README.md` and #76), and
the navbar's `bg-bg-void/80 backdrop-blur` lets 20% of whatever is behind it through the
glyph. Over a bright daylit hall the "1" fills with office. Generate the hall dark-ceilinged,
lit low and from outside the glass. Every regeneration must hold that, forever.
