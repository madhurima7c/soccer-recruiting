# Kit Desktop Demo

11-step animated prototype of the Kit recruiting assistant desktop flow, built from 9 Figma screens with [transitions.dev](https://transitions.dev) motion tokens and GSAP.

## Run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default `http://localhost:5173/`). The animation auto-plays on load. Use **Play**, **Pause**, or **Restart** to control playback.

UI is composited from Figma assets — no duplicate text. The teal desktop stays persistent; windows, popover, toolbars, and modals animate as separate layers.

## Animation sequence

| Step | Description |
| --- | --- |
| 1 | Desktop windows pop up one by one |
| 2 | Hand enters from right, screen zooms into popover |
| 3 | Cursor selects Draw + Select icon |
| 4 | Popover fades, Draw + Select toolbar drops from top |
| 5 | Desktop fades in with overlapping windows |
| 6 | Cursor click on desktop |
| 7 | Selection mode — glow, cursor selects Mail / Excel / Safari, clicks Use selection |
| 8 | Toolbar fades, soccer ball moves with steel AI glow |
| 9 | Kit modal appears, cursor selects “Help me prepare for ECNL Phoenix” |
| 10 | ECNL schedule populates with reveal animation |
| 11 | Cursor clicks Share with staff |

## Figma sources

File: `Design-for-Soccer-Recruiting` (`4kiWtsFEQozwERuqGiuO1p`)

| Screen | Node |
| --- | --- |
| 1 — Desktop | `3324:6032` |
| 2 — Hand + popover | `3324:8354` |
| 3 — Assistant windows | `3324:4291` |
| 4 — Need a hand popover | `3324:8417` |
| 5 — Draw + Select toolbar | `3324:8480` |
| 6 — Desktop pop-ups | `3324:1092` |
| 7 — Window selection | `3324:2730` |
| 9 — Kit modal | `3324:5825` |
| 10 — ECNL schedule | `3324:5881` |

Screenshots exported to `assets/screens/`. Verification captures in `verify/`.

## Stack

- Vite
- GSAP timeline
- transitions.dev CSS motion tokens (`_root.css`)
