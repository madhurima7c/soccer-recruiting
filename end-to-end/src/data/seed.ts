// ── Seed data: Cascadia State University Women's Soccer (fictional D1 program) ──
// All names fictional. All "AI" content deterministic mocks.
import type {
  BenchmarkTemplate, Capture, ComplianceEvent, ContactLogEntry, FeedItem, InboundItem,
  JournalEntry, MetricKey, MirrorObservation, Person, Position, Program, RecruitingEvent,
  StaffMember, WhatIfSnapshot,
} from '../types'
import { METRIC_KEYS } from '../types'

// deterministic PRNG so every reset produces identical data
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const STAFF: StaffMember[] = [
  { id: 'st-pat', name: 'Pat Herrera', initials: 'PH', role: 'Head Coach', access: 'full', color: '#7c3aed' },
  { id: 'st-dana', name: 'Dana Okafor', initials: 'DO', role: 'Associate Head (Recruiting Lead)', access: 'full', color: '#0f766e' },
  { id: 'st-jesse', name: 'Jesse Lin', initials: 'JL', role: 'Assistant Coach', access: 'full', color: '#b45309' },
  { id: 'st-mari', name: 'Marisol Vega', initials: 'MV', role: 'Volunteer (capture-only)', access: 'capture-only', color: '#be185d' },
  { id: 'st-tommy', name: 'Tommy Burke', initials: 'TB', role: 'Volunteer (capture-only)', access: 'capture-only', color: '#4338ca' },
]
export const DEFAULT_USER_ID = 'st-dana'

export const PROGRAM: Program = {
  name: 'Cascadia State University Women’s Soccer',
  division: 'NCAA Division I · Cascade Conference',
  vocabulary: [
    { word: 'engine', meaning: 'Never stops running — covers ground both ways for 90 minutes.' },
    { word: 'energy raiser', meaning: 'Lifts the intensity of everyone around her when she steps on.' },
    { word: 'coachable', meaning: 'Applies a correction within the same session.' },
    { word: 'breakfast test', meaning: 'Someone you would want to sit next to at team breakfast every day for four years.' },
    { word: 'vocal', meaning: 'Organizes teammates out loud, constantly.' },
    { word: 'gamer', meaning: 'Bigger the moment, better the performance.' },
    { word: 'late bloomer', meaning: 'Trajectory says more than the current level.' },
  ],
  valuesHierarchy: ['Competitive spirit', 'Work ethic', 'Athleticism', 'Technical'],
  dimensions: ['Motor', 'First touch', 'Compete'],
  tiers: [
    { id: 'blue', name: 'Top Board', color: '#2563eb', textColor: '#fff', meaning: 'Would take a commitment today' },
    { id: 'green', name: 'Active Watch', color: '#16a34a', textColor: '#fff', meaning: 'Multiple viewings planned, gathering film' },
    { id: 'yellow', name: 'Wide Net', color: '#eab308', textColor: '#1c1917', meaning: 'On the radar, not yet prioritized' },
    { id: 'red', name: 'Cooling', color: '#dc2626', textColor: '#fff', meaning: 'Likely pass — keep the why' },
  ],
  complianceTarget: 'ARMS',
  seasonFocus: ['Compete', 'duelsWonPct'],
}

// ── Benchmark templates (named references the program built — Rohit's weights, visible) ──
const T = (pos: Position, name: string, base: Partial<Record<MetricKey, number>>, weights: Partial<Record<MetricKey, number>>): BenchmarkTemplate => {
  const values = {} as Record<MetricKey, number>
  const w = {} as Record<MetricKey, number>
  const defaults: Record<MetricKey, number> = {
    duelsWonPct: 55, aerialWonPct: 50, defDuelsWonPct: 58, interceptionsP90: 4.5,
    passAccPct: 80, fwdPassAccPct: 68, progPassesP90: 7, progRunsP90: 1.8,
    keyPassesP90: 0.8, xAP90: 0.12, goalsP90: 0.15, dribblesWonPct: 55,
  }
  METRIC_KEYS.forEach(k => { values[k] = base[k] ?? defaults[k]; w[k] = weights[k] ?? 2 })
  return { id: `tpl-${pos.toLowerCase()}`, name, position: pos, source: 'Built by staff from 2024–25 Cascade Conference Wyscout exports', values, weights: w }
}

export const TEMPLATES: BenchmarkTemplate[] = [
  T('GK', 'Cascade Conference First-Team GK Template', { passAccPct: 74, fwdPassAccPct: 55, duelsWonPct: 60 }, { passAccPct: 4, fwdPassAccPct: 3 }),
  T('CB', 'Cascade Conference First-Team CB Template', { duelsWonPct: 62, aerialWonPct: 60, defDuelsWonPct: 66, interceptionsP90: 6.5, passAccPct: 84, progPassesP90: 8 }, { aerialWonPct: 5, defDuelsWonPct: 5, interceptionsP90: 4, progPassesP90: 3 }),
  T('FB', 'Cascade Conference First-Team FB Template', { duelsWonPct: 56, defDuelsWonPct: 60, progRunsP90: 2.6, keyPassesP90: 1.0, xAP90: 0.14 }, { progRunsP90: 4, defDuelsWonPct: 4, keyPassesP90: 3 }),
  T('DM', 'Cascade Conference First-Team DM Template', { duelsWonPct: 58, defDuelsWonPct: 64, interceptionsP90: 7.2, passAccPct: 86, fwdPassAccPct: 74, progPassesP90: 9.5 }, { interceptionsP90: 5, passAccPct: 4, progPassesP90: 5, defDuelsWonPct: 4 }),
  T('CM', 'Cascade Conference First-Team CM Template', { duelsWonPct: 57, defDuelsWonPct: 60, interceptionsP90: 5.5, passAccPct: 84, fwdPassAccPct: 72, progPassesP90: 10, progRunsP90: 2.2, keyPassesP90: 1.3, xAP90: 0.18 }, { progPassesP90: 5, duelsWonPct: 5, keyPassesP90: 4, passAccPct: 3, interceptionsP90: 3 }),
  T('W', 'Cascade Conference First-Team Winger Template', { dribblesWonPct: 60, progRunsP90: 3.4, keyPassesP90: 1.8, xAP90: 0.24, goalsP90: 0.3 }, { dribblesWonPct: 5, xAP90: 4, progRunsP90: 4, goalsP90: 3 }),
  T('F', 'Cascade Conference First-Team Forward Template', { goalsP90: 0.55, xAP90: 0.15, aerialWonPct: 52, keyPassesP90: 1.1, dribblesWonPct: 55 }, { goalsP90: 5, aerialWonPct: 3, keyPassesP90: 3 }),
]
const tplFor = (pos: Position) => TEMPLATES.find(t => t.position === pos)!

