import React, { useMemo, useState } from 'react'
import { Download, LayoutGrid, Table2 } from 'lucide-react'
import { useStore } from '../store'
import type { FunnelStage, Person } from '../types'
import { FUNNEL_LABELS, FUNNEL_ORDER } from '../types'
import { Avatar, Btn, Card, ComplianceBadge, PipelineBadge, SectionLabel, TierChip } from '../lib/ui'

function FunnelStrip({ recruits }: { recruits: Person[] }) {
  const counts = FUNNEL_ORDER.map(st => ({ st, n: recruits.filter(r => r.funnelStage === st).length }))
  return (
    <div className="flex items-stretch gap-1">
      {counts.map(({ st, n }, i) => (
        <React.Fragment key={st}>
          <div className="flex min-w-[86px] flex-col items-center rounded-lg bg-white px-3 py-1.5 border border-stone-200">
            <span className="text-lg font-bold tabular-nums text-stone-800">{n}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">{FUNNEL_LABELS[st]}</span>
          </div>
          {i < counts.length - 1 && <div className="self-center text-stone-300">›</div>}
        </React.Fragment>
      ))}
    </div>
  )
}

function BoardCard({ p, draggable, onTier }: { p: Person; draggable: boolean; onTier?: () => void }) {
  const navigate = useStore(s => s.navigate)
  const device = useStore(s => s.device)
  return (
    <div
      draggable={draggable}
      onDragStart={e => e.dataTransfer.setData('personId', p.id)}
      onClick={() => navigate('profile', p.id)}
      className={`group rounded-lg border border-stone-200 bg-white p-2 shadow-sm hover:border-stone-300 ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className={`truncate font-semibold text-stone-800 ${device === 'phone' ? 'text-xs' : 'text-[13px]'}`}>{p.name}</span>
        <PipelineBadge p={p} />
      </div>
      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-stone-500">
        <span className="font-bold text-stone-600">{p.positions.join('/')}</span>
        <span>’{String(p.classYear).slice(2)}</span>
        <span className="truncate">{p.club?.split(' (')[0]}</span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <ComplianceBadge p={p} />
        {onTier && (
          <button onClick={e => { e.stopPropagation(); onTier() }} className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600 opacity-0 transition-opacity group-hover:opacity-100">
            re-tier
          </button>
        )}
      </div>
    </div>
  )
}

function TierPickerModal({ p, onClose }: { p: Person; onClose: () => void }) {
  const tiers = useStore(s => s.program.tiers)
  const retier = useStore(s => s.retier)
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-6" onClick={onClose}>
      <div className="w-72 rounded-2xl bg-white p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 text-sm font-bold text-stone-800">Move {p.name} to…</div>
        <div className="space-y-2">
          {tiers.map(t => (
            <button key={t.id} onClick={() => { retier(p.id, t.id); onClose() }}
              className="flex w-full items-center gap-2 rounded-lg border border-stone-200 p-2 text-left hover:bg-stone-50">
              <span className="h-4 w-4 rounded-full" style={{ background: t.color }} />
              <span className="text-sm font-semibold text-stone-700">{t.name}</span>
              <span className="ml-auto text-[10px] text-stone-400">{t.meaning}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SheetView({ recruits }: { recruits: Person[] }) {
  const updatePerson = useStore(s => s.updatePerson)
  const tiers = useStore(s => s.program.tiers)
  const toast = useStore(s => s.toast)
  const cols = ['Name', 'Pos', 'Class', 'Pipeline', 'Club / School', 'Tier', 'Stage', 'GPA', 'SAT', 'Contactable', 'Notes source']
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs text-stone-500">Same data as the board — the spreadsheet is a lens, not a second system. Edits round-trip.</div>
        <Btn onClick={() => toast('recruiting-board.xlsx exported', ['(Simulated download — the escape hatch that builds the trust to stay)'])}>
          <span className="flex items-center gap-1.5"><Download size={14} /> Export .xlsx</span>
        </Btn>
      </div>
      <div className="overflow-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="bg-stone-50 text-[10px] uppercase tracking-wide text-stone-500">
            <tr>{cols.map(c => <th key={c} className="border-b border-stone-200 px-3 py-2 font-bold">{c}</th>)}</tr>
          </thead>
          <tbody>
            {recruits.map(p => (
              <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="px-3 py-1.5 font-semibold text-stone-800">{p.name}</td>
                <td className="px-3 py-1.5">{p.positions.join('/')}</td>
                <td className="px-3 py-1.5">{p.classYear}</td>
                <td className="px-3 py-1.5">{p.pipeline}</td>
                <td className="px-3 py-1.5 text-stone-500">{p.club ?? p.school}</td>
                <td className="px-3 py-1.5">
                  <select value={p.tierId} onChange={e => updatePerson(p.id, { tierId: e.target.value })} className="rounded border border-stone-200 bg-white px-1 py-0.5">
                    {tiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </td>
                <td className="px-3 py-1.5">
                  <select value={p.funnelStage} onChange={e => updatePerson(p.id, { funnelStage: e.target.value as FunnelStage })} className="rounded border border-stone-200 bg-white px-1 py-0.5">
                    {FUNNEL_ORDER.map(f => <option key={f} value={f}>{FUNNEL_LABELS[f]}</option>)}
                  </select>
                </td>
                <td className="px-3 py-1.5">
                  <input className="w-12 rounded border border-stone-200 px-1 py-0.5" value={p.gpa ?? ''} onChange={e => updatePerson(p.id, { gpa: parseFloat(e.target.value) || undefined })} />
                </td>
                <td className="px-3 py-1.5 tabular-nums">{p.sat ?? '—'}</td>
                <td className="px-3 py-1.5">{p.contactable ? '✓' : '⚠ eval only'}</td>
                <td className="px-3 py-1.5 text-stone-400">{p.referralChain[0]?.who ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function TierBoard() {
  const device = useStore(s => s.device)
  const people = useStore(s => s.people)
  const tiers = useStore(s => s.program.tiers)
  const retier = useStore(s => s.retier)
  const [view, setView] = useState<'board' | 'sheet'>('board')
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')
  const [pickerFor, setPickerFor] = useState<Person | null>(null)

  const recruits = useMemo(() => people.filter(p => p.lifecycle === 'recruit'), [people])
  const years = useMemo(() => [...new Set(recruits.map(r => r.classYear))].sort(), [recruits])
  const filtered = yearFilter === 'all' ? recruits : recruits.filter(r => r.classYear === yearFilter)
  const canDrag = device === 'desktop'

  return (
    <div className="flex h-full flex-col">
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white ${device === 'phone' ? 'px-3 py-2' : 'px-5 py-3'}`}>
        <div className="flex items-center gap-3">
          <h1 className={`font-bold text-stone-900 ${device === 'ipad' ? 'text-xl' : 'text-base'}`}>Recruiting Board</h1>
          {device === 'desktop' && (
            <div className="flex rounded-lg border border-stone-200 p-0.5">
              <button onClick={() => setView('board')} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${view === 'board' ? 'bg-stone-800 text-white' : 'text-stone-500'}`}><LayoutGrid size={12} /> Board</button>
              <button onClick={() => setView('sheet')} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${view === 'sheet' ? 'bg-stone-800 text-white' : 'text-stone-500'}`}><Table2 size={12} /> Sheet</button>
            </div>
          )}
          <div className="flex gap-1">
            <button onClick={() => setYearFilter('all')} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${yearFilter === 'all' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}>All classes</button>
            {years.map(y => (
              <button key={y} onClick={() => setYearFilter(y)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${yearFilter === y ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}>{y}</button>
            ))}
          </div>
        </div>
        {device !== 'phone' && <FunnelStrip recruits={filtered} />}
      </div>

      {view === 'sheet' && device === 'desktop' ? (
        <div className="min-h-0 flex-1 overflow-auto"><SheetView recruits={filtered} /></div>
      ) : (
        <div className={`min-h-0 flex-1 overflow-auto ${device === 'phone' ? 'p-2' : 'p-4'}`}>
          {device !== 'desktop' && (
            <div className="mb-2 text-[11px] text-stone-400">{device === 'ipad' ? 'View + single-recruit re-tier on iPad. Full drag and bulk ops live on the desktop.' : 'Glance view — tap a card for the recruit, long actions live on the desktop.'}</div>
          )}
          <div className={`grid gap-3 ${device === 'phone' ? 'grid-cols-1' : 'grid-cols-4'}`}>
            {tiers.map(tier => {
              const cards = filtered.filter(r => r.tierId === tier.id)
              return (
                <div
                  key={tier.id}
                  onDragOver={canDrag ? e => e.preventDefault() : undefined}
                  onDrop={canDrag ? e => { const pid = e.dataTransfer.getData('personId'); if (pid) retier(pid, tier.id) } : undefined}
                  className="flex min-h-[120px] flex-col rounded-xl border border-stone-200 bg-stone-50"
                >
                  <div className="flex items-center justify-between rounded-t-xl px-3 py-2" style={{ background: tier.color }}>
                    <span className="text-sm font-bold" style={{ color: tier.textColor }}>{tier.name}</span>
                    <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold" style={{ color: tier.textColor }}>{cards.length}</span>
                  </div>
                  <div className="px-3 pt-1 text-[10px] italic text-stone-400">{tier.meaning}</div>
                  <div className="flex flex-col gap-2 p-2">
                    {cards.map(p => (
                      <BoardCard key={p.id} p={p} draggable={canDrag} onTier={device !== 'desktop' ? () => setPickerFor(p) : undefined} />
                    ))}
                    {!cards.length && <div className="py-4 text-center text-xs text-stone-300">drop here</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {pickerFor && <TierPickerModal p={pickerFor} onClose={() => setPickerFor(null)} />}
    </div>
  )
}
