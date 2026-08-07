// ─────────────────────────────────────────────────────────────────────────────
// RecruitIQ shadcn reference — seed data
// Cascadia State University (women's soccer, D1) — same fictional world as
// Ideation/prototype. Demo clock fixed at Jul 22, 2026.
// Five Laws honored: no composite scores, no rankings, no fit indexes.
// ─────────────────────────────────────────────────────────────────────────────

export type Position = 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'W' | 'F'
export const POSITIONS: Position[] = ['GK', 'CB', 'FB', 'DM', 'CM', 'W', 'F']
export const POSITION_LABELS: Record<Position, string> = {
  GK: 'Goalkeeper', CB: 'Center Back', FB: 'Fullback', DM: 'Def. Mid',
  CM: 'Center Mid', W: 'Winger', F: 'Forward',
}

export type Pipeline = 'HS' | 'Transfer' | 'JuCo'
export type FunnelStage = 'watching' | 'contacted' | 'offered' | 'committed'
export const FUNNEL_LABELS: Record<FunnelStage, string> = {
  watching: 'Watching', contacted: 'Contacted', offered: 'Offered', committed: 'Committed',
}

export interface Tier { id: string; name: string; color: string; meaning: string }
export const TIERS: Tier[] = [
  { id: 'blue',   name: 'Take now',      color: '#3B82F6', meaning: 'Would accept a commit today' },
  { id: 'green',  name: 'Strong follow', color: '#10B981', meaning: 'High interest — keep building' },
  { id: 'yellow', name: 'Monitor',       color: '#F59E0B', meaning: 'Watch list — needs more viewings' },
  { id: 'red',    name: 'Hold / pass',   color: '#EF4444', meaning: 'Not pursuing right now' },
]
export const tierById = (id?: string) => TIERS.find(t => t.id === id)

export interface StaffMember {
  id: string; name: string; initials: string; role: string; color: string
}
export const STAFF: StaffMember[] = [
  { id: 'dana',  name: 'Dana Whitfield', initials: 'DW', role: 'Assoc. Head (Recruiting Lead)', color: '#4F46E5' },
  { id: 'mara',  name: 'Mara Chen',      initials: 'MC', role: 'Head Coach',                    color: '#0E7490' },
  { id: 'priya', name: 'Priya Nair',     initials: 'PN', role: 'Assistant Coach',               color: '#B45309' },
  { id: 'luke',  name: 'Luke Ortega',    initials: 'LO', role: 'Volunteer (capture-only)',      color: '#6D28D9' },
]
export const staffById = (id: string) => STAFF.find(s => s.id === id)!

export type MetricKey = 'duelsWonPct' | 'passAccPct' | 'progPassesP90' | 'interceptionsP90' | 'keyPassesP90' | 'xAP90'
export const METRIC_LABELS: Record<MetricKey, string> = {
  duelsWonPct: 'Duels won %',
  passAccPct: 'Pass accuracy %',
  progPassesP90: 'Progressive passes /90',
  interceptionsP90: 'Interceptions /90',
  keyPassesP90: 'Key passes /90',
  xAP90: 'xA /90',
}
export const METRIC_MAX: Record<MetricKey, number> = {
  duelsWonPct: 100, passAccPct: 100, progPassesP90: 12, interceptionsP90: 10, keyPassesP90: 4, xAP90: 0.6,
}

// Named benchmark template — provenance for every bar (Law 1: reference the
// program built, never a machine judgment).
export interface Benchmark {
  id: string; name: string; source: string
  values: Partial<Record<MetricKey, number>>
  weights: Partial<Record<MetricKey, number>> // coach-set 1–5, shown in the open
}
export const BENCHMARKS: Record<string, Benchmark> = {
  cm: {
    id: 'cm', name: 'Cascade Conf. First-Team CM template', source: 'Built by staff from 2024–25 all-conference exports',
    values: { duelsWonPct: 58, passAccPct: 84, progPassesP90: 7.2, interceptionsP90: 5.1, keyPassesP90: 1.4, xAP90: 0.18 },
    weights: { duelsWonPct: 4, passAccPct: 3, progPassesP90: 5, interceptionsP90: 3, keyPassesP90: 2, xAP90: 2 },
  },
  w: {
    id: 'w', name: 'Cascade Conf. First-Team Winger template', source: 'Built by staff from 2024–25 all-conference exports',
    values: { duelsWonPct: 52, passAccPct: 76, progPassesP90: 4.8, interceptionsP90: 2.2, keyPassesP90: 2.6, xAP90: 0.34 },
    weights: { duelsWonPct: 3, passAccPct: 2, progPassesP90: 4, interceptionsP90: 1, keyPassesP90: 5, xAP90: 5 },
  },
  cb: {
    id: 'cb', name: 'Cascade Conf. First-Team CB template', source: 'Built by staff from 2024–25 all-conference exports',
    values: { duelsWonPct: 66, passAccPct: 88, progPassesP90: 5.4, interceptionsP90: 7.3, keyPassesP90: 0.4, xAP90: 0.04 },
    weights: { duelsWonPct: 5, passAccPct: 4, progPassesP90: 3, interceptionsP90: 5, keyPassesP90: 1, xAP90: 1 },
  },
}

export type FitStatus = 'clear' | 'open' | 'concern' | 'unknown'
export interface FitGates { soccer: FitStatus; academic: FitStatus; financial: FitStatus }

export type NoteKind = 'voice' | 'text' | 'sideline' | 'call' | 'video-anchor'
export interface Note {
  id: string
  authorId: string
  at: string            // display date
  context: string       // where it came from — provenance (Law 1)
  kind: NoteKind
  chips?: string[]      // program vocabulary tags
  text: string
  draft?: boolean       // AI transcript not yet confirmed by a human
  private?: boolean     // Law 5: shared by default, private by intent
}

export interface DimRead { dim: string; score: number; by: string; on: string }

export interface Player {
  id: string
  name: string
  position: Position
  classYear: number          // roster: grad year · recruits: HS class / transfer arrival
  jersey?: number
  eligibilityLeft: number    // seasons remaining incl. 2026
  graduating: boolean
  hometown: string
  dimReads?: DimRead[]       // spring-review reads (coach-entered)
}

