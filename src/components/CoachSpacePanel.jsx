import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  GitBranch, FileText, ExternalLink, ZoomIn, ZoomOut, Move, Paperclip, X, Brain,
  Plus, ThumbsUp, Circle, StickyNote, CheckCircle2,
} from 'lucide-react';
import { synthesizeNode } from '../lib/coachSpaceAi';
import { STAFF } from '../lib/coachSpaceSeed';

const CANVAS_W = 2600;
const CANVAS_H = 1800;
const NODE_W = 220;
const NOTE_W = 160;

function timeAgo(ts) {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

function nodeCenter(node) {
  const w = node.kind === 'note' ? NOTE_W : NODE_W;
  const h = node.kind === 'note' ? 72 : 100;
  return {
    x: (node.canvasX ?? 0) + w / 2,
    y: (node.canvasY ?? 0) + h / 2,
  };
}

function GraphEdges({ nodes, zoom }) {
  const decisions = nodes.filter((n) => n.kind === 'decision');
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = [];

  for (const d of decisions) {
    for (const linkId of d.links || []) {
      const target = byId[linkId];
      if (target) {
        const a = nodeCenter(d);
        const b = nodeCenter(target);
        edges.push({ id: `${d.id}-${linkId}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y, dashed: false });
      }
    }
    for (const note of nodes.filter((n) => n.kind === 'note' && n.parentId === d.id)) {
      const a = nodeCenter(d);
      const b = nodeCenter(note);
      edges.push({ id: `${d.id}-${note.id}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y, dashed: true });
    }
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 overflow-visible"
      width={CANVAS_W}
      height={CANVAS_H}
      style={{ opacity: Math.min(1, zoom + 0.2) }}
    >
      {edges.map((e) => (
        <line
          key={e.id}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke={e.dashed ? '#a3a3a3' : '#d4d4d4'}
          strokeWidth={e.dashed ? 1.5 : 2}
          strokeDasharray={e.dashed ? '6 4' : undefined}
        />
      ))}
    </svg>
  );
}

function StatusBadge({ status }) {
  const styles = {
    open: 'bg-neutral-100 text-neutral-600',
    voting: 'bg-orange-100 text-orange-700',
    decided: 'bg-green-100 text-green-700',
  };
  const labels = { open: 'Open', voting: 'Voting', decided: 'Decided' };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide ${styles[status] || styles.open}`}>
      {labels[status] || status}
    </span>
  );
}

function AiSynthesis({ node }) {
  const syn = synthesizeNode(node);
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/80 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Brain className="h-4 w-4 text-orange-500" />
        AI synthesis
      </div>
      <p className="mt-2 text-xs text-muted">{syn.headline}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink">{syn.summary}</p>
      {syn.themes?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {syn.themes.map((t) => (
            <span key={t} className="rounded-full border border-line bg-white px-2 py-0.5 text-[10px] text-muted">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function VotePanel({ node, myVote, onVote, onCloseDecision }) {
  const syn = synthesizeNode(node);
  if (!node.options?.length) {
    return (
      <p className="text-xs text-muted">
        No options yet — add a compare in the title (A vs B) or define options when creating the node.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cast vote</p>
      {node.options.map((opt) => {
        const tally = syn.voteTally.find((v) => v.id === opt.id);
        const count = tally?.count || 0;
        const total = node.votes?.length || 1;
        const pct = total ? Math.round((count / total) * 100) : 0;
        const isMine = myVote?.optionId === opt.id;

        return (
          <div key={opt.id} className={`rounded-xl border p-3 ${isMine ? 'border-orange-300 bg-orange-50/50' : 'border-line bg-white'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-ink">{opt.label}</p>
                {opt.description && <p className="mt-0.5 text-[11px] text-muted">{opt.description}</p>}
              </div>
              <span className="shrink-0 text-xs font-semibold text-ink">{count}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${pct}%` }} />
            </div>
            {tally?.voters?.length > 0 && (
              <p className="mt-1.5 text-[10px] text-muted">{tally.voters.join(' · ')}</p>
            )}
            {node.status !== 'decided' && (
              <button
                type="button"
                onClick={() => onVote(opt.id)}
                className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs transition ${
                  isMine ? 'border-orange-400 bg-orange-100 text-orange-800' : 'border-line hover:border-orange-300'
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
                {isMine ? 'Your vote' : 'Vote'}
              </button>
            )}
          </div>
        );
      })}
      {node.status === 'voting' && (
        <button
          type="button"
          onClick={onCloseDecision}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 py-2 text-xs text-green-800 hover:bg-green-100"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Close decision
        </button>
      )}
    </div>
  );
}

function NoteCard({ note }) {
  return (
    <article className={`rounded-xl border p-3 ${note.isOwn ? 'border-orange-200 bg-orange-50/40' : 'border-line bg-white'}`}>
      <div className="flex items-center gap-2 text-[10px] text-muted">
        <StickyNote className="h-3 w-3" />
        <span className="font-medium text-ink">{note.coach}</span>
        {note.role && <span>· {note.role}</span>}
        <span>· {timeAgo(note.createdAt)}</span>
      </div>
      {note.type === 'pdf' && note.artifact && (
        <a
          href={note.artifact.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1.5 text-xs hover:border-orange-300"
        >
          <FileText className="h-3.5 w-3.5 text-orange-500" />
          <span className="font-medium">{note.artifact.title}</span>
          <ExternalLink className="ml-auto h-3 w-3 text-muted" />
        </a>
      )}
      {note.content && <p className="mt-2 text-sm leading-relaxed text-ink">{note.content}</p>}
    </article>
  );
}

export default function CoachSpacePanel({ coachSpace, onCoachSpaceChange, profile }) {
  const decisions = useMemo(() => coachSpace.filter((n) => n.kind === 'decision'), [coachSpace]);
  const [selectedId, setSelectedId] = useState(decisions[0]?.id || null);
  const [pan, setPan] = useState({ x: -60, y: -20 });
  const [zoom, setZoom] = useState(0.82);
  const [dragging, setDragging] = useState(false);
  const [note, setNote] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const dragStart = useRef(null);
  const fileRef = useRef(null);

  const selected = coachSpace.find((n) => n.id === selectedId && n.kind === 'decision');
  const linkedNotes = useMemo(
    () => coachSpace.filter((n) => n.kind === 'note' && n.parentId === selectedId),
    [coachSpace, selectedId],
  );

  const myVote = selected?.votes?.find((v) => v.coach === STAFF.head.coach);

  const onPointerDown = useCallback((e) => {
    if (e.target.closest('[data-graph-node]')) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }, [pan]);

  const onPointerMove = useCallback((e) => {
    if (!dragging || !dragStart.current) return;
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('pointerup', onPointerUp);
    return () => window.removeEventListener('pointerup', onPointerUp);
  }, [onPointerUp]);

  function updateNode(id, patch) {
    onCoachSpaceChange(coachSpace.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  function addNoteToNode(type, content, artifact) {
    if (!selected) return;
    const entry = {
      id: crypto.randomUUID(),
      ...STAFF.head,
      type,
      content,
      artifact,
      createdAt: Date.now(),
      isOwn: true,
    };
    updateNode(selected.id, { notes: [...(selected.notes || []), entry] });
    setNote('');
  }

  function castVote(optionId) {
    if (!selected || selected.status === 'decided') return;
    const withoutMine = (selected.votes || []).filter((v) => v.coach !== STAFF.head.coach);
    const vote = {
      id: crypto.randomUUID(),
      ...STAFF.head,
      optionId,
      createdAt: Date.now(),
      isOwn: true,
    };
    updateNode(selected.id, {
      votes: [...withoutMine, vote],
      status: selected.status === 'open' ? 'voting' : selected.status,
    });
  }

  function closeDecision() {
    if (!selected) return;
    updateNode(selected.id, { status: 'decided' });
  }

  function createDecision() {
    const title = newTitle.trim();
    if (!title) return;
    const id = crypto.randomUUID();
    const vsMatch = title.match(/(.+?)\s+vs\.?\s+(.+)/i);
    const options = vsMatch
      ? [
          { id: 'opt-a', label: vsMatch[1].trim(), description: 'Option A' },
          { id: 'opt-b', label: vsMatch[2].trim(), description: 'Option B' },
        ]
      : [{ id: 'opt-yes', label: 'Proceed', description: 'Move forward' }, { id: 'opt-no', label: 'Hold', description: 'Wait for more info' }];

    const node = {
      id,
      kind: 'decision',
      college: profile.college || 'Your program',
      title,
      preview: 'New decision node — add notes and votes',
      status: 'open',
      ...STAFF.head,
      canvasX: 400 + decisions.length * 40,
      canvasY: 300 + decisions.length * 30,
      links: [],
      options,
      votes: [],
      notes: [],
      publishedAt: Date.now(),
      isOwn: true,
    };
    onCoachSpaceChange([...coachSpace, node]);
    setSelectedId(id);
    setNewTitle('');
    setShowNewForm(false);
  }

  function openNoteNode(noteNode) {
    const parent = coachSpace.find((n) => n.id === noteNode.parentId);
    if (parent) setSelectedId(parent.id);
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-57px)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <GitBranch className="h-5 w-5 text-orange-500" />
            Coach Space
          </h1>
          <p className="text-xs text-muted">
            {profile.college || 'Your program'} · Obsidian-style decision graph · notes · votes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNewForm((s) => !s)}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs hover:bg-surface"
          >
            <Plus className="h-3.5 w-3.5" /> New decision
          </button>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="rounded-lg p-2 text-muted hover:bg-surface">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setZoom((z) => Math.max(0.45, z - 0.1))} className="rounded-lg p-2 text-muted hover:bg-surface">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="flex items-center gap-1 text-[10px] text-muted">
            <Move className="h-3 w-3" /> pan canvas
          </span>
        </div>
      </div>

      {showNewForm && (
        <div className="flex gap-2 border-b border-line bg-surface px-4 py-3">
          <input
            className="input-field flex-1 text-sm"
            placeholder='Decision title — e.g. "Jordan Blake vs Avery Kim"'
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createDecision()}
          />
          <button type="button" onClick={createDecision} className="btn-primary py-2 text-xs">
            Add node
          </button>
        </div>
      )}

      <div className="relative flex flex-1 overflow-hidden">
        <div
          className="relative flex-1 cursor-grab overflow-hidden bg-[#eceae4] active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          style={{
            backgroundImage: 'radial-gradient(circle, #c8c8c8 1px, transparent 1px)',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: CANVAS_W,
              height: CANVAS_H,
              position: 'relative',
            }}
          >
            <GraphEdges nodes={coachSpace} zoom={zoom} />

            {coachSpace.map((node) => {
              if (node.kind === 'note') {
                const isLinked = node.parentId === selectedId;
                return (
                  <button
                    key={node.id}
                    type="button"
                    data-graph-node
                    onClick={() => openNoteNode(node)}
                    className={`absolute rounded-xl border p-3 text-left shadow-sm transition hover:shadow-md ${
                      isLinked ? 'border-purple-300 bg-purple-50/80 ring-1 ring-purple-200' : 'border-line bg-white'
                    }`}
                    style={{ left: node.canvasX, top: node.canvasY, width: NOTE_W }}
                  >
                    <div className="flex items-center gap-1 text-[9px] text-purple-600">
                      <StickyNote className="h-3 w-3" /> note
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs font-medium text-ink">{node.title || node.content}</p>
                    <p className="mt-1 text-[10px] text-muted">{node.coach}</p>
                  </button>
                );
              }

              const voteCount = node.votes?.length || 0;
              const noteCount = (node.notes?.length || 0)
                + coachSpace.filter((n) => n.kind === 'note' && n.parentId === node.id).length;

              return (
                <button
                  key={node.id}
                  type="button"
                  data-graph-node
                  onClick={() => setSelectedId(node.id)}
                  className={`absolute rounded-2xl border-2 p-4 text-left shadow-card transition hover:shadow-lg ${
                    selectedId === node.id
                      ? 'border-orange-400 bg-white ring-2 ring-orange-100'
                      : 'border-line bg-white hover:border-neutral-300'
                  }`}
                  style={{ left: node.canvasX, top: node.canvasY, width: NODE_W }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <Circle className={`h-2.5 w-2.5 fill-current ${
                      node.status === 'decided' ? 'text-green-500' : node.status === 'voting' ? 'text-orange-500' : 'text-neutral-300'
                    }`} />
                    <StatusBadge status={node.status} />
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-ink">{node.title}</h3>
                  <p className="mt-1 line-clamp-1 text-[10px] text-muted">{node.preview}</p>
                  <div className="mt-3 flex items-center gap-3 text-[10px] text-muted">
                    <span>{voteCount} votes</span>
                    <span>{noteCount} notes</span>
                  </div>
                  {(node.links?.length > 0) && (
                    <div className="mt-2 flex items-center gap-1 text-[9px] text-neutral-400">
                      <GitBranch className="h-3 w-3" /> {node.links.length} linked
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selected && (
          <aside className="flex w-full max-w-md shrink-0 flex-col border-l border-line bg-white shadow-lg sm:w-[440px]">
            <div className="flex items-start justify-between border-b border-line px-4 py-3">
              <div className="min-w-0 pr-2">
                <div className="mb-1 flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  {selected.isOwn && <span className="text-[10px] text-orange-600">Your node</span>}
                </div>
                <h2 className="font-semibold leading-snug text-ink">{selected.title}</h2>
                <p className="mt-1 text-xs text-muted">{selected.college} · decision node</p>
              </div>
              <button type="button" onClick={() => setSelectedId(null)} className="rounded-lg p-1 text-muted hover:bg-surface">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <AiSynthesis node={selected} />
              <VotePanel
                node={selected}
                myVote={myVote}
                onVote={castVote}
                onCloseDecision={closeDecision}
              />

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Notes on this node</p>
                <div className="space-y-2">
                  {(selected.notes || []).map((n) => (
                    <NoteCard key={n.id} note={n} />
                  ))}
                  {linkedNotes.map((n) => (
                    <NoteCard key={n.id} note={{ ...n, content: n.content || n.title }} />
                  ))}
                  {!selected.notes?.length && !linkedNotes.length && (
                    <p className="text-xs text-muted">No notes yet — staff can add context below.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-line p-4">
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note to this decision node…"
                className="input-field resize-none text-sm"
              />
              <div className="mt-2 flex gap-2">
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  addNoteToNode('pdf', note.trim() || file.name, {
                    title: file.name.replace(/\.pdf$/i, ''),
                    filename: file.name,
                    url: URL.createObjectURL(file),
                  });
                  e.target.value = '';
                }} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1 rounded-xl border border-line px-3 py-2 text-xs text-muted hover:bg-surface"
                >
                  <Paperclip className="h-3.5 w-3.5" /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => { const t = note.trim(); if (t) addNoteToNode('text', t); }}
                  className="btn-primary flex-1 py-2 text-xs"
                >
                  Add note
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
