export const CANVAS = { width: 1920, height: 1080, fps: 30 };
export const DURATION = 300;

export const GRAY = "#f7f7f7";
export const PANEL_BG = "#181a1b";

/** Figma 3360:2229 — frame 1 mini card */
export const MINI_CARD = { x: 338, y: 189, w: 279, h: 74, r: 12 };

/** Figma 3360:2641 — frame 2 zoomed mini card (measured on export) */
export const MINI_CARD_ZOOMED = { x: 288, y: 190, w: 520, h: 100, r: 20 };
/** Summary text — all 3 lines incl. "that you should watch" (excl. far-right thumbnails) */
export const AI_TEXT_BOX = { x: 338, y: 287, w: 852, h: 113 };
export const AI_STAR = { x: 338, y: 284, size: 40 };

/** Figma 3360:1937 final modal */
export const MODAL_FINAL = { x: 547, y: 92, w: 827, h: 895, r: 36 };

/** Vertical bands inside modal (y offsets from modal top) — reveal one by one */
export const MODAL_SECTIONS = [
  { id: "header", y0: 0, y1: 98, start: 0, end: 0.1 },
  { id: "meta", y0: 98, y1: 152, start: 0.08, end: 0.22 },
  { id: "summary", y0: 152, y1: 232, start: 0.18, end: 0.34 },
  { id: "top-widgets", y0: 232, y1: 440, start: 0.3, end: 0.52 },
  { id: "mid-widgets", y0: 440, y1: 720, start: 0.48, end: 0.74 },
  { id: "footer", y0: 720, y1: 895, start: 0.7, end: 0.95 },
] as const;

export const TIMING = {
  aiTextStart: 0,
  aiTextEnd: 65,
  zoomStart: 80,
  zoomEnd: 125,
  morphStart: 130,
  morphEnd: 230,
  finalHoldStart: 230,
  holdEnd: 300,
};

/** Scale frame-1 so mini card reaches frame-2 size */
export const ZOOM = {
  scale: MINI_CARD_ZOOMED.w / MINI_CARD.w,
  originX: MINI_CARD.x,
  originY: MINI_CARD.y,
};