export interface Recruit {
  id: string
  name: string
  position: Position
  classYear: number
  pipeline: Pipeline
  club: string
  tierId: string
  stage: FunnelStage
  gpa?: number
  fitGates: FitGates
  benchmarkId: string
  stats: Partial<Record<MetricKey, number>>
  ratings: number[]          // 1–5 staff rating per viewing (attributed trend)
  viewings: number
  lastContact?: string
  contactable: boolean
  contactNote: string
  referral: string           // who vouched — first-class provenance
  notes: Note[]
  dimReads: DimRead[]        // from live captures — never machine-generated
  eligYears: number          // seasons they'd bring
  arrives: number            // first season on campus
}

// ── Current roster (18) ──────────────────────────────────────────────────────
export const ROSTER: Player[] = [
  { id: 'r1',  name: 'Tess Okafor',      position: 'GK', classYear: 2027, jersey: 1,  eligibilityLeft: 2, graduating: false, hometown: 'Tacoma, WA' },
  { id: 'r2',  name: 'June Callahan',    position: 'GK', classYear: 2029, jersey: 31, eligibilityLeft: 4, graduating: false, hometown: 'Boise, ID' },
  { id: 'r3',  name: 'Marisol Vega',     position: 'CB', classYear: 2026, jersey: 4,  eligibilityLeft: 1, graduating: true,  hometown: 'Yakima, WA',
    dimReads: [{ dim: 'Compete', score: 5, by: 'mara', on: 'Apr 2026' }] },
  { id: 'r4',  name: 'Anneke Visser',    position: 'CB', classYear: 2027, jersey: 5,  eligibilityLeft: 2, graduating: false, hometown: 'Portland, OR' },
  { id: 'r5',  name: 'Dominique Rhodes', position: 'CB', classYear: 2028, jersey: 15, eligibilityLeft: 3, graduating: false, hometown: 'Renton, WA' },
  { id: 'r6',  name: 'Skye Tanaka',      position: 'FB', classYear: 2026, jersey: 2,  eligibilityLeft: 1, graduating: true,  hometown: 'Bellevue, WA' },
  { id: 'r7',  name: 'Carmen Ibarra',    position: 'FB', classYear: 2027, jersey: 3,  eligibilityLeft: 2, graduating: false, hometown: 'Pasco, WA' },
  { id: 'r8',  name: 'Lena Marsh',       position: 'FB', classYear: 2029, jersey: 22, eligibilityLeft: 4, graduating: false, hometown: 'Eugene, OR' },
  { id: 'r9',  name: 'Noa Lindqvist',    position: 'DM', classYear: 2026, jersey: 6,  eligibilityLeft: 1, graduating: true,  hometown: 'Spokane, WA',
    dimReads: [{ dim: 'Motor', score: 4, by: 'dana', on: 'Apr 2026' }] },
  { id: 'r10', name: 'Priya Raman',      position: 'DM', classYear: 2028, jersey: 14, eligibilityLeft: 3, graduating: false, hometown: 'Redmond, WA' },
  { id: 'r11', name: 'Georgia Whitfield',position: 'CM', classYear: 2026, jersey: 8,  eligibilityLeft: 1, graduating: true,  hometown: 'Olympia, WA',
    dimReads: [{ dim: 'First touch', score: 5, by: 'mara', on: 'Apr 2026' }, { dim: 'Motor', score: 4, by: 'priya', on: 'Apr 2026' }] },
  { id: 'r12', name: 'Sana Yoshida',     position: 'CM', classYear: 2027, jersey: 10, eligibilityLeft: 2, graduating: false, hometown: 'Seattle, WA' },
  { id: 'r13', name: 'Erin Dooley',      position: 'CM', classYear: 2029, jersey: 18, eligibilityLeft: 4, graduating: false, hometown: 'Missoula, MT' },
  { id: 'r14', name: 'Zora Bektaš',      position: 'W',  classYear: 2026, jersey: 7,  eligibilityLeft: 1, graduating: true,  hometown: 'Kent, WA' },
  { id: 'r15', name: 'Callie Runningwater', position: 'W', classYear: 2028, jersey: 11, eligibilityLeft: 3, graduating: false, hometown: 'Browning, MT' },
  { id: 'r16', name: 'Maya Osei',        position: 'W',  classYear: 2029, jersey: 20, eligibilityLeft: 4, graduating: false, hometown: 'Federal Way, WA' },
  { id: 'r17', name: 'Bridget Halloran', position: 'F',  classYear: 2026, jersey: 9,  eligibilityLeft: 1, graduating: true,  hometown: 'Anchorage, AK' },
  { id: 'r18', name: 'Ingrid Sole',      position: 'F',  classYear: 2027, jersey: 13, eligibilityLeft: 2, graduating: false, hometown: 'Vancouver, WA' },
]

