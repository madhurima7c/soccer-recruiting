# Julia Ticker Animation

Three-screen animation from Figma **Design-for-Soccer-Recruiting** (nodes `3428:7942`, `3428:8294`, `3428:8312`):

1. **Frame 1** — Julia Smith profile rail shown at the left
2. **Frame 2** — Rail scrolls left like a ticker tape
3. **Frame 3** — Stops with **Make Offer** visible; cursor clicks; confetti

## Run

```bash
cd julia-ticker-animation
npm install
npm run dev
```

Opens at **http://localhost:3004**

## Controls

- **Play / Pause** — Spacebar
- **Scrubber** — drag to any frame

## Timing (30 fps, 10 s)

| Phase | Frames | Time |
|-------|--------|------|
| Hold frame 1 | 0–44 | 0–1.5s |
| Ticker scroll | 45–164 | 1.5–5.5s |
| Hold at Make Offer | 165–194 | 5.5–6.5s |
| Cursor move + click | 195–251 | 6.5–8.4s |
| Confetti | 240–299 | 8–10s |
