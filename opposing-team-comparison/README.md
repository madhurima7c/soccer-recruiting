# PITCHSIDE v2 — the plain-English matchup field

Standalone what-if platform for collegiate soccer recruiting, rebuilt from scratch around
one rule: **anyone can read it.** Every number on screen has a plain-language explanation
(hover ⓘ), a value, and an expandable suggestion for what to do about it.
Port **5500** (`pitchside` in `.claude/launch.json`); RecruitIQ stays on 5200.

## Layout (top to bottom)
1. **Rival deck** — five full one-point-perspective fields (goals east/west), one per
   rival, in a horizontal snap-scroll strip. Swipe / arrows / dots to change opponent;
   whichever field is in view is the team being compared everywhere on the page.
   Rivals: Stanton (possession) · Redwood Tech (press) · Mesa Verde (crosses) ·
   Olympia Pacific (counters) · Bellfield State (set pieces).
2. **The seam** — "Your roster vs X: ahead in 3 · behind in 2 · even in 2" plus saved
   views as pills (views capture placements AND removals; localStorage `pitchside-v2`).
3. **My field** — editable. Drag recruits IN from the bench; drag any player OUT to the
   remove zone (removed spots stay visible as dashed "open · tap to undo" circles).
   Node stroke = coach's 1–5 score; hover = the number; click = full profile.
4. **Recruit bench** — horizontal tray of draggable recruit cards; the recruit who best
   answers the current matchup gap gets a green "best fit vs X" tag.
5. **The matchup, in plain English** — seven questions that decide the game
   (Who scores more? · Who gives up fewer? · Who keeps the ball? · Who hunts it back
   faster? · Who owns the air? · Corners & free kicks? · Who returns more starters?).
   Each row: both values as paired bars, a verdict in words, and a collapsible
   **What this means / What to do** — with an "Add to my field" button when a recruit on
   the board answers it. The air row recomputes live as you edit the field.
6. **The film note** — the scout's attributed read of this rival, and the stance:
   numbers find the questions, film answers them.

## Player profiles (the reference card, realized)
Header (jersey, name, club, status or "Most compatible" badge) → Position / Foot / Coach
score → **Player Radar**: percentile rank vs collegiate recruits at the same position,
values colored by the **percentile guide** (80–100 Elite green · 60–79 Above-Avg blue ·
40–59 Average orange · 20–39 Below-Avg red · 0–19 Needs-Dev gray), dashed = position
average → collapsible **Technical** (First Touch, Passing, Decision Making, Spatial
Awareness /100 with position-average ticks) → **Physical** (top speed km/h, 10m/30m
splits, strength/agility, distance, high-intensity running) → **Character** chips →
**Academic** (GPA, NCAA status) → staff notes → video tiles → your own notes box.
GKs get goalkeeper axes (Shot-stopping, Command…) instead of outfield ones.
Profile numbers derive deterministically from each player's radar + traits (`lib/profile.ts`).

## Why these comparison criteria
Possession/PPDA/crosses alone answered "what is their style" but not "who wins what."
v2 compares outcomes AND style: scoring, conceding, ball share, ball-winning speed,
aerial control (live with your what-if), set-piece threat, and returning experience —
each phrased as the question a coach actually asks, with the verdict in words instead
of raw diffs (no more "Defending −6").