// ── Recruiting board (14) ────────────────────────────────────────────────────
export const RECRUITS: Recruit[] = [
  {
    id: 'p1', name: 'Rosa Delgado', position: 'CM', classYear: 2027, pipeline: 'HS',
    club: 'Rainier Valley SC ECNL', tierId: 'blue', stage: 'offered', gpa: 3.8,
    fitGates: { soccer: 'clear', academic: 'clear', financial: 'open' },
    benchmarkId: 'cm',
    stats: { duelsWonPct: 61, passAccPct: 86, progPassesP90: 8.1, interceptionsP90: 4.2, keyPassesP90: 1.7, xAP90: 0.21 },
    ratings: [3, 4, 4, 5, 5], viewings: 5, lastContact: 'Jul 18',
    contactable: true, contactNote: 'Contact open (Jun 15, 2025 passed)',
    referral: 'Club coach M. Duarte → Dana (Apr 2026)',
    eligYears: 4, arrives: 2027,
    dimReads: [
      { dim: 'Motor', score: 5, by: 'dana', on: 'Jul 12' },
      { dim: 'Motor', score: 3, by: 'priya', on: 'Jun 28' },
      { dim: 'First touch', score: 4, by: 'dana', on: 'Jul 12' },
      { dim: 'Compete', score: 5, by: 'mara', on: 'Jul 12' },
    ],
    notes: [
      { id: 'n1', authorId: 'dana', at: 'Jul 18, 2026', context: 'Call · 22 min', kind: 'call',
        chips: ['family call', 'timeline'], text: 'Mom asked about aid timeline and housing. Rosa wants to visit in September with her club coach. No other campus visits booked yet — Stanton U reached out but nothing scheduled.' },
      { id: 'n2', authorId: 'dana', at: 'Jul 12, 2026', context: 'ECNL Regional League — Field 6', kind: 'sideline',
        chips: ['scans early', 'plays through pressure', 'leader'], text: 'Organized the midfield the whole half — constantly talking, pointing teammates into position. Took the 6 role when their DM went down and didn\'t look out of place.' },
      { id: 'n3', authorId: 'priya', at: 'Jun 28, 2026', context: 'Crossfire Showcase — Game 2', kind: 'voice', draft: true,
        chips: ['work rate?'], text: 'Transcript (unconfirmed): "…didn\'t track back on the counter twice in the second half, want to see if that\'s fatigue or habit — worth another look at full fitness."' },
      { id: 'n4', authorId: 'mara', at: 'Jul 12, 2026', context: 'ECNL Regional League — Field 6', kind: 'text',
        chips: ['breakfast test ✓'], text: 'Talked with her after the match — thoughtful, asks questions back. The kind of kid you don\'t mind having breakfast with on a road trip.' },
      { id: 'n5', authorId: 'luke', at: 'Jun 14, 2026', context: 'Video — Veo full match vs Spokane Surge', kind: 'video-anchor',
        chips: ['set pieces'], text: '3:41 — takes the corner short instead of serving; 61:20 — switches play 40 yards on her weak foot.' },
    ],
  },
  {
    id: 'p2', name: 'Kiara Boateng', position: 'CM', classYear: 2026, pipeline: 'Transfer',
    club: 'Mesa Verde State (Big Sky)', tierId: 'blue', stage: 'contacted', gpa: 3.4,
    fitGates: { soccer: 'clear', academic: 'open', financial: 'concern' },
    benchmarkId: 'cm',
    stats: { duelsWonPct: 64, passAccPct: 81, progPassesP90: 6.8, interceptionsP90: 6.0, keyPassesP90: 1.1, xAP90: 0.12 },
    ratings: [4, 4], viewings: 2, lastContact: 'Jul 20',
    contactable: true, contactNote: 'In portal since Jul 8 — portal clock running',
    referral: 'Former asst. at Mesa Verde (Dana\'s network)',
    eligYears: 2, arrives: 2026,
    dimReads: [
      { dim: 'Compete', score: 5, by: 'dana', on: 'Jul 15' },
      { dim: 'Motor', score: 4, by: 'dana', on: 'Jul 15' },
    ],
    notes: [
      { id: 'n6', authorId: 'dana', at: 'Jul 20, 2026', context: 'Call · 35 min', kind: 'call',
        chips: ['portal', 'aid gap'], text: 'Wants to stay west. Two years eligibility. Aid ask is above what we have left this cycle — needs a conversation with Mara before we go further. Timeline: she wants to decide by Aug 1.' },
      { id: 'n7', authorId: 'dana', at: 'Jul 15, 2026', context: 'Video — Wyscout, 3 matches', kind: 'video-anchor',
        chips: ['ball-winner', 'ready now'], text: 'Wins everything in the middle third. 12:04 vs NAU — recovers, turns, plays forward in one motion. Would start for us today at the 8.' },
    ],
  },
  {
    id: 'p3', name: 'Siobhan McAllister', position: 'CM', classYear: 2028, pipeline: 'HS',
    club: 'Emerald City FC ECNL', tierId: 'green', stage: 'contacted', gpa: 4.0,
    fitGates: { soccer: 'open', academic: 'clear', financial: 'clear' },
    benchmarkId: 'cm',
    stats: { duelsWonPct: 49, passAccPct: 88, progPassesP90: 6.1, interceptionsP90: 3.0, keyPassesP90: 1.9, xAP90: 0.24 },
    ratings: [3, 4, 3], viewings: 3, lastContact: 'Jul 10',
    contactable: true, contactNote: 'Contact open (Jun 15, 2026 passed)',
    referral: 'Inbound — counselor email, screened in by Dana',
    eligYears: 4, arrives: 2028,
    dimReads: [
      { dim: 'First touch', score: 5, by: 'priya', on: 'Jul 2' },
      { dim: 'Compete', score: 3, by: 'dana', on: 'Jun 20' },
    ],
    notes: [
      { id: 'n8', authorId: 'priya', at: 'Jul 2, 2026', context: 'ECNL Northwest — Game 1', kind: 'sideline',
        chips: ['elite technician', 'quiet'], text: 'Cleanest first touch on the field, both feet. But drifts out of games when her team is chasing — want to see her against a physical press.' },
    ],
  },
  {
    id: 'p4', name: 'Femi Adeyemi', position: 'W', classYear: 2027, pipeline: 'HS',
    club: 'Portland Thorns Academy', tierId: 'blue', stage: 'committed', gpa: 3.6,
    fitGates: { soccer: 'clear', academic: 'clear', financial: 'clear' },
    benchmarkId: 'w',
    stats: { duelsWonPct: 55, passAccPct: 74, progPassesP90: 5.9, interceptionsP90: 1.8, keyPassesP90: 3.1, xAP90: 0.41 },
    ratings: [4, 5, 5, 5], viewings: 4, lastContact: 'Jul 21',
    contactable: true, contactNote: 'Verbal commit — May 30, 2026',
    referral: 'Thorns Academy director → Mara',
    eligYears: 4, arrives: 2027,
    dimReads: [
      { dim: 'Motor', score: 5, by: 'mara', on: 'May 22' },
      { dim: 'First touch', score: 4, by: 'dana', on: 'May 22' },
    ],
    notes: [
      { id: 'n9', authorId: 'mara', at: 'Jul 21, 2026', context: 'Text logged', kind: 'text',
        chips: ['committed'], text: 'Checked in — she\'s running captain\'s practices with her academy team this summer. Locked in for 2027.' },
    ],
  },
  {
    id: 'p5', name: 'Harlow Jensen', position: 'W', classYear: 2027, pipeline: 'HS',
    club: 'Spokane Surge ECNL-RL', tierId: 'yellow', stage: 'watching', gpa: 3.2,
    fitGates: { soccer: 'open', academic: 'open', financial: 'unknown' },
    benchmarkId: 'w',
    stats: { duelsWonPct: 47, passAccPct: 71, progPassesP90: 4.1, interceptionsP90: 1.5, keyPassesP90: 2.2, xAP90: 0.28 },
    ratings: [3, 3], viewings: 2, lastContact: undefined,
    contactable: true, contactNote: 'Contact open — no direct contact yet',
    referral: 'Luke flagged at Crossfire Showcase',
    eligYears: 4, arrives: 2027,
    dimReads: [{ dim: 'Motor', score: 4, by: 'luke', on: 'Jun 27' }],
    notes: [
      { id: 'n10', authorId: 'luke', at: 'Jun 27, 2026', context: 'Crossfire Showcase — Game 3', kind: 'sideline',
        chips: ['raw', 'pace'], text: 'Fastest player on the field, wins her matchup every time on the dribble. End product inconsistent — two great chances created, two wasted.' },
    ],
  },
  {
    id: 'p6', name: 'Amaya Cruz', position: 'F', classYear: 2026, pipeline: 'Transfer',
    club: 'Coastal Carolina (Sun Belt)', tierId: 'green', stage: 'contacted', gpa: 3.1,
    fitGates: { soccer: 'clear', academic: 'open', financial: 'open' },
    benchmarkId: 'w',
    stats: { duelsWonPct: 51, passAccPct: 69, progPassesP90: 3.8, interceptionsP90: 1.2, keyPassesP90: 2.4, xAP90: 0.38 },
    ratings: [4, 3, 4], viewings: 3, lastContact: 'Jul 16',
    contactable: true, contactNote: 'In portal since Jun 30',
    referral: 'Agent inquiry — verified by Dana',
    eligYears: 1, arrives: 2026,
    dimReads: [{ dim: 'Compete', score: 4, by: 'dana', on: 'Jul 9' }],
    notes: [
      { id: 'n11', authorId: 'dana', at: 'Jul 16, 2026', context: 'Call · 18 min', kind: 'call',
        chips: ['one year', 'goals'], text: '11 goals last season. One year of eligibility — this is a bridge-year move while Bridget\'s replacement develops. She understands the role.' },
    ],
  },
  {
    id: 'p7', name: 'Noor Haddad', position: 'CB', classYear: 2027, pipeline: 'HS',
    club: 'Eastside United ECNL', tierId: 'green', stage: 'offered', gpa: 3.9,
    fitGates: { soccer: 'clear', academic: 'clear', financial: 'open' },
    benchmarkId: 'cb',
    stats: { duelsWonPct: 63, passAccPct: 84, progPassesP90: 4.9, interceptionsP90: 6.4, keyPassesP90: 0.3, xAP90: 0.03 },
    ratings: [4, 4, 5], viewings: 3, lastContact: 'Jul 14',
    contactable: true, contactNote: 'Contact open (Jun 15, 2025 passed)',
    referral: 'Whitney camp discovery (Jun 2025)',
    eligYears: 4, arrives: 2027,
    dimReads: [
      { dim: 'Compete', score: 5, by: 'mara', on: 'Jul 5' },
      { dim: 'First touch', score: 3, by: 'priya', on: 'Jul 5' },
    ],
    notes: [
      { id: 'n12', authorId: 'mara', at: 'Jul 5, 2026', context: 'ID Camp — session 2', kind: 'text',
        chips: ['aerial', 'organizer'], text: 'Won every header in the box session. Talks like a senior. Reads the game a step early — steps into passing lanes before the ball is released.' },
      { id: 'n13', authorId: 'priya', at: 'Jul 5, 2026', context: 'ID Camp — session 2', kind: 'voice', draft: true,
        text: 'Transcript (unconfirmed): "…first touch under pressure got loose twice in the rondo, fine on the bigger field though."' },
    ],
  },
  {
    id: 'p8', name: 'Greta Lindholm', position: 'CB', classYear: 2026, pipeline: 'JuCo',
    club: 'Walla Walla CC (NWAC)', tierId: 'yellow', stage: 'watching', gpa: 3.5,
    fitGates: { soccer: 'open', academic: 'clear', financial: 'unknown' },
    benchmarkId: 'cb',
    stats: { duelsWonPct: 68, passAccPct: 78, progPassesP90: 3.6, interceptionsP90: 7.9, keyPassesP90: 0.2, xAP90: 0.02 },
    ratings: [3], viewings: 1, lastContact: undefined,
    contactable: true, contactNote: 'NWAC transfer — contact open',
    referral: 'NWAC all-region list → Priya',
    eligYears: 2, arrives: 2026,
    dimReads: [],
    notes: [
      { id: 'n14', authorId: 'priya', at: 'Jun 19, 2026', context: 'Video — NWAC semifinal', kind: 'video-anchor',
        chips: ['physical'], text: 'Dominant in the air, needs one live viewing. 22:10 — steps out and wins it clean at midfield.' },
    ],
  },
  {
    id: 'p9', name: 'Tilly Wren', position: 'GK', classYear: 2027, pipeline: 'HS',
    club: 'Boise Nationals ECNL-RL', tierId: 'green', stage: 'contacted', gpa: 3.7,
    fitGates: { soccer: 'clear', academic: 'clear', financial: 'clear' },
    benchmarkId: 'cb',
    stats: {},
    ratings: [4, 4], viewings: 2, lastContact: 'Jul 11',
    contactable: true, contactNote: 'Contact open (Jun 15, 2025 passed)',
    referral: 'GK coach network — B. Marsh',
    eligYears: 4, arrives: 2027,
    dimReads: [{ dim: 'Compete', score: 4, by: 'dana', on: 'Jun 22' }],
    notes: [
      { id: 'n15', authorId: 'dana', at: 'Jul 11, 2026', context: 'Call · 15 min', kind: 'call',
        chips: ['depth plan'], text: 'Tess graduates 2027 — Tilly would overlap one season behind June. She knows the plan and likes the development runway. Parents want an unofficial visit before fall.' },
    ],
  },
  {
    id: 'p10', name: 'Beatriz Fonseca', position: 'FB', classYear: 2027, pipeline: 'HS',
    club: 'Rainier Valley SC ECNL', tierId: 'blue', stage: 'offered', gpa: 3.5,
    fitGates: { soccer: 'clear', academic: 'clear', financial: 'concern' },
    benchmarkId: 'w',
    stats: { duelsWonPct: 54, passAccPct: 79, progPassesP90: 5.2, interceptionsP90: 3.4, keyPassesP90: 1.6, xAP90: 0.19 },
    ratings: [4, 5, 4, 5], viewings: 4, lastContact: 'Jul 19',
    contactable: true, contactNote: 'Contact open (Jun 15, 2025 passed)',
    referral: 'Same club as Rosa Delgado — M. Duarte',
    eligYears: 4, arrives: 2027,
    dimReads: [
      { dim: 'Motor', score: 5, by: 'dana', on: 'Jul 12' },
      { dim: 'Motor', score: 5, by: 'priya', on: 'Jun 28' },
    ],
    notes: [
      { id: 'n16', authorId: 'dana', at: 'Jul 19, 2026', context: 'Call · 28 min', kind: 'call',
        chips: ['aid gap', 'Skye replacement'], text: 'She\'s our Skye replacement — same profile, overlapping season to learn the system. Aid conversation is the blocker: family needs more than the current package. Flagged for Mara.' },
    ],
  },
  {
    id: 'p11', name: 'Oksana Melnyk', position: 'DM', classYear: 2026, pipeline: 'Transfer',
    club: 'Fresno Pacific (PacWest)', tierId: 'green', stage: 'watching', gpa: 3.3,
    fitGates: { soccer: 'open', academic: 'open', financial: 'unknown' },
    benchmarkId: 'cm',
    stats: { duelsWonPct: 60, passAccPct: 83, progPassesP90: 5.5, interceptionsP90: 6.8, keyPassesP90: 0.8, xAP90: 0.07 },
    ratings: [4], viewings: 1, lastContact: undefined,
    contactable: true, contactNote: 'In portal since Jul 15',
    referral: 'Portal feed — position filter match',
    eligYears: 2, arrives: 2026,
    dimReads: [],
    notes: [
      { id: 'n17', authorId: 'dana', at: 'Jul 17, 2026', context: 'Video — 2 matches', kind: 'video-anchor',
        chips: ['Noa replacement?'], text: 'Screens well, positionally clean. Noa graduates next spring — Oksana could bridge while Priya R. develops. Need a live look and a call this week.' },
    ],
  },
  {
    id: 'p12', name: 'Daniela Reyes', position: 'F', classYear: 2028, pipeline: 'HS',
    club: 'Emerald City FC ECNL', tierId: 'yellow', stage: 'watching', gpa: 3.8,
    fitGates: { soccer: 'open', academic: 'clear', financial: 'unknown' },
    benchmarkId: 'w',
    stats: { duelsWonPct: 45, passAccPct: 68, progPassesP90: 3.2, interceptionsP90: 0.9, keyPassesP90: 1.8, xAP90: 0.31 },
    ratings: [3, 4], viewings: 2, lastContact: 'Jul 8',
    contactable: true, contactNote: 'Contact open (Jun 15, 2026 passed)',
    referral: 'Same club as Siobhan — seen on same trips',
    eligYears: 4, arrives: 2028,
    dimReads: [{ dim: 'Motor', score: 3, by: 'priya', on: 'Jul 2' }],
    notes: [
      { id: 'n18', authorId: 'priya', at: 'Jul 2, 2026', context: 'ECNL Northwest — Game 1', kind: 'sideline',
        chips: ['instincts', 'frame'], text: 'Pure box striker instincts — both goals were one-touch finishes. Physically behind her age group; 2028 timeline gives her room to grow into it.' },
    ],
  },
  {
    id: 'p13', name: 'Freya Nilsen', position: 'W', classYear: 2029, pipeline: 'HS',
    club: 'Whatcom Rangers ECNL-RL', tierId: 'yellow', stage: 'watching', gpa: 3.9,
    fitGates: { soccer: 'unknown', academic: 'clear', financial: 'unknown' },
    benchmarkId: 'w',
    stats: {},
    ratings: [4], viewings: 1, lastContact: undefined,
    contactable: false, contactNote: '⚠ Evaluation only — contact opens Jun 15, 2027',
    referral: 'Luke flagged at state cup',
    eligYears: 4, arrives: 2029,
    dimReads: [],
    notes: [
      { id: 'n19', authorId: 'luke', at: 'Jun 8, 2026', context: 'WA State Cup — U15 final', kind: 'sideline',
        chips: ['2029', 'early flag'], text: 'Youngest player on the field and the most dangerous. File and revisit fall season — no contact until Jun 15 next year.' },
    ],
  },
  {
    id: 'p14', name: 'Jade Toala', position: 'FB', classYear: 2028, pipeline: 'HS',
    club: 'Tacoma Stars ECNL', tierId: 'green', stage: 'contacted', gpa: 3.6,
    fitGates: { soccer: 'clear', academic: 'clear', financial: 'open' },
    benchmarkId: 'w',
    stats: { duelsWonPct: 52, passAccPct: 77, progPassesP90: 4.4, interceptionsP90: 3.9, keyPassesP90: 1.2, xAP90: 0.14 },
    ratings: [4, 4, 3], viewings: 3, lastContact: 'Jul 6',
    contactable: true, contactNote: 'Contact open (Jun 15, 2026 passed)',
    referral: 'Tacoma Stars coach → Priya',
    eligYears: 4, arrives: 2028,
    dimReads: [
      { dim: 'Motor', score: 4, by: 'priya', on: 'Jun 30' },
      { dim: 'Compete', score: 4, by: 'luke', on: 'Jun 27' },
    ],
    notes: [
      { id: 'n20', authorId: 'priya', at: 'Jun 30, 2026', context: 'Crossfire Showcase — Game 4', kind: 'sideline',
        chips: ['two-footed', 'overlaps'], text: 'Comfortable both sides — could cover Carmen or Lena\'s spot. Gets forward relentlessly; recovery speed covers her mistakes.' },
    ],
  },
]

