/** Fictional TopDrawerSoccer-style headlines for the desktop prototype (no real-person PII). */

export const tdsNav = [
  "Home",
  "Club",
  "College",
  "Rankings",
  "Commitments",
  "Videos",
  "Premium",
] as const

export const tdsHeadlines = [
  {
    id: "w-top25",
    kicker: "College",
    title: "TDS Women’s Division I Top 25: Preseason",
    blurb: "Florida State opens at No. 1; Stanford and TCU round out the top three.",
  },
  {
    id: "recruit-rank",
    kicker: "Recruiting",
    title: "Final 2026 Women’s DI Recruiting Rankings",
    blurb: "National class snapshot for staff preparing fall ID weekends.",
  },
  {
    id: "ecnl-awards",
    kicker: "Club",
    title: "ECNL Girls Announces 2025-26 Awards",
    blurb: "Conference Players of the Year and All-Conference teams posted.",
  },
  {
    id: "new-coaches",
    kicker: "College",
    title: "New DI College Soccer Coaches to Know",
    blurb: "Staff moves that reshape recruiting territories this cycle.",
  },
] as const

export const tdsWomenTop25 = [
  { rank: 1, name: "Florida State", record: "0-0-0" },
  { rank: 2, name: "Stanford", record: "0-0-0" },
  { rank: 3, name: "TCU", record: "0-0-0" },
  { rank: 4, name: "Duke", record: "0-0-0" },
  { rank: 5, name: "Washington", record: "0-0-0" },
  { rank: 6, name: "Vanderbilt", record: "0-0-0" },
  { rank: 7, name: "North Carolina", record: "0-0-0" },
  { rank: 8, name: "UCLA", record: "0-0-0" },
] as const

export const tdsCommitments = [
  { name: "Jordan Lee", pos: "MF", school: "DePaul", classYear: "2027" },
  { name: "Camila Ruiz", pos: "CB", school: "Tennessee", classYear: "2027" },
  { name: "Mia Johansson", pos: "ST", school: "USF", classYear: "2028" },
  { name: "Riley Thompson", pos: "FB", school: "Xavier", classYear: "2027" },
] as const

export const tdsTeamRank = [
  { age: "U15", club: "So Cal Blues — ECNL" },
  { age: "U16", club: "Mtn. View Los Altos SC — ECNL" },
  { age: "U17", club: "Solar Soccer Club — ECNL" },
  { age: "U18", club: "Real Colorado — ECNL" },
] as const
