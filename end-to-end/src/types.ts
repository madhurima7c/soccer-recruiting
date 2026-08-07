// ── One spine, many lenses (Law 3): a single object model rendered per context ──

export type DeviceMode = 'desktop' | 'ipad' | 'phone'

export type Screen =
  | 'board' | 'profile' | 'capture' | 'debrief' | 'compare' | 'queue'
  | 'outbox' | 'calendar' | 'journal' | 'setup' | 'events' | 'recruits' | 'primer' | 'insights'

export type Position = 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'W' | 'F'
export const POSITIONS: Position[] = ['GK', 'CB', 'FB', 'DM', 'CM', 'W', 'F']

export type Pipeline = 'HS' | 'Transfer' | 'JuCo'
export type FunnelStage = 'wideNet' | 'watching' | 'contacted' | 'offered' | 'committed'
export const FUNNEL_ORDER: FunnelStage[] = ['wideNet', 'watching', 'contacted', 'offered', 'committed']
export const FUNNEL_LABELS: Record<FunnelStage, string> = {
  wideNet: 'Wide net', watching: 'Watching', contacted: 'Contacted', offered: 'Offered', committed: 'Committed',
}

export type FitStatus = 'clear' | 'open' | 'concern' | 'unknown'
export interface FitGate { status: FitStatus; note: string; updated: string }

export interface StaffMember {
  id: string
  name: string
  initials: string
  role: 'Head Coach' | 'Associate Head (Recruiting Lead)' | 'Assistant Coach' | 'Volunteer (capture-only)'
  access: 'full' | 'capture-only' | 'read-only'
  color: string // avatar bg
}

export type MetricKey =
  | 'duelsWonPct' | 'aerialWonPct' | 'defDuelsWonPct' | 'interceptionsP90'
  | 'passAccPct' | 'fwdPassAccPct' | 'progPassesP90' | 'progRunsP90'
  | 'keyPassesP90' | 'xAP90' | 'goalsP90' | 'dribblesWonPct'

export const METRIC_LABELS: Record<MetricKey, string> = {
  duelsWonPct: 'Duels won %',
  aerialWonPct: 'Aerial duels won %',
  defDuelsWonPct: 'Defensive duels won %',
  interceptionsP90: 'Interceptions /90',
  passAccPct: 'Pass accuracy %',
  fwdPassAccPct: 'Forward pass acc. %',
  progPassesP90: 'Progressive passes /90',
  progRunsP90: 'Progressive runs /90',
  keyPassesP90: 'Key passes /90',
  xAP90: 'xA /90',
  goalsP90: 'Goals /90',
  dribblesWonPct: 'Dribbles won %',
}
export const METRIC_KEYS = Object.keys(METRIC_LABELS) as MetricKey[]

export interface BenchmarkTemplate {
  id: string
  name: string           // e.g. "Cascade Conference First-Team CM Template"
  position: Position
  source: string         // where the template came from — provenance for the bars
  values: Record<MetricKey, number>
  weights: Record<MetricKey, number> // coach-defined 1–5, shown in the open (Rohit's method, promoted to visible metadata)
}

export interface VideoLink {
  id: string
  title: string
  platform: 'Veo' | 'Hudl' | 'YouTube' | 'Wyscout'
  anchors: { t: string; note: string; authorId: string }[]
  requestedFrom?: string    // video chase list state
  requestedOn?: string
  nudgedOn?: string
}

export interface Person {
  id: string
  name: string
  lifecycle: 'recruit' | 'rosterPlayer'
  positions: Position[]
  classYear: number          // grad year (HS) or roster class year
  club?: string
  school?: string            // HS / previous college / JuCo
  pipeline?: Pipeline
  tierId?: string            // recruits only
  funnelStage?: FunnelStage
  gpa?: number
  sat?: number
  fitGates: { soccer: FitGate; academic: FitGate; financial: FitGate }
  stats?: Record<MetricKey, number>
  templateId: string
  ratingsAcrossViewings: number[]   // trend sparkline, 1–5 staff rating per viewing
  videos: VideoLink[]
  referralChain: { who: string; role: string }[]
  contactable: boolean
  contactableReason: string
  // roster-only
  eligibilityRemaining?: number
  graduating?: boolean
  idp?: { focus: string; trajectory: number[] } // IDP development arc (develop-vs-recruit rail)
  jersey?: number
  height?: string
  hometown?: string
  // attributed staff assessments on the program dimensions (coach-entered at spring review;
  // recruits get theirs from live captures instead — never machine-generated)
  staffDims?: { name: string; score: number; by: string; on: string }[]
}