export const recruitById = (id: string) => RECRUITS.find(r => r.id === id)

// Seasons shown on runway visualizations
export const SEASONS = [2026, 2027, 2028, 2029] as const

export const FIT_LABEL: Record<FitStatus, string> = {
  clear: 'Clear', open: 'In progress', concern: 'Concern', unknown: 'Not started',
}

export const NOW_LABEL = 'Jul 22, 2026'

// ── Pitch geometry (1-4-3-3), shared by the workbench and mini pitches ──────
export const PITCH_SPOTS: { pos: Position; x: number; y: number; label: string }[] = [
  { pos: 'GK', x: 50, y: 90, label: 'GK' },
  { pos: 'CB', x: 38, y: 74, label: 'CB' },
  { pos: 'CB', x: 62, y: 74, label: 'CB' },
  { pos: 'FB', x: 14, y: 68, label: 'LB' },
  { pos: 'FB', x: 86, y: 68, label: 'RB' },
  { pos: 'DM', x: 50, y: 56, label: 'DM' },
  { pos: 'CM', x: 34, y: 42, label: 'CM' },
  { pos: 'CM', x: 66, y: 42, label: 'CM' },
  { pos: 'W', x: 15, y: 24, label: 'LW' },
  { pos: 'W', x: 85, y: 24, label: 'RW' },
  { pos: 'F', x: 50, y: 14, label: 'CF' },
]

