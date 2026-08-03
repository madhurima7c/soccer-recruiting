# RosterMind

AI workspace for college soccer coaches — onboarding context, integrations, chat, and PDF recruiting reports.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## What's included

- **Onboarding** — college, roster, budget, coaching style, family context, integrations (Hudl, Wyscout, ECNL, Excel, Outlook, Gmail)
- **Dashboard** — integration snapshot, unread email summary, today context, chat history
- **AI chat** — mock succinct replies + PDF artifacts (jspdf) for rival strategy and player comparisons

Prototype only: no real API, scraping, or LLM. Integrations simulate connect/scrape status.

Reset app state: in dev console run `__resetRosterMind()`
