# Roster Map

Interactive recruiting visualization prototype for the UW MHCI+D Capstone (collegiate soccer recruiting).

Inspired by connection-map and Collection-style view toggling — applied to **individual recruit ↔ team roster** fit.

## Open locally

```bash
python3 -m http.server 5180
# then open http://127.0.0.1:5180/
```

(Port **5173** is often taken by other projects.)

## Deploy to Vercel

```bash
npx vercel
```

## How to demo

1. Use the **bottom dock** to switch views:
   - **List icon** — structured Type | Title lists (recruits ↔ roster) with fan connections
   - **Overlapping squares** — unstructured node map + artifact panel
2. In unstructured view: click nodes, drag **Josie** onto the team cluster, open **Compare depth**, or **Disconnect**
3. In structured view: click a row (e.g. Josie) to fan connection lines to related roster items

## Project path

`~/Projects/recruit-graph`