// stat generator: template value ± jitter, deterministic per person index
function genStats(pos: Position, rnd: () => number, quality: number): Record<MetricKey, number> {
  const tpl = tplFor(pos)
  const out = {} as Record<MetricKey, number>
  METRIC_KEYS.forEach(k => {
    const spread = tpl.values[k] * 0.28
    let v = tpl.values[k] + (quality - 0.5) * spread + (rnd() - 0.5) * spread * 0.9
    if (k.endsWith('Pct')) v = Math.min(94, Math.max(20, v)) // percentages stay plausible
    out[k] = Math.round(v * 10) / 10
  })
  return out
}
function genRatings(rnd: () => number, n: number, drift: number): number[] {
  const arr: number[] = []
  let v = 2.4 + rnd() * 1.2
  for (let i = 0; i < n; i++) { v = Math.min(5, Math.max(1, v + drift + (rnd() - 0.5) * 0.7)); arr.push(Math.round(v * 10) / 10) }
  return arr
}

const gate = (status: 'clear' | 'open' | 'concern' | 'unknown', note: string, updated: string) => ({ status, note, updated })

// ── Roster: 24 players, 6 graduating seniors (2 at CM → the demo gap) ──
interface RosterSpec { name: string; pos: Position; year: number; grad?: boolean; elig: number; idp?: { focus: string; trajectory: number[] }; jersey: number; home: string; q: number }
const ROSTER_SPECS: RosterSpec[] = [
  { name: 'Maya Lindqvist', pos: 'GK', year: 2026, grad: true, elig: 0, jersey: 1, home: 'Bellingham, WA', q: 0.75 },
  { name: 'Reese Calloway', pos: 'GK', year: 2028, elig: 2, jersey: 18, home: 'Boise, ID', q: 0.55 },
  { name: 'Jordan Petkova', pos: 'GK', year: 2029, elig: 4, jersey: 30, home: 'Vancouver, WA', q: 0.45 },
  { name: 'Sam Okonkwo', pos: 'CB', year: 2026, grad: true, elig: 0, jersey: 4, home: 'Renton, WA', q: 0.8 },
  { name: 'Tessa Marchetti', pos: 'CB', year: 2027, elig: 1, jersey: 5, home: 'Spokane, WA', q: 0.7 },
  { name: 'Lena Vogl', pos: 'CB', year: 2028, elig: 2, jersey: 15, home: 'Portland, OR', q: 0.6 },
  { name: 'Priya Nair', pos: 'CB', year: 2029, elig: 4, jersey: 26, home: 'Redmond, WA', q: 0.5 },
  { name: 'Casey Truong', pos: 'FB', year: 2026, grad: true, elig: 0, jersey: 2, home: 'Tacoma, WA', q: 0.72 },
  { name: 'Izzy Ferreira', pos: 'FB', year: 2027, elig: 1, jersey: 3, home: 'Salem, OR', q: 0.66 },
  { name: 'Noor Haddad', pos: 'FB', year: 2028, elig: 2, jersey: 22, home: 'Kent, WA', q: 0.58, idp: { focus: 'Final-third delivery + weak-foot service', trajectory: [2.1, 2.4, 2.8, 3.2, 3.6] } },
  { name: 'Emerson Blake', pos: 'FB', year: 2029, elig: 4, jersey: 27, home: 'Eugene, OR', q: 0.48 },
  { name: 'Rowan Castillo', pos: 'DM', year: 2027, elig: 1, jersey: 6, home: 'Yakima, WA', q: 0.74 },
  { name: 'Sloane Bergström', pos: 'DM', year: 2028, elig: 2, jersey: 14, home: 'Anchorage, AK', q: 0.56 },
  { name: 'Adriana Kovač', pos: 'CM', year: 2026, grad: true, elig: 0, jersey: 8, home: 'Federal Way, WA', q: 0.85 },
  { name: 'Belle Tanaka', pos: 'CM', year: 2026, grad: true, elig: 0, jersey: 10, home: 'Honolulu, HI', q: 0.78 },
  { name: 'Quinn Delacroix', pos: 'CM', year: 2027, elig: 1, jersey: 16, home: 'Missoula, MT', q: 0.62 },
  { name: 'Harper Osei', pos: 'CM', year: 2028, elig: 2, jersey: 21, home: 'Seattle, WA', q: 0.6, idp: { focus: 'Tempo control — receiving on the half-turn', trajectory: [2.0, 2.3, 2.9, 3.4, 3.9] } },
  { name: 'Faith Mwangi', pos: 'W', year: 2027, elig: 1, jersey: 7, home: 'Kirkland, WA', q: 0.76 },
  { name: 'Lucia Barros', pos: 'W', year: 2028, elig: 2, jersey: 11, home: 'Hillsboro, OR', q: 0.58, idp: { focus: '1v1 ceiling — end product after the beat', trajectory: [2.5, 2.6, 3.0, 3.1, 3.5] } },
  { name: 'Skye Donnelly', pos: 'W', year: 2029, elig: 4, jersey: 29, home: 'Bozeman, MT', q: 0.5 },
  { name: 'Remy Fontaine', pos: 'W', year: 2028, elig: 2, jersey: 13, home: 'Coeur d’Alene, ID', q: 0.54 },
  { name: 'Georgia Whitfield', pos: 'F', year: 2026, grad: true, elig: 0, jersey: 9, home: 'Olympia, WA', q: 0.82 },
  { name: 'Anika Sørensen', pos: 'F', year: 2027, elig: 1, jersey: 19, home: 'Everett, WA', q: 0.68 },
  { name: 'Delaney Cruz', pos: 'F', year: 2029, elig: 4, jersey: 24, home: 'Reno, NV', q: 0.52 },
]

