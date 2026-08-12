# Log Moment — Scout Companion

Mobile prototype mockup for live scouting moment capture from Figma.

## Open

**Recommended:** run a local server:

```bash
cd log-moment
npm run serve
```

Then open **http://localhost:8082/standalone.html**

Or one command:

```bash
npm run open
```

From the repo root (all prototypes):

```bash
bash serve-prototypes.sh
```

## Figma reference

[Mobile Moment Capture — node 726:4580](https://www.figma.com/design/4kiWtsFEQozwERuqGiuO1p/Design-for-Soccer-Recruiting?node-id=726-4580)

## Interactions

- **Log data / Saved moments** tabs
- Scroll **FIFA-style player cards** horizontally; tap to select
- Toggle quick tags: Shot, Duel, Compete, Flag
- **Log moment** saves to Saved moments with toast feedback
- Note field + microphone icon (visual)

## Viewport

Designed for **402×874** mobile (iPhone). On desktop, the phone frame is centered with a subtle shadow.

## joi-prototype/ (Aug 12)
Interactive GSAP version of this flow — Joi-style pull-down summary (staggered text + avatar
pills), tappable Field 7 card → player carousel, jersey-first add-player, Log Moment with
green confirmation + localStorage timestamps. Serve the folder statically:
`npx http-server log-moment/joi-prototype -p 5610` (or open via GitHub Pages build).
Haptics use navigator.vibrate — maps to UIImpactFeedbackGenerator in the planned Xcode port.
