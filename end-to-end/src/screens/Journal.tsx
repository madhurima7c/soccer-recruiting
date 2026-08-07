import React, { useMemo, useState } from 'react'
import { BookOpen, GraduationCap, Plus, Search } from 'lucide-react'
import { useStore } from '../store'
import { AuthorLine, Btn, Card, SectionLabel, TierChip, fmtDate } from '../lib/ui'

const DECISION_STYLE = { offer: 'bg-emerald-100 text-emerald-800', pass: 'bg-red-100 text-red-800', hold: 'bg-amber-100 text-amber-900' }

function NewEntry({ onClose }: { onClose: () => void }) {
  const people = useStore(s => s.people.filter(p => p.lifecycle === 'recruit'))
  const program = useStore(s => s.program)
  const snapshots = useStore(s => s.snapshots)
  const addJournalEntry = useStore(s => s.addJournalEntry)
  const [personId, setPersonId] = useState(people[0]?.id ?? '')
  const [decision, setDecision] = useState<'offer' | 'pass' | 'hold'>('offer')
  const [reasons, setReasons] = useState<string[]>([])
  const [text, setText] = useState('')
  const [snapshotId, setSnapshotId] = useState<string | undefined>(snapshots[snapshots.length - 1]?.id)
  const options = [...program.vocabulary.map(v => v.word), ...program.valuesHierarchy, 'Academic risk', 'Style of play', 'Family preference', 'Aid math']
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-6" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-base font-bold text-stone-900">Journal a decision — with its why</div>
        <div className="mt-0.5 text-xs text-stone-500">Passes are journaled too: that’s exactly the knowledge that currently evaporates.</div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs font-bold uppercase text-stone-500">Recruit
            <select value={personId} onChange={e => setPersonId(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm font-normal normal-case">
              {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold uppercase text-stone-500">Decision
            <div className="mt-1 flex gap-1">
              {(['offer', 'pass', 'hold'] as const).map(d => (
                <button key={d} onClick={() => setDecision(d)} className={`flex-1 rounded-lg py-1.5 text-sm font-semibold capitalize ${decision === d ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}>{d}</button>
              ))}
            </div>
          </label>
        </div>
        <div className="mt-3">
          <SectionLabel>Structured reasons (your vocabulary)</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {options.map(o => (
              <button key={o} onClick={() => setReasons(r => r.includes(o) ? r.filter(x => x !== o) : [...r, o])}
                className={`rounded-full px-2.5 py-1 text-xs ${reasons.includes(o) ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-600'}`}>{o}</button>
            ))}
          </div>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Free text — the honest why…" rows={3} className="mt-3 w-full rounded-lg border border-stone-300 p-2 text-sm" />
        {snapshots.length > 0 && (
          <label className="mt-2 block text-xs font-bold uppercase text-stone-500">Link the snapshot on screen when decided
            <select value={snapshotId ?? ''} onChange={e => setSnapshotId(e.target.value || undefined)} className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm font-normal normal-case">
              <option value="">— none —</option>
              {snapshots.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => { addJournalEntry({ personId, decision, reasons, text, snapshotId }); onClose() }}>Save entry</Btn>
        </div>
      </div>
    </div>
  )
}

function Primer() {
  const program = useStore(s => s.program)
  const journal = useStore(s => s.journal)
  const people = useStore(s => s.people)
  const staff = useStore(s => s.staff)
  return (
    <Card className="border-teal-200 p-5">
      <div className="flex items-center gap-2 text-base font-bold text-stone-900"><GraduationCap size={18} className="text-teal-700" /> Program Primer — a new assistant’s first hour</div>
      <div className="mt-1 text-xs text-stone-500">Auto-assembled from living artifacts. Nobody wrote documentation — the ideology was written down as a side effect of daily work.</div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <SectionLabel>What this program values (in the head coach’s order)</SectionLabel>
          <ol className="space-y-1">
            {program.valuesHierarchy.map((v, i) => (
              <li key={v} className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-1.5 text-sm font-semibold text-stone-700"><span className="text-teal-700">{i + 1}.</span> {v}</li>
            ))}
          </ol>
          <div className="mt-1 text-[10px] italic text-stone-400">Displayed, never used to auto-score anyone.</div>
        </div>
        <div>
          <SectionLabel>How this staff talks (the vocabulary)</SectionLabel>
          <div className="space-y-1.5">
            {program.vocabulary.map(v => (
              <div key={v.word} className="rounded-lg bg-stone-50 px-3 py-1.5">
                <span className="text-sm font-bold text-teal-800">{v.word}</span>
                <span className="ml-2 text-xs text-stone-500">{v.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <SectionLabel>What we offered, what we passed on, and why (recent journal)</SectionLabel>
        <div className="space-y-1.5">
          {journal.slice(0, 6).map(j => {
            const p = people.find(x => x.id === j.personId)
            return (
              <div key={j.id} className="flex items-start gap-2 rounded-lg bg-stone-50 px-3 py-1.5 text-xs">
                <span className={`mt-0.5 rounded px-1.5 py-0.5 font-bold uppercase ${DECISION_STYLE[j.decision]}`}>{j.decision}</span>
                <span className="text-stone-700"><b>{p?.name}</b> — {j.text}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-3 text-[11px] text-stone-400">Staff roles: {staff.map(s => `${s.name} (${s.access})`).join(' · ')}</div>
    </Card>
  )
}

export default function Journal({ primer }: { primer?: boolean }) {
  const journal = useStore(s => s.journal)
  const people = useStore(s => s.people)
  const snapshots = useStore(s => s.snapshots)
  const navigate = useStore(s => s.navigate)
  const [q, setQ] = useState('')
  const [showPrimer, setShowPrimer] = useState(!!primer)
  const [newOpen, setNewOpen] = useState(false)

  const filtered = useMemo(() => journal.filter(j => {
    const p = people.find(x => x.id === j.personId)
    const hay = `${p?.name} ${p?.positions.join()} ${j.decision} ${j.reasons.join()} ${j.text}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  }), [journal, people, q])

  return (
    <div className="mx-auto max-w-4xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Decision journal</h1>
          <div className="text-xs text-stone-500">Append-only and searchable — “show every CM we passed on and why.” The program learns on purpose.</div>
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => setShowPrimer(x => !x)}><span className="flex items-center gap-1.5"><BookOpen size={14} /> {showPrimer ? 'Hide' : 'Open'} Program Primer</span></Btn>
          <Btn variant="primary" onClick={() => setNewOpen(true)}><span className="flex items-center gap-1.5"><Plus size={14} /> New entry</span></Btn>
        </div>
      </div>

      {showPrimer && <div className="mt-4"><Primer /></div>}

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2">
        <Search size={15} className="text-stone-400" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder='Try “CM pass” or “academics”…' className="w-full bg-transparent text-sm outline-none" />
      </div>

      <div className="mt-3 space-y-2">
        {filtered.map(j => {
          const p = people.find(x => x.id === j.personId)
          const snap = snapshots.find(s => s.id === j.snapshotId)
          return (
            <Card key={j.id} className="p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${DECISION_STYLE[j.decision]}`}>{j.decision}</span>
                  <button onClick={() => navigate('profile', j.personId)} className="text-sm font-bold text-stone-900 hover:underline">{p?.name}</button>
                  <TierChip tierId={p?.tierId} small />
                  <span className="text-xs text-stone-400">{p?.positions.join('/')} · {p?.pipeline} ’{String(p?.classYear).slice(2)}</span>
                </div>
                <AuthorLine staffId={j.authorId} at={j.at} />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {j.reasons.map(r => <span key={r} className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">{r}</span>)}
              </div>
              <p className="mt-1.5 text-sm text-stone-700">{j.text}</p>
              {snap && <div className="mt-1.5 rounded bg-teal-50 px-2 py-1 text-[11px] text-teal-800">📎 Linked snapshot: {snap.name} ({snap.placements.length} placement{snap.placements.length !== 1 && 's'}, {snap.scholarshipEquiv} schol.-equiv)</div>}
            </Card>
          )
        })}
        {!filtered.length && <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-400">No entries match.</div>}
      </div>
      {newOpen && <NewEntry onClose={() => setNewOpen(false)} />}
    </div>
  )
}
