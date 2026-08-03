/** Demo staff at the head coach's program. */
export const STAFF = {
  head: { coach: 'You', role: 'Head Coach' },
  associate: { coach: 'Mike Torres', role: 'Associate Head Coach' },
  recruiting: { coach: 'Sarah Chen', role: 'Recruiting Coordinator' },
  gk: { coach: 'James Okonkwo', role: 'Goalkeeper Coach' },
  analyst: { coach: 'Lisa Park', role: 'Performance Analyst' },
};

export function getSeedCoachSpace(college = 'Your program') {
  const program = college || 'Your program';
  const { head, associate, recruiting, gk, analyst } = STAFF;

  return [
    {
      id: 'seed-budget',
      kind: 'decision',
      college: program,
      title: 'Budget: allocate one ST slot',
      preview: 'Only one full ST scholarship left this cycle…',
      status: 'decided',
      coach: head.coach,
      role: head.role,
      canvasX: 180,
      canvasY: 320,
      links: ['seed-1'],
      options: [
        { id: 'opt-use', label: 'Use slot now', description: 'Sign before spring window closes' },
        { id: 'opt-hold', label: 'Hold for grad transfer', description: 'Keep flexibility until May' },
      ],
      votes: [
        { id: 'v1', ...recruiting, optionId: 'opt-use', createdAt: Date.now() - 86400000 * 3 },
        { id: 'v2', ...associate, optionId: 'opt-use', createdAt: Date.now() - 86400000 * 2.5 },
        { id: 'v3', ...head, optionId: 'opt-use', createdAt: Date.now() - 86400000 * 2, isOwn: true },
      ],
      notes: [],
      publishedAt: Date.now() - 86400000 * 4,
      isOwn: false,
    },
    {
      id: 'seed-1',
      kind: 'decision',
      college: program,
      title: 'ST signing: Garcia vs Okonkwo',
      preview: 'Win-now transition vs culture-first organizer…',
      status: 'voting',
      coach: recruiting.coach,
      role: recruiting.role,
      canvasX: 480,
      canvasY: 280,
      links: ['seed-budget', 'seed-2'],
      options: [
        { id: 'opt-garcia', label: 'Garcia', description: 'Transition goals · press fit · win-now' },
        { id: 'opt-okonkwo', label: 'Okonkwo', description: 'Leadership · culture · spine stability' },
      ],
      votes: [
        { id: 'v4', ...recruiting, optionId: 'opt-garcia', createdAt: Date.now() - 86400000 * 2 },
        { id: 'v5', ...associate, optionId: 'opt-okonkwo', createdAt: Date.now() - 86400000 * 1.5 },
        { id: 'v6', ...gk, optionId: 'opt-garcia', createdAt: Date.now() - 86400000 * 1.2 },
      ],
      notes: [
        {
          id: 'n1',
          ...recruiting,
          type: 'text',
          content: 'Garcia matches our 4-3-3 press triggers. Okonkwo may need a redshirt year.',
          createdAt: Date.now() - 86400000 * 2,
        },
        {
          id: 'n2',
          ...associate,
          type: 'text',
          content: 'We lost two captains — Okonkwo’s leadership score is the gap we need to close.',
          createdAt: Date.now() - 86400000 * 1.5,
        },
        {
          id: 'n3',
          ...head,
          type: 'text',
          content: 'Need the staff aligned before we offer. One slot, no mulligans.',
          createdAt: Date.now() - 43200000,
          isOwn: true,
        },
      ],
      publishedAt: Date.now() - 86400000 * 2,
      isOwn: false,
    },
    {
      id: 'note-film-1',
      kind: 'note',
      parentId: 'seed-1',
      college: program,
      title: 'Garcia film cut-up',
      coach: analyst.coach,
      role: analyst.role,
      canvasX: 680,
      canvasY: 180,
      type: 'pdf',
      content: 'Hudl — transition runs vs conference CBs',
      artifact: { title: 'Garcia transition film', filename: 'garcia-film.pdf', url: '#' },
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'seed-2',
      kind: 'decision',
      college: program,
      title: 'CB board: pick a primary target',
      preview: 'Avery Kim vs Jordan Blake vs Sam Okoye under $15k…',
      status: 'open',
      coach: associate.coach,
      role: associate.role,
      canvasX: 820,
      canvasY: 420,
      links: ['seed-1'],
      options: [
        { id: 'opt-avery', label: 'Avery Kim', description: 'Organizer · Wyscout aerial leader' },
        { id: 'opt-jordan', label: 'Jordan Blake', description: 'Athletic · ECNL press profile' },
        { id: 'opt-sam', label: 'Sam Okoye', description: 'Pace · budget-safe development' },
      ],
      votes: [
        { id: 'v7', ...recruiting, optionId: 'opt-avery', createdAt: Date.now() - 86400000 * 5 },
        { id: 'v8', ...gk, optionId: 'opt-jordan', createdAt: Date.now() - 86400000 * 4 },
      ],
      notes: [
        {
          id: 'n4',
          ...recruiting,
          type: 'text',
          content: 'All three verified on Wyscout. Avery is the vocal organizer we need.',
          createdAt: Date.now() - 86400000 * 5,
        },
      ],
      publishedAt: Date.now() - 86400000 * 5,
      isOwn: false,
    },
    {
      id: 'note-wyscout-2',
      kind: 'note',
      parentId: 'seed-2',
      college: program,
      title: 'Wyscout CB export',
      coach: analyst.coach,
      role: analyst.role,
      canvasX: 1020,
      canvasY: 340,
      type: 'pdf',
      content: 'Aerial & press metrics for top 5',
      artifact: { title: 'CB board Wyscout export', filename: 'cb-board.pdf', url: '#' },
      createdAt: Date.now() - 86400000 * 3,
    },
  ];
}

