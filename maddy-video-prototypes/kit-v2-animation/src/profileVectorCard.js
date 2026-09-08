import {
  MODAL_FINAL,
  PROFILE_META,
  PROFILE_SUMMARY,
  TEAL,
  asset,
} from "./constants.js";
import { interpolate } from "./interpolate.js";
import {
  LOGGED_MOMENTS,
  POINTS_CONTACT,
  SEASON_STATS,
  popAttrs,
  sectionT,
  staggerT,
} from "./profileSections.js";

function renderWord(word) {
  const cls = word.hl ? "pf-word pf-word-hl" : "pf-word";
  return `<span class="${cls}">${word.text}</span>`;
}

function renderSaveRateChart(chartT) {
  const pathLen = 320;
  const dash = (1 - chartT) * pathLen;
  const fillH = interpolate(chartT, [0, 1], [67, 0]);
  return `
    <svg class="pf-chart-svg" viewBox="0 0 265 72" preserveAspectRatio="none">
      <line x1="0" y1="8.7" x2="265" y2="8.7" stroke="rgba(255,255,255,0.08)" stroke-width="1.1"/>
      <line x1="0" y1="28.3" x2="265" y2="28.3" stroke="rgba(255,255,255,0.08)" stroke-width="1.1"/>
      <line x1="0" y1="47.9" x2="265" y2="47.9" stroke="rgba(255,255,255,0.08)" stroke-width="1.1"/>
      <line x1="0" y1="67.4" x2="265" y2="67.4" stroke="rgba(255,255,255,0.08)" stroke-width="1.1"/>
      <line x1="139" y1="4.4" x2="139" y2="67.4" stroke="rgba(255,255,255,0.08)" stroke-width="1.1" stroke-dasharray="2.2 3.3"/>
      <line x1="0" y1="42.4" x2="265" y2="42.4" stroke="white" stroke-width="1.1" stroke-dasharray="4.4 4.4" opacity="0.35"/>
      <path d="M0 55.5 L35 50 L70 53.3 L104 40.3 L139 44.6 L174 31.5 L209 37 L244 19.6 L265 23.9 L265 67.4 L0 67.4 Z"
        fill="${TEAL}" opacity="${0.26 * chartT}"/>
      <path d="M0 55.5 L35 50 L70 53.3 L104 40.3 L139 44.6 L174 31.5 L209 37 L244 19.6 L265 23.9"
        fill="none" stroke="${TEAL}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
        stroke-dasharray="${pathLen}" stroke-dashoffset="${dash}"/>
    </svg>`;
}

function renderStatBar(label, value, pct, t) {
  const w = Math.round(213 * pct * t);
  return `
    <div class="pf-stat-row" ${popAttrs(t)}>
      <div class="pf-stat-label">${label}</div>
      <div class="pf-stat-bar-row">
        <div class="pf-stat-track">
          <div class="pf-stat-fill" style="width:${w}px"></div>
          <div class="pf-stat-avg"></div>
        </div>
        <span class="pf-stat-val">${value}</span>
      </div>
    </div>`;
}

function renderTimelineItem(date, text, t, opts = {}) {
  const dotCls = opts.muted ? "pf-dot pf-dot-muted" : "pf-dot pf-dot-active";
  const textCls = opts.muted ? "pf-timeline-text pf-muted" : "pf-timeline-text";
  const thumb = opts.video
    ? `<img class="pf-video-thumb" src="${asset("video-short-save.png")}" alt="">`
    : "";
  return `
    <div class="pf-timeline-item" ${popAttrs(t)}>
      <div class="${dotCls}"></div>
      <div class="pf-timeline-body">
        <div class="pf-timeline-date">${date}</div>
        <div class="${textCls}">${text}</div>
      </div>
      ${thumb}
    </div>`;
}

