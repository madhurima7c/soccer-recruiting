import React, { useMemo, useState } from 'react'
import { Check, Clock, GitMerge, Video, X } from 'lucide-react'
import { useStore } from '../store'
import type { InboundItem } from '../types'
import { Btn, Card, SectionLabel, WhySeeing } from '../lib/ui'

const SOURCE_STYLE: Record<InboundItem['sourceType'], string> = {
  player: 'bg-sky-100 text-sky-800',
  parent: 'bg-emerald-100 text-emerald-800',
  'club coach': 'bg-teal-100 text-teal-800',
  agent: 'bg-orange-100 text-orange-800',
  unknown: 'bg-stone-200 text-stone-600',
}

function MergePrompt({ item, onClose }: { item: InboundItem; onClose: () => void }) {
  const target = useStore(s => s.people.find(p => p.id === item.likelyDuplicateOf))
  const approveInbound = useStore(s => s.approveInbound)
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-base font-bold text-stone-900"><GitMerge size={18} className="text-teal-700" /> Likely duplicate</div>
        <p className="mt-2 text-sm text-stone-600">
          This looks like <b>{target?.name}</b>, already on your board ({target?.positions.join('/')}, ’{String(target?.classYear).slice(2)}, {target?.club?.split(' (')[0]}). Merge?
        </p>
        <WhySeeing sources={['Name match: “M. Torres” ≈ Mia Torres', 'Same club: Crossfire Premier (ECNL)', 'Same class year: 2027']} label="why flagged as duplicate" />
        <div className="mt-4 flex flex-col gap-2">
          <Btn variant="primary" onClick={() => { approveInbound(item.id, { mergeInto: item.likelyDuplicateOf }); onClose() }}>Merge into {target?.name}</Btn>
          <Btn onClick={() => { approveInbound(item.id); onClose() }}>No — create a new record</Btn>
        </div>
      </div>
    </div>
  )
}

