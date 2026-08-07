import React, { useMemo, useState } from 'react'
import { ArrowLeft, Check, Pencil, Send } from 'lucide-react'
import { useStore } from '../store'
import type { Capture } from '../types'
import { AuthorLine, Avatar, Btn, Card, DraftBadge, SectionLabel, TierChip, WhySeeing } from '../lib/ui'

function DraftBlock({ c }: { c: Capture }) {
  const confirmCapture = useStore(s => s.confirmCapture)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(c.draftText ?? '')
  if (c.confirmed || !c.draftText) return null
  return (
    <div className="ai-draft rounded-xl p-3">
      <div className="flex items-center justify-between">
        <AuthorLine staffId={c.authorId} at={c.at} />
        <div className="flex items-center gap-2">
          <DraftBadge />
          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-stone-500">{c.draftKind === 'ocr' ? 'notebook OCR' : 'voice transcript'}</span>
        </div>
      </div>
      {c.photoLabel && <div className="mt-2 flex h-14 items-center justify-center rounded-lg bg-stone-200 text-[10px] font-bold uppercase text-stone-500">{c.photoLabel} — image kept beside extraction</div>}
      {editing
        ? <textarea value={text} onChange={e => setText(e.target.value)} className="mt-2 w-full rounded-lg border border-violet-300 bg-white p-2 text-sm" rows={3} />
        : <p className="mt-2 text-sm italic text-violet-900">{c.draftText}</p>}
      <div className="mt-2 flex items-center gap-2">
        <Btn variant="primary" className="!py-1 !text-xs" onClick={() => confirmCapture(c.id, text)}>
          <span className="flex items-center gap-1"><Check size={12} /> Confirm{editing ? ' edits' : ''}</span>
        </Btn>
        {!editing && <Btn className="!py-1 !text-xs" onClick={() => setEditing(true)}><span className="flex items-center gap-1"><Pencil size={12} /> Edit</span></Btn>}
        <WhySeeing sources={[c.draftKind === 'ocr' ? 'OCR extraction of the photographed notebook page' : 'Transcription of the raw audio (audio kept)', 'Corrections teach the transcriber the program’s proper nouns']} />
      </div>
    </div>
  )
}