// ── Program vocabulary traits — coach-entered at spring reviews / captures. ──
// This is the raw material the matchmaking mirror reflects (Law 1: it
// retrieves and organizes the staff's own words; it never invents a score).
export const TRAITS: Record<string, { strengths: string[]; character: string[] }> = {
  // recruits
  p1:  { strengths: ['organizer', 'press-resistant', 'engine'],   character: ['leader', 'vocal', 'coachable'] },
  p2:  { strengths: ['ball-winner', 'engine', 'ready-now'],       character: ['competitor', 'driven'] },
  p3:  { strengths: ['technician', 'press-resistant', 'vision'],  character: ['quiet', 'composed'] },
  p4:  { strengths: ['pace', 'finisher', 'engine'],               character: ['leader', 'driven'] },
  p5:  { strengths: ['pace', '1v1'],                              character: ['raw', 'competitor'] },
  p6:  { strengths: ['finisher', 'movement'],                     character: ['professional', 'composed'] },
  p7:  { strengths: ['aerial', 'organizer', 'reads-early'],       character: ['leader', 'vocal'] },
  p8:  { strengths: ['aerial', 'physical'],                       character: ['competitor'] },
  p9:  { strengths: ['shot-stopper', 'distribution'],             character: ['composed', 'coachable'] },
  p10: { strengths: ['engine', 'overlaps', 'two-footed'],         character: ['competitor', 'vocal'] },
  p11: { strengths: ['screening', 'positioning'],                 character: ['composed', 'quiet'] },
  p12: { strengths: ['finisher', 'movement'],                     character: ['raw', 'coachable'] },
  p13: { strengths: ['pace', '1v1'],                              character: ['raw', 'fearless'] },
  p14: { strengths: ['two-footed', 'overlaps', 'engine'],         character: ['competitor', 'coachable'] },
  // graduating roster players (spring-review vocabulary — powers replacement matching)
  r3:  { strengths: ['aerial', 'organizer'],                      character: ['leader', 'vocal'] },
  r6:  { strengths: ['engine', 'overlaps', 'two-footed'],         character: ['competitor'] },
  r9:  { strengths: ['screening', 'positioning'],                 character: ['quiet', 'composed'] },
  r11: { strengths: ['organizer', 'press-resistant', 'vision'],   character: ['leader', 'coachable'] },
  r14: { strengths: ['pace', '1v1'],                              character: ['competitor', 'fearless'] },
  r17: { strengths: ['finisher', 'movement', 'physical'],         character: ['leader', 'driven'] },
}
export const traitsOf = (id: string) => TRAITS[id] ?? { strengths: [], character: [] }
export const rosterById = (id: string) => ROSTER.find(p => p.id === id)

