const A = (name) => `/assets/log-moment/${name}`;

function playerCard(player, { active = false } = {}) {
  const posClass = active ? "lm-pos lm-pos-active" : "lm-pos";
  return `
    <article class="lm-player-card${active ? " lm-player-card-active" : ""}">
      <div class="lm-player-id">
        <img class="lm-player-avatar" src="${A(player.avatar)}" alt=""${player.avatarStyle ? ` style="${player.avatarStyle}"` : ""}>
        <div class="lm-player-name-block">
          <p class="lm-player-name">${player.name}</p>
          <p class="${posClass}">${player.position}</p>
        </div>
      </div>
      <div class="lm-divider"></div>
      ${player.rows
        .map(
          (row) => `
        <div class="lm-metric-row">
          ${row
            .map(
              (m) => `
            <div class="lm-metric">
              <p class="lm-metric-label">${m.label}</p>
              <p class="lm-metric-value">${m.value}</p>
            </div>`,
            )
            .join("")}
        </div>`,
        )
        .join("")}
    </article>`;
}

const PLAYERS = [
  {
    name: "Julia Smith",
    position: "FW",
    avatar: "avatar-julia.png",
    active: true,
    rows: [
      [
        { label: "GRAD", value: "2027" },
        { label: "GPA", value: "3.92" },
      ],
      [
        { label: "HEIGHT", value: "5′7″" },
        { label: "JERSEY", value: "#11" },
      ],
      [
        { label: "HS", value: "Central HS" },
        { label: "POSITION", value: "FW" },
      ],
    ],
  },
  {
    name: "Sam Ortiz",
    position: "CM",
    avatar: "avatar-sam.png",
    rows: [
      [
        { label: "GRAD", value: "2028" },
        { label: "GPA", value: "3.75" },
      ],
      [
        { label: "HEIGHT", value: "5′5″" },
        { label: "JERSEY", value: "#10" },
      ],
      [
        { label: "HS", value: "Westlake HS" },
        { label: "POSITION", value: "CM" },
      ],
    ],
  },
  {
    name: "Jordan Lee",
    position: "CM",
    avatar: "avatar-jordan.png",
    avatarStyle: "object-position: 60% 20%",
    rows: [
      [
        { label: "GRAD", value: "2027" },
        { label: "GPA", value: "3.88" },
      ],
      [
        { label: "HEIGHT", value: "5′6″" },
        { label: "JERSEY", value: "#7" },
      ],
      [
        { label: "HS", value: "Liberty HS" },
        { label: "POSITION", value: "CM" },
      ],
    ],
  },
];

/** Figma node 2539:28373 — 402×874 iPhone Log moment */
export function renderLogMomentScreen() {
  return `
    <div class="lm-phone">
      <div class="lm-status-bar">
        <span class="lm-status-time">9:41</span>
        <span class="lm-status-island"></span>
        <span class="lm-status-icons" aria-hidden="true">
          <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="white"/><rect x="5" y="2" width="3" height="10" rx="1" fill="white"/><rect x="10" y="0" width="3" height="12" rx="1" fill="white"/><rect x="15" y="1" width="3" height="11" rx="1" fill="white" opacity="0.35"/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.4C10.4 2.4 12.6 3.3 14.2 4.8L15.6 3.4C13.6 1.4 10.9 0.2 8 0.2C5.1 0.2 2.4 1.4 0.4 3.4L1.8 4.8C3.4 3.3 5.6 2.4 8 2.4Z" fill="white"/><path d="M8 6.4C9.5 6.4 10.9 7 11.9 8L13.3 6.6C11.9 5.2 10 4.4 8 4.4C6 4.4 4.1 5.2 2.7 6.6L4.1 8C5.1 7 6.5 6.4 8 6.4Z" fill="white"/><path d="M8 10.2C8.9 10.2 9.7 10.6 10.3 11.2L8 13.5L5.7 11.2C6.3 10.6 7.1 10.2 8 10.2Z" fill="white" transform="translate(0,-2)"/></svg>
          <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="white" stroke-opacity="0.35" fill="none"/><rect x="2" y="2" width="17" height="9" rx="2" fill="white"/><path d="M24 4.5V8.5C25 8 25.5 7.2 25.5 6.5C25.5 5.8 25 5 24 4.5Z" fill="white" opacity="0.4"/></svg>
        </span>
      </div>

      <div class="lm-content">
        <header class="lm-page-title">
          <span class="lm-back">←</span>
          <span class="lm-title">Field 7</span>
          <span class="lm-title-spacer"></span>
        </header>

        <section class="lm-fixture">
          <div class="lm-fixture-teams">
            <div class="lm-team">
              <img class="lm-club-logo" src="${A("club-ga-aspire.png")}" alt="">
              <p class="lm-team-name">GA Aspire</p>
            </div>
            <div class="lm-kickoff">
              <p class="lm-kickoff-time">9:45 AM</p>
              <div class="lm-live-row">
                <img class="lm-live-dot" src="${A("live-dot.svg")}" alt="">
                <span class="lm-live-text">LIVE · 34′</span>
              </div>
            </div>
            <div class="lm-team">
              <img class="lm-club-logo" src="${A("club-fc-dallas.png")}" alt="">
              <p class="lm-team-name">FC Dallas</p>
            </div>
          </div>
        </section>

        <section class="lm-players">
          <div class="lm-players-header">
            <h2 class="lm-players-title">Watching 3 players</h2>
            <img class="lm-add-btn" src="${A("btn-add-player.svg")}" alt="">
          </div>
          <div class="lm-carousel">
            ${PLAYERS.map((p) => playerCard(p, { active: p.active })).join("")}
          </div>
          <div class="lm-pagination">
            <img src="${A("live-dot.svg")}" alt="" class="lm-page-dot lm-page-dot-active">
            <img src="${A("page-dot.svg")}" alt="" class="lm-page-dot">
            <img src="${A("page-dot.svg")}" alt="" class="lm-page-dot">
            <span class="lm-swipe-hint">Swipe →</span>
          </div>
        </section>

        <section class="lm-log-panel">
          <p class="lm-panel-live">LIVE · 34′</p>
          <div class="lm-chips">
            <span class="lm-chip lm-chip-selected">Shot</span>
            <span class="lm-chip">Duel</span>
            <span class="lm-chip">Compete</span>
            <span class="lm-chip">Flag</span>
          </div>
          <div class="lm-note-field">
            <span class="lm-note-placeholder">Add an optional note…</span>
            <img class="lm-mic" src="${A("mic.svg")}" alt="">
          </div>
          <button type="button" class="lm-log-btn">Log moment</button>
        </section>
      </div>
    </div>`;
}

export const LOG_MOMENT_SIZE = { width: 402, height: 874 };