// ── Recruits: 28 — 16 HS '27/'28 + 2 HS '29 (evaluation-only), 7 transfer, 3 JuCo ──
interface RecruitSpec {
  id: string; name: string; pos: Position; year: number; club: string; school?: string
  pipeline: 'HS' | 'Transfer' | 'JuCo'; tier: string; funnel: Person['funnelStage']
  gpa?: number; sat?: number; q: number; viewings: number; drift: number
  missingVideo?: boolean; preGate?: boolean
  referral: { who: string; role: string }[]
  gates?: Partial<Person['fitGates']>
}
const RECRUIT_SPECS: RecruitSpec[] = [
  // HS 2027
  { id: 'r-torres', name: 'Mia Torres', pos: 'CM', year: 2027, club: 'Crossfire Premier (ECNL)', school: 'Skyline HS', pipeline: 'HS', tier: 'blue', funnel: 'contacted', gpa: 3.8, sat: 1310, q: 0.82, viewings: 7, drift: 0.12, referral: [{ who: 'Coach Reyes', role: 'Club coach, Crossfire' }, { who: 'Luke-type volunteer (Tommy)', role: 'Saw her at EPD state camp' }] },
  { id: 'r-lindstrom', name: 'Zoe Lindstrom', pos: 'CM', year: 2027, club: 'Eastside FC (ECNL)', school: 'Issaquah HS', pipeline: 'HS', tier: 'blue', funnel: 'contacted', gpa: 3.9, sat: 1380, q: 0.76, viewings: 6, drift: 0.08, referral: [{ who: 'Alum: K. Moreno ’19', role: 'Trains with her club' }] },
  { id: 'r-park', name: 'Kenzie Park', pos: 'CM', year: 2027, club: 'Pacific FC (RL)', school: 'Gig Harbor HS', pipeline: 'HS', tier: 'green', funnel: 'watching', gpa: 3.6, q: 0.64, viewings: 4, drift: 0.15, missingVideo: true, referral: [{ who: 'Coach Han', role: 'Club coach, Pacific FC' }] },
  { id: 'r-ferro', name: 'Ava Ferro', pos: 'DM', year: 2027, club: 'Spokane Surge (ECNL-R)', school: 'Mead HS', pipeline: 'HS', tier: 'green', funnel: 'watching', gpa: 3.4, q: 0.6, viewings: 3, drift: 0.05, referral: [{ who: 'HS coach D. Alvarez', role: 'Reference call 5/20' }] },
  { id: 'r-brooks', name: 'Talia Brooks', pos: 'F', year: 2027, club: 'Crossfire Premier (ECNL)', school: 'Newport HS', pipeline: 'HS', tier: 'blue', funnel: 'offered', gpa: 3.5, sat: 1220, q: 0.84, viewings: 9, drift: 0.1, referral: [{ who: 'Coach Reyes', role: 'Club coach, Crossfire' }] },
  { id: 'r-rahim', name: 'Nadia Rahim', pos: 'CB', year: 2027, club: 'Westside United (ECNL)', school: 'Garfield HS', pipeline: 'HS', tier: 'green', funnel: 'contacted', gpa: 3.95, sat: 1420, q: 0.66, viewings: 5, drift: 0.06, referral: [{ who: 'Parent inquiry', role: 'Inbound form, screened 4/12' }] },
  { id: 'r-novak', name: 'Elle Novak', pos: 'GK', year: 2027, club: 'Rain City SC (ECNL)', school: 'Ballard HS', pipeline: 'HS', tier: 'yellow', funnel: 'watching', gpa: 3.3, q: 0.55, viewings: 2, drift: 0.02, referral: [{ who: 'GK coach network', role: 'Camp discovery, June ’25' }] },
  { id: 'r-suarez', name: 'Cam Suarez', pos: 'W', year: 2027, club: 'Boise Thorns (ECNL-R)', school: 'Timberline HS', pipeline: 'HS', tier: 'yellow', funnel: 'wideNet', gpa: 3.1, q: 0.52, viewings: 1, drift: 0, referral: [{ who: 'Inbound email', role: 'Player-direct, screened 3/30' }] },
  { id: 'r-halloran', name: 'Bri Halloran', pos: 'FB', year: 2027, club: 'Portland Rise (ECNL)', school: 'Lincoln HS', pipeline: 'HS', tier: 'yellow', funnel: 'watching', gpa: 3.7, q: 0.57, viewings: 2, drift: 0.04, referral: [{ who: 'Alum: J. Whitcomb ’21', role: 'Coaches her HS team' }] },
  { id: 'r-ivanova', name: 'Sasha Ivanova', pos: 'W', year: 2027, club: 'Vancouver Royals (ECNL)', school: 'Union HS', pipeline: 'HS', tier: 'green', funnel: 'watching', gpa: 3.5, q: 0.68, viewings: 4, drift: 0.18, missingVideo: true, referral: [{ who: 'Coach Petrov', role: 'Club coach, Royals' }] },
  // HS 2028
  { id: 'r-marsh', name: 'Devon Marsh', pos: 'CM', year: 2028, club: 'Crossfire Premier (ECNL)', school: 'Eastlake HS', pipeline: 'HS', tier: 'green', funnel: 'watching', gpa: 3.6, q: 0.62, viewings: 3, drift: 0.2, referral: [{ who: 'Coach Reyes', role: 'Club coach, Crossfire' }] },
  { id: 'r-adeyemi', name: 'Lily Adeyemi', pos: 'F', year: 2028, club: 'Seattle United (ECNL)', school: 'Roosevelt HS', pipeline: 'HS', tier: 'blue', funnel: 'contacted', gpa: 3.7, q: 0.78, viewings: 5, drift: 0.22, referral: [{ who: 'Marisol Vega', role: 'Volunteer — saw her twice at state cup' }] },
  { id: 'r-yoon', name: 'Grace Yoon', pos: 'CB', year: 2028, club: 'Eastside FC (ECNL)', school: 'Interlake HS', pipeline: 'HS', tier: 'green', funnel: 'watching', gpa: 4.0, sat: 1450, q: 0.6, viewings: 3, drift: 0.1, referral: [{ who: 'Alum: K. Moreno ’19', role: 'Trains with her club' }] },
  { id: 'r-callahan', name: 'Piper Callahan', pos: 'GK', year: 2028, club: 'Idaho Rush (ECNL-R)', school: 'Boise HS', pipeline: 'HS', tier: 'yellow', funnel: 'wideNet', gpa: 3.2, q: 0.5, viewings: 1, drift: 0.05, referral: [{ who: 'Inbound form', role: 'Player-direct, screened 5/02' }] },
  { id: 'r-duarte', name: 'Marisol Duarte', pos: 'FB', year: 2028, club: 'Yakima FC (RL)', school: 'Davis HS', pipeline: 'HS', tier: 'yellow', funnel: 'wideNet', gpa: 3.4, q: 0.53, viewings: 1, drift: 0.08, referral: [{ who: 'HS coach text', role: 'Referral 5/18' }] },
  { id: 'r-kowalski', name: 'Jenna Kowalski', pos: 'W', year: 2028, club: 'Tacoma Stars (ECNL)', school: 'Bellarmine Prep', pipeline: 'HS', tier: 'green', funnel: 'watching', gpa: 3.8, q: 0.63, viewings: 2, drift: 0.12, referral: [{ who: 'Coach Mills', role: 'Club coach, Stars' }] },
  // HS 2029 — evaluation-only (contact window opens Jun 15, 2027)
  { id: 'r-nilsen', name: 'Freya Nilsen', pos: 'CM', year: 2029, club: 'Crossfire Premier (ECNL)', school: 'Skyline HS', pipeline: 'HS', tier: 'yellow', funnel: 'wideNet', q: 0.58, viewings: 1, drift: 0.25, preGate: true, referral: [{ who: 'Coach Reyes', role: 'Club coach — “watch this one”' }] },
  { id: 'r-baptiste', name: 'Simone Baptiste', pos: 'W', year: 2029, club: 'Portland Rise (ECNL)', school: 'Grant HS', pipeline: 'HS', tier: 'yellow', funnel: 'wideNet', q: 0.55, viewings: 1, drift: 0.2, preGate: true, referral: [{ who: 'Tommy Burke', role: 'Volunteer — spotted at Rise showcase' }] },
  // Transfer portal (compressed clock)
  { id: 'r-reyes', name: 'Carmen Reyes', pos: 'CM', year: 2026, club: 'Portal — from Boise State', school: 'Boise State (2 yrs elig.)', pipeline: 'Transfer', tier: 'blue', funnel: 'offered', gpa: 3.2, q: 0.8, viewings: 3, drift: 0.05, referral: [{ who: 'Agent: R. Calloway, Elevate Mgmt', role: 'Portal outreach 6/28' }] },
  { id: 'r-whitlock', name: 'Dani Whitlock', pos: 'GK', year: 2026, club: 'Portal — from Montana', school: 'Montana (1 yr elig.)', pipeline: 'Transfer', tier: 'green', funnel: 'contacted', gpa: 3.5, q: 0.65, viewings: 2, drift: 0, referral: [{ who: 'GK coach network', role: 'Direct portal watch' }] },
  { id: 'r-fontana', name: 'Alexis Fontana', pos: 'CB', year: 2026, club: 'Portal — from Sacramento State', school: 'Sacramento State (2 yrs elig.)', pipeline: 'Transfer', tier: 'green', funnel: 'contacted', gpa: 3.0, q: 0.67, viewings: 2, drift: 0.03, referral: [{ who: 'Former staff connection', role: 'Asst. at Sac State' }] },
  { id: 'r-abara', name: 'Toni Abara', pos: 'F', year: 2026, club: 'Portal — from Fresno State', school: 'Fresno State (1 yr elig.)', pipeline: 'Transfer', tier: 'blue', funnel: 'contacted', gpa: 2.9, q: 0.79, viewings: 2, drift: 0.06, gates: { academic: gate('concern', 'Transfer-credit review pending with admissions', '2026-06-30') }, referral: [{ who: 'Agent: R. Calloway, Elevate Mgmt', role: 'Portal outreach 6/25' }] },
  { id: 'r-kobayashi', name: 'Hana Kobayashi', pos: 'W', year: 2026, club: 'Portal — from Hawai‘i', school: 'Hawai‘i (2 yrs elig.)', pipeline: 'Transfer', tier: 'yellow', funnel: 'watching', gpa: 3.4, q: 0.6, viewings: 1, drift: 0, referral: [{ who: 'Portal feed', role: 'Positional filter match' }] },
  { id: 'r-roth', name: 'Mackenzie Roth', pos: 'DM', year: 2026, club: 'Portal — from Utah Tech', school: 'Utah Tech (3 yrs elig.)', pipeline: 'Transfer', tier: 'yellow', funnel: 'watching', gpa: 3.1, q: 0.58, viewings: 1, drift: 0.02, referral: [{ who: 'Portal feed', role: 'Positional filter match' }] },
  { id: 'r-chen', name: 'Vivian Chen', pos: 'FB', year: 2026, club: 'Portal — from Portland', school: 'Portland (2 yrs elig.)', pipeline: 'Transfer', tier: 'green', funnel: 'watching', gpa: 3.6, q: 0.63, viewings: 2, drift: 0.04, referral: [{ who: 'Jesse Lin', role: 'Scouted vs. us, Oct ’25' }] },
  // JuCo
  { id: 'r-delgado', name: 'Rosa Delgado', pos: 'CM', year: 2027, club: 'Peninsula College', school: 'Peninsula College (NWAC)', pipeline: 'JuCo', tier: 'green', funnel: 'watching', gpa: 3.3, q: 0.66, viewings: 3, drift: 0.14, referral: [{ who: 'NWAC coach network', role: 'Referral from Peninsula HC' }] },
  { id: 'r-emerson', name: 'Kat Emerson', pos: 'F', year: 2027, club: 'Spokane CC', school: 'Spokane CC (NWAC)', pipeline: 'JuCo', tier: 'yellow', funnel: 'wideNet', gpa: 3.0, q: 0.56, viewings: 1, drift: 0.1, missingVideo: true, referral: [{ who: 'Inbound email', role: 'Player-direct, screened 6/02' }] },
  { id: 'r-hassan', name: 'Leila Hassan', pos: 'CB', year: 2027, club: 'Everett CC', school: 'Everett CC (NWAC)', pipeline: 'JuCo', tier: 'yellow', funnel: 'wideNet', gpa: 3.5, q: 0.54, viewings: 1, drift: 0.05, referral: [{ who: 'HS coach D. Alvarez', role: 'Referral 6/10' }] },
]

