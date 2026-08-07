# Unifying Soccer Recruiting — clickable prototype

High-fidelity web prototype of a collaborative recruiting platform for collegiate soccer coaching staffs.
MHCI+D × Adobe capstone · fictional data · every "AI" behavior is a deterministic simulation.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`). State persists to `localStorage` so a test session survives refresh — use **Reset demo data** (top bar) to return to the seeded state.

## The frame toggle

`Desktop / iPad (sideline) / Phone (travel)` in the top bar changes the viewport **and the product surface** (per the device-split table in the user flow doc): the comparison canvas, criteria mirror, debrief, journal, and compliance outbox are desktop-only; sideline capture is iPad-primary; the screening queue is phone-primary. Each device lands on its home surface.

## The Five Laws (what to check the prototype against)

1. **Mirror, never oracle** — no rankings, scores, fit-indexes, or "you should…" anywhere. Every AI-produced element (screen reasons, transcripts, OCR, mirror observations) has a "Why am I seeing this?" source affordance and renders in a dashed-violet *draft* treatment until confirmed.
2. **Capture adapts to the coach** — chips / voice / scribble / photo-OCR on every capture surface.
3. **One spine, many lenses** — one `Person` store renders board, sheet, profile, comparison, outbox. Logging a call lands in the timeline + staff feed + outbox from one capture.
4. **The roster is always in the room** — the depth chart (graduation waterfall) sits inside the comparison surface; dragging a recruit into a slot saves a what-if snapshot.
5. **Shared by default** — author avatars on every note; "draft (only you)" exists, publish is default.

## Demo script (also in-app: “Demo script” button, top-right)

1. **Sideline capture** — iPad frame → Capture opens the ID camp → tap a recruit → chips + voice draft → save → "+ Unknown #" adds *#14, blue, Crossfire* → offline banner shows queued captures (tap it to sync).
2. **Post-event debrief** — Desktop → Events → *Emerald City Showcase* → Debrief packet → Confirm 2 AI drafts (edit one) → see the Torres divergence (Dana 5/5 vs Tommy 2/5, attributed, never averaged) → re-tier via the color dots → Post summary to staff feed.
3. **Call capture** — Phone frame → Recruits → phone button on a contactable recruit → duration + topics + voice note → toast names all three destinations → Desktop → Compliance Outbox → the call is waiting, pre-formatted (switch ARMS/Teamworks/Jump Forward/Win One).
4. **The thesis** — Desktop → Compare + Depth. The **pitch planner** (The-Athletic-style squad view) shows every player at their position with `+N` seasons of eligibility left; the 6 graduated seniors are struck through (2 at CM = the hole). **Scrub the seasons** (2026-27 → 2028-29) to watch the waterfall empty positions over time. Pick a **criteria lens** (Compete, Motor, duel win %…) — every player gets their *attributed* read (initials = who said it; divergent reads shown side by side, never averaged). **Drag a recruit from the rail onto her position** → declare the intent ("Replaces Kovač" / "Adds depth") → save *Scenario A*, build *Scenario B*, compare (◆ diff). Scrub forward to see short-term vs long-term fit: a portal transfer arrives now and runs out; an HS ’27 lands next season with +4. Click any player → benchmark bars + attributed reads + "Add to comparison canvas" to weigh recruit vs incumbent. The grid view remains a toggle. Then the criteria mirror: drill provenance, dismiss one ("Not a real pattern").
5. **Inbound** — Phone frame → Queue → screen 4 items (each shows its screening reason + source type) → approving *M. Torres* triggers the duplicate-merge prompt → merge, no duplicate created.

## Stack

Vite + React + TypeScript · Tailwind CSS 4 · Zustand (persisted) · Recharts (sparklines) · lucide-react.
No backend, no auth. Seed data in `src/data/seed.ts`; object model in `src/types.ts`; all cross-surface actions (the Law-3 ripples) in `src/store.ts`.

## Insights (desktop)

An **Insights** surface (nav, after Compare + Depth) holds four *descriptive* lenses: board composition (tier/pipeline/class/position), position coverage vs graduation, evaluation coverage & gaps (who the staff has and hasn't seen), and attributed staff activity over time. These visualize **shape and coverage over human-entered counts** — no scores, ranks, or fit-indexes. See `DECISIONS.md` #23 for why this doesn't reopen the deliberate absences below.

## Deliberate absences

No radar charts, no composite score gauges, no AI-confidence meters, no single-number "fit score" — no chart that produces a *verdict on a player*. Insights (above) shows counts and coverage, never quality. If you're looking for the forbidden ones, re-read Law 1.

See `DECISIONS.md` for judgment calls the reference docs didn't cover.