// ── Program-level numbers (coach-entered, shown on the stat tiles) ──────────
export const PROGRAM = {
  scholarshipsUsed: 12.4,
  scholarshipCap: 14,
  teamGPA: 3.52,
  season: '2026 season',
}

// ── Quantitative layer — Wyscout-style export columns per player ────────────
// (Status · Matches · Minutes · Goals · xG · Country · Foot · GPA · Major)
export type Foot = 'Right' | 'Left' | 'Both'
export interface Quant {
  matches: number
  minutes: number
  goals: number
  xg: number          // season total
  country: string
  foot: Foot
  major?: string
}
export const QUANT: Record<string, Quant> = {
  p1:  { matches: 24, minutes: 2065, goals: 5,  xg: 4.1, country: 'USA',       foot: 'Right', major: 'Undecided' },
  p2:  { matches: 19, minutes: 1710, goals: 3,  xg: 2.4, country: 'USA',       foot: 'Right', major: 'Kinesiology' },
  p3:  { matches: 21, minutes: 1500, goals: 2,  xg: 1.8, country: 'USA',       foot: 'Left',  major: 'Biology' },
  p4:  { matches: 22, minutes: 1830, goals: 11, xg: 8.9, country: 'USA',       foot: 'Right', major: 'Business' },
  p5:  { matches: 16, minutes: 1120, goals: 6,  xg: 6.8, country: 'USA',       foot: 'Right', major: 'Undecided' },
  p6:  { matches: 20, minutes: 1650, goals: 11, xg: 9.4, country: 'USA',       foot: 'Right', major: 'Communications' },
  p7:  { matches: 23, minutes: 2070, goals: 2,  xg: 1.1, country: 'USA',       foot: 'Right', major: 'Pre-med' },
  p8:  { matches: 18, minutes: 1620, goals: 1,  xg: 0.7, country: 'Sweden',    foot: 'Right', major: 'Undecided' },
  p9:  { matches: 20, minutes: 1800, goals: 0,  xg: 0,   country: 'USA',       foot: 'Right', major: 'Psychology' },
  p10: { matches: 25, minutes: 2230, goals: 3,  xg: 2.2, country: 'USA',       foot: 'Left',  major: 'Undecided' },
  p11: { matches: 17, minutes: 1440, goals: 1,  xg: 0.5, country: 'Ukraine',   foot: 'Right', major: 'Economics' },
  p12: { matches: 19, minutes: 1180, goals: 9,  xg: 7.2, country: 'USA',       foot: 'Right', major: 'Undecided' },
  p13: { matches: 12, minutes: 760,  goals: 5,  xg: 3.9, country: 'USA',       foot: 'Left',  major: '—' },
  p14: { matches: 20, minutes: 1710, goals: 2,  xg: 1.6, country: 'USA',       foot: 'Both',  major: 'Engineering' },
}
export const quantOf = (id: string) => QUANT[id]