function QueueCardBody({ item }: { item: InboundItem }) {
  const ex = item.extracted
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${SOURCE_STYLE[item.sourceType]}`}>{item.sourceType}</span>
        {item.filedAs === 'camp-blast' && <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-bold text-stone-500">camp / commercial</span>}
        {item.likelyDuplicateOf && <span className="flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800"><GitMerge size={10} /> possible duplicate</span>}
      </div>
      <div className="mt-2 text-[11px] text-stone-400">{item.fromLine}</div>
      <div className="mt-2 text-lg font-bold text-stone-900">{ex.name ?? '—'}</div>
      <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-stone-600">
        {ex.classYear && <span>Class of <b>{ex.classYear}</b></span>}
        {ex.position && <span><b>{ex.position}</b></span>}
        {ex.club && <span>{ex.club}</span>}
        {ex.videoLink && <span className="flex items-center gap-1 text-teal-700"><Video size={13} /> video link</span>}
      </div>
      {ex.note && <div className="mt-1 text-xs italic text-stone-500">{ex.note}</div>}
      <div className="mt-3 rounded-lg bg-violet-50 p-2">
        <div className="text-[10px] font-bold uppercase tracking-wide text-violet-700">Screened in because</div>
        <div className="text-xs text-violet-900">{item.screenReason}</div>
        <WhySeeing sources={item.sources} />
      </div>
    </>
  )
}

export default function Queue() {
  const device = useStore(s => s.device)
  const inbound = useStore(s => s.inbound)
  const approveInbound = useStore(s => s.approveInbound)
  const dismissInbound = useStore(s => s.dismissInbound)
  const snoozeInbound = useStore(s => s.snoozeInbound)
  const queued = useMemo(() => inbound.filter(i => i.status === 'queued'), [inbound])
  const [mergeFor, setMergeFor] = useState<InboundItem | null>(null)
  const [anim, setAnim] = useState<'swipe-left' | 'swipe-right' | ''>('')

  const act = (item: InboundItem, action: 'approve' | 'dismiss' | 'snooze') => {
    if (action === 'approve' && item.likelyDuplicateOf) { setMergeFor(item); return }
    const dir = action === 'approve' ? 'swipe-right' : action === 'dismiss' ? 'swipe-left' : ''
    if (device === 'phone' && dir) {
      setAnim(dir)
      setTimeout(() => { setAnim(''); action === 'approve' ? approveInbound(item.id) : dismissInbound(item.id) }, 280)
    } else {
      action === 'approve' ? approveInbound(item.id) : action === 'dismiss' ? dismissInbound(item.id) : snoozeInbound(item.id)
    }
    if (action === 'snooze') snoozeInbound(item.id)
  }

  if (device === 'phone') {
    const item = queued[0]
    return (
      <div className="flex h-full flex-col bg-stone-100 p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-stone-900">Screening queue</h1>
          <span className="rounded-full bg-stone-800 px-2 py-0.5 text-xs font-bold text-white">{queued.length}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-stone-500">2–3× daily, 5 minutes. Approval never auto-contacts anyone.</div>
        <div className="relative mt-3 flex-1">
          {queued.slice(0, 3).map((it, i) => (
            <div key={it.id} className={`absolute inset-x-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg ${i === 0 ? anim : ''}`}
              style={{ top: i * 8, zIndex: 10 - i, transform: `scale(${1 - i * 0.03})`, opacity: i === 0 ? 1 : 0.6 }}>
              <QueueCardBody item={it} />
              {i === 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={() => act(it, 'dismiss')} className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600"><X size={22} /></button>
                  <button onClick={() => act(it, 'snooze')} className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500" title="Not sure — snooze to the desktop pile"><Clock size={18} /></button>
                  <button onClick={() => act(it, 'approve')} className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check size={22} /></button>
                </div>
              )}
            </div>
          ))}
          {!queued.length && <div className="flex h-full items-center justify-center text-sm text-stone-400">Queue clear. ✓</div>}
        </div>
        {mergeFor && <MergePrompt item={mergeFor} onClose={() => setMergeFor(null)} />}
      </div>
    )
  }

  // desktop bulk mode — the 742-unread problem, burned down in one sitting
  return (
    <div className="mx-auto max-w-5xl p-5">
      <h1 className="text-xl font-bold text-stone-900">Inbound screening — bulk mode</h1>
      <div className="text-xs text-stone-500">Every card carries the reason it was screened in — audit the machine in one glance, correct it in one tap. Swipe-mode lives on the phone.</div>
      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-3">
        {queued.map(it => (
          <Card key={it.id} className="p-3">
            <QueueCardBody item={it} />
            <div className="mt-3 flex gap-2">
              <Btn variant="primary" className="!py-1 !text-xs" onClick={() => act(it, 'approve')}>Approve</Btn>
              <Btn className="!py-1 !text-xs" onClick={() => act(it, 'snooze')}>Snooze</Btn>
              <Btn variant="danger" className="!py-1 !text-xs" onClick={() => act(it, 'dismiss')}>Dismiss</Btn>
            </div>
          </Card>
        ))}
      </div>
      {!queued.length && <div className="mt-6 rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-400">Queue clear. Dismissed items are filed, recoverable — never deleted.</div>}
      <div className="mt-4">
        <SectionLabel>Filed / handled</SectionLabel>
        <div className="space-y-1">
          {inbound.filter(i => i.status !== 'queued').map(i => (
            <div key={i.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-xs text-stone-500 border border-stone-100">
              <span className="truncate">{i.fromLine}</span>
              <span className="ml-2 shrink-0 rounded bg-stone-100 px-1.5 py-0.5 font-bold uppercase">{i.status}</span>
            </div>
          ))}
        </div>
      </div>
      {mergeFor && <MergePrompt item={mergeFor} onClose={() => setMergeFor(null)} />}
    </div>
  )
}
