/** Depth-chart prototype data aligned to Figma frames 689-5162 + 786-4058 */

export type RecruitClassYear = "2026" | "2027" | "2028" | "2029" | "2030"

export type RecruitStatus = "offer" | "visited" | "camp" | "watching"

/** Coach Excel-style marker: how realistic is landing this recruit at UW */
export type RecruitLikelihood = "committed" | "interested" | "limited"

export type DepthPlayer = {
  id: string
  lastName: string
  firstName?: string
  position: string
  /** Coaches' eyes ranking, 1–5 */
  coachRating: number
  club: string
  /** Jersey # at current club */
  clubNumber: number
  /** Class standing shown on pitch cards, e.g. FR. / SO. / JR. */
  standing?: string
  highlightsUrl: string
  classYear: RecruitClassYear
  status: RecruitStatus
  /** Override Excel-style committed / interested / limited; else derived from status */
  likelihood?: RecruitLikelihood
  hue: number
  /** Placed on the pitch at this slot (null = in the bottom pool only) */
  placedSlot?: string | null
}

export type PositionSlot = {
  id: string
  /** Traditional position number (e.g. 9 for ST) */
  positionNumber: number
  abbrev: string
  label: string
  /** Spots looking to fill for the active class */
  spotsToFill: number
}

export const CLASS_YEARS: RecruitClassYear[] = [
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
]

export const STATUS_LABEL: Record<RecruitStatus, string> = {
  offer: "Offer",
  visited: "Visited",
  camp: "Camp",
  watching: "Watching",
}

export const LIKELIHOOD_LABEL: Record<RecruitLikelihood, string> = {
  committed: "Committed",
  interested: "Interested",
  limited: "Limited",
}

/** Short mark — readable without color (colorblind / print / mono) */
export const LIKELIHOOD_SHORT: Record<RecruitLikelihood, string> = {
  committed: "C",
  interested: "I",
  limited: "L",
}

/** Shared chrome for likelihood marks (letter carries meaning) */
export const LIKELIHOOD_MARK = {
  color: "#3a3a3c",
  background: "#ebe8e1",
  border: "rgba(26, 28, 25, 0.14)",
} as const

/** Demo overrides — top talent isn't always landable */
const LIKELIHOOD_OVERRIDES: Partial<Record<string, RecruitLikelihood>> = {
  camp: "limited", // 5.0★ but tuition / distance constraints
  boehm: "committed",
  dutra: "interested",
  newlin: "committed",
  menti: "interested",
  blake: "committed",
  ellis: "interested",
  murphy: "limited",
  buck: "limited",
  thomas: "limited",
  egan: "interested",
  loudd: "interested",
  aguilar: "interested",
  leyva: "committed",
}

export function getLikelihood(player: DepthPlayer): RecruitLikelihood {
  if (player.likelihood) return player.likelihood
  const override = LIKELIHOOD_OVERRIDES[player.id]
  if (override) return override
  if (player.status === "offer") return "committed"
  if (player.status === "visited" || player.status === "camp") return "interested"
  return "limited"
}