function buildPeople(): Person[] {
  const rnd = mulberry32(20260706)
  const roster: Person[] = ROSTER_SPECS.map((s, i) => ({
    id: `p-${s.name.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    name: s.name,
    lifecycle: 'rosterPlayer',
    positions: [s.pos],
    classYear: s.year,
    pipeline: undefined,
    fitGates: {
      soccer: gate('clear', 'On roster', '2026-01-15'),
      academic: gate('clear', 'In good standing', '2026-06-01'),
      financial: gate('clear', s.grad ? 'Final year' : 'Aid set through class year', '2026-01-15'),
    },
    stats: genStats(s.pos, rnd, s.q),
    templateId: tplFor(s.pos).id,
    ratingsAcrossViewings: [],
    videos: [{ id: `v-${i}`, title: `2025 season reel — #${s.jersey}`, platform: 'Veo', anchors: [] }],
    referralChain: [],
    contactable: true,
    contactableReason: 'Roster player',
    eligibilityRemaining: s.elig,
    graduating: s.grad,
    idp: s.idp,
    jersey: s.jersey,
    hometown: s.home,
    // spring-review reads, entered by a named coach — the roster-side counterpart of capture dims
    staffDims: PROGRAM.dimensions.map((d, di) => ({
      name: d,
      score: Math.max(1, Math.min(5, Math.round(s.q * 5 + (rnd() - 0.5) * 1.6))),
      by: ['st-pat', 'st-dana', 'st-jesse'][(i + di) % 3],
      on: '2026-04-15',
    })),
  }))
  const recruits: Person[] = RECRUIT_SPECS.map((s, i) => {
    const missing = !!s.missingVideo
    const videos = missing
      ? [{ id: `rv-${i}`, title: 'Highlight reel — requested', platform: 'Veo' as const, anchors: [], requestedFrom: s.club.split(' (')[0], requestedOn: '2026-05-12', nudgedOn: '2026-05-26' }]
      : [{
          id: `rv-${i}`, title: `Highlight reel · Spring 2026`, platform: (['Veo', 'Hudl', 'YouTube'] as const)[i % 3],
          anchors: [
            { t: '3:41', note: s.pos === 'CB' || s.pos === 'FB' ? 'loses her mark on corners' : 'drops between the lines to receive', authorId: 'st-dana' },
            { t: '7:15', note: 'wins it back within 5 seconds — engine moment', authorId: 'st-jesse' },
          ],
        }]
    const base: Person = {
      id: s.id,
      name: s.name,
      lifecycle: 'recruit',
      positions: [s.pos],
      classYear: s.year,
      club: s.club,
      school: s.school,
      pipeline: s.pipeline,
      tierId: s.tier,
      funnelStage: s.funnel,
      gpa: s.gpa,
      sat: s.sat,
      fitGates: {
        soccer: gate(s.q > 0.7 ? 'clear' : 'open', s.q > 0.7 ? `Seen live ${s.viewings}×, style fit confirmed` : `Seen live ${s.viewings}× — more viewings planned`, '2026-06-22'),
        academic: s.gpa ? gate(s.gpa >= 3.4 ? 'clear' : 'open', s.gpa >= 3.4 ? `GPA ${s.gpa} on file${s.sat ? `, SAT ${s.sat}` : ''}` : `GPA ${s.gpa} — transcript requested`, '2026-06-10') : gate('unknown', 'Transcript not yet requested', '2026-05-01'),
        financial: gate(s.funnel === 'offered' ? 'open' : 'unknown', s.funnel === 'offered' ? 'Aid conversation started with family' : 'Not yet discussed', '2026-06-15'),
        ...(s.gates ?? {}),
      },
      stats: genStats(s.pos, rnd, s.q),
      templateId: tplFor(s.pos).id,
      ratingsAcrossViewings: genRatings(rnd, s.viewings, s.drift),
      videos,
      referralChain: s.referral,
      contactable: !s.preGate,
      contactableReason: s.preGate
        ? 'Evaluation only — contact window opens Jun 15, 2027 (class of 2029)'
        : s.pipeline === 'Transfer' ? 'In portal — contact permitted' : 'Contactable — Jun 15 window passed',
    }
    return base
  })
  return [...roster, ...recruits]
}

