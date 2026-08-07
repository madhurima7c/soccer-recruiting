# RecruitIQ — shadcn reference prototype (v3 · graphic-heavy)

Reference prototype for the collegiate-soccer recruiting tool (transfer portal + HS +
JuCo, built for coaches), styled to the Figma direction: light, minimal, black-dot pitch,
orange for needs, green for placements, radar + bar charts everywhere a number used to be.
Real shadcn/ui components (base-nova, Tailwind v4) so every piece maps to the shadcn kit.

**Run:** `npm run dev` (port 5200 via `.claude/launch.json` → `recruitiq-shadcn`).
Demo clock Jul 22, 2026. Saved views persist in localStorage. Light default, dark toggle.

## Data model — what gets captured and why

**Quantitative** (Wyscout-style export, per player — `QUANT` in `src/data/seed.ts`):
Status · Matches · Minutes · Goals · xG · Country · Foot · GPA · Major, plus class year and
eligibility. **Every data point has a one-sentence coach-language explanation** in the
`EXPLAIN` map, surfaced as ⓘ tooltips wherever the value appears (rule: if it can't be
explained in one sentence, it doesn't ship). Radar profiles (`RADAR`) are six position-
neutral percentiles vs conference — Finishing · Creativity · Progression · Defending ·
Aerial · Security (GKs get their own axes) — with the league median drawn as a dashed ring.

**Qualitative** (the part the spreadsheet can't hold — this is the product's edge):
- **Traits** — program-vocabulary chips split into *character* (leader, coachable,
  competitor…) and *strengths* (press-resistant, ball-winner, two-footed…), coach-entered.
- **Staff reads** — 1–5 dots per dimension, always attributed (who, when), divergence
  flagged and never averaged.
- **Attributed notes** — call logs, sideline captures, voice drafts (visibly unconfirmed),
  video anchors, each with event context and vocabulary chips.
- **Provenance** — referral chains ("who vouched") and ratings-across-viewings sparklines.

**Matchmaking** stays evidence-based: similar players = players who share 2+ signals from
the qualitative layer (matching traits, matching 4+ reads, matching timelines), shown with
the exact evidence. The radar shows *shape*; the signals show *why she's like her*.

## Surfaces

### 0 · Rival lens (`src/screens/RivalLens.tsx`) — added Jul 29
"My potential configuration vs their current state." Pick a saved depth scenario (roster +
placed recruits) and a rival; the surface answers three questions with three graphic forms:

- **How strong is my (potential) team?** Hexagon radar overlay: my team shape (outfield
  average per axis, recruits included) vs the rival's — with **coach-swappable corners**
  (the flexible-criteria requirement: a pool of 8 criteria, incl. "Press resistance" and
  "Work rate" computed from the staff's own qualitative captures). Overlay up to 3 rivals.
- **What's their game / what's missing in mine?** The rival dossier: style tags, formation,
  record, four **bullet-stat tiles** (possession, PPDA, crosses/90, set-piece share vs the
  conference-median tick, each with a one-line coach read), **unit dumbbells** (DEF/MID/ATT,
  you vs them), the one **threat axis** their identity attacks, and an *attributed scout
  note* from a film session — the analysis is film; the numbers index it.
- **What do I do about it?** The **lean tornado** (you minus them per criterion; a bar is
  flagged only when it points into what this rival exploits) and the **exposure card**:
  the arithmetic-lowest player on the threat axis at the positions it lands on (e.g. GK
  Command vs a 24-crosses/90 team), then the recruits on your board who answer it, each
  with axis value, delta vs the exposed player, shared-evidence signals, a "cold-Tuesday-
  night competitor" flag from staff character reads, and an "in this what-if ✓" badge when
  the scenario already contains them.

Fictional Cascade Conference rivals with distinct identities: **Stanton University**
(possession), **Redwood Tech** (high press), **Mesa Verde State** (direct + crosses — the
GK demo fixture; seeded scenario "vs Mesa Verde — GK plan" shows Tilly Wren answering it).
Percentiles are framed **opposition-adjusted** (cross-competition normalization from the
scouting-workflow notes), and the footer carries the pipeline stance: *needs in coach
language → criteria → shortlist → film; data surfaces players faster, it never signs one.*

1. **Recruiting Board** — stat tiles (players / scholarships 12.4/14 / team GPA / graduating)
   → Depth & needs / Roster tabs → pitch center (black = set, orange dashed = thin next
   fall, green = placed) with the focused recruit's **radar** beside it and **depth bars
   (now vs fall ’27)** below. Right rail: THIS SCENARIO (drag-and-drop or Place, Undo,
   name + Save) and RECRUITS cards (status badge, Position/Foot/GPA rows, sparkline).
2. **Compare & saved** — scenario library with mini-pitch cards (pick two for trade-offs),
   player columns (character/strengths/reads/runway), an **overlaid radar** of everyone in
   the comparison vs the league median, and the similar-recruits rail with evidence chips.
3. **Sheet companion** — Wyscout-style spreadsheet with status chips and ⓘ column headers;
   the docked panel populates a mini depth chart (her spot green, thin groups orange), her
   card, radar + depth bars, and SIMILAR CANDIDATES — whose rows light up in the sheet.

## Design-history note
v1–v2 honored the "no radar / no composite" deliberate absence. v3 consciously retires the
radar half of that rule per the designer's direction; composite 0-100 scores remain out —
similarity is still explained in staff language, never scored.
