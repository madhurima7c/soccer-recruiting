# Coach prototypes

Separate HTML entry pages (not the same React route):

| Prototype | Path |
|---|---|
| **v1 — Excel + assistant** | `/` |
| **v2 — Fake desktop shell (Sideline)** | `/desktop/` |
| **v3 — Depth chart by class year** | `/depth/` |

## Run

```bash
npm install
npm run dev
```

Then open:

- http://localhost:5173/
- http://localhost:5173/desktop/
- http://localhost:5173/depth/

## Deploy

```bash
npm run build
npx vercel --yes
```