// Portal/commitment status in sheet language (the "Contract" column analogue)
export function statusOf(r: Recruit): { label: string; tone: 'green' | 'amber' | 'blue' | 'gray' } {
  if (r.stage === 'committed') return { label: 'Committed', tone: 'green' }
  if (r.pipeline === 'Transfer') return { label: 'In portal', tone: 'amber' }
  if (r.pipeline === 'JuCo') return { label: 'NWAC transfer', tone: 'amber' }
  if (!r.contactable) return { label: 'Eval only', tone: 'gray' }
  return { label: r.stage === 'offered' ? 'Offered' : r.stage === 'contacted' ? 'In contact' : 'Watching', tone: 'blue' }
}

// ── Radar profiles — six position-neutral percentiles (0–100) vs. the
// conference at the player's position. GK uses its own axes. ────────────────
export const RADAR_AXES = ['Finishing', 'Creativity', 'Progression', 'Defending', 'Aerial', 'Security'] as const
export const GK_AXES = ['Shot-stopping', 'Distribution', 'Command', 'Sweeping', 'Composure', 'Communication'] as const

export const RADAR: Record<string, number[]> = {
  // recruits (order matches RADAR_AXES; p9 matches GK_AXES)
  p1:  [55, 62, 78, 66, 48, 74],
  p2:  [40, 45, 65, 85, 60, 70],
  p3:  [38, 75, 62, 40, 30, 88],
  p4:  [82, 70, 68, 30, 35, 55],
  p5:  [55, 52, 58, 22, 28, 40],
  p6:  [85, 55, 45, 25, 50, 48],
  p7:  [20, 25, 55, 88, 85, 78],
  p8:  [15, 18, 38, 90, 92, 60],
  p9:  [78, 70, 62, 55, 75, 68],
  p10: [35, 58, 72, 65, 45, 66],
  p11: [18, 35, 58, 82, 55, 80],
  p12: [78, 42, 35, 18, 40, 45],
  p13: [60, 55, 62, 20, 25, 42],
  p14: [28, 50, 66, 70, 42, 64],
  // graduating roster players (for like-for-like comparison)
  r3:  [15, 20, 45, 86, 88, 70],
  r6:  [30, 52, 70, 68, 40, 62],
  r9:  [15, 30, 52, 84, 50, 78],
  r11: [50, 68, 80, 60, 42, 78],
  r14: [70, 58, 64, 25, 30, 50],
  r17: [80, 48, 42, 22, 55, 46],
  // rest of the roster (outfield) — powers team-level aggregation
  r4:  [18, 30, 60, 72, 58, 80],
  r5:  [12, 15, 42, 70, 52, 64],
  r7:  [25, 45, 62, 66, 38, 72],
  r8:  [30, 40, 55, 58, 35, 60],
  r10: [15, 32, 55, 74, 48, 82],
  r12: [42, 60, 70, 50, 35, 84],
  r13: [35, 45, 58, 48, 30, 76],
  r15: [60, 50, 58, 30, 28, 52],
  r16: [55, 42, 50, 26, 24, 48],
  r18: [68, 40, 38, 24, 42, 50],
  // goalkeepers (GK_AXES order: Shot-stopping · Distribution · Command · Sweeping · Composure · Communication)
  r1:  [72, 66, 44, 60, 70, 58],
  r2:  [60, 55, 40, 50, 55, 45],
}
export const radarOf = (id: string) => RADAR[id]
export const radarAxesFor = (position: Position) => position === 'GK' ? [...GK_AXES] : [...RADAR_AXES]

// ── Rival teams — the opponent lens. Each dossier is what "analysis of the
// other team" looks like: a team shape (same percentile axes), style tags,
// four headline style stats vs the conference median, unit profiles, ONE
// named threat axis, and an ATTRIBUTED scout note (film is the analysis;
// the numbers just index it). ──────────────────────────────────────────────
export interface RivalTeam {
  id: string
  name: string
  short: string
  record: string
  formation: string
  color: string
  styleTags: string[]
  axes: number[]                                   // RADAR_AXES order, team percentile vs conference
  extra: Record<'Press resistance' | 'Work rate', number>
  stats: { possession: number; ppda: number; crossesP90: number; setPiecePct: number }
  units: { DEF: number; MID: number; ATT: number } // unit profile average, percentile
  threatAxis: string
  threatWhy: string
  scout: { by: string; on: string; note: string; tags: string[] }
}

export const RIVALS: RivalTeam[] = [
  {
    id: 'stanton', name: 'Stanton University', short: 'STN', record: '14-3-2 (’25)', formation: '4-3-3',
    color: '#0D9488',
    styleTags: ['possession', 'through the thirds', 'patient build-up'],
    axes: [55, 62, 74, 58, 48, 82],
    extra: { 'Press resistance': 80, 'Work rate': 62 },
    stats: { possession: 61, ppda: 12.4, crossesP90: 12, setPiecePct: 18 },
    units: { DEF: 68, MID: 76, ATT: 62 },
    threatAxis: 'Defending',
    threatWhy: 'They keep the ball for long stretches — your block defends 60+ minutes. Defending and concentration axes decide this one.',
    scout: { by: 'priya', on: 'Jul 14', note: 'Everything goes through their 6 and left 8 — deny the first pass into midfield and they recycle sideways without hurting you. Fullbacks stay home; almost no wide service. If we chase, we lose; compact mid-block made them sterile for 70 minutes last fall.', tags: ['deny the 6', 'mid-block', 'be patient'] },
  },
  {
    id: 'redwood', name: 'Redwood Tech', short: 'RWT', record: '11-6-2 (’25)', formation: '4-2-3-1',
    color: '#7C3AED',
    styleTags: ['high press', 'transition', 'counter-press'],
    axes: [58, 45, 55, 80, 60, 52],
    extra: { 'Press resistance': 55, 'Work rate': 88 },
    stats: { possession: 47, ppda: 6.1, crossesP90: 15, setPiecePct: 24 },
    units: { DEF: 72, MID: 66, ATT: 70 },
    threatAxis: 'Security',
    threatWhy: 'PPDA 6.1 — the most aggressive press in the conference. Your build-up gets hunted: Security under pressure is the axis that decides it.',
    scout: { by: 'dana', on: 'Jul 8', note: 'They trap the first pass to the fullback and go 40 yards in two touches when they win it. Our CBs will not get time. Either we play through the press with a press-resistant 6/8, or we go over it and fight for seconds — which is not our game.', tags: ['press trap wide', 'need a press-proof 6', 'protect transitions'] },
  },
  {
    id: 'mesaverde', name: 'Mesa Verde State', short: 'MVS', record: '12-5-1 (’25)', formation: '4-4-2',
    color: '#EA580C',
    styleTags: ['direct', 'wide service', 'set pieces'],
    axes: [66, 48, 50, 62, 84, 45],
    extra: { 'Press resistance': 48, 'Work rate': 74 },
    stats: { possession: 44, ppda: 10.8, crossesP90: 24, setPiecePct: 31 },
    units: { DEF: 60, MID: 55, ATT: 74 },
    threatAxis: 'Aerial',
    threatWhy: '24 crosses/90 (conference high) and 31% of goals from set pieces. Everything arrives in your box in the air — GK command and CB aerial percentages decide it.',
    scout: { by: 'mara', on: 'Jun 30', note: 'Two banks of four, then launch it wide the moment they win it. Both wingers serve early, back post every time, and the 9 attacks the GK on every restart. If our keeper doesn\'t own the six-yard box we lose this fixture on repetition alone. Note: Kiara Boateng is in the portal FROM this program — her notes on their restarts are on the board.', tags: ['early wide service', 'back-post runs', 'GK must command the box'] },
  },
]
export const rivalById = (id: string) => RIVALS.find(r => r.id === id)!

