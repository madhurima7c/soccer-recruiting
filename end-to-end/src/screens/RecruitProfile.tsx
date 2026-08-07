import React, { useMemo, useState } from 'react'
import { ArrowLeft, FileText, Link2, Mic, PhoneCall, Play, Send, Video } from 'lucide-react'
import { NOW, useStore } from '../store'
import type { Capture, Person } from '../types'
import {
  AuthorLine, Avatar, BenchmarkBars, Btn, Card, ComplianceBadge, DraftBadge,
  FitGateStrip, PipelineBadge, RatingSparkline, SectionLabel, TierChip, WhySeeing, fmtDate,
} from '../lib/ui'

export function CallCaptureModal({ p, onClose }: { p: Person; onClose: () => void }) {
  const logCall = useStore(s => s.logCall)
  const [duration, setDuration] = useState(15)
  const [topics, setTopics] = useState<string[]>([])
  const [voice, setVoice] = useState<string | undefined>()
  const TOPICS = ['academics', 'visit planning', 'family', 'playing style', 'timeline', 'aid conversation']
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/30 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-base font-bold text-stone-900">Log a call — {p.name}</div>
        <div className="mt-0.5 text-xs text-stone-500">30-second capture. The conversation stays human; only the log is captured.</div>
        <div className="mt-4">
          <SectionLabel>Duration</SectionLabel>
          <div className="flex gap-2">
            {[5, 15, 22, 30, 45].map(d => (
              <button key={d} onClick={() => setDuration(d)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${duration === d ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-600'}`}>{d}m</button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <SectionLabel>Topics</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopics(x => x.includes(t) ? x.filter(y => y !== t) : [...x, t])}
                className={`rounded-full px-3 py-1 text-sm ${topics.includes(t) ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-600'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <SectionLabel>One voice note for color</SectionLabel>
          <button
            onClick={() => setVoice(v => v ? undefined : 'Family is warm on us — mom asked about the nursing program. She wants to visit before deciding anything. [simulated transcript draft]')}
            className={`flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm ${voice ? 'ai-draft' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}
          >
            <Mic size={16} className={voice ? 'text-violet-600' : ''} />
            {voice ? <span><DraftBadge /> <span className="mt-1 block text-stone-700">{voice}</span></span> : 'Hold to talk (tap to simulate)'}
          </button>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => { logCall(p.id, duration, topics, voice); onClose() }}>
            <span className="flex items-center gap-1.5"><PhoneCall size={14} /> Log call</span>
          </Btn>
        </div>
      </div>
    </div>
  )
}

function TimelineItem({ c }: { c: Capture }) {
  const confirmCapture = useStore(s => s.confirmCapture)
  const isDraft = !!c.draftText && !c.confirmed
  return (
    <div className={`rounded-xl p-3 ${isDraft ? 'ai-draft' : 'border border-stone-200 bg-white'}`}>
      <div className="flex items-center justify-between gap-2">
        <AuthorLine staffId={c.authorId} at={c.at} />
        <div className="flex items-center gap-2">
          {!c.published && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">draft (only you)</span>}
          {isDraft && <DraftBadge />}
          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-stone-500">{c.kind}</span>
        </div>
      </div>
      {c.chips && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {c.chips.map(ch => <span key={ch} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800">{ch}</span>)}
        </div>
      )}
      {c.dims && (
        <div className="mt-2 flex gap-4">
          {c.dims.map(d => (
            <span key={d.name} className="text-xs text-stone-600">{d.name} <span className="tracking-tight">{'●'.repeat(d.score)}{'○'.repeat(5 - d.score)}</span></span>
          ))}
        </div>
      )}
      {c.photoLabel && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-stone-100 p-2 text-xs text-stone-500"><FileText size={14} /> {c.photoLabel} (photo)</div>
      )}
      {c.scribble && <img src={c.scribble} alt="scribble" className="mt-2 max-h-28 rounded-lg border border-stone-200 bg-white" />}
      {(c.text || c.draftText) && <p className={`mt-2 text-sm ${isDraft ? 'italic text-violet-900' : 'text-stone-700'}`}>{c.text ?? c.draftText}</p>}
      {isDraft && (
        <div className="mt-2 flex items-center gap-2">
          <Btn variant="primary" className="!py-1 !text-xs" onClick={() => confirmCapture(c.id, c.draftText!)}>Confirm</Btn>
          <WhySeeing sources={[c.draftKind === 'ocr' ? 'OCR extraction from your notebook photo' : 'Transcribed from your voice capture', 'Drafted, not committed — corrections teach the transcriber your proper nouns']} />
        </div>
      )}
    </div>
  )
}

function VideoPane({ p }: { p: Person }) {
  const toast = useStore(s => s.toast)
  return (
    <div className="space-y-3">
      {p.videos.map(v => v.requestedFrom ? (
        <Card key={v.id} className="border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900"><Video size={15} /> Video chase — {v.title}</div>
          <div className="mt-1 text-xs text-amber-800">Requested from {v.requestedFrom} on {fmtDate(v.requestedOn!)} · nudged {fmtDate(v.nudgedOn!)}</div>
          <Btn className="mt-2 !text-xs" onClick={() => toast('Courtesy nudge sent', [`Prefilled one-tap note to ${v.requestedFrom} — being a source stays cheap for the club coach`])}>Send one-tap courtesy nudge</Btn>
        </Card>
      ) : (
        <Card key={v.id} className="overflow-hidden">
          <div className="flex aspect-video items-center justify-center bg-stone-800">
            <div className="flex flex-col items-center text-stone-400">
              <Play size={36} />
              <span className="mt-1 text-xs">{v.platform} embed placeholder — {v.title}</span>
            </div>
          </div>
          {v.anchors.length > 0 && (
            <div className="p-3">
              <SectionLabel>Timestamped note anchors</SectionLabel>
              <div className="space-y-1.5">
                {v.anchors.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="rounded bg-stone-800 px-1.5 py-0.5 font-mono font-bold text-white">{a.t}</span>
                    <span className="text-stone-700">{a.note}</span>
                    <AuthorLine staffId={a.authorId} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
      <Card className="p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-stone-300 bg-stone-100 text-[9px] font-bold uppercase text-stone-400">Wyscout<br />Match Report</div>
          <div>
            <div className="text-sm font-semibold text-stone-800">Wyscout Match Report — framed source</div>
            <div className="text-xs text-stone-500">We anchor source tools next to the judgment layer; we don’t rebuild them. Opens the platform’s own PDF.</div>
            <button onClick={() => toast('Opening Wyscout report placeholder', ['Static PDF stand-in — shot maps and heat maps embed from the source platform'])} className="mt-1 flex items-center gap-1 text-xs font-semibold text-teal-700"><Link2 size={12} /> Open report</button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function RecruitProfile() {
  const id = useStore(s => s.routeId)
  const p = useStore(s => s.people.find(x => x.id === id))
  const device = useStore(s => s.device)
  const navigate = useStore(s => s.navigate)
  const captures = useStore(s => s.captures)
  const contactLogs = useStore(s => s.contactLogs)
  const [tab, setTab] = useState<'timeline' | 'stats' | 'video' | 'referral'>('timeline')
  const [callOpen, setCallOpen] = useState(false)

  const myCaptures = useMemo(() => captures.filter(c => c.personId === id).sort((a, b) => b.at.localeCompare(a.at)), [captures, id])
  const myLogs = useMemo(() => contactLogs.filter(c => c.personId === id).sort((a, b) => b.at.localeCompare(a.at)), [contactLogs, id])

  if (!p) return <div className="p-8 text-sm text-stone-400">Pick a person from the board or the People list.</div>

  const isPhone = device === 'phone'
  const qualPane = (
    <div className="space-y-2">
      <SectionLabel>The staff’s words (always on screen)</SectionLabel>
      {myCaptures.length ? myCaptures.map(c => <TimelineItem key={c.id} c={c} />) : <div className="text-xs text-stone-400">No captures yet.</div>}
    </div>
  )

  return (
    <div className={`mx-auto max-w-5xl ${isPhone ? 'p-3' : 'p-5'}`}>
      <button onClick={() => navigate(device === 'desktop' ? 'recruits' : 'recruits')} className="mb-2 flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800">
        <ArrowLeft size={13} /> People
      </button>

      {/* header */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-bold text-stone-900 ${isPhone ? 'text-lg' : 'text-2xl'}`}>{p.name}</h1>
              <TierChip tierId={p.tierId} />
              <PipelineBadge p={p} />
            </div>
            <div className="mt-1 text-sm text-stone-500">
              {p.positions.join(' / ')} · Class of {p.classYear} {p.club && <>· {p.club}</>} {p.school && <>· {p.school}</>}
              {p.lifecycle === 'rosterPlayer' && <> · #{p.jersey} · {p.eligibilityRemaining} yr elig. remaining {p.graduating && '· graduating'}</>}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <ComplianceBadge p={p} />
              <span className="text-[11px] text-stone-400">{p.contactableReason}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Btn variant="primary" onClick={() => setCallOpen(true)} disabled={!p.contactable}>
              <span className="flex items-center gap-1.5"><PhoneCall size={14} /> Log a call</span>
            </Btn>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-stone-400">rating across viewings</div>
              <RatingSparkline p={p} />
            </div>
          </div>
        </div>
        <div className="mt-3"><FitGateStrip p={p} compact={isPhone} /></div>
      </div>

      {/* body: on desktop the qualitative pane NEVER leaves the screen */}
      <div className={`mt-4 ${device === 'desktop' ? 'grid grid-cols-[1.2fr_1fr] gap-4' : ''}`}>
        <div>
          <div className="mb-2 flex gap-1">
            {(['timeline', 'stats', 'video', 'referral'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${tab === t ? 'bg-stone-800 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>
                {t === 'referral' ? 'Who vouched' : t}
              </button>
            ))}
          </div>

          {tab === 'timeline' && (
            <div className="space-y-2">
              {myLogs.map(l => (
                <div key={l.id} className="rounded-xl border border-stone-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <AuthorLine staffId={l.authorId} at={l.at} />
                    <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-sky-700">{l.type}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-stone-700">{l.detail}</p>
                </div>
              ))}
              {device !== 'desktop' && myCaptures.map(c => <TimelineItem key={c.id} c={c} />)}
              {!myLogs.length && device === 'desktop' && <div className="rounded-xl border border-dashed border-stone-300 p-4 text-center text-xs text-stone-400">No contact log yet{p.contactable ? ' — “Log a call” files it to timeline, feed, and outbox at once.' : ' — this recruit is evaluation-only.'}</div>}
            </div>
          )}

          {tab === 'stats' && (
            <Card className="p-4">
              <BenchmarkBars p={p} />
              <div className="mt-4 border-t border-stone-100 pt-3">
                <SectionLabel>Trend across viewings</SectionLabel>
                <RatingSparkline p={p} width={280} height={48} />
                <div className="text-[10px] text-stone-400">Attributed staff ratings per live viewing — direction over level (the late-bloomer signal).</div>
              </div>
            </Card>
          )}

          {tab === 'video' && <VideoPane p={p} />}

          {tab === 'referral' && (
            <Card className="p-4">
              <SectionLabel>Referral chain — who vouched</SectionLabel>
              {p.referralChain.length ? (
                <div className="space-y-0">
                  {p.referralChain.map((r, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-600" />
                        {i < p.referralChain.length - 1 && <span className="w-px flex-1 bg-stone-200" />}
                      </div>
                      <div className="pb-4">
                        <div className="text-sm font-semibold text-stone-800">{r.who}</div>
                        <div className="text-xs text-stone-500">{r.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-xs text-stone-400">No referral chain recorded.</div>}
              <div className="mt-2 rounded-lg bg-stone-50 p-2 text-[11px] text-stone-500">Warm-path credibility is first-class provenance: an agent-supplied claim and a staff observation never look alike in the record.</div>
            </Card>
          )}
        </div>

        {device === 'desktop' && <div>{qualPane}</div>}
      </div>

      {callOpen && <CallCaptureModal p={p} onClose={() => setCallOpen(false)} />}
    </div>
  )
}