export const players: DepthPlayer[] = [
  // ——— Class of 2029 keepers (bottom pool in Figma) ———
  {
    id: "ellis",
    lastName: "Ellis",
    firstName: "Jordan",
    position: "GK",
    coachRating: 4.5,
    club: "Seattle United",
    clubNumber: 1,
    standing: "FR.",
    highlightsUrl: "#",
    classYear: "2029",
    status: "offer",
    hue: 205,
    placedSlot: null,
  },
  {
    id: "dalton",
    lastName: "Dalton",
    firstName: "Reese",
    position: "GK",
    coachRating: 4.0,
    club: "Crossfire Premier",
    clubNumber: 0,
    standing: "FR.",
    highlightsUrl: "#",
    classYear: "2029",
    status: "visited",
    hue: 28,
    placedSlot: null,
  },
  {
    id: "nguyen-k",
    lastName: "Nguyen",
    firstName: "Avery",
    position: "GK",
    coachRating: 3.5,
    club: "ECNL Seattle",
    clubNumber: 18,
    highlightsUrl: "#",
    classYear: "2029",
    status: "camp",
    hue: 160,
    placedSlot: null,
  },
  {
    id: "park-k",
    lastName: "Park",
    firstName: "Sam",
    position: "GK",
    coachRating: 3.0,
    club: "Washington Premier",
    clubNumber: 12,
    highlightsUrl: "#",
    classYear: "2029",
    status: "watching",
    hue: 48,
    placedSlot: null,
  },

  // ——— Placed on pitch (2029 class in Figma overall) ———
  {
    id: "boehm",
    lastName: "Boehm",
    position: "LW",
    coachRating: 4.5,
    club: "ECNL Seattle",
    clubNumber: 6,
    standing: "FR.",
    highlightsUrl: "#",
    classYear: "2029",
    status: "offer",
    hue: 28,
    placedSlot: "lw",
  },
  {
    id: "camp",
    lastName: "Camp",
    firstName: "N.",
    position: "ST",
    coachRating: 5.0,
    club: "ECNL LA",
    clubNumber: 11,
    standing: "SO.",
    highlightsUrl: "#",
    classYear: "2029",
    status: "offer",
    hue: 350,
    placedSlot: "st",
  },
  {
    id: "dutra",
    lastName: "Dutra",
    position: "RW",
    coachRating: 4.0,
    club: "ECNL San Diego",
    clubNumber: 24,
    standing: "4TH",
    highlightsUrl: "#",
    classYear: "2029",
    status: "visited",
    hue: 12,
    placedSlot: "rw",
  },
  {
    id: "newlin",
    lastName: "Newlin",
    position: "AM",
    coachRating: 4.5,
    club: "ECNL Chicago",
    clubNumber: 23,
    standing: "5TH",
    highlightsUrl: "#",
    classYear: "2029",
    status: "offer",
    hue: 265,
    placedSlot: "am",
  },
  {
    id: "leyva",
    lastName: "Leyva",
    position: "CM",
    coachRating: 4.0,
    club: "ECNL LA",
    clubNumber: 10,
    standing: "JR.",
    highlightsUrl: "#",
    classYear: "2029",
    status: "offer",
    hue: 320,
    placedSlot: "cm-l",
  },
  {
    id: "aguilar",
    lastName: "Aguilar",
    position: "CM",
    coachRating: 4.0,
    club: "GA Phoenix",
    clubNumber: 18,
    standing: "SO.",
    highlightsUrl: "#",
    classYear: "2029",
    status: "camp",
    hue: 30,
    placedSlot: "cm-r",
  },
  {
    id: "menti",
    lastName: "Menti",
    position: "DM",
    coachRating: 4.5,
    club: "ECNL Seattle",
    clubNumber: 2,
    standing: "SR.",
    highlightsUrl: "#",
    classYear: "2029",
    status: "offer",
    hue: 8,
    placedSlot: "dm",
  },
  {
    id: "loudd",
    lastName: "Loudd",
    position: "LB",
    coachRating: 4.0,
    club: "ECNL Portland",
    clubNumber: 4,
    standing: "SR.",
    highlightsUrl: "#",
    classYear: "2029",
    status: "visited",
    hue: 250,
    placedSlot: "lb",
  },
  {
    id: "blake",
    lastName: "Blake",
    position: "LCB",
    coachRating: 4.5,
    club: "ECNL LA",
    clubNumber: 5,
    standing: "JR.",
    highlightsUrl: "#",
    classYear: "2029",
    status: "offer",
    hue: 15,
    placedSlot: "lcb",
  },
  {
    id: "thomas",
    lastName: "Thomas",
    position: "RCB",
    coachRating: 4.0,
    club: "ECNL Chicago",
    clubNumber: 19,
    standing: "6TH",
    highlightsUrl: "#",
    classYear: "2029",
    status: "watching",
    hue: 40,
    placedSlot: "rcb",
  },
  {
    id: "egan",
    lastName: "Egan",
    position: "RB",
    coachRating: 4.0,
    club: "ECNL Seattle",
    clubNumber: 27,
    standing: "JR.",
    highlightsUrl: "#",
    classYear: "2029",
    status: "camp",
    hue: 335,
    placedSlot: "rb",
  },

  // ——— Depth backups (Pitch frame 786-4058) ———
  {
    id: "murphy",
    lastName: "Murphy",
    position: "LW",
    coachRating: 3.5,
    club: "GA Bay Area",
    clubNumber: 9,
    highlightsUrl: "#",
    classYear: "2029",
    status: "watching",
    hue: 200,
    placedSlot: "lw",
  },
  {
    id: "duncan",
    lastName: "Duncan",
    position: "LW",
    coachRating: 3.0,
    club: "ECNL Portland",
    clubNumber: 16,
    highlightsUrl: "#",
    classYear: "2029",
    status: "camp",
    hue: 160,
    placedSlot: "lw",
  },
  {
    id: "buck",
    lastName: "Buck",
    position: "ST",
    coachRating: 3.5,
    club: "GA Charlotte",
    clubNumber: 15,
    highlightsUrl: "#",
    classYear: "2029",
    status: "watching",
    hue: 45,
    placedSlot: "st",
  },
  {
    id: "nguyen",
    lastName: "Nguyen",
    position: "RW",
    coachRating: 3.0,
    club: "GA Bay Area",
    clubNumber: 30,
    highlightsUrl: "#",
    classYear: "2029",
    status: "watching",
    hue: 220,
    placedSlot: "rw",
  },
  {
    id: "gouran",
    lastName: "Gouran",
    position: "AM",
    coachRating: 3.5,
    club: "ECNL Seattle",
    clubNumber: 28,
    highlightsUrl: "#",
    classYear: "2029",
    status: "camp",
    hue: 95,
    placedSlot: "am",
  },
  {
    id: "chou",
    lastName: "Chou",
    position: "AM",
    coachRating: 3.0,
    club: "GA Atlanta",
    clubNumber: 7,
    highlightsUrl: "#",
    classYear: "2028",
    status: "watching",
    hue: 180,
    placedSlot: "am",
  },
  {
    id: "shell",
    lastName: "Shell",
    position: "CM",
    coachRating: 3.0,
    club: "GA Dallas",
    clubNumber: 13,
    highlightsUrl: "#",
    classYear: "2029",
    status: "watching",
    hue: 55,
    placedSlot: "cm-l",
  },
  {
    id: "holdenried",
    lastName: "Holdenried",
    position: "CM",
    coachRating: 2.5,
    club: "ECNL Denver",
    clubNumber: 17,
    highlightsUrl: "#",
    classYear: "2028",
    status: "watching",
    hue: 140,
    placedSlot: "cm-l",
  },
  {
    id: "morton",
    lastName: "Morton",
    position: "CM",
    coachRating: 3.0,
    club: "ECNL Chicago",
    clubNumber: 8,
    highlightsUrl: "#",
    classYear: "2029",
    status: "camp",
    hue: 210,
    placedSlot: "cm-r",
  },
  {
    id: "matte",
    lastName: "Matté",
    position: "DM",
    coachRating: 3.0,
    club: "GA Bay Area",
    clubNumber: 3,
    highlightsUrl: "#",
    classYear: "2028",
    status: "watching",
    hue: 190,
    placedSlot: "dm",
  },
  {
    id: "durham",
    lastName: "Durham",
    position: "LB",
    coachRating: 3.0,
    club: "GA Atlanta",
    clubNumber: 14,
    highlightsUrl: "#",
    classYear: "2029",
    status: "watching",
    hue: 70,
    placedSlot: "lb",
  },
  {
    id: "norman",
    lastName: "Norman",
    position: "LCB",
    coachRating: 3.5,
    club: "GA Charlotte",
    clubNumber: 20,
    highlightsUrl: "#",
    classYear: "2029",
    status: "visited",
    hue: 300,
    placedSlot: "lcb",
  },
  {
    id: "stearns",
    lastName: "Stearns",
    position: "LCB",
    coachRating: 3.0,
    club: "ECNL Boston",
    clubNumber: 22,
    highlightsUrl: "#",
    classYear: "2028",
    status: "watching",
    hue: 110,
    placedSlot: "lcb",
  },
  {
    id: "defilippo",
    lastName: "De Filippo",
    position: "RCB",
    coachRating: 3.0,
    club: "GA Bay Area",
    clubNumber: 21,
    highlightsUrl: "#",
    classYear: "2029",
    status: "watching",
    hue: 175,
    placedSlot: "rcb",
  },
  {
    id: "montoya",
    lastName: "Montoya",
    position: "RB",
    coachRating: 3.0,
    club: "GA Phoenix",
    clubNumber: 12,
    highlightsUrl: "#",
    classYear: "2028",
    status: "watching",
    hue: 85,
    placedSlot: "rb",
  },

  // ——— Other class years for filter ———
  {
    id: "chamberland",
    lastName: "Chamberland",
    position: "GK",
    coachRating: 5.0,
    club: "ECNL Seattle",
    clubNumber: 0,
    standing: "2ND",
    highlightsUrl: "#",
    classYear: "2027",
    status: "offer",
    hue: 205,
    placedSlot: "gk",
  },
  {
    id: "ijams",
    lastName: "Ijams",
    position: "GK",
    coachRating: 4.0,
    club: "GA Bay Area",
    clubNumber: 1,
    highlightsUrl: "#",
    classYear: "2027",
    status: "visited",
    hue: 25,
    placedSlot: "gk",
  },
  {
    id: "murry",
    lastName: "Murry",
    position: "GK",
    coachRating: 3.5,
    club: "ECNL Denver",
    clubNumber: 99,
    highlightsUrl: "#",
    classYear: "2027",
    status: "camp",
    hue: 150,
    placedSlot: "gk",
  },
  {
    id: "hurst",
    lastName: "Hurst",
    position: "GK",
    coachRating: 3.0,
    club: "GA Atlanta",
    clubNumber: 33,
    highlightsUrl: "#",
    classYear: "2028",
    status: "watching",
    hue: 280,
    placedSlot: "gk",
  },
  {
    id: "reyes",
    lastName: "Reyes",
    position: "CB",
    coachRating: 4.0,
    club: "GA LA",
    clubNumber: 5,
    highlightsUrl: "#",
    classYear: "2026",
    status: "offer",
    hue: 10,
    placedSlot: null,
  },
  {
    id: "wells",
    lastName: "Wells",
    position: "FB",
    coachRating: 3.5,
    club: "GA Dallas",
    clubNumber: 2,
    highlightsUrl: "#",
    classYear: "2026",
    status: "watching",
    hue: 230,
    placedSlot: null,
  },
  {
    id: "chen",
    lastName: "Chen",
    position: "ST",
    coachRating: 4.5,
    club: "ECNL Portland",
    clubNumber: 9,
    highlightsUrl: "#",
    classYear: "2030",
    status: "camp",
    hue: 195,
    placedSlot: null,
  },
]