// ── Events ──
export const EVENTS: RecruitingEvent[] = [
  {
    id: 'ev-showcase', name: 'Emerald City Showcase', dates: 'Jun 21–22, 2026', location: 'Starfire Sports, Tukwila WA',
    status: 'past', fields: 'Fields 1–8',
    watchlist: [
      { personId: 'r-torres', assigneeId: 'st-dana' }, { personId: 'r-lindstrom', assigneeId: 'st-dana' },
      { personId: 'r-brooks', assigneeId: 'st-jesse' }, { personId: 'r-rahim', assigneeId: 'st-tommy' },
      { personId: 'r-marsh', assigneeId: 'st-tommy' }, { personId: 'r-adeyemi', assigneeId: 'st-mari' },
    ],
  },
  {
    id: 'ev-idcamp', name: 'Cascadia Summer ID Camp', dates: 'Jul 12, 2026', location: 'CSU Soccer Complex',
    status: 'upcoming', fields: 'Fields A–B',
    watchlist: [
      { personId: 'r-park', assigneeId: 'st-mari' }, { personId: 'r-ferro', assigneeId: 'st-mari' },
      { personId: 'r-novak', assigneeId: 'st-mari' }, { personId: 'r-yoon', assigneeId: 'st-tommy' },
      { personId: 'r-kowalski', assigneeId: 'st-tommy' }, { personId: 'r-nilsen', assigneeId: 'st-tommy' },
      { personId: 'r-halloran', assigneeId: 'st-dana' }, { personId: 'r-ivanova', assigneeId: 'st-dana' },
    ],
  },
]