/** Migrate legacy thread cards (posts-only) to decision nodes. */
function migrateLegacyNode(thread, program) {
  const posts = thread.posts || thread.notes || [];
  return {
    ...thread,
    kind: thread.kind || 'decision',
    college: program,
    status: thread.status || 'open',
    options: thread.options || [],
    votes: thread.votes || [],
    links: thread.links || [],
    notes: posts.map((p) => ({
      id: p.id || crypto.randomUUID(),
      coach: p.coach,
      role: p.role || STAFF.head.role,
      type: p.type || 'text',
      content: p.content,
      artifact: p.artifact,
      createdAt: p.createdAt || Date.now(),
      isOwn: p.isOwn,
    })),
    posts: undefined,
  };
}

export function normalizeCoachSpace(coachSpace, college) {
  const program = college || 'Your program';
  const seeds = getSeedCoachSpace(program);
  const seedById = Object.fromEntries(seeds.map((s) => [s.id, s]));

  const hasNewModel = coachSpace.some((n) => n.kind === 'decision' || n.kind === 'note');
  if (!hasNewModel && coachSpace.length > 0) {
    return seeds;
  }

  const merged = coachSpace.map((node) => {
    if (node.id?.startsWith('seed-') && seedById[node.id]) {
      const fresh = seedById[node.id];
      return {
        ...fresh,
        canvasX: node.canvasX ?? fresh.canvasX,
        canvasY: node.canvasY ?? fresh.canvasY,
        votes: node.votes?.length ? node.votes : fresh.votes,
        notes: node.notes?.length ? node.notes : fresh.notes,
      };
    }
    if (node.kind === 'note') {
      return { ...node, college: program };
    }
    return migrateLegacyNode(node, program);
  });

  const ids = new Set(merged.map((n) => n.id));
  for (const seed of seeds) {
    if (seed.id.startsWith('note-') && !ids.has(seed.id)) {
      merged.push(seed);
    }
  }

  return merged;
}

export function createDecisionFromChat({ title, preview, college, posts, canvasX, canvasY, chatId }) {
  const options = inferOptionsFromTitle(title);
  return {
    id: chatId ? `pub-${chatId}` : crypto.randomUUID(),
    chatId,
    kind: 'decision',
    college: college || 'Your program',
    title,
    preview,
    status: options.length >= 2 ? 'voting' : 'open',
    coach: STAFF.head.coach,
    role: STAFF.head.role,
    canvasX,
    canvasY,
    links: [],
    options,
    votes: [],
    notes: posts || [],
    publishedAt: Date.now(),
    isOwn: true,
  };
}

function inferOptionsFromTitle(title) {
  const vsMatch = title.match(/(.+?)\s+vs\.?\s+(.+)/i);
  if (vsMatch) {
    return [
      { id: 'opt-a', label: vsMatch[1].trim(), description: 'Option A' },
      { id: 'opt-b', label: vsMatch[2].trim(), description: 'Option B' },
    ];
  }
  return [];
}
