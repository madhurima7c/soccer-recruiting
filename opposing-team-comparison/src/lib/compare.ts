// The plain-English comparison: every row is a question a coach actually asks,
// with both values, a verdict in words, WHAT IT MEANS in one sentence, and
// WHAT TO DO — including, when the answer is on the recruiting board, the
// specific player to try. No naked diffs, no jargon-only numbers.
import {
  RECRUITS, RIVAL_SEASON, MY_SEASON, RADAR_AXES, GK_AXES, radarOf,
  type Recruit, type RivalTeam,
} from '@/data/seed'
import { myTeamAxes } from '@/lib/rival'

export interface CompareRow {
  id: string
  question: string           // plain-English question
  explainKey: string         // ⓘ entry
  mine: number
  theirs: number
  unit: string
  max: number                // for the paired bars
  betterIs: 'higher' | 'lower'
  verdict: 'you' | 'them' | 'even'
  verdictLabel: string       // "clear edge — you" / "close" ...
  meaning: string            // what this means, in words, with the values
  action: string             // what to do about it
  suggestion?: { recruit: Recruit; line: string }  // draggable answer from the board
  liveWithWhatIf?: boolean   // recomputes as you edit the field
}

const topRecruitBy = (pick: (r: Recruit) => number, exclude: string[]): Recruit | undefined =>
  RECRUITS.filter(r => !exclude.includes(r.id)).sort((a, b) => pick(b) - pick(a))[0]

const axisVal = (r: Recruit, axis: (typeof RADAR_AXES)[number]) =>
  r.position === 'GK' ? 0 : (radarOf(r.id)?.[RADAR_AXES.indexOf(axis)] ?? 0)

function verdictOf(mine: number, theirs: number, betterIs: 'higher' | 'lower', closeBand: number) {
  const lead = betterIs === 'higher' ? mine - theirs : theirs - mine
  if (Math.abs(lead) <= closeBand) return { verdict: 'even' as const, verdictLabel: 'about even' }
  return lead > 0
    ? { verdict: 'you' as const, verdictLabel: 'edge: you' }
    : { verdict: 'them' as const, verdictLabel: 'edge: them' }
}

