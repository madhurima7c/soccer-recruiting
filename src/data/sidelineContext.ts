export type StaffValue = { id: string; label: string; detail: string }

export type RosterPlayer = {
  id: string
  name: string
  pos: string
  year: string
  rating: number
  status: "roster" | "committed" | "target"
}

export type AskCeilingPoint = {
  id: string
  name: string
  pos: string
  ask: number
  ceiling: number
  highlight?: boolean
}

export type RivalProjection = {
  rival: string
  matchup: string
  ratings: { name: string; score: number; note: string }[]
}

export const teamContext = {
  school: "Columbia WSOC",
  formation: "4-3-3",
  philosophy:
    "Mature, self-directed players who raise the standard in training. We recruit for academic fit first, then style — composure on the ball, willingness to press, and psychosocial readiness for Ivy expectations.",
  values: [
    {
      id: "academics",
      label: "Academic floor",
      detail: "GPA 3.0+ · families who clear admissions hurdles",
    },
    {
      id: "maturity",
      label: "Maturity & ownership",
      detail: "Self-directed development over needing to be dragged along",
    },
    {
      id: "style",
      label: "Game model",
      detail: "Technical + tactical composure; press when triggered",
    },
    {
      id: "geo",
      label: "Geographic fit",
      detail: "Seattle · Bay Area · LA · Atlanta · Charlotte · Chicago",
    },
  ] as StaffValue[],
  needs: [
    { id: "gk", label: "Keeper depth", detail: "Need 2 viable options · insurance if top ask walks" },
    { id: "cb", label: "Center back", detail: "Aerial presence · organize the line" },
    { id: "st", label: "Striker", detail: "Finishing floor · at least 1 of 2 slots" },
    { id: "money", label: "Scholarship", detail: "~$300k left · protect against 80% asks" },
  ],
}

export const currentRoster: RosterPlayer[] = [
  { id: "holt", name: "Holt", pos: "CB", year: "JR", rating: 4, status: "roster" },
  { id: "keane", name: "Keane", pos: "GK", year: "JR", rating: 3, status: "roster" },
  { id: "kent", name: "Kent", pos: "LB", year: "SR", rating: 4, status: "roster" },
  { id: "alden", name: "Alden", pos: "GK", year: "SO", rating: 3, status: "roster" },
]

export const committedRecruits: RosterPlayer[] = [
  { id: "park", name: "Park", pos: "CM", year: "’27", rating: 4, status: "committed" },
  { id: "wells", name: "Wells", pos: "FB", year: "’27", rating: 3, status: "committed" },
]

export const depthTargets: RosterPlayer[] = [
  { id: "nora", name: "Nora Ellison", pos: "GK", year: "’27", rating: 5, status: "target" },
  { id: "avery", name: "Avery Collins", pos: "ST", year: "’27", rating: 4, status: "target" },
  { id: "elise", name: "Elise Navarro", pos: "FB", year: "’27", rating: 4, status: "target" },
  { id: "sofia", name: "Sofia Reyes", pos: "CB", year: "’27", rating: 4, status: "target" },
  { id: "taylor", name: "Taylor Kim", pos: "GK", year: "’27", rating: 4, status: "target" },
  { id: "samira", name: "Samira Haddad", pos: "ST", year: "’27", rating: 5, status: "target" },
]

/** Ask (% scholarship) vs Ceiling (projected impact 1–5 mapped to chart) */
export const askCeilingPoints: AskCeilingPoint[] = [
  { id: "nora", name: "Nora", pos: "GK", ask: 80, ceiling: 4.6, highlight: true },
  { id: "avery", name: "Avery", pos: "ST", ask: 65, ceiling: 4.3, highlight: true },
  { id: "elise", name: "Elise", pos: "FB", ask: 45, ceiling: 3.9, highlight: true },
  { id: "sofia", name: "Sofia", pos: "CB", ask: 55, ceiling: 4.1, highlight: true },
  { id: "taylor", name: "Taylor", pos: "GK", ask: 40, ceiling: 3.5, highlight: true },
  { id: "samira", name: "Samira", pos: "ST", ask: 70, ceiling: 4.8, highlight: true },
  { id: "riley", name: "Riley", pos: "CM", ask: 50, ceiling: 3.2 },
  { id: "harper", name: "Harper", pos: "W", ask: 35, ceiling: 2.8 },
  { id: "amelia", name: "Amelia", pos: "FB", ask: 60, ceiling: 3.4 },
]

/** Players the Phoenix summary calls out — keep depth + ask charts aligned */
export const phoenixFocusIds = ["nora", "avery"] as const


export const rivalProjections: RivalProjection[] = [
  {
    rival: "Dartmouth",
    matchup: "Ivy opener · high press",
    ratings: [
      { name: "Nora Ellison", score: 4, note: "Handles aerial barrage; starts build cleanly" },
      { name: "Sofia Reyes", score: 5, note: "Wins first balls vs their target forward" },
      { name: "Samira Haddad", score: 4, note: "Punishes transition gaps in their back three" },
      { name: "Elise Navarro", score: 3, note: "Solid; less decisive in wide 1v1s" },
    ],
  },
  {
    rival: "Princeton",
    matchup: "Possession · low block",
    ratings: [
      { name: "Nora Ellison", score: 5, note: "Distribution unlocks their press trap" },
      { name: "Samira Haddad", score: 5, note: "Ceiling finisher when we have the ball" },
      { name: "Sofia Reyes", score: 4, note: "Steps into midfield to progress" },
      { name: "Taylor Kim", score: 3, note: "Fine as rotation; less with feet under pressure" },
    ],
  },
  {
    rival: "Harvard",
    matchup: "Physical · set pieces",
    ratings: [
      { name: "Sofia Reyes", score: 5, note: "Clears box; organizes marking" },
      { name: "Nora Ellison", score: 4, note: "Commands area on corners" },
      { name: "Elise Navarro", score: 4, note: "Tracks runners from deep" },
      { name: "Samira Haddad", score: 3, note: "Needs service; less involved without width" },
    ],
  },
]
