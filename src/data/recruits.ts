export type StaffMember = {
  id: string
  name: string
  role: string
  initials: string
}

export type Recruit = {
  id: string
  name: string
  position: string
  club: string
  scholarshipAsk: number
  technical: number
  tactical: number
  physical: number
  psychosocial: number
  desire: number
  risk: number
  status: "watching" | "offer" | "visit" | "committed-elsewhere"
}

export type Scenario = {
  id: string
  title: string
  subtitle: string
  score: number
  predicted: number
  loseList: number
  players: string[]
  warning?: string
}

export type StaffThought = {
  id: string
  authorId: string
  about: string
  text: string
  rating?: number
  time: string
}

export const staff: StaffMember[] = [
  { id: "amphone", name: "Amphone", role: "Head Coach", initials: "AM" },
  { id: "jordan", name: "Jordan", role: "Assoc. Head", initials: "JL" },
  { id: "casey", name: "Casey", role: "Recruiting Coord.", initials: "CK" },
]

export const recruits: Recruit[] = [
  {
    id: "rowe",
    name: "Rowe",
    position: "GK",
    club: "ECNL Seattle",
    scholarshipAsk: 80,
    technical: 4,
    tactical: 4,
    physical: 3,
    psychosocial: 5,
    desire: 4.5,
    risk: 3.8,
    status: "offer",
  },
  {
    id: "delgado",
    name: "Delgado",
    position: "GK",
    club: "GA Bay Area",
    scholarshipAsk: 45,
    technical: 4,
    tactical: 3,
    physical: 4,
    psychosocial: 4,
    desire: 3.8,
    risk: 2.2,
    status: "visit",
  },
  {
    id: "kramer",
    name: "Kramer",
    position: "ST",
    club: "ECNL LA",
    scholarshipAsk: 70,
    technical: 5,
    tactical: 4,
    physical: 4,
    psychosocial: 3,
    desire: 4.2,
    risk: 4.1,
    status: "watching",
  },
  {
    id: "samsani",
    name: "Samsani",
    position: "CB",
    club: "GA Atlanta",
    scholarshipAsk: 55,
    technical: 3,
    tactical: 4,
    physical: 5,
    psychosocial: 4,
    desire: 3.5,
    risk: 2.8,
    status: "watching",
  },
  {
    id: "doran",
    name: "Doran",
    position: "FB",
    club: "ECNL Chicago",
    scholarshipAsk: 40,
    technical: 3,
    tactical: 4,
    physical: 3,
    psychosocial: 5,
    desire: 2.9,
    risk: 1.8,
    status: "watching",
  },
  {
    id: "guin",
    name: "Guin",
    position: "ST",
    club: "GA Charlotte",
    scholarshipAsk: 60,
    technical: 4,
    tactical: 3,
    physical: 4,
    psychosocial: 3,
    desire: 3.2,
    risk: 3.5,
    status: "committed-elsewhere",
  },
]

export const scenarios: Scenario[] = [
  {
    id: "both-keepers",
    title: "Take both keepers",
    subtitle: "Rowe 80% + Delgado 45%",
    score: 1.25,
    predicted: 1.5,
    loseList: 1.25,
    players: ["rowe", "delgado"],
    warning: "Striker minimum at risk",
  },
  {
    id: "rowe-striker",
    title: "Rowe + the striker",
    subtitle: "Rowe 80% + Kramer 70%",
    score: 1.5,
    predicted: 1.75,
    loseList: 0.8,
    players: ["rowe", "kramer"],
  },
  {
    id: "skip-80",
    title: "Skip the 80% ask",
    subtitle: "Delgado 45% + Kramer 70%",
    score: 1.15,
    predicted: 2.25,
    loseList: 2.0,
    players: ["delgado", "kramer"],
  },
]

export const constraints = [
  { id: "money", label: "Scholarship money", value: "$300k left", ok: true },
  { id: "roster", label: "Roster cap", value: "24 / 25", ok: true },
  { id: "gk", label: "Keeper minimum", value: "2", progress: 2, max: 2, ok: true },
  { id: "cb", label: "Center back minimum", value: "2", progress: 2, max: 2, ok: true },
  { id: "st", label: "Striker minimum", value: "1 of 2", progress: 1, max: 2, ok: false },
  { id: "academics", label: "Academic floor", value: "GPA 3.0", ok: true },
]

export const staffThoughts: StaffThought[] = [
  {
    id: "t1",
    authorId: "amphone",
    about: "Rowe",
    text: "Wants 80%, but the feet and composure are rare. I'd take both keepers and wait on the striker class.",
    rating: 5,
    time: "2h ago",
  },
  {
    id: "t2",
    authorId: "jordan",
    about: "Delgado",
    text: "Cheaper ask, strong in the air. Good insurance if Rowe walks. Less sure on distribution.",
    rating: 4,
    time: "1h ago",
  },
  {
    id: "t3",
    authorId: "casey",
    about: "Kramer",
    text: "Finishing is a 5. Parents are pushing hard on money. Psychosocial still a question mark.",
    rating: 3,
    time: "45m ago",
  },
]

export const excelRows = [
  { name: "Rowe", pos: "GK", club: "ECNL Seattle", ask: "80%", status: "Offer out", tech: 4, note: "Visit Apr 12" },
  { name: "Delgado", pos: "GK", club: "GA Bay Area", ask: "45%", status: "Campus visit", tech: 4, note: "Strong aerial" },
  { name: "Kramer", pos: "ST", club: "ECNL LA", ask: "70%", status: "Watching", tech: 5, note: "Parents push $" },
  { name: "Samsani", pos: "CB", club: "GA Atlanta", ask: "55%", status: "Watching", tech: 3, note: "Physical 5" },
  { name: "Doran", pos: "FB", club: "ECNL Chicago", ask: "40%", status: "Watching", tech: 3, note: "Culture fit" },
  { name: "Guin", pos: "ST", club: "GA Charlotte", ask: "60%", status: "Elsewhere", tech: 4, note: "Northwestern" },
  { name: "Blake", pos: "CB", club: "Roster", ask: "—", status: "Current", tech: 4, note: "Junior starter" },
  { name: "Ijams", pos: "GK", club: "Roster", ask: "—", status: "Current", tech: 3, note: "3rd year" },
]
