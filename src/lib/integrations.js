export const INTEGRATIONS = [
  {
    id: 'hudl',
    name: 'Hudl',
    category: 'Soccer',
    desc: 'Pull game film, player highlights, and team tendencies for recruiting decisions.',
    icon: '🎬',
  },
  {
    id: 'wyscout',
    name: 'Wyscout',
    category: 'Soccer',
    desc: 'Scrape match data, player stats, and comparable profiles across leagues.',
    icon: '📊',
  },
  {
    id: 'ecnl',
    name: 'ECNL',
    category: 'Soccer',
    desc: 'Track elite club pipeline, event schedules, and prospect rankings.',
    icon: '⚽',
  },
  {
    id: 'excel',
    name: 'Excel',
    category: 'Productivity',
    desc: 'Sync roster spreadsheets, budget models, and recruiting boards.',
    icon: '📗',
  },
  {
    id: 'outlook',
    name: 'Microsoft Email',
    category: 'Productivity',
    desc: 'Surface recruit emails, visit requests, and compliance threads.',
    icon: '📧',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Productivity',
    desc: 'Aggregate Gmail recruiting conversations and unread follow-ups.',
    icon: '✉️',
  },
];

export const MORE_INTEGRATIONS = [
  { id: 'ncsa', name: 'NCSA', category: 'Soccer', desc: 'Recruit profiles, coach messages, and athlete interest signals.', icon: '🏅' },
  { id: 'sportsrecruits', name: 'SportsRecruits', category: 'Soccer', desc: 'Club and college matching, video links, and pipeline tags.', icon: '📱' },
  { id: 'transfermarkt', name: 'Transfermarkt', category: 'Soccer', desc: 'Market values, transfer history, and comparable pro pathways.', icon: '💶' },
  { id: 'google-calendar', name: 'Google Calendar', category: 'Productivity', desc: 'Visit weekends, ID camp schedules, and staff availability.', icon: '📅' },
  { id: 'slack', name: 'Slack', category: 'Productivity', desc: 'Staff recruiting channels and shared shortlists.', icon: '💬' },
  { id: 'notion', name: 'Notion', category: 'Productivity', desc: 'Recruiting wiki, visit notes, and decision logs.', icon: '📝' },
];

export function getAllIntegrations(profile) {
  const custom = (profile.customIntegrations || []).map((c) => ({
    id: c.id,
    name: c.name,
    category: 'Custom',
    desc: c.desc || 'Custom integration added by your staff.',
    icon: '🔗',
    custom: true,
  }));
  return [...INTEGRATIONS, ...MORE_INTEGRATIONS, ...custom];
}

export function mockScrapeStatus(integrationId) {
  const lines = {
    hudl: '12 new highlight reels indexed · 3 targets tagged',
    wyscout: '847 player profiles refreshed · 14 comps added',
    ecnl: '6 ECNL events synced · 22 prospects updated',
    excel: 'Roster board v3 imported · budget sheet linked',
    outlook: '18 threads parsed · 4 visit requests flagged',
    gmail: '11 unread recruit emails summarized',
    ncsa: '9 new athlete messages · 4 hot leads',
    sportsrecruits: '15 profile views from target clubs',
    transfermarkt: 'Market comps updated for 6 targets',
    'google-calendar': '3 visit weekends blocked · 2 conflicts flagged',
    slack: '2 staff threads with new shortlist votes',
    notion: 'Recruiting board page synced',
  };
  return lines[integrationId] || 'Connected and syncing';
}

export function unreadEmailSummary(integrations) {
  const emailTools = ['gmail', 'outlook'].filter((id) => integrations[id]?.connected);
  if (!emailTools.length) return { total: 0, detail: 'Connect Gmail or Outlook to see email summary.' };
  const gmail = integrations.gmail?.connected ? 7 : 0;
  const outlook = integrations.outlook?.connected ? 5 : 0;
  return {
    total: gmail + outlook,
    detail: `${gmail + outlook} unread recruiting threads across connected inboxes.`,
  };
}
