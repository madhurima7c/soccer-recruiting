# Personalized Reports & Visualizations

Standalone HTML prototype for the Kit **Personalized Reports & Visualizations** flow from Figma.

## Open

**Recommended:** run a local server:

```bash
cd personalized-reports-visualizations
npm run serve
```

Then open **http://localhost:8081/standalone.html**

Or one command:

```bash
npm run open
```

From the repo root, both prototypes:

```bash
bash serve-prototypes.sh
```

Assets are bundled in **`assets/`** (no network required).

## Screens

| View | Figma | Behavior |
|------|-------|----------|
| Report viewer | [717:9091](https://www.figma.com/design/4kiWtsFEQozwERuqGiuO1p/Design-for-Soccer-Recruiting?node-id=717-9091) | Scrollable PDF-style report card |
| Share modal | [1227:8207](https://www.figma.com/design/4kiWtsFEQozwERuqGiuO1p/Design-for-Soccer-Recruiting?node-id=1227-8207) | Opens when clicking **Share** (top right) |

## Interactions

- **Scroll** the report area to read the full comparison document
- **Share** → modal with report name, note, and confirm
- **X**, **Escape**, or click backdrop → close modal
- Bottom chat bar is visual-only (placeholder input)