/** Full vector profile — Figma frame 6 layout, sequential populate */
export function renderProfileVectorCard(profileT) {
  const metaT = sectionT(profileT, "meta");
  const summaryT = sectionT(profileT, "summary");
  const saveT = sectionT(profileT, "saveRate");
  const momentsT = sectionT(profileT, "loggedMoments");
  const statsT = sectionT(profileT, "seasonStats");
  const contactT = sectionT(profileT, "pointsContact");
  const coachT = sectionT(profileT, "coachRef");
  const btnT = sectionT(profileT, "buttons");

  const summaryWords = Math.floor(
    interpolate(summaryT, [0, 1], [0, PROFILE_SUMMARY.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const savePct = Math.round(interpolate(saveT, [0, 0.45], [0, 78], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const chartDrawT = interpolate(saveT, [0.2, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const metaHtml =
    metaT > 0.01
      ? `<div class="pf-meta-row" ${popAttrs(metaT)}>
          ${PROFILE_META.map(
            (m, i) => `
            <div class="pf-meta-col" ${popAttrs(staggerT(metaT, i, PROFILE_META.length))}>
              <div class="pf-meta-label">${m.label}</div>
              <div class="pf-meta-val">${m.value}</div>
            </div>`,
          ).join('<div class="pf-meta-div"></div>')}
        </div>`
      : "";

  const summaryHtml =
    summaryWords > 0 && metaT > 0.85
      ? `<div class="pf-summary-block" ${popAttrs(summaryT)}>
          <p class="pf-summary-text"><span class="pf-star-inline">✦</span> ${PROFILE_SUMMARY.slice(0, summaryWords).map(renderWord).join(" ")}</p>
        </div>`
      : "";

  const saveRateHtml =
    saveT > 0.01
      ? `<div class="pf-panel pf-save-rate" ${popAttrs(saveT)}>
          <div class="pf-panel-label">Save rate</div>
          <div class="pf-save-pct">${savePct}%</div>
          ${renderSaveRateChart(chartDrawT)}
          <div class="pf-chart-months"><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span></div>
        </div>`
      : "";

  const momentsHtml =
    momentsT > 0.01
      ? `<div class="pf-panel pf-logged" ${popAttrs(momentsT)}>
          <div class="pf-panel-label">Logged moments</div>
          <div class="pf-timeline">
            ${LOGGED_MOMENTS.map((m, i) => {
              const itemT = staggerT(momentsT, i, LOGGED_MOMENTS.length);
              if (itemT <= 0.001) return "";
              return renderTimelineItem(m.date, m.text, itemT, {
                video: m.video,
                muted: m.muted,
              });
            }).join("")}
          </div>
          <div class="pf-mini-btns" ${popAttrs(interpolate(momentsT, [0.7, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}>
            <span class="pf-mini-btn">View moments</span>
            <span class="pf-mini-btn pf-mini-btn-fill">+ Add moments</span>
          </div>
        </div>`
      : "";

  const statsHtml =
    statsT > 0.01
      ? `<div class="pf-panel pf-season" ${popAttrs(statsT)}>
          <div class="pf-panel-label">Season Statistics</div>
          <div class="pf-stats-list">
            ${SEASON_STATS.map((s, i) => {
              const barT = staggerT(statsT, i, SEASON_STATS.length);
              if (barT <= 0.001) return "";
              return renderStatBar(s.label, s.value, s.pct, barT);
            }).join("")}
          </div>
        </div>`
      : "";

  const contactHtml =
    contactT > 0.01
      ? `<div class="pf-panel pf-contact" ${popAttrs(contactT)}>
          <div class="pf-panel-label">Points of contact</div>
          <div class="pf-timeline pf-timeline-compact">
            ${POINTS_CONTACT.map((c, i) => {
              const itemT = staggerT(contactT, i, POINTS_CONTACT.length);
              if (itemT <= 0.001) return "";
              return renderTimelineItem(c.date, c.text, itemT);
            }).join("")}
          </div>
          <span class="pf-mini-btn pf-view-all" ${popAttrs(interpolate(contactT, [0.65, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}>View all</span>
        </div>`
      : "";

  const coachHtml =
    coachT > 0.01
      ? `<div class="pf-coach-card" ${popAttrs(coachT)}>
          <div class="pf-coach-avatar">MC</div>
          <div class="pf-coach-info">
            <div class="pf-coach-label">CLUB COACH REFERENCE</div>
            <div class="pf-coach-name">Maya Chen</div>
            <div class="pf-coach-sub">Head Coach · City SC ECNL</div>
          </div>
        </div>`
      : "";

  const buttonsHtml =
    btnT > 0.01
      ? `<div class="pf-actions" ${popAttrs(btnT)}>
          <button class="pf-btn pf-btn-ghost" type="button">Add to shortlist</button>
          <button class="pf-btn pf-btn-primary" type="button">View full profile</button>
        </div>`
      : "";

  return `
    <div class="pf-vector" style="width:${MODAL_FINAL.w}px;height:${MODAL_FINAL.h}px">
      <div class="pf-final-header">
        <img class="pf-final-avatar" src="${asset("avatar-julia.png")}" width="70" height="70" alt="">
        <div class="pf-final-header-text">
          <div class="pf-final-name">Julia Smith <span class="card-dot">·</span> <span class="card-pos">GK</span></div>
          <div class="pf-final-sub">#11 · Central HS · 5'7"</div>
        </div>
        <div class="pf-badges" ${popAttrs(metaT)}>
          <span class="pf-badge">2029 Recruit</span>
          <span class="pf-badge">4.8★</span>
        </div>
        <span class="pf-close">✕</span>
      </div>
      ${metaHtml}
      ${summaryHtml}
      ${saveRateHtml}
      ${momentsHtml}
      ${statsHtml}
      ${contactHtml}
      ${coachHtml}
      ${buttonsHtml}
    </div>`;
}

export function scaleProfileToCard(card) {
  return card.w / MODAL_FINAL.w;
}
