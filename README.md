# Kit prototypes

Separate HTML entry pages (not the same React route):

| Prototype | Path |
|---|---|
| **Current — responsive Kit product** | `/` |
| **Flow 1 — Fake Mac desktop + Kit edge pill** | `/flow1/` or `/desktop-flow1/` |
| **v2 — Fake desktop shell (Kit)** | `/desktop/` |
| **v3 — Depth chart by class year** | `/depth/` |

## Run

```bash
npm install
npm run dev
```

Then open:

- http://localhost:5173/
- http://localhost:5173/flow1/ *(or `/desktop-flow1/`)*
- http://localhost:5173/desktop/
- http://localhost:5173/depth/

## Deploy (Netlify)

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

Or preview:

```bash
npm run deploy:preview
```

Shareable Flow 1 URL after deploy: `https://<your-site>.netlify.app/flow1/`
