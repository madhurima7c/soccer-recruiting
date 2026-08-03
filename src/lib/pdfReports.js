import { jsPDF } from 'jspdf';

function header(doc, title) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(23, 23, 23);
  doc.text(title, 20, 24);
  doc.setDrawColor(229, 229, 229);
  doc.line(20, 28, 190, 28);
}

function body(doc, lines, startY = 38) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(64, 64, 64);
  let y = startY;
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, 170);
    doc.text(wrapped, 20, y);
    y += wrapped.length * 5 + 4;
    if (y > 270) {
      doc.addPage();
      y = 24;
    }
  }
  return y;
}

function drawBarChart(doc, x, y, w, h, labels, valuesA, valuesB, nameA, nameB) {
  doc.setFontSize(9);
  doc.setTextColor(23, 23, 23);
  doc.text('Attribute comparison', x, y);
  y += 8;

  const max = 10;
  const barW = (w - 20) / labels.length / 2 - 2;

  labels.forEach((label, i) => {
    const bx = x + i * ((w - 10) / labels.length) + 4;
    const ha = (valuesA[i] / max) * h;
    const hb = (valuesB[i] / max) * h;

    doc.setFillColor(249, 115, 22);
    doc.rect(bx, y + h - ha, barW, ha, 'F');
    doc.setFillColor(168, 85, 247);
    doc.rect(bx + barW + 2, y + h - hb, barW, hb, 'F');

    doc.setFontSize(7);
    doc.setTextColor(115, 115, 115);
    doc.text(label, bx, y + h + 8, { maxWidth: barW * 2 + 4 });
  });

  doc.setFontSize(8);
  doc.setTextColor(249, 115, 22);
  doc.text(nameA, x, y - 2);
  doc.setTextColor(168, 85, 247);
  doc.text(nameB, x + 60, y - 2);

  return y + h + 18;
}