export const byId = Object.fromEntries(players.map((p) => [p.id, p]))

export type FormationId = "4-3-3" | "4-4-2" | "3-5-2"

export type FormationSlot = {
  id: string
  positionNumber: number
  abbrev: string
  label: string
  /** Player.position values that can fill this spot */
  accepts: string[]
  left: string
  top: string
  width: string
}

export type Formation = {
  id: FormationId
  label: string
  slots: FormationSlot[]
}

/** Which player positions can fill each formation role */
export const FORMATIONS: Formation[] = [
  {
    id: "4-3-3",
    label: "4-3-3",
    slots: [
      { id: "lw", positionNumber: 11, abbrev: "LW", label: "Left Wing", accepts: ["LW", "W"], left: "1%", top: "2%", width: "28%" },
      { id: "st", positionNumber: 9, abbrev: "ST", label: "Striker", accepts: ["ST"], left: "36%", top: "0%", width: "28%" },
      { id: "rw", positionNumber: 7, abbrev: "RW", label: "Right Wing", accepts: ["RW", "W"], left: "71%", top: "2%", width: "28%" },
      { id: "cm-l", positionNumber: 8, abbrev: "CM", label: "Center Mid", accepts: ["CM", "AM", "DM"], left: "5%", top: "32%", width: "27%" },
      { id: "cm-c", positionNumber: 8, abbrev: "CM", label: "Center Mid", accepts: ["CM", "AM", "DM"], left: "36.5%", top: "38%", width: "27%" },
      { id: "cm-r", positionNumber: 8, abbrev: "CM", label: "Center Mid", accepts: ["CM", "AM", "DM"], left: "68%", top: "32%", width: "27%" },
      { id: "lb", positionNumber: 3, abbrev: "LB", label: "Left Back", accepts: ["LB", "FB"], left: "1%", top: "62%", width: "24%" },
      { id: "lcb", positionNumber: 5, abbrev: "CB", label: "Center Back", accepts: ["LCB", "CB"], left: "25.5%", top: "64%", width: "24%" },
      { id: "rcb", positionNumber: 4, abbrev: "CB", label: "Center Back", accepts: ["RCB", "CB"], left: "50.5%", top: "64%", width: "24%" },
      { id: "rb", positionNumber: 2, abbrev: "RB", label: "Right Back", accepts: ["RB", "FB"], left: "75%", top: "62%", width: "24%" },
      { id: "gk", positionNumber: 1, abbrev: "GK", label: "Goalkeeper", accepts: ["GK"], left: "36%", top: "84%", width: "28%" },
    ],
  },
  {
    id: "4-4-2",
    label: "4-4-2",
    slots: [
      { id: "st-l", positionNumber: 9, abbrev: "ST", label: "Striker", accepts: ["ST"], left: "18%", top: "0%", width: "28%" },
      { id: "st-r", positionNumber: 9, abbrev: "ST", label: "Striker", accepts: ["ST"], left: "54%", top: "0%", width: "28%" },
      { id: "lm", positionNumber: 11, abbrev: "LM", label: "Left Mid", accepts: ["LW", "W", "LM"], left: "1%", top: "28%", width: "24.5%" },
      { id: "cm-l", positionNumber: 8, abbrev: "CM", label: "Center Mid", accepts: ["CM", "AM", "DM"], left: "25.5%", top: "34%", width: "24.5%" },
      { id: "cm-r", positionNumber: 8, abbrev: "CM", label: "Center Mid", accepts: ["CM", "AM", "DM"], left: "50%", top: "34%", width: "24.5%" },
      { id: "rm", positionNumber: 7, abbrev: "RM", label: "Right Mid", accepts: ["RW", "W", "RM"], left: "74.5%", top: "28%", width: "24.5%" },
      { id: "lb", positionNumber: 3, abbrev: "LB", label: "Left Back", accepts: ["LB", "FB"], left: "1%", top: "62%", width: "24%" },
      { id: "lcb", positionNumber: 5, abbrev: "CB", label: "Center Back", accepts: ["LCB", "CB"], left: "25.5%", top: "64%", width: "24%" },
      { id: "rcb", positionNumber: 4, abbrev: "CB", label: "Center Back", accepts: ["RCB", "CB"], left: "50.5%", top: "64%", width: "24%" },
      { id: "rb", positionNumber: 2, abbrev: "RB", label: "Right Back", accepts: ["RB", "FB"], left: "75%", top: "62%", width: "24%" },
      { id: "gk", positionNumber: 1, abbrev: "GK", label: "Goalkeeper", accepts: ["GK"], left: "36%", top: "84%", width: "28%" },
    ],
  },
  {
    id: "3-5-2",
    label: "3-5-2",
    slots: [
      { id: "st-l", positionNumber: 9, abbrev: "ST", label: "Striker", accepts: ["ST"], left: "18%", top: "0%", width: "28%" },
      { id: "st-r", positionNumber: 9, abbrev: "ST", label: "Striker", accepts: ["ST"], left: "54%", top: "0%", width: "28%" },
      { id: "lm", positionNumber: 11, abbrev: "LM", label: "Left Wing", accepts: ["LW", "W", "LM"], left: "0.5%", top: "26%", width: "23%" },
      { id: "cm-l", positionNumber: 8, abbrev: "CM", label: "Center Mid", accepts: ["CM", "AM", "DM"], left: "19.5%", top: "34%", width: "23%" },
      { id: "cm-c", positionNumber: 6, abbrev: "DM", label: "Defensive Mid", accepts: ["DM", "CM"], left: "38.5%", top: "42%", width: "23%" },
      { id: "cm-r", positionNumber: 8, abbrev: "CM", label: "Center Mid", accepts: ["CM", "AM", "DM"], left: "57.5%", top: "34%", width: "23%" },
      { id: "rm", positionNumber: 7, abbrev: "RM", label: "Right Wing", accepts: ["RW", "W", "RM"], left: "76.5%", top: "26%", width: "23%" },
      { id: "lcb", positionNumber: 5, abbrev: "CB", label: "Center Back", accepts: ["LCB", "CB"], left: "13%", top: "66%", width: "24%" },
      { id: "cb", positionNumber: 5, abbrev: "CB", label: "Center Back", accepts: ["CB", "LCB", "RCB"], left: "38%", top: "68%", width: "24%" },
      { id: "rcb", positionNumber: 4, abbrev: "CB", label: "Center Back", accepts: ["RCB", "CB"], left: "63%", top: "66%", width: "24%" },
      { id: "gk", positionNumber: 1, abbrev: "GK", label: "Goalkeeper", accepts: ["GK"], left: "36%", top: "84%", width: "28%" },
    ],
  },
]

