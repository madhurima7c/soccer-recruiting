# Kit V2 Animation (browser)

Plain HTML/CSS/JS port of the Remotion animation. Same PNG assets, same timing, same logic — but you can scrub, pause, and edit directly in Cursor without Remotion Studio.

## Export to MP4

There is no in-browser export button that writes the file — export runs from the terminal so you get a clean **1920×1080** MP4.

```bash
cd kit-v2-animation
npm install          # first time only (installs Playwright + ffmpeg)
npm run render       # exports out/kit-v2-1080p.mp4
```

| Setting | Value |
|---------|-------|
| Resolution | 1920 × 1080 |
| Frame rate | 30 fps |
| Duration | 10 s (300 frames) |
| Output | `out/kit-v2-1080p.mp4` |

In the preview UI, click **Export MP4** in the top-right for these instructions.

First export downloads Playwright Chromium once (~2 min). Capture + encode takes ~3–5 min.

## Run

```bash
cd kit-v2-animation
npm install
npm run dev
```

Opens at **http://localhost:3002**

## Controls

- **Play / Pause** — Spacebar
- **Scrubber** — drag to any frame
- **← / →** — step one frame
- **Speed** — 0.25× to 2×

## What to edit

| File | Purpose |
|------|---------|
| `src/constants.js` | Frame timing, layout rects, modal sections |
| `src/interpolate.js` | Easing curves |
| `src/aiGeneratingReveal.js` | AI text sweep + star pulse |
| `src/profileMorph.js` | Card expand + section scan line |
| `src/render.js` | Main timeline (orchestrates all layers) |
| `src/style.css` | Visual effects (glow, scan line) |

## Assets

PNGs are symlinked from `remotion-animation/public/assets/kit-v2/`. Replace or add files there (or copy into `kit-v2-animation/public/assets/kit-v2/`).

## Remotion project

The original Remotion project remains in `remotion-animation/` if you need video export later.
