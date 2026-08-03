import {
  LayoutDashboard, Plug, UserCircle, Plus, MessageSquare,
  Users, PanelLeftClose, PanelLeft,
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'context', label: 'Context', icon: UserCircle },
  { id: 'coach-space', label: 'Coach Space', icon: Users },
];

export default function Sidebar({
  open,
  onToggle,
  view,
  onNavigate,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
}) {
  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-line bg-white transition-all ${
        open ? 'w-[260px]' : 'w-0 overflow-hidden border-0'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 text-xs font-bold text-white">
            RM
          </div>
          <span className="text-sm font-semibold text-ink">RosterMind</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-ink"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <nav className="space-y-0.5 px-2">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              view === id
                ? 'bg-surface text-ink font-medium'
                : 'text-muted hover:bg-surface hover:text-ink'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-4 px-2">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm text-ink transition hover:bg-surface"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto px-2 pb-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Chat history
        </p>
        {chats.length === 0 && (
          <p className="px-3 text-xs text-muted">No conversations yet</p>
        )}
        {chats.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              onSelectChat(c.id);
              onNavigate('chat');
            }}
            className={`mb-0.5 flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${
              c.id === activeChatId && view === 'chat'
                ? 'bg-surface text-ink font-medium'
                : 'text-muted hover:bg-surface'
            }`}
          >
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-2 flex-1">{c.title}</span>
            {c.published && (
              <span className="shrink-0 rounded bg-orange-100 px-1 text-[9px] text-orange-600">live</span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}

export function SidebarToggle({ open, onToggle }) {
  if (open) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-lg p-2 text-muted hover:bg-surface"
    >
      <PanelLeft className="h-4 w-4" />
    </button>
  );
}