function ConfirmedBlock({ c }: { c: Capture }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <AuthorLine staffId={c.authorId} at={c.at} />
        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-stone-500">{c.kind}</span>
      </div>
      {c.chips && <div className="mt-1.5 flex flex-wrap gap-1.5">{c.chips.map(ch => <span key={ch} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800">{ch}</span>)}</div>}
      {c.dims && <div className="mt-1.5 flex gap-3">{c.dims.map(d => <span key={d.name} className="text-xs text-stone-600">{d.name} <b>{d.score}/5</b></span>)}</div>}
      {c.text && <p className="mt-1.5 text-sm text-stone-700">{c.text}</p>}
      {c.scribble && <img src={c.scribble} alt="scribble" className="mt-2 max-h-24 rounded-lg border border-stone-200" />}
    </div>
  )
}

// divergence: same player, same dimension, ratings ≥2 apart — attributed, never averaged
function Divergence({ caps }: { caps: Capture[] }) {
  const staff = useStore(s => s.staff)
  const dimPairs: { dim: string; a: Capture; b: Capture; av: number; bv: number }[] = []
  const withDims = caps.filter(c => c.dims?.length)
  for (let i = 0; i < withDims.length; i++) for (let j = i + 1; j < withDims.length; j++) {
    const a = withDims[i], b = withDims[j]
    if (a.authorId === b.authorId) continue
    a.dims!.forEach(da => {
      const db = b.dims!.find(d => d.name === da.name)
      if (db && Math.abs(da.score - db.score) >= 2) dimPairs.push({ dim: da.name, a, b, av: da.score, bv: db.score })
    })
  }
  if (!dimPairs.length) return null
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
      <div className="text-xs font-bold uppercase tracking-wide text-orange-800">Divergence — two attributed reads, never averaged</div>
      {dimPairs.map((d, i) => {
        const an = staff.find(s => s.id === d.a.authorId)!, bn = staff.find(s => s.id === d.b.authorId)!
        return (
          <div key={i} className="mt-2">
            <div className="grid grid-cols-2 gap-2">
              {[[an, d.av, d.a], [bn, d.bv, d.b]].map(([m, v]: any, k) => (
                <div key={k} className="rounded-lg bg-white p-2">
                  <AuthorLine staffId={m.id} />
                  <div className="mt-1 text-sm text-stone-800">{d.dim}: <b>{v}/5</b></div>
                </div>
              ))}
            </div>
            {/* alignment dot-plot: raters by name */}
            <div className="mt-2 rounded-lg bg-white p-2">
              <div className="text-[10px] font-bold uppercase text-stone-400">alignment — {d.dim}</div>
              <div className="relative mt-3 mb-1 h-1 rounded bg-stone-200">
                {[1, 2, 3, 4, 5].map(n => <span key={n} className="absolute -top-4 text-[9px] text-stone-400" style={{ left: `${((n - 1) / 4) * 100}%` }}>{n}</span>)}
                {[[an, d.av], [bn, d.bv]].map(([m, v]: any, k) => (
                  <span key={k} title={`${m.name}: ${v}/5`} className="absolute -top-[7px] flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full text-[8px] font-bold text-white" style={{ left: `${((v - 1) / 4) * 100}%`, background: m.color }}>{m.initials[0]}</span>
                ))}
              </div>
            </div>
            <div className="mt-1.5 text-[11px] italic text-orange-800">Disagreement becomes Monday’s conversation, not a hidden variance.</div>
          </div>
        )
      })}
    </div>
  )
}

export default function Debrief() {
  const routeId = useStore(s => s.routeId) ?? 'ev-showcase'
  const ev = useStore(s => s.events.find(e => e.id === routeId)) ?? useStore.getState().events.find(e => e.status === 'past')!
  const captures = useStore(s => s.captures)
  const people = useStore(s => s.people)
  const tiers = useStore(s => s.program.tiers)
  const retier = useStore(s => s.retier)
  const navigate = useStore(s => s.navigate)
  const postDebriefSummary = useStore(s => s.postDebriefSummary)

  const caps = useMemo(() => captures.filter(c => c.eventId === ev.id), [captures, ev.id])
  const byRecruit = useMemo(() => {
    const map = new Map<string, Capture[]>()
    caps.forEach(c => map.set(c.personId, [...(map.get(c.personId) ?? []), c]))
    return [...map.entries()]
  }, [caps])
  const draftsLeft = caps.filter(c => c.draftText && !c.confirmed).length

  return (
    <div className="mx-auto max-w-5xl p-5">
      <button onClick={() => navigate('events')} className="mb-2 flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800"><ArrowLeft size={13} /> Events</button>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Debrief packet — {ev.name}</h1>
          <div className="text-sm text-stone-500">{ev.dates} · auto-assembled: every capture by every staff member, grouped by recruit</div>
        </div>
        <Btn variant="primary" onClick={() => postDebriefSummary(ev.id)}>
          <span className="flex items-center gap-1.5"><Send size={14} /> Post summary to staff feed</span>
        </Btn>
      </div>

      {/* event summary strip */}
      <div className="mt-3 flex gap-2">
        {[[`${byRecruit.length}`, 'recruits seen'], [`${caps.length}`, 'captures'], [`${draftsLeft}`, 'AI drafts to confirm']].map(([n, l]) => (
          <div key={l} className="rounded-lg border border-stone-200 bg-white px-4 py-1.5 text-center">
            <span className="text-lg font-bold text-stone-800">{n}</span>
            <span className="ml-1.5 text-xs text-stone-500">{l}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        {byRecruit.map(([personId, personCaps]) => {
          const p = people.find(x => x.id === personId)
          if (!p) return null
          return (
            <Card key={personId} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button onClick={() => navigate('profile', p.id)} className="flex items-center gap-2 text-left">
                  <span className="text-base font-bold text-stone-900 hover:underline">{p.name}</span>
                  <TierChip tierId={p.tierId} small />
                  <span className="text-xs text-stone-500">{p.positions.join('/')} · ’{String(p.classYear).slice(2)}</span>
                </button>
                {/* the whiteboard ritual, preserved but shared */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-stone-400">tier</span>
                  {tiers.map(t => (
                    <button key={t.id} title={`${t.name} — ${t.meaning}`} onClick={() => retier(p.id, t.id)}
                      className={`h-5 w-5 rounded-full border-2 ${p.tierId === t.id ? 'border-stone-900' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      style={{ background: t.color }} />
                  ))}
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Divergence caps={personCaps} />
                {personCaps.map(c => c.draftText && !c.confirmed ? <DraftBlock key={c.id} c={c} /> : <ConfirmedBlock key={c.id} c={c} />)}
              </div>
            </Card>
          )
        })}
        {!byRecruit.length && <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-400">No captures at this event yet.</div>}
      </div>
    </div>
  )
}