// ── Captures from the past showcase — 4 unconfirmed AI drafts left for the demo ──
export const CAPTURES: Capture[] = [
  { id: 'c1', personId: 'r-torres', authorId: 'st-dana', at: '2026-06-21T10:42:00', eventId: 'ev-showcase', kind: 'chips', chips: ['engine', 'vocal'], dims: [{ name: 'Motor', score: 5 }, { name: 'First touch', score: 4 }, { name: 'Compete', score: 5 }], confirmed: true, published: true },
  { id: 'c2', personId: 'r-torres', authorId: 'st-tommy', at: '2026-06-21T10:55:00', eventId: 'ev-showcase', kind: 'chips', chips: ['coachable'], dims: [{ name: 'Motor', score: 2 }, { name: 'First touch', score: 4 }, { name: 'Compete', score: 3 }], confirmed: true, published: true },
  { id: 'c3', personId: 'r-torres', authorId: 'st-dana', at: '2026-06-21T11:20:00', eventId: 'ev-showcase', kind: 'voice', draftText: 'Second half she took over the middle third — kept demanding it off the back line, um, switched the point twice under pressure. Want to see her against a pressing team. [name unclear: “Torres”/“Torrez”]', draftKind: 'voice-transcript', confirmed: false, published: true },
  { id: 'c4', personId: 'r-lindstrom', authorId: 'st-dana', at: '2026-06-21T13:05:00', eventId: 'ev-showcase', kind: 'voice', draftText: 'Quietest good player on the field. Everything clean, nothing wasted — does she raise anyone else’s level though? Check with Jesse on the breakfast test read.', draftKind: 'voice-transcript', confirmed: false, published: true },
  { id: 'c5', personId: 'r-brooks', authorId: 'st-jesse', at: '2026-06-21T14:30:00', eventId: 'ev-showcase', kind: 'chips', chips: ['gamer', 'energy raiser'], dims: [{ name: 'Motor', score: 4 }, { name: 'First touch', score: 3 }, { name: 'Compete', score: 5 }], confirmed: true, published: true },
  { id: 'c6', personId: 'r-brooks', authorId: 'st-jesse', at: '2026-06-22T09:15:00', eventId: 'ev-showcase', kind: 'voice', draftText: 'Two goals in the first twenty. First one she made out of nothing — pressed the center back into a mistake. That is the compete level we keep talking about.', draftKind: 'voice-transcript', confirmed: false, published: true },
  { id: 'c7', personId: 'r-rahim', authorId: 'st-tommy', at: '2026-06-22T10:00:00', eventId: 'ev-showcase', kind: 'photo', photoLabel: 'Notebook p.14 — Rahim + Marsh notes', draftText: 'Rahim — steps early, reads it well. Won everything in the air vs bigger 9. Talks the back line through the press. GPA girl, family sat front row.', draftKind: 'ocr', confirmed: false, published: true },
  { id: 'c8', personId: 'r-marsh', authorId: 'st-tommy', at: '2026-06-22T10:01:00', eventId: 'ev-showcase', kind: 'chips', chips: ['late bloomer'], dims: [{ name: 'Motor', score: 3 }, { name: 'First touch', score: 4 }, { name: 'Compete', score: 3 }], confirmed: true, published: true },
  { id: 'c9', personId: 'r-adeyemi', authorId: 'st-mari', at: '2026-06-22T11:40:00', eventId: 'ev-showcase', kind: 'chips', chips: ['energy raiser', 'gamer'], dims: [{ name: 'Motor', score: 4 }, { name: 'First touch', score: 4 }, { name: 'Compete', score: 4 }], confirmed: true, published: true },
]

