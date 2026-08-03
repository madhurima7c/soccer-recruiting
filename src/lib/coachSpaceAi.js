export function synthesizeNode(node) {
  if (node.kind === 'note') {
    return {
      headline: 'Linked note',
      summary: node.content || node.title || '',
      consensus: null,
      voteTally: [],
      coachStances: [],
      themes: [],
    };
  }

  const notes = node.notes || [];
  const votes = node.votes || [];
  const options = node.options || [];

  const voteTally = options.map((opt) => ({
    ...opt,
    count: votes.filter((v) => v.optionId === opt.id).length,
    voters: votes.filter((v) => v.optionId === opt.id).map((v) => `${v.coach} (${v.role})`),
  }));

  const leading = [...voteTally].sort((a, b) => b.count - a.count)[0];
  const totalVotes = votes.length;
  const staffInNotes = [...new Set(notes.map((n) => n.coach))];

  let consensus = null;
  if (node.status === 'decided' && leading?.count > 0) {
    consensus = `Decision closed — staff landed on ${leading.label}.`;
  } else if (leading && leading.count >= 2 && leading.count > (voteTally[1]?.count || 0)) {
    consensus = `Staff room trending toward ${leading.label} (${leading.count}/${totalVotes} votes).`;
  } else if (totalVotes > 0 && voteTally.filter((v) => v.count > 0).length > 1) {
    consensus = 'Split vote — more discussion or film needed before offering.';
  } else if (totalVotes === 0 && notes.length > 0) {
    consensus = 'Notes accumulating — cast votes to move this decision forward.';
  } else {
    consensus = 'New decision node — add notes and votes to start deliberation.';
  }

  const allText = [
    ...notes.map((n) => n.content || ''),
    ...votes.map((v) => options.find((o) => o.id === v.optionId)?.label || ''),
  ].join(' ').toLowerCase();

  const themes = [];
  if (allText.includes('budget') || allText.includes('$')) themes.push('Budget');
  if (allText.includes('film') || allText.includes('hudl')) themes.push('Film');
  if (allText.includes('culture') || allText.includes('leadership')) themes.push('Culture');
  if (allText.includes('press') || allText.includes('athletic')) themes.push('System fit');
  if (allText.includes('wyscout') || allText.includes('ecnl')) themes.push('Data');
  if (!themes.length) themes.push('Roster gap');

  const headline = [
    totalVotes ? `${totalVotes} vote${totalVotes > 1 ? 's' : ''}` : null,
    notes.length ? `${notes.length} note${notes.length > 1 ? 's' : ''}` : null,
    staffInNotes.length ? `${staffInNotes.length} staff contributor${staffInNotes.length > 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(' · ') || 'Empty decision node';

  const summary = [
    consensus,
    voteTally.length && totalVotes
      ? `Tally: ${voteTally.map((v) => `${v.label} (${v.count})`).join(', ')}.`
      : null,
    notes.length
      ? `Latest notes from ${staffInNotes.slice(0, 3).join(', ')}${staffInNotes.length > 3 ? '…' : ''}.`
      : null,
  ].filter(Boolean).join(' ');

  return {
    headline,
    summary,
    consensus,
    voteTally,
    themes: [...new Set(themes)],
    status: node.status,
  };
}

/** @deprecated use synthesizeNode */
export function synthesizeThread(thread) {
  return synthesizeNode(thread);
}