/** @deprecated — prefer FORMATIONS; kept for any leftover imports */
export const positionSlots: PositionSlot[] = FORMATIONS[0].slots.map((s) => ({
  id: s.id,
  positionNumber: s.positionNumber,
  abbrev: s.abbrev,
  label: s.label,
  spotsToFill: 0,
}))

/** @deprecated — prefer FORMATIONS */
export const pitchLayout = {
  id: FORMATIONS[0].id,
  label: FORMATIONS[0].label,
  slots: FORMATIONS[0].slots.map((s) => ({
    slotId: s.id,
    left: s.left,
    top: s.top,
    width: s.width,
  })),
}

export function getFormation(id: FormationId): Formation {
  return FORMATIONS.find((f) => f.id === id) ?? FORMATIONS[0]
}

export function playerFitsSlot(
  player: DepthPlayer,
  slot: FormationSlot,
): boolean {
  return slot.accepts.includes(player.position)
}

/** Rank eligible year recruits for a slot (highest rating first) */
export function eligibleForSlot(
  yearPlayers: DepthPlayer[],
  slot: FormationSlot,
): DepthPlayer[] {
  return yearPlayers
    .filter((p) => playerFitsSlot(p, slot))
    .sort((a, b) => {
      if (b.coachRating !== a.coachRating) return b.coachRating - a.coachRating
      return a.lastName.localeCompare(b.lastName)
    })
}
