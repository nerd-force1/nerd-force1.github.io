# Scene harness

A standalone twin of the rack scene in `src/app/components/journey/rack-scene/rack-scene.ts`,
for tuning the look by screenshot instead of by eye on hex values. Same geometry constants,
materials, lights, camera and bloom; hues hardcoded to the token values (this directory is
outside `src/app`, so the design guard deliberately does not scan it — keep it that way).

**If you change the scene, change the harness, or the poster regeneration in
`public/journey/README.md` silently drifts from the live site.**

Run from `frontend/`:

```bash
python3 -m http.server 8777          # web root must be frontend/ so ../node_modules resolves
firefox --headless --no-remote --profile "$(mktemp -d)" --window-size=1600,1000 \
  --screenshot out.png http://localhost:8777/scene-harness/
```

The page holds its `load` event (top-level await) until the frame is rendered and baked into
a plain `<img>`, so the screenshot is deterministic — see `public/journey/README.md` for why
a raw WebGL canvas screenshots as black.