function drawBudgetBar(doc, x, y, w, segments) {
  doc.setFontSize(9);
  doc.setTextColor(23, 23, 23);
  doc.text('Budget allocation ($k)', x, y);
  y += 6;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cx = x;
  segments.forEach((seg) => {
    const sw = (seg.value / total) * w;
    doc.setFillColor(...seg.rgb);
    doc.rect(cx, y, sw, 10, 'F');
    cx += sw;
  });
  y += 16;
  segments.forEach((seg, i) => {
    doc.setFillColor(...seg.rgb);
    doc.circle(x + i * 45, y, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(64, 64, 64);
    doc.text(`${seg.label} $${seg.value}k`, x + 5 + i * 45, y + 1);
  });
  return y + 10;
}

function drawGapBars(doc, x, y, gaps) {
  doc.setFontSize(9);
  doc.setTextColor(23, 23, 23);
  doc.text('Rival gap index', x, y);
  y += 8;
  gaps.forEach((g) => {
    doc.setFontSize(8);
    doc.text(g.label, x, y);
    doc.text(`${g.score}`, x + 120, y);
    doc.setFillColor(245, 245, 244);
    doc.rect(x, y + 2, 100, 5, 'F');
    doc.setFillColor(249, 115, 22);
    doc.rect(x, y + 2, g.score, 5, 'F');
    y += 12;
  });
  return y + 4;
}

export function buildPlayerCompareData(profile, players = {}) {
  const a = players.a || 'Jordan Blake';
  const b = players.b || 'Avery Kim';
  const position = players.position || profile.positionsNeeded[0] || 'Center Back';
  const labels = ['Athletic', 'Leadership', 'Culture', 'Press fit', 'Aerial'];
  const valuesA = [9, 6, 6, 9, 7];
  const valuesB = [7, 9, 8, 7, 9];
  const recommendation = profile.positionsNeeded.includes('Center Back') || position.includes('Back')
    ? `${b} closes a structural gap if you need a vocal organizer. ${a} wins if you must upgrade athleticism immediately.`
    : `${a} for win-now impact. ${b} if culture and leadership are the bottleneck.`;

  return {
    kind: 'player-compare',
    playerA: { name: a, ovr: 86, cost: 13 },
    playerB: { name: b, ovr: 84, cost: 11 },
    bars: labels.map((label, i) => ({
      label,
      values: [valuesA[i], valuesB[i]],
      names: [a.split(' ')[0], b.split(' ')[0]],
    })),
    chartLabels: labels,
    valuesA,
    valuesB,
    narrative: [
      `${a} brings press-ready athleticism and immediate transition impact. Hudl shows strong recovery runs.`,
      `${b} brings organizer traits and culture stability—Wyscout top-third on defensive actions.`,
      `Your ${profile.formation} loses ${profile.gradLosses} players. One signing shifts identity modestly on a ${profile.rosterSize}-player roster.`,
    ],
    recommendation,
    position,
  };
}

export function buildRivalReportData(profile) {
  const reserve = Math.max(0, Math.round(profile.budgetK * 0.15));
  const perSpot = Math.round((profile.budgetK - reserve) / Math.max(1, profile.gradLosses));
  return {
    kind: 'rival-strategy',
    budgetSegments: [
      { label: 'Signings', value: perSpot * Math.min(profile.gradLosses, 3), color: '#f97316', rgb: [249, 115, 22] },
      { label: 'Reserve', value: reserve, color: '#a855f7', rgb: [168, 85, 247] },
      { label: 'Ops', value: Math.max(5, Math.round(profile.budgetK * 0.08)), color: '#22c55e', rgb: [34, 197, 94] },
    ],
    gapBars: [
      { label: 'Dartmouth — culture / academics', score: 78 },
      { label: 'Dartmouth — defensive depth', score: 42 },
      { label: 'Columbia — attack metrics', score: 81 },
      { label: 'Your program — budget flex', score: 65 },
    ],
    narrative: [
      `With $${profile.budgetK}k in aid and ${profile.gradLosses} graduates leaving, prioritize ${profile.positionsNeeded.join(', ') || 'targeted'} reinforcements.`,
      'Dartmouth leads on Ivy academic fit—counter with faster ECNL pipeline touches and CB/CDM profiles.',
      'Columbia’s attack is strong on film; match with a high-impact ST and overlapping fullback.',
    ],
  };
}

export function generateRivalReport(profile) {
  const data = buildRivalReportData(profile);
  const doc = new jsPDF();
  header(doc, 'Recruiting Strategy: Overtake Dartmouth & Columbia');
  let y = drawBudgetBar(doc, 20, 36, 170, data.budgetSegments);
  y = drawGapBars(doc, 20, y + 6, data.gapBars);
  body(doc, [
    '',
    `Prepared for ${profile.college || 'Your program'} · ${new Date().toLocaleDateString()}`,
    '',
    'Executive summary',
    data.narrative[0],
    '',
    'Dartmouth gap analysis',
    '• They lead on Ivy academic fit and culture scores. Counter with faster ECNL pipeline touches.',
    '• Weakness: defensive depth after two CB graduations. Press with physical CB/CDM profiles from Wyscout comps.',
    '',
    'Columbia gap analysis',
    '• Strong attack metrics in Hudl film review. Match with a high-OVR ST and overlapping fullback.',
    `• Budget edge: hold ~$${Math.max(0, profile.budgetK - 40)}k flex on one difference-maker.`,
    '',
    '90-day actions',
    '1. Pull Wyscout shortlists for CB, ST per your style: ' + (profile.coachingStyle.join(', ') || 'high press') + '.',
    '2. Schedule ECNL event blocks where both rivals had zero presence last cycle.',
    '3. Export this board to Excel and sync visit calendar via connected email.',
  ], y + 4);
  return doc.output('blob');
}

export function generatePlayerCompareReport(profile, players = {}) {
  const data = buildPlayerCompareData(profile, players);
  const doc = new jsPDF();
  header(doc, `Player Decision: ${data.playerA.name} vs ${data.playerB.name}`);
  let y = drawBarChart(
    doc, 20, 40, 170, 50,
    data.chartLabels, data.valuesA, data.valuesB,
    data.playerA.name, data.playerB.name,
  );
  body(doc, [
    `Program context: ${profile.college || 'Your school'} · Budget $${profile.budgetK}k · Position: ${data.position}`,
    '',
    `${data.playerA.name} · OVR ${data.playerA.ovr} · $${data.playerA.cost}k`,
    '• Strengths: Athleticism 9, Competition 8—immediate impact in transition.',
    '• Risk: Culture score still developing; higher variance in year one.',
    '',
    `${data.playerB.name} · OVR ${data.playerB.ovr} · $${data.playerB.cost}k`,
    '• Strengths: Leadership 9, Culture 8—organizer on and off the field.',
    '• Risk: Less burst in 1v1; slower to lift attack metrics.',
    '',
    'Recommendation',
    data.recommendation,
  ], y);
  return doc.output('blob');
}

export function createPdfArtifact(type, profile, players) {
  const reportData = type === 'rival'
    ? buildRivalReportData(profile)
    : buildPlayerCompareData(profile, players);
  const blob = type === 'rival'
    ? generateRivalReport(profile)
    : generatePlayerCompareReport(profile, players);
  const a = players?.a || 'Jordan Blake';
  const b = players?.b || 'Avery Kim';
  const filename = type === 'rival'
    ? 'recruiting-strategy-report.pdf'
    : `${a.toLowerCase().replace(/\s/g, '-')}-vs-${b.toLowerCase().replace(/\s/g, '-')}.pdf`;
  const title = type === 'rival'
    ? 'Recruiting Strategy Report'
    : `${a} vs ${b}`;
  return {
    type: 'pdf',
    title,
    filename,
    url: URL.createObjectURL(blob),
    reportData,
  };
}