export const CONTACT_LOGS: ContactLogEntry[] = [
  { id: 'cl1', personId: 'r-torres', authorId: 'st-dana', at: '2026-06-16T18:30:00', type: 'call', detail: 'Intro call — 22 min. Topics: academics, visit planning. Family engaged.' },
  { id: 'cl2', personId: 'r-brooks', authorId: 'st-pat', at: '2026-06-18T19:00:00', type: 'call', detail: 'Offer call — 35 min. Family will visit campus in August.' },
  { id: 'cl3', personId: 'r-reyes', authorId: 'st-dana', at: '2026-06-29T12:15:00', type: 'call', detail: 'Portal timeline call — 15 min. She wants a decision window inside two weeks.' },
  { id: 'cl4', personId: 'r-lindstrom', authorId: 'st-jesse', at: '2026-06-24T17:45:00', type: 'text', detail: 'Confirmed she will attend Cascadia ID Camp Jul 12.' },
  { id: 'cl5', personId: 'r-rahim', authorId: 'st-dana', at: '2026-06-25T16:00:00', type: 'email', detail: 'Sent academic packet + transcript request.' },
]

export const COMPLIANCE_EVENTS: ComplianceEvent[] = [
  { id: 'ce1', personId: 'r-torres', at: '2026-06-16T18:30:00', type: 'Call', detail: 'Intro call, 22 min (D. Okafor)', done: true },
  { id: 'ce2', personId: 'r-brooks', at: '2026-06-18T19:00:00', type: 'Offer', detail: 'Verbal offer extended (P. Herrera)', done: true },
  { id: 'ce3', personId: 'r-brooks', at: '2026-06-18T19:00:00', type: 'Call', detail: 'Offer call, 35 min (P. Herrera)', done: false },
  { id: 'ce4', personId: 'r-torres', at: '2026-06-21T10:42:00', type: 'Evaluation', detail: 'Live evaluation — Emerald City Showcase', done: false },
  { id: 'ce5', personId: 'r-lindstrom', at: '2026-06-21T13:05:00', type: 'Evaluation', detail: 'Live evaluation — Emerald City Showcase', done: false },
  { id: 'ce6', personId: 'r-brooks', at: '2026-06-22T09:15:00', type: 'Evaluation', detail: 'Live evaluation — Emerald City Showcase', done: false },
  { id: 'ce7', personId: 'r-reyes', at: '2026-06-29T12:15:00', type: 'Call', detail: 'Portal call, 15 min (D. Okafor)', done: false },
  { id: 'ce8', personId: 'r-rahim', at: '2026-06-25T16:00:00', type: 'Contact', detail: 'Recruiting email — academic packet (D. Okafor)', done: false },
]

export const FEED: FeedItem[] = [
  { id: 'f1', at: '2026-06-22T20:10:00', authorId: 'st-jesse', kind: 'capture', personId: 'r-brooks', text: 'Added a voice note on Talia Brooks from the showcase — “that is the compete level we keep talking about.”' },
  { id: 'f2', at: '2026-06-23T09:00:00', authorId: 'st-dana', kind: 'tier', personId: 'r-adeyemi', text: 'Moved Lily Adeyemi to Top Board (blue) after Marisol’s second live look.' },
  { id: 'f3', at: '2026-06-29T12:40:00', authorId: 'st-dana', kind: 'call', personId: 'r-reyes', text: 'Logged a call with Carmen Reyes (portal) — she wants a decision inside two weeks.' },
  { id: 'f4', at: '2026-07-01T08:30:00', authorId: 'st-pat', kind: 'system', text: 'Reminder: Cascadia ID Camp Jul 12 — coverage assignments are live on the event.' },
]

export const INBOUND: InboundItem[] = [
  { id: 'in1', fromLine: 'harlow.jensen09@gmail.com — “2028 CM interested in Cascadia State”', sourceType: 'player', extracted: { name: 'Harlow Jensen', classYear: 2028, position: 'CM', club: 'Crossfire Premier (ECNL)', videoLink: true }, screenReason: 'Mentions ECNL club + 2028 + attached highlight link', sources: ['Email body: “I play for Crossfire Premier ECNL”', 'Subject line: “2028 CM”', 'Veo link detected'], status: 'queued' },
  { id: 'in2', fromLine: 'mmarsh.family@outlook.com — “My daughter Sydney, class of 2027”', sourceType: 'parent', extracted: { name: 'Sydney Marsh', classYear: 2027, position: 'FB', club: 'WA Premier (RL)', videoLink: true }, screenReason: 'Parent inquiry + 2027 + position + video link', sources: ['Email body: “left back for WA Premier”', 'YouTube link detected'], status: 'queued' },
  { id: 'in3', fromLine: 'coach.d@raincitysc.org — “GK you should see”', sourceType: 'club coach', extracted: { name: 'Paige Whitaker', classYear: 2028, position: 'GK', club: 'Rain City SC (ECNL)', videoLink: false }, screenReason: 'Club-coach referral + named player + 2028', sources: ['Sender domain matches Rain City SC', 'Body: “our 2028 goalkeeper Paige Whitaker”'], status: 'queued' },
  { id: 'in4', fromLine: 'r.calloway@elevatemgmt.co — “Available: D1 midfielder, 2 yrs eligibility”', sourceType: 'agent', extracted: { name: 'Nia Douglas', classYear: 2026, position: 'CM', club: 'Portal — from Wyoming', videoLink: true }, screenReason: 'Agent outreach + portal entry + position match to CM need', sources: ['Sender: Elevate Mgmt (agent — provenance preserved)', 'Body: “entered the portal Tuesday”', 'Wyscout link detected'], status: 'queued' },
  { id: 'in5', fromLine: 'ofelia.ramos.soccer@gmail.com — “2027 winger, transcript attached”', sourceType: 'player', extracted: { name: 'Ofelia Ramos', classYear: 2027, position: 'W', club: 'WA Premier (ECNL)', videoLink: true }, screenReason: 'Mentions ECNL club + 2027 + transcript attached', sources: ['Attachment: transcript.pdf', 'Body: “right winger, WA Premier ECNL”'], status: 'queued' },
  { id: 'in6', fromLine: 'no-reply@eliteexposurecamps.com — “LAST CHANCE: 300+ college-bound players!”', sourceType: 'unknown', extracted: { note: 'Commercial camp promotion — no individual player' }, screenReason: 'Filed as camp blast: bulk sender + no player entities found', sources: ['Bulk mail headers', 'No name/class-year entities extracted'], status: 'queued', filedAs: 'camp-blast' },
  { id: 'in7', fromLine: 'events@nwsoccershowcase.com — “Register your roster for our July showcase”', sourceType: 'unknown', extracted: { note: 'Commercial camp promotion — no individual player' }, screenReason: 'Filed as camp blast: bulk sender + no player entities found', sources: ['Bulk mail headers', 'Duplicate template of prior filed mail'], status: 'queued', filedAs: 'camp-blast' },
  { id: 'in8', fromLine: 'mia.t.soccer@gmail.com — “M. Torres — Crossfire midfield, 2027 (new reel)”', sourceType: 'player', extracted: { name: 'M. Torres', classYear: 2027, position: 'CM', club: 'Crossfire Premier (ECNL)', videoLink: true }, screenReason: 'Mentions ECNL club + 2027 + video link', sources: ['Body: “new spring highlight reel”', 'Veo link detected'], status: 'queued', likelyDuplicateOf: 'r-torres' },
  { id: 'in9', fromLine: 'jdub2029@icloud.com — “soccer recruit”', sourceType: 'unknown', extracted: { name: 'J. (no last name found)', note: 'No class year, no club — mentions “varsity soccer” only' }, screenReason: 'Ambiguous: soccer mention but no class year / club / position extracted', sources: ['Body: “I play varsity soccer and want to play in college”', 'No entities matched'], status: 'queued' },
]