export type CaptureKind = 'chips' | 'voice' | 'scribble' | 'photo' | 'text' | 'call'

export interface Capture {
  id: string
  personId: string
  authorId: string
  at: string                // ISO
  eventId?: string
  kind: CaptureKind
  chips?: string[]
  dims?: { name: string; score: number }[]  // 1–5 dots on staff dimensions
  text?: string             // confirmed text
  draftText?: string        // AI transcript/OCR draft — unconfirmed (Law 1: distinct visual state)
  draftKind?: 'voice-transcript' | 'ocr'
  confirmed: boolean        // human has touched AI output
  published: boolean        // Law 5: shared by default; draft (only you) exists
  scribble?: string         // dataURL of canvas
  photoLabel?: string       // placeholder for notebook photo
  // calls
  durationMin?: number
  topics?: string[]
}

export interface ContactLogEntry {
  id: string
  personId: string
  authorId: string
  at: string
  type: 'call' | 'text' | 'visit' | 'email' | 'evaluation'
  detail: string
}

export interface ComplianceEvent {
  id: string
  personId: string
  at: string
  type: 'Call' | 'Contact' | 'Evaluation' | 'Visit' | 'Offer'
  detail: string
  done: boolean
}

export interface FeedItem {
  id: string
  at: string
  authorId: string
  text: string
  personId?: string
  kind: 'capture' | 'call' | 'tier' | 'summary' | 'decision' | 'system'
}

export interface RecruitingEvent {
  id: string
  name: string
  dates: string
  location: string
  status: 'past' | 'upcoming'
  fields?: string
  watchlist: { personId: string; assigneeId: string }[]
}

export interface InboundItem {
  id: string
  fromLine: string
  sourceType: 'player' | 'parent' | 'club coach' | 'agent' | 'unknown'
  extracted: { name?: string; classYear?: number; position?: string; club?: string; videoLink?: boolean; note?: string }
  screenReason: string          // the visible reason it was screened in (Law 1)
  sources: string[]             // provenance for "Why am I seeing this?"
  status: 'queued' | 'approved' | 'dismissed' | 'snoozed'
  likelyDuplicateOf?: string    // personId
  filedAs?: 'camp-blast' | null
}

export interface SnapshotPlacement {
  slot: string
  personId: string
  // coach-declared intent: is this placement replacing someone or strengthening the group?
  intent?: { kind: 'replace' | 'depth'; targetId?: string }
}
export interface WhatIfSnapshot {
  id: string
  name: string
  createdAt: string
  authorId: string
  placements: SnapshotPlacement[]
  // coach-entered resource math — displayed, never computed as advice
  spotsUsed: number
  scholarshipEquiv: number
  eligibilityYears: number
  note?: string
}

export interface JournalEntry {
  id: string
  personId: string
  decision: 'offer' | 'pass' | 'hold'
  reasons: string[]     // structured, from the program vocabulary
  text: string
  snapshotId?: string
  at: string
  authorId: string
}

export interface MirrorObservation {
  id: string
  text: string             // descriptive, NEVER advice
  provenance: { label: string; personIds: string[] }
  dismissed: boolean
}

export interface Tier { id: string; name: string; color: string; textColor: string; meaning: string }

export interface Program {
  name: string
  division: string
  vocabulary: { word: string; meaning: string }[]
  valuesHierarchy: string[]
  dimensions: string[]      // 1–5 dot capture dimensions
  tiers: Tier[]
  complianceTarget: 'ARMS' | 'Teamworks' | 'Jump Forward' | 'Win One'
  // the coach's pinned criteria for this season (lens ids on the pitch planner) — coach-ordered, never used to score
  seasonFocus: string[]
}
