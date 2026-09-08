# Maddy Video Prototypes

Five animation / video prototypes for soccer recruiting (Remotion, Playwright+ffmpeg, and GSAP).

| # | Folder | Stack | Description | Dev port |
|---|--------|-------|-------------|----------|
| 1 | `kit-desktop-video/` | Remotion | AI desktop KIT assistant — windows, ball morph, selection, schedule | Remotion Studio |
| 2 | `remotion-animation/` | Remotion | Julia profile card + AI generating reveal (Kit V2) | Remotion Studio |
| 3 | `kit-v2-animation/` | Vite + Playwright | HTML/CSS port of `remotion-animation` with MP4 export | 3003 |
| 4 | `julia-ticker-animation/` | Vite + Playwright | Julia rail ticker → Make Offer click + confetti | 3004 |
| 5 | `kit-desktop-demo/` | Vite + GSAP | 11-step Kit desktop flow from Figma screens | 5173 |

## Quick start

Each subfolder is self-contained:

```bash
cd <folder>
npm install
npm run dev      # or: npx remotion studio  (Remotion projects)
npm run render   # Playwright projects → out/*.mp4
```

## Source videos (not in repo)

Some projects expect local `.mov` files on your machine:

- **`julia-ticker-animation`**: optional `public/assets/logMoment.mov` if used by the timeline

These were symlinked from Desktop during development and are excluded here.