export const JOURNAL: JournalEntry[] = [
  { id: 'j1', personId: 'r-brooks', decision: 'offer', reasons: ['gamer', 'energy raiser', 'Competitive spirit'], text: 'Nine live viewings across two seasons; the compete level never dipped once. Front line loses Whitfield — Brooks is the profile we lose.', at: '2026-06-18T19:30:00', authorId: 'st-pat' },
  { id: 'j2', personId: 'r-reyes', decision: 'offer', reasons: ['engine', 'Work ethic'], text: 'Portal window math: 2 CM grads, Reyes starts day one. Two years of eligibility buys the ’28 class time to develop.', at: '2026-06-30T10:00:00', authorId: 'st-pat' },
  { id: 'j3', personId: 'r-torres', decision: 'hold', reasons: ['engine', 'vocal'], text: 'Everything says offer except the pressing-team question. One more look at ID camp, then decide.', at: '2026-06-23T09:30:00', authorId: 'st-dana' },
  { id: 'j4', personId: 'r-adeyemi', decision: 'offer', reasons: ['energy raiser', 'Competitive spirit'], text: '2028 class anchor. Marisol saw the same thing twice, independently. Early offer protects us from the fall rush.', at: '2026-07-02T14:00:00', authorId: 'st-pat' },
  { id: 'j5', personId: 'r-suarez', decision: 'pass', reasons: ['Academic risk'], text: 'Passed: academics risk (3.1, no test score, transcript slow to arrive) and family strongly prefers staying near Boise. Good player — wrong fit for our admissions picture.', at: '2026-06-08T11:00:00', authorId: 'st-dana' },
  { id: 'j6', personId: 'r-callahan', decision: 'pass', reasons: ['Style of play'], text: 'Passed: distribution doesn’t match how we build from the back — pass accuracy well under template and it showed live. Kept notes in case she develops; revisit only if GK board empties.', at: '2026-06-12T15:30:00', authorId: 'st-jesse' },
]

export const MIRROR: MirrorObservation[] = [
  { id: 'm1', text: '6 of your 8 top-tier and active-watch CMs carry the tag “engine.”', provenance: { label: 'View the 6 records', personIds: ['r-torres', 'r-lindstrom', 'r-park', 'r-marsh', 'r-reyes', 'r-delgado'] }, dismissed: false },
  { id: 'm2', text: 'All 4 offers this cycle were seen live 3+ times before the offer; both passes were seen live once.', provenance: { label: 'View the 6 decisions', personIds: ['r-brooks', 'r-reyes', 'r-adeyemi', 'r-torres', 'r-suarez', 'r-callahan'] }, dismissed: false },
  { id: 'm3', text: 'Both passes this cycle cited a non-soccer reason (academics, style-system fit) before any on-ball reason.', provenance: { label: 'View the 2 journal entries', personIds: ['r-suarez', 'r-callahan'] }, dismissed: false },
  { id: 'm4', text: 'Your last 5 tier promotions followed a capture that used the word “compete” or the Compete dimension at 4+.', provenance: { label: 'View the 5 captures', personIds: ['r-adeyemi', 'r-brooks', 'r-torres', 'r-ivanova', 'r-marsh'] }, dismissed: false },
]

export const SNAPSHOTS: WhatIfSnapshot[] = []

export function buildSeed() {
  return {
    program: PROGRAM,
    staff: STAFF,
    templates: TEMPLATES,
    people: buildPeople(),
    captures: CAPTURES,
    contactLogs: CONTACT_LOGS,
    complianceEvents: COMPLIANCE_EVENTS,
    feed: FEED,
    inbound: INBOUND,
    events: EVENTS,
    journal: JOURNAL,
    mirror: MIRROR,
    snapshots: SNAPSHOTS,
  }
}
