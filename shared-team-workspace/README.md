# Shared Team Workspace

Standalone prototype of the Kit **Shared team workspace** ranking screens from Figma.

## Screens

1. **Coach boards** — Four coach columns with individual GK rankings and empty slots
2. **Team ranking chart** — Aggregated vote share bar chart (opens via **View team ranking**)

## Standalone HTML (no build step)

**Recommended:** run a local server (images load reliably; double-click can fail in some browsers):

```bash
cd shared-team-workspace
npm run serve
```

Then open **http://localhost:8080/standalone.html**

Or one command:

```bash
npm run open
```

You can also double-click **`standalone.html`**, but if player photos are missing, use `npm run serve` instead.

Assets are bundled in **`assets/`** (no network required).

## Run with Vite (optional)

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default `http://localhost:5173`).

## Navigation

- Click **View team ranking** (top right) → team chart view
- Click the **back arrow** → return to coach boards

## Figma reference

- Coach boards: [node 1060:12258](https://www.figma.com/design/4kiWtsFEQozwERuqGiuO1p/Design-for-Soccer-Recruiting?node-id=1060-12258)
- Team chart: [node 1060:12076](https://www.figma.com/design/4kiWtsFEQozwERuqGiuO1p/Design-for-Soccer-Recruiting?node-id=1060-12076)
