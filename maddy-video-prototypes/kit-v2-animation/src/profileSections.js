import { Easing, interpolate } from "./interpolate.js";

/** Sequential reveal windows on profileT 0→1 (populate + settle/zoom-out) */
export const PROFILE_SECTIONS = {
  meta: { start: 0.0, end: 0.12 },
  /** Summary waits for meta row to finish — avoids text collision at ~6.2s */
  summary: { start: 0.12, end: 0.28 },
  saveRate: { start: 0.16, end: 0.32 },
  loggedMoments: { start: 0.26, end: 0.5 },
  seasonStats: { start: 0.38, end: 0.82 },
  pointsContact: { start: 0.58, end: 0.88 },
  coachRef: { start: 0.78, end: 0.92 },
  buttons: { start: 0.9, end: 1.0 },
};

export const SEASON_STATS = [
  { label: "Goals /90", value: "0.62", pct: 0.852 },
  { label: "xG /90", value: "0.51", pct: 0.876 },
  { label: "Aerial win %", value: "68%", pct: 0.763 },
  { label: "Press actions /90", value: "22", pct: 0.801 },
  { label: "Minutes played", value: "1,840", pct: 0.898 },
];

export const LOGGED_MOMENTS = [
  { date: "Jul 12 '26", text: "Save — full-stretch tip over bar · video", video: true },
  { date: "Jul 12 '26", text: "Distribution — breaks first line · video", video: true },
  { date: "May 03 '26", text: "Coach note: vocal leadership, commands box · staff", muted: true },
];

export const POINTS_CONTACT = [
  { date: "Jul 12 '26", text: "Email sent by Julia" },
  { date: "Jul 16 '26", text: "You watched Julia at ECNL 2026" },
];

export function sectionT(profileT, section) {
  const { start, end } = PROFILE_SECTIONS[section];
  return interpolate(profileT, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
}

export function staggerT(sectionProgress, index, count, spread = 0.82) {
  if (sectionProgress <= 0) return 0;
  const slot = count <= 1 ? 0 : index / (count - 1);
  const start = slot * spread;
  const end = Math.min(1, start + (1 - spread) / Math.max(count, 1));
  return interpolate(sectionProgress, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.12)),
  });
}

export function popAttrs(t) {
  if (t <= 0.001) return 'style="opacity:0;transform:translateY(10px) scale(0.94)"';
  const y = interpolate(t, [0, 1], [10, 0]);
  const scale = interpolate(t, [0, 1], [0.94, 1]);
  return `style="opacity:${t};transform:translateY(${y}px) scale(${scale})"`;
}
