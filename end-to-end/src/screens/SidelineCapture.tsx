import React, { useRef, useState } from 'react'
import { Camera, CloudOff, Mic, Pencil, Plus, RefreshCw, X } from 'lucide-react'
import { NOW, useStore } from '../store'
import type { Person } from '../types'
import { Avatar, Btn, ComplianceBadge, DraftBadge, SectionLabel } from '../lib/ui'

function ScribblePad({ onChange }: { onChange: (dataUrl: string | undefined) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [dirty, setDirty] = useState(false)
  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  return (
    <div>
      <canvas
        ref={ref} width={520} height={140}
        className="w-full touch-none rounded-xl border-2 border-stone-300 bg-white"
        onPointerDown={e => { drawing.current = true; const c = ref.current!.getContext('2d')!; const p = pos(e); c.beginPath(); c.moveTo(p.x, p.y); c.lineWidth = 2.5; c.strokeStyle = '#1c1917'; c.lineCap = 'round' }}
        onPointerMove={e => { if (!drawing.current) return; const c = ref.current!.getContext('2d')!; const p = pos(e); c.lineTo(p.x, p.y); c.stroke(); if (!dirty) setDirty(true) }}
        onPointerUp={() => { drawing.current = false; onChange(ref.current!.toDataURL()) }}
      />
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-stone-400">Finger or stylus — freeform.</span>
        {dirty && <button className="text-xs font-semibold text-stone-500" onClick={() => { const c = ref.current!.getContext('2d')!; c.clearRect(0, 0, 520, 140); setDirty(false); onChange(undefined) }}>clear</button>}
      </div>
    </div>
  )
}

function CaptureSheet({ p, eventId, onClose }: { p: Person; eventId: string; onClose: () => void }) {
  const program = useStore(s => s.program)
  const addCapture = useStore(s => s.addCapture)
  const currentUserId = useStore(s => s.currentUserId)
  const toast = useStore(s => s.toast)
  const [chips, setChips] = useState<string[]>([])
  const [dims, setDims] = useState<Record<string, number>>({})
  const [voice, setVoice] = useState<string | undefined>()
  const [scribble, setScribble] = useState<string | undefined>()
  const [photo, setPhoto] = useState(false)
  const [pane, setPane] = useState<'chips' | 'voice' | 'scribble' | 'photo'>('chips')

  const save = () => {
    const base = { personId: p.id, authorId: currentUserId, at: NOW, eventId, confirmed: true, published: true }
    let n = 0
    if (chips.length || Object.keys(dims).length) {
      addCapture({ ...base, kind: 'chips', chips, dims: Object.entries(dims).map(([name, score]) => ({ name, score })) }, { offline: true }); n++
    }
    if (voice) { addCapture({ ...base, kind: 'voice', draftText: voice, draftKind: 'voice-transcript', confirmed: false }, { offline: true }); n++ }
    if (scribble) { addCapture({ ...base, kind: 'scribble', scribble }, { offline: true }); n++ }
    if (photo) { addCapture({ ...base, kind: 'photo', photoLabel: 'Notebook page — tagged to this recruit', draftText: 'OCR draft: strong first half, won the midfield duel battle, asked for it under pressure. Confirm exact wording at debrief.', draftKind: 'ocr', confirmed: false }, { offline: true }); n++ }
    if (!n) { onClose(); return }
    toast('Captured — eyes back on the field', ['Queued locally; syncs when signal returns'])
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="max-h-[90%] w-full max-w-2xl overflow-auto rounded-t-3xl bg-stone-50 p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-stone-900">{p.name}</div>
            <div className="text-sm text-stone-500">{p.positions.join('/')} · ’{String(p.classYear).slice(2)} · {p.club?.split(' (')[0]}</div>
          </div>
          <div className="flex items-center gap-3">
            <ComplianceBadge p={p} big />
            <button onClick={onClose} className="rounded-full bg-stone-200 p-2"><X size={20} /></button>
          </div>
        </div>

        {/* glance data — P7's exact recall list, one tap deep */}
        <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-white p-2 text-center">
          {[['GPA', p.gpa ?? '—'], ['SAT', p.sat ?? '—'], ['Tier', p.tierId ?? '—'], ['Last contact', p.contactable ? 'Jun 24' : 'n/a']].map(([k, v]) => (
            <div key={String(k)}><div className="text-[10px] font-bold uppercase text-stone-400">{k}</div><div className="text-sm font-bold text-stone-800">{String(v)}</div></div>
          ))}
        </div>

        {/* modality switcher — capture adapts to the coach (Law 2) */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {([['chips', 'Chips', null], ['voice', 'Voice', <Mic key="m" size={18} />], ['scribble', 'Scribble', <Pencil key="p" size={18} />], ['photo', 'Photo', <Camera key="c" size={18} />]] as const).map(([k, label, icon]) => (
            <button key={k} onClick={() => setPane(k)} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-base font-bold ${pane === k ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="mt-4 min-h-[190px]">
          {pane === 'chips' && (
            <div>
              <div className="flex flex-wrap gap-2.5">
                {program.vocabulary.map(v => (
                  <button key={v.word} title={v.meaning} onClick={() => setChips(c => c.includes(v.word) ? c.filter(x => x !== v.word) : [...c, v.word])}
                    className={`rounded-full px-5 py-2.5 text-lg font-semibold ${chips.includes(v.word) ? 'bg-teal-700 text-white' : 'bg-white text-stone-700 border-2 border-stone-300'}`}>
                    {v.word}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2.5">
                {program.dimensions.map(d => (
                  <div key={d} className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                    <span className="text-lg font-semibold text-stone-700">{d}</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setDims(x => ({ ...x, [d]: n }))}
                          className={`h-9 w-9 rounded-full text-sm font-bold ${dims[d] === n ? 'bg-stone-900 text-white' : dims[d] && n < dims[d] ? 'bg-stone-400 text-white' : 'bg-stone-200 text-stone-500'}`}>{n}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pane === 'voice' && (
            <button onClick={() => setVoice(v => v ? undefined : 'She keeps showing for it — twice she pulled wide to open the lane and then arrived late in the box. Motor never dropped. [names drafted: check spelling at debrief]')}
              className={`flex w-full items-start gap-3 rounded-2xl p-5 text-left ${voice ? 'ai-draft' : 'bg-white border-2 border-stone-300'}`}>
              <Mic size={28} className={voice ? 'text-violet-600' : 'text-stone-400'} />
              {voice
                ? <span><DraftBadge /><span className="mt-2 block text-lg italic text-violet-900">{voice}</span><span className="mt-1 block text-xs text-stone-500">Raw audio kept · transcript drafted for later confirmation</span></span>
                : <span className="text-lg font-semibold text-stone-500">Hold to talk<span className="block text-sm font-normal text-stone-400">(tap to simulate a voice capture)</span></span>}
            </button>
          )}
          {pane === 'scribble' && <ScribblePad onChange={setScribble} />}
          {pane === 'photo' && (
            <button onClick={() => setPhoto(x => !x)} className={`flex w-full items-center gap-4 rounded-2xl p-5 text-left ${photo ? 'ai-draft' : 'bg-white border-2 border-stone-300'}`}>
              <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-stone-200 text-[10px] font-bold uppercase text-stone-500">{photo ? 'notebook p.03' : 'no photo'}</div>
              {photo
                ? <span><DraftBadge /><span className="mt-1 block text-base italic text-violet-900">OCR draft: strong first half, won the midfield duel battle, asked for it under pressure.</span><span className="mt-1 block text-xs text-stone-500">Image + extraction stay side by side until you confirm — the paper bridge.</span></span>
                : <span className="text-lg font-semibold text-stone-500">Photograph a notebook page<span className="block text-sm font-normal text-stone-400">(tap to simulate — OCR drafts beside the image)</span></span>}
            </button>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Btn onClick={onClose} className="!px-5 !py-2.5 !text-base">Cancel</Btn>
          <Btn variant="primary" onClick={save} className="!px-7 !py-2.5 !text-base">Save capture</Btn>
        </div>
      </div>
    </div>
  )
}

function QuickAdd({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const quickAdd = useStore(s => s.quickAddDiscovery)
  const toast = useStore(s => s.toast)
  const [jersey, setJersey] = useState('14')
  const [color, setColor] = useState('blue')
  const [club, setClub] = useState('Crossfire')
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5" onClick={e => e.stopPropagation()}>
        <div className="text-xl font-bold text-stone-900">Quick-add a discovery</div>
        <div className="mt-1 text-sm text-stone-500">Jersey + team is enough — identity resolves later.</div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <label className="text-xs font-bold uppercase text-stone-500"># Jersey<input value={jersey} onChange={e => setJersey(e.target.value)} className="mt-1 w-full rounded-lg border-2 border-stone-300 px-3 py-2.5 text-xl font-bold" /></label>
          <label className="text-xs font-bold uppercase text-stone-500">Kit color<input value={color} onChange={e => setColor(e.target.value)} className="mt-1 w-full rounded-lg border-2 border-stone-300 px-3 py-2.5 text-xl font-bold" /></label>
          <label className="text-xs font-bold uppercase text-stone-500">Club<input value={club} onChange={e => setClub(e.target.value)} className="mt-1 w-full rounded-lg border-2 border-stone-300 px-3 py-2.5 text-xl font-bold" /></label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => { quickAdd(jersey, color, club, eventId); toast(`Unknown #${jersey} added to the watchlist`, ['Evaluation-only until identity resolves']); onClose() }}>
            <span className="flex items-center gap-1"><Plus size={16} /> Add to watchlist</span>
          </Btn>
        </div>
      </div>
    </div>
  )
}

export default function SidelineCapture() {
  const routeId = useStore(s => s.routeId) ?? 'ev-idcamp'
  const ev = useStore(s => s.events.find(e => e.id === routeId)) ?? useStore.getState().events.find(e => e.status === 'upcoming')!
  const people = useStore(s => s.people)
  const staff = useStore(s => s.staff)
  const offlineQueued = useStore(s => s.offlineQueued)
  const syncOffline = useStore(s => s.syncOffline)
  const [sheetFor, setSheetFor] = useState<Person | null>(null)
  const [quickOpen, setQuickOpen] = useState(false)

  const cards = ev.watchlist
    .map(w => ({ p: people.find(p => p.id === w.personId)!, assignee: staff.find(s => s.id === w.assigneeId)! }))
    .filter(x => x.p)

  return (
    // muted, high-contrast palette — the sunlight simulation
    <div className="min-h-full bg-stone-200 p-5">
      {offlineQueued > 0 && (
        <button onClick={syncOffline} className="mb-4 flex w-full items-center justify-between rounded-xl bg-stone-900 px-4 py-3 text-white">
          <span className="flex items-center gap-2 text-base font-bold"><CloudOff size={18} /> {offlineQueued} capture{offlineQueued > 1 ? 's' : ''} queued — will sync</span>
          <span className="flex items-center gap-1 text-sm text-stone-300"><RefreshCw size={14} /> tap to simulate signal</span>
        </button>
      )}

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">{ev.name}</h1>
          <div className="mt-1 text-lg font-medium text-stone-600">{ev.dates} · {ev.location} · {ev.fields}</div>
        </div>
        <Btn variant="primary" onClick={() => setQuickOpen(true)} className="!px-5 !py-3 !text-lg">
          <span className="flex items-center gap-2"><Plus size={20} /> Unknown #</span>
        </Btn>
      </div>
      <div className="mt-1 text-sm text-stone-500">The five-second contract: unlock → captured → eyes back on the field. No charts here on purpose.</div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {cards.map(({ p, assignee }) => (
          <button key={p.id} onClick={() => setSheetFor(p)} className="rounded-2xl border-2 border-stone-300 bg-white p-5 text-left shadow-sm active:scale-[0.99]">
            <div className="flex items-start justify-between">
              <div className="text-2xl font-extrabold text-stone-900">{p.name}</div>
              <Avatar staffId={assignee.id} size={30} />
            </div>
            <div className="mt-1 text-lg font-semibold text-stone-600">{p.positions.join('/')} · ’{String(p.classYear).slice(2)} · {p.club?.split(' (')[0]}</div>
            <div className="mt-3 flex items-center justify-between">
              <ComplianceBadge p={p} big />
              {!p.contactable && <span className="text-xs font-medium text-amber-800">{p.contactableReason.split(' — ')[0]}</span>}
            </div>
          </button>
        ))}
      </div>

      {sheetFor && <CaptureSheet p={sheetFor} eventId={ev.id} onClose={() => setSheetFor(null)} />}
      {quickOpen && <QuickAdd eventId={ev.id} onClose={() => setQuickOpen(false)} />}
    </div>
  )
}