export function compareRows(rival: RivalTeam, placements: string[], removed: string[]): CompareRow[] {
  const their = RIVAL_SEASON[rival.id]
  const mine = MY_SEASON
  const rows: CompareRow[] = []

  const push = (
    row: Omit<CompareRow, 'verdict' | 'verdictLabel'>,
    closeBand: number,
  ) => rows.push({ ...row, ...verdictOf(row.mine, row.theirs, row.betterIs, closeBand) })

  // 1 · scoring
  push({
    id: 'scoring', question: 'Who scores more?', explainKey: 'gf',
    mine: mine.gf, theirs: their.gf, unit: ' goals/game', max: 3, betterIs: 'higher',
    meaning: `You averaged ${mine.gf} goals a game last season; they averaged ${their.gf}. ${their.gf > mine.gf ? 'They create and finish more than you do.' : mine.gf > their.gf ? 'Your attack out-produced theirs.' : 'Nearly identical output.'}`,
    action: their.gf > mine.gf
      ? 'You don\'t have to out-score them — you have to out-score them THAT DAY. Tighten the two rows below, or add a finisher.'
      : 'Protect this edge: keep your main scorers healthy and don\'t change what creates their chances.',
    suggestion: their.gf > mine.gf
      ? (() => { const r = topRecruitBy(x => axisVal(x, 'Finishing'), placements); return r && { recruit: r, line: `${r.name} is the best pure finisher on your board.` } })()
      : undefined,
  }, 0.15)

  // 2 · conceding
  push({
    id: 'conceding', question: 'Who gives up fewer goals?', explainKey: 'ga',
    mine: mine.ga, theirs: their.ga, unit: ' allowed/game', max: 2.5, betterIs: 'lower',
    meaning: `You allow ${mine.ga} a game; they allow ${their.ga}. ${their.ga < mine.ga ? 'Their defense has been harder to break down than yours.' : mine.ga < their.ga ? 'Your defense has been the stingier one.' : 'Defensively you\'ve been equals.'}`,
    action: their.ga < mine.ga
      ? 'Expect a low-margin game — one goal may decide it. Set pieces and defensive errors become everything.'
      : 'Their defense gives up chances — patience will produce looks; don\'t force the first one.',
  }, 0.15)

  // 3 · keeping the ball
  push({
    id: 'ball', question: 'Who keeps the ball?', explainKey: 'possession',
    mine: mine.possession, theirs: rival.stats.possession, unit: '%', max: 70, betterIs: 'higher',
    meaning: `You averaged ${mine.possession}% of the ball; they averaged ${rival.stats.possession}%. ${rival.stats.possession < 46 ? 'They WANT you to have it — their game starts when you lose it.' : rival.stats.possession > 55 ? 'They\'ll try to make you chase for long stretches.' : 'Neither side is built to dominate the ball.'}`,
    action: rival.stats.possession < 46
      ? 'Having the ball isn\'t winning here. Every giveaway in your half is their best chance — value safe outlets over risky splitting passes.'
      : 'Midfield control decides this one. Whoever wins the middle third sets the terms.',
  }, 4)

  // 4 · winning it back
  push({
    id: 'winback', question: 'Who hunts the ball back faster?', explainKey: 'winback',
    mine: mine.ppda, theirs: rival.stats.ppda, unit: ' passes allowed', max: 16, betterIs: 'lower',
    meaning: `You let opponents make ${mine.ppda} passes before challenging; they allow ${rival.stats.ppda}. ${rival.stats.ppda <= 8 ? 'That\'s an aggressive press — your defenders will have almost no time on the ball.' : rival.stats.ppda >= 12 ? 'They barely press — you\'ll be allowed to build from the back.' : 'They press selectively, in bursts.'}`,
    action: rival.stats.ppda <= 8
      ? 'Your build-up players get hunted. You need calm feet under pressure in midfield — or a plan to skip the press entirely.'
      : 'You\'ll have time on the ball. Use it — this is a game to play through the middle.',
    suggestion: rival.stats.ppda <= 8
      ? (() => { const r = topRecruitBy(x => axisVal(x, 'Security'), placements); return r && { recruit: r, line: `${r.name} keeps the ball under pressure better than anyone on your board.` } })()
      : undefined,
  }, 1.2)

  // 5 · the air — LIVE with the what-if
  const myAir = myTeamAxes(['Aerial'], placements, removed)[0]
  push({
    id: 'air', question: 'Who owns the air?', explainKey: 'air',
    mine: myAir, theirs: their.aerialPct, unit: '', max: 100, betterIs: 'higher',
    liveWithWhatIf: true,
    meaning: `Your squad's aerial ranking is ${myAir} of 100 (this updates as you edit the field above); they win ${their.aerialPct}% of their headers. ${their.aerialPct >= 60 ? 'Crosses and corners are how they hurt you.' : 'The air is not their weapon.'}`,
    action: their.aerialPct >= 60 && myAir < 55
      ? 'This is the gap that decides the game. Add height and box command — or concede zero corners and wide free kicks.'
      : 'No emergency here — normal marking assignments hold.',
    suggestion: their.aerialPct >= 60 && myAir < 55
      ? (() => {
          const gk = RECRUITS.find(r => r.position === 'GK' && !placements.includes(r.id) && (radarOf(r.id)?.[GK_AXES.indexOf('Command')] ?? 0) >= 60)
          const cb = RECRUITS
            .filter(r => r.position === 'CB' && !placements.includes(r.id))
            .sort((a, b) => axisVal(b, 'Aerial') - axisVal(a, 'Aerial'))[0]
          const r = gk ?? cb
          return r && { recruit: r, line: r.position === 'GK' ? `${r.name} commands the box — drag her onto your field and watch this row move.` : `${r.name} is the best aerial defender on your board.` }
        })()
      : undefined,
  }, 5)

  // 6 · dead balls
  push({
    id: 'restarts', question: 'Who\'s dangerous on corners & free kicks?', explainKey: 'setpiece',
    mine: mine.setPiecePct, theirs: rival.stats.setPiecePct, unit: '% of goals', max: 40, betterIs: 'higher',
    meaning: `${rival.stats.setPiecePct}% of their goals come from dead-ball situations (corners, free kicks${rival.id === 'bellfield' ? ', long throws' : ''}); ${mine.setPiecePct}% of yours do. ${rival.stats.setPiecePct >= 25 ? 'Restarts are a rehearsed weapon for them, not luck.' : 'Set pieces are incidental for them.'}`,
    action: rival.stats.setPiecePct >= 25
      ? 'Every foul near your box hands them a chance. Defend clean, and treat their corner routines as scouted plays — your staff\'s film notes cover the patterns.'
      : 'Standard set-piece prep is enough for this one.',
  }, 4)

  // 7 · experience
  push({
    id: 'experience', question: 'Who returns more of last year\'s team?', explainKey: 'experience',
    mine: mine.returning, theirs: their.returning, unit: ' of 11 starters', max: 11, betterIs: 'higher',
    meaning: `You bring back ${mine.returning} of 11 starters next fall (six are graduating); they bring back ${their.returning}. ${their.returning > mine.returning ? 'They\'ll start the season already knowing who they are. You\'ll be rebuilding chemistry.' : 'You\'re the more settled side going in.'}`,
    action: their.returning > mine.returning
      ? 'Favor recruits who arrive READY — transfers with college minutes — over projects, and get commits in early so spring training includes them.'
      : 'Your continuity is an edge in the first month of the season — schedule the hard fixtures early if you can.',
    suggestion: their.returning > mine.returning
      ? (() => { const r = RECRUITS.find(x => x.pipeline === 'Transfer' && !placements.includes(x.id)); return r && { recruit: r, line: `${r.name} is a transfer with ${r.eligYears} season${r.eligYears === 1 ? '' : 's'} of college experience — ready on day one.` } })()
      : undefined,
  }, 1)

  return rows
}

export function verdictSummary(rows: CompareRow[]) {
  return {
    you: rows.filter(r => r.verdict === 'you').length,
    them: rows.filter(r => r.verdict === 'them').length,
    even: rows.filter(r => r.verdict === 'even').length,
  }
}
