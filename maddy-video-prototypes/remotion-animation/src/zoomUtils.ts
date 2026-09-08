import { MINI_CARD, MINI_CARD_ZOOMED, MODAL_FINAL } from "./constants";

type Rect = { x: number; y: number; w: number; h: number; r: number };

/** Profile expands from frame-2 mini card, anchored top-left */
export const getMorphEndRect = (): Rect => ({
  x: MINI_CARD_ZOOMED.x,
  y: MINI_CARD_ZOOMED.y,
  w: MODAL_FINAL.w,
  h: MODAL_FINAL.h,
  r: MODAL_FINAL.r,
});

export const lerpRect = (a: Rect, b: Rect, t: number) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
  r: a.r + (b.r - a.r) * t,
});

/** Interpolate mini card from frame-1 → frame-2 during zoom */
export const getZoomedMiniCard = (zoomProg: number): Rect => ({
  x: MINI_CARD.x + (MINI_CARD_ZOOMED.x - MINI_CARD.x) * zoomProg,
  y: MINI_CARD.y + (MINI_CARD_ZOOMED.y - MINI_CARD.y) * zoomProg,
  w: MINI_CARD.w + (MINI_CARD_ZOOMED.w - MINI_CARD.w) * zoomProg,
  h: MINI_CARD.h + (MINI_CARD_ZOOMED.h - MINI_CARD.h) * zoomProg,
  r: MINI_CARD.r + (MINI_CARD_ZOOMED.r - MINI_CARD.r) * zoomProg,
});