// Conference medians for the headline style stats (bullet-chart ticks)
export const CONF_MEDIAN = { possession: 50, ppda: 9.5, crossesP90: 16, setPiecePct: 22 }

// ── The data guide — every data point explained in coach language. ──────────
// Surfaced as ⓘ tooltips wherever the number appears (the "explain each data
// point" rule: if we can't explain it simply, it doesn't ship).
export const EXPLAIN: Record<string, string> = {
  status: 'Where things stand: Committed (verbal), In portal (transfer clock running), Offered, In contact, Watching, or Eval only (younger HS — no contact allowed yet).',
  matches: 'Matches appeared in this past season. Context for every other number.',
  minutes: 'Minutes actually on the field. Under ~900, treat the stats as a hint, not a fact — the sample is small.',
  goals: 'Goals scored this season, all competitions the platform covers.',
  xg: 'Expected goals — the QUALITY of the chances she got, not luck. 8 goals on 4 xG usually means a hot streak; 4 goals on 8 xG means finishing let her down, but she keeps getting into great spots.',
  foot: 'Preferred foot. "Both" is rare and changes what roles she can cover (both fullback sides, inverted winger).',
  country: 'Birth country / passport — flags visa timelines and international eligibility paperwork for transfers.',
  gpa: 'Core GPA as reported. Drives admissions fit and NCAA eligibility — the academic gate.',
  major: 'Intended major — matters for course-load conflicts with training and travel.',
  class: 'HS graduation year, or roster class for college players. Sets when she can arrive and how long she can stay.',
  eligibility: 'Seasons of NCAA eligibility remaining — how many falls she can actually play for you.',
  scholarships: 'Equivalency math: women\'s soccer allows 14.0 scholarship equivalents, split across the roster in fractions.',
  // radar axes
  Finishing: 'Goal output vs chance quality (goals + xG per 90), as a percentile vs conference players at her position.',
  Creativity: 'Chances created for teammates — key passes and expected assists, percentile vs position.',
  Progression: 'How much she moves the ball toward goal — progressive passes and carries, percentile vs position.',
  Defending: 'Duels won and interceptions — how often she wins the ball back, percentile vs position.',
  Aerial: 'Share of aerial duels won. Matters most for CBs, strikers, and set pieces.',
  Security: 'How rarely she gives the ball away — pass completion under her usual pressure level.',
  // GK axes
  'Shot-stopping': 'Saves vs the quality of shots faced (post-shot xG). The core GK number.',
  Distribution: 'Passing quality with feet — short build-up and long accuracy.',
  Command: 'Claims crosses and owns the box on set pieces.',
  Sweeping: 'Comfort defending the space behind the back line.',
  Composure: 'Calm under pressure — staff-observed, from viewings.',
  Communication: 'Organizes the back line audibly — staff-observed, from viewings.',
  // qualitative
  reads: 'A 1–5 read one coach entered after one viewing — always shown with WHO and WHEN. Never averaged: if two coaches disagree, you see both.',
  radar: 'Each axis is a percentile vs conference players at her position (50 = league median, the gray ring). Shape, not a total score — a spiky shape is a role, a round shape is a utility player.',
  signals: 'Similarity is counted in shared evidence from your own staff notes — matching traits, matching 4+ reads, matching timelines. No black-box score.',
  // rival lens
  possession: 'Share of the ball over the season. Above ~55% they make you chase; below ~45% they want the game direct and broken up.',
  ppda: 'Passes allowed Per Defensive Action — press intensity. LOWER = more aggressive press. Under ~8, your back line will not get time on the ball.',
  crossesP90: 'Crosses attempted per 90. Above ~20, the game arrives in your box in the air — GK command and CB aerial numbers decide it.',
  setpiece: 'Share of their goals from set pieces. Above ~25%, restarts are a primary weapon, not an accident.',
  oppadjusted: 'Percentiles are normalized for strength of competition — an 80 in a weak conference is not an 80 in yours. A player dominating a weak league is projected to your level, not taken at face value.',
  teamshape: 'Team axis = average of your outfield players (plus any placed recruits) on that percentile axis. It shows the shape of the squad, not a strength score — whether a lean is good depends on who you play.',
  lean: 'Your team axis minus theirs. A big bar isn\'t automatically bad — it\'s a lean. It becomes a problem when it points into what the rival exploits.',
  units: 'Unit profile = average percentile across the players in that line (DEF / MID / ATT). Dumbbell shows you vs them per line.',
  criteria: 'The hexagon corners are YOUR criteria — every staff weighs different things. Swap any corner for another criterion from the pool; the comparison recomputes.',
  pipeline: 'The workflow this feeds: staff defines needs in coach language → needs become data criteria → criteria produce a shortlist → the shortlist gets watched, live and on film. Data gets you there faster; it never signs anyone.',
}
