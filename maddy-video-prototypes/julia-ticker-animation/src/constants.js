/** Figma frames 3428:7942 / 8294 / 8312 — native 1920×1080 */
export const CANVAS = { width: 1920, height: 1080, fps: 30 };
export const DURATION = 300;

export const COLORS = {
  bg: "#f7f7f7",
  railBg: "#171e1a",
  railBorder: "#2b352f",
  teal: "#34d0bd",
  tealText: "#75eadc",
  label: "#c5c7c6",
  btnText: "#1a1a1a",
};

/** railrow-Julia Smith — Figma node 3428:8249 */
export const RAIL = {
  width: 3216,
  height: 353.076,
  border: 6.112,
  radius: 73.341,
  padX: 61.118,
  padY: 55.006,
  identityWidth: 876.958,
  /** Figma frame 1 — full card visible from left, rest clipped on right */
  leftStart: 670,
  topStart: 363.709,
  leftMid: -503,
  leftEnd: -1782,
};

export const AVATAR = { size: 230.84, border: 8.109 };

export const BTN = {
  width: 434.326,
  height: 159.142,
  radius: 26.524,
};

export const TIMING = {
  holdStart: 0,
  holdStartEnd: 45,
  scrollStart: 45,
  scrollEnd: 165,
  holdEndStart: 165,
  holdEndEnd: 195,
  cursorMoveStart: 195,
  cursorMoveEnd: 225,
  clickStart: 225,
  clickEnd: 252,
  confettiStart: 240,
  confettiEnd: 300,
};

export const asset = (name) => `/assets/${name}`;
