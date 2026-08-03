import { useState } from 'react';
import { Check, ArrowUpRight, Plus } from 'lucide-react';
import { getAllIntegrations } from '../lib/integrations';

export default function IntegrationsPanel({ profile, onUpdateProfile }) {
  const [customName, setCustomName] = useState('');
  const all = getAllIntegrations(profile);

  function toggle(id) {
    const integrations = {
      ...profile.integrations,
      [id]: {
        connected: !profile.integrations?.[id]?.connected,
        connectedAt: new Date().toISOString(),
      },
    };
    onUpdateProfile({ ...profile, integrations });
  }

  function addCustom() {
    const name = customName.trim();
    if (!name) return;
    const id = `custom-${Date.now()}`;
    const customIntegrations = [
      ...(profile.customIntegrations || []),
      { id, name, desc: `Custom tool: ${name}` },
    ];
    onUpdateProfile({
      ...profile,
      customIntegrations,
      integrations: {
        ...profile.integrations,
        [id]: { connected: true, connectedAt: new Date().toISOString() },
      },
    });
    setCustomName('');
  }

  const connected = all.filter((i) => profile.integrations?.[i.id]?.connected);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Integrations</h1>
      <p className="mt-2 text-sm text-muted">
        {connected.length} connected · Hudl, Wyscout, ECNL scrape recruiting data; email tools surface inbox context.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((item) => {
          const isConnected = profile.integrations?.[item.id]?.connected;
          return (
            <article key={item.id} className="card">
              <div className="mb-3 flex items-start justify-between">
                <span className="text-2xl">{item.icon}</span>
                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] uppercase text-muted">
                  {item.category}
                </span>
              </div>
              <h3 className="font-medium text-ink">{item.name}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm transition ${
                  isConnected
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-line hover:border-neutral-400'
                }`}
              >
                {isConnected ? (
                  <>
                    <Check className="h-4 w-4" /> Connected
                  </>
                ) : (
                  <>
                    Connect <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-line bg-surface p-6">
        <h3 className="flex items-center gap-2 text-sm font-medium text-ink">
          <Plus className="h-4 w-4" /> Add another tool
        </h3>
        <p className="mt-1 text-xs text-muted">Club CRM, legacy database, or internal spreadsheet API</p>
        <div className="mt-4 flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Tool name (e.g. Teamworks, ARMS)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          />
          <button type="button" onClick={addCustom} className="btn-primary py-2.5">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
