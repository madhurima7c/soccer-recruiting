import { createPdfArtifact } from './pdfReports.js';
import { mockScrapeStatus } from './integrations.js';

function succinct(text) {
  return text.trim();
}

export function getSuggestedPrompts(profile) {
  const pos = profile.positionsNeeded[0] || 'Center Back';
  const pos2 = profile.positionsNeeded[1] || pos;
  const perSpot = profile.gradLosses > 0
    ? Math.round(profile.budgetK / Math.max(1, profile.gradLosses))
    : Math.round(profile.budgetK * 0.15);
  const trait = profile.playerPrefs[0]?.toLowerCase() || 'leadership';
  const style = profile.coachingStyle[0]?.toLowerCase() || 'high press';
  const school = profile.college || 'our program';

  return [
    `How would a ${trait}-first ${pos} change our ${profile.formation} roster identity at ${school}?`,
    `Top ${pos2} targets under ~$${perSpot}k that fit our ${style} system — who should I watch first?`,
    `Jordan Blake vs Avery Kim for ${pos}: who closes our gap faster given ${profile.gradLosses} grads out?`,
  ];
}

export function mockAiReply(input, profile) {
  const q = input.toLowerCase();
  const pos = profile.positionsNeeded[0] || 'Center Back';

  if (q.includes('jordan') && q.includes('avery') || q.includes('player a') || q.includes('player b') || (q.includes(' vs ') && q.includes('decide'))) {
    const artifact = createPdfArtifact('player', profile, { a: 'Jordan Blake', b: 'Avery Kim', position: pos });
    return {
      text: succinct(`Jordan brings ${profile.coachingStyle[0] || 'press'}-ready athleticism; Avery brings organizer traits and culture. PDF breaks down fit vs your current ${profile.formation} spine.`),
      artifact,
    };
  }

  if (q.includes('top') && (q.includes('candidate') || q.includes('target') || q.includes('who should i watch'))) {
    const perSpot = Math.round(profile.budgetK / Math.max(1, profile.gradLosses));
    return {
      text: succinct(`Top ${pos} board under ~$${perSpot}k: 1) Jordan Blake (ECNL A, press profile) 2) Avery Kim (Wyscout comp leader on aerials) 3) Mia Torres (budget-safe, high development) 4) Sam Okoye (Hudl film — recovery pace) 5) Riley Chen (culture score, local visit). Connect Wyscout/ECNL to refresh weekly.`),
    };
  }

  if (q.includes('roster identity') || q.includes('change our') || q.includes('how would a') || q.includes('compared to')) {
    const trait = profile.playerPrefs[0] || 'competitive';
    return {
      text: succinct(`A ${trait.toLowerCase()} ${pos} shifts team center slightly toward ${trait.includes('Leadership') ? 'Leadership' : 'Competition'} on your identity map—modest move with one signing on ${profile.rosterSize} players. Biggest roster gap: ${profile.positionsNeeded.join(', ') || 'unset'}. Pair with ${profile.coachingStyle[0] || 'your system'} clips in Hudl before offering.`),
    };
  }

  if (q.includes('pdf') || q.includes('report') || q.includes('dashboard')) {
    const artifact = createPdfArtifact('rival', profile);
    return {
      text: succinct(`Report generated from ${profile.college || 'your'} context, $${profile.budgetK}k budget, and connected integrations. Open PDF below.`),
      artifact,
    };
  }

  if (q.includes('budget') || q.includes('scholarship')) {
    return {
      text: succinct(`Cap $${profile.budgetK}k · ${profile.gradLosses} departures. Hold ~15% reserve. Average slot this cycle: ~$${Math.round(profile.budgetK / Math.max(1, profile.gradLosses))}k.`),
    };
  }

  if (q.includes('recruit') || q.includes('hire')) {
    const count = Math.max(1, Math.min(3, profile.gradLosses));
    return {
      text: succinct(`Recommend ${count} signings in ${profile.positionsNeeded.join(', ') || pos}—not more. Match ${profile.playerPrefs[0] || 'competition'} + ${profile.coachingStyle[0] || 'your style'}.`),
    };
  }

  return {
    text: succinct(`Using ${profile.college || 'your program'} context · $${profile.budgetK}k · needs: ${profile.positionsNeeded.join(', ') || 'TBD'}. Try a position compare, top-candidates list, or Jordan vs Avery decision.`),
  };
}

export function buildTodaySummary(profile) {
  const connected = Object.entries(profile.integrations || {})
    .filter(([, v]) => v?.connected)
    .map(([id]) => id);

  const scrapeLines = connected.slice(0, 4).map((id) => mockScrapeStatus(id));

  return {
    college: profile.college || 'Program not set',
    budget: `$${profile.budgetK}k aid`,
    needs: profile.positionsNeeded.join(', ') || 'Define in Context',
    style: profile.coachingStyle.join(', ') || '—',
    integrations: connected.length,
    scrapeLines,
  };
}
