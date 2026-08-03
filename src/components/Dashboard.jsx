import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, MessageSquare, FileText, ExternalLink,
  Mail, Plug, ChevronRight, Share2, Check,
} from 'lucide-react';
import Sidebar, { SidebarToggle } from './Sidebar.jsx';
import IntegrationsPanel from './IntegrationsPanel.jsx';
import ContextPanel from './ContextPanel.jsx';
import CoachSpacePanel from './CoachSpacePanel.jsx';
import ReportPreview from './ReportPreview.jsx';
import { getAllIntegrations, unreadEmailSummary } from '../lib/integrations';
import { getSuggestedPrompts, mockAiReply, buildTodaySummary } from '../lib/mockAi';
import { STAFF, createDecisionFromChat } from '../lib/coachSpaceSeed';

function PdfArtifact({ artifact }) {
  if (!artifact) return null;
  return (
    <a
      href={artifact.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-white p-4 transition hover:border-orange-300 shadow-sm"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
        <FileText className="h-5 w-5 text-orange-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{artifact.title}</p>
        <p className="text-xs text-muted">{artifact.filename}</p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted" />
    </a>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-ink text-white'
            : 'border border-line bg-white text-ink shadow-sm'
        }`}
      >
        {msg.content}
        {msg.artifact?.reportData && <ReportPreview reportData={msg.artifact.reportData} />}
        {msg.artifact && <PdfArtifact artifact={msg.artifact} />}
      </div>
    </div>
  );
}

function DashboardHome({ profile, prompts, today, emailSummary, connectedCount, onPrompt, onNewChat }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Today</h1>
      <p className="mt-1 text-sm text-muted">{profile.college || 'Your program'} · quick snapshot</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="card">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Plug className="h-3.5 w-3.5 text-orange-500" />
            Integrations
          </div>
          <p className="mt-2 text-lg font-medium text-ink">{connectedCount} connected</p>
          <p className="mt-1 text-xs text-muted">{emailSummary.detail}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Mail className="h-3.5 w-3.5 text-orange-500" />
            Inbox
          </div>
          <p className="mt-2 text-lg font-medium text-ink">{emailSummary.total} unread</p>
        </div>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-4">
        {[
          { label: 'Program', value: today.college },
          { label: 'Budget', value: today.budget },
          { label: 'Needs', value: today.needs },
          { label: 'Style', value: today.style },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-line bg-white px-3 py-2">
            <p className="text-[10px] uppercase text-muted">{item.label}</p>
            <p className="truncate text-xs font-medium text-ink">{item.value}</p>
          </div>
        ))}
      </div>

      {today.scrapeLines.length > 0 && (
        <ul className="mt-4 space-y-1">
          {today.scrapeLines.map((line, i) => (
            <li key={i} className="flex items-center gap-1 text-xs text-muted">
              <ChevronRight className="h-3 w-3" /> {line}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10">
        <h2 className="text-sm font-medium text-ink">Suggested for you</h2>
        <div className="mt-3 flex flex-col gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPrompt(p)}
              className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-left text-sm text-ink shadow-sm hover:border-neutral-300"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted" />
              {p}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onNewChat}
          className="mt-4 text-xs text-muted hover:text-ink"
        >
          Or start a blank chat →
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({
  profile,
  onUpdateProfile,
  chats,
  onChatsChange,
  coachSpace,
  onCoachSpaceChange,
  onResetOnboarding,
  onRestartFromOnboarding,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState('dashboard');
  const [input, setInput] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [publishToast, setPublishToast] = useState(false);
  const bottomRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeId);
  const prompts = getSuggestedPrompts(profile);
  const today = buildTodaySummary(profile);
  const emailSummary = unreadEmailSummary(profile.integrations || {});
  const connectedCount = getAllIntegrations(profile).filter((i) => profile.integrations?.[i.id]?.connected).length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  function newChat() {
    const chat = {
      id: crypto.randomUUID(),
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
      published: false,
    };
    onChatsChange([chat, ...chats]);
    setActiveId(chat.id);
    setView('chat');
  }

  function send(text) {
    const q = text.trim();
    if (!q) return;

    let chat = activeChat;
    let allChats = chats;

    if (!chat) {
      chat = {
        id: crypto.randomUUID(),
        title: q.slice(0, 48),
        messages: [],
        createdAt: Date.now(),
        published: false,
      };
      allChats = [chat, ...chats];
      setActiveId(chat.id);
      setView('chat');
    }

    const userMsg = { role: 'user', content: q };
    const reply = mockAiReply(q, profile);
    const assistantMsg = { role: 'assistant', content: reply.text, artifact: reply.artifact };

    const updated = {
      ...chat,
      title: chat.messages.length ? chat.title : q.slice(0, 48),
      messages: [...chat.messages, userMsg, assistantMsg],
    };

    onChatsChange(allChats.map((c) => (c.id === updated.id ? updated : c)));
    setInput('');
  }

  function publishChat() {
    if (!activeChat?.messages?.length) return;
    const preview = activeChat.messages.find((m) => m.role === 'assistant')?.content?.slice(0, 140)
      || activeChat.messages[0]?.content?.slice(0, 140);

    const notes = activeChat.messages.flatMap((m) => {
      if (m.role === 'user') {
        return [{
          id: crypto.randomUUID(),
          coach: STAFF.head.coach,
          role: STAFF.head.role,
          type: 'text',
          content: m.content,
          createdAt: Date.now(),
          isOwn: true,
        }];
      }
      if (m.role === 'assistant' && m.artifact) {
        return [{
          id: crypto.randomUUID(),
          coach: STAFF.head.coach,
          role: STAFF.head.role,
          type: 'pdf',
          content: m.content,
          artifact: {
            title: m.artifact.title,
            filename: m.artifact.filename,
            url: m.artifact.url,
            reportData: m.artifact.reportData,
          },
          createdAt: Date.now(),
          isOwn: true,
        }];
      }
      return [];
    });

    const updated = { ...activeChat, published: true, publishedAt: Date.now() };
    onChatsChange(chats.map((c) => (c.id === updated.id ? updated : c)));

    const existing = coachSpace.find((e) => e.chatId === activeChat.id);
    const decisionCount = coachSpace.filter((n) => n.kind === 'decision').length;
    const canvasX = existing?.canvasX ?? 420 + (decisionCount % 2) * 300;
    const canvasY = existing?.canvasY ?? 260 + Math.floor(decisionCount / 2) * 180;

    const entry = createDecisionFromChat({
      title: activeChat.title,
      preview,
      college: profile.college,
      posts: notes,
      canvasX,
      canvasY,
      chatId: activeChat.id,
    });

    const withoutDup = coachSpace.filter((e) => e.chatId !== activeChat.id);
    onCoachSpaceChange([entry, ...withoutDup]);
    setPublishToast(true);
    setTimeout(() => setPublishToast(false), 3000);
  }

  const viewTitle = {
    dashboard: 'Dashboard',
    integrations: 'Integrations',
    context: 'Context',
    'coach-space': 'Coach Space',
    chat: activeChat?.title || 'Chat',
  }[view];

  return (
    <div className="flex h-screen bg-surface text-ink">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        view={view}
        onNavigate={setView}
        chats={chats}
        activeChatId={activeId}
        onSelectChat={(id) => {
          setActiveId(id);
          setView('chat');
        }}
        onNewChat={newChat}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <SidebarToggle open={sidebarOpen} onToggle={() => setSidebarOpen(true)} />
            <span className="text-sm text-muted">{viewTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {view === 'chat' && activeChat?.messages?.length > 0 && (
              <button
                type="button"
                onClick={publishChat}
                disabled={activeChat.published}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition ${
                  activeChat.published
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-line hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                {activeChat.published ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Published
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" /> Publish to Coach Space
                  </>
                )}
              </button>
            )}
          </div>
        </header>

        {publishToast && (
          <div className="bg-orange-50 px-4 py-2 text-center text-xs text-orange-700 border-b border-orange-100">
            Published to Coach Space — opens as a decision node. Staff can add notes and vote.
          </div>
        )}

        <div className={`flex-1 overflow-y-auto ${view === 'coach-space' ? 'overflow-hidden' : ''}`}>
          {view === 'dashboard' && (
            <DashboardHome
              profile={profile}
              prompts={prompts}
              today={today}
              emailSummary={emailSummary}
              connectedCount={connectedCount}
              onPrompt={(p) => {
                setView('chat');
                send(p);
              }}
              onNewChat={newChat}
            />
          )}

          {view === 'integrations' && (
            <IntegrationsPanel profile={profile} onUpdateProfile={onUpdateProfile} />
          )}

          {view === 'context' && (
            <ContextPanel
              profile={profile}
              onEditContext={onResetOnboarding}
              onRestartFromOnboarding={onRestartFromOnboarding}
            />
          )}

          {view === 'coach-space' && (
            <CoachSpacePanel
              coachSpace={coachSpace}
              onCoachSpaceChange={onCoachSpaceChange}
              profile={profile}
            />
          )}

          {view === 'chat' && (
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto max-w-3xl space-y-6">
                  {!activeChat?.messages?.length ? (
                    <div className="flex flex-col items-center pt-12 text-center">
                      <Sparkles className="mb-4 h-8 w-8 text-purple-500" />
                      <h1 className="text-xl font-semibold text-ink">New chat</h1>
                      <p className="mt-2 text-sm text-muted">Pick a prompt or ask anything</p>
                      <div className="mt-8 flex w-full max-w-lg flex-col gap-2">
                        {prompts.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => send(p)}
                            className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-left text-sm text-ink shadow-sm hover:border-neutral-300"
                          >
                            <MessageSquare className="h-4 w-4 shrink-0 text-muted" />
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    activeChat.messages.map((msg, i) => <Message key={i} msg={msg} />)
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>
            </div>
          )}
        </div>

        {view === 'chat' && (
          <div className="border-t border-line bg-white p-4">
            <div className="mx-auto max-w-3xl">
              <div className="chat-input-wrap">
                <div className="chat-input-inner flex items-end gap-2">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder="Ask about recruits, roster fit, or player decisions…"
                    className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                  />
                  <button
                    type="button"
                    onClick={() => send(input)}
                    className="mb-1 rounded-lg bg-ink p-2 text-white hover:bg-neutral-800"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
