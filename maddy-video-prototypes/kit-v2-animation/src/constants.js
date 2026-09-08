export const CANVAS = { width: 1920, height: 1080, fps: 30 };
export const DURATION = 300;

export const FRAME_BG = "#f7f7f7";
export const PANEL_BG = "#181a1b";
/** Expanded card shell — Figma semantic/surface/app */
export const CARD_SHELL = "#181a1b";
export const CARD_HEADER_BG = "#323537";
export const TEAL = "#34d0bd";

export const MINI_CARD = { x: 338, y: 189, w: 279, h: 74, r: 12 };
export const MINI_CARD_ZOOMED = { x: 377, y: 381, w: 709, h: 189, r: 20 };
export const MODAL_EXPANDED = { x: 376, y: 381, w: 1425, h: 967, r: 36 };
export const MODAL_FINAL = { x: 547, y: 92, w: 827, h: 895, r: 36 };

/** Figma 3360:3398 — flush with Julia mini card left edge (3389 @ x:34 in Frame 63) */
export const AI_TEXT_BOX = { x: 338, y: 287, w: 1088, h: 114 };
/** Zoomed hold — baked frame-2.png teal star @ x:381 y:653, aligned with card @ x:383 */
export const AI_TEXT_BOX_ZOOMED = { x: 381, y: 653, w: 1088, h: 114 };

/** Figma 3360:3400 — inline clip fan after "watch" */
export const AI_SNIPPET_THUMB = "snippet-clip-thumbnail.png";
export const AI_SNIPPET_VIDEO = "snippet-clip-video.png";
/** Figma 3360:3403 — first inline clip (10:35 · Shot) */
export const AI_SNIPPET_VIDEO_1 = "snippet-clip-video-1.png";

export const AI_SNIPPETS = [
  {
    rotate: -4.15,
    w: 46.403,
    h: 28.712,
    marginLeft: 0,
    videoSrc: AI_SNIPPET_VIDEO_1,
    video: {
      left: -35.04,
      top: -27.07,
      w: 125.604,
      h: 76.578,
      imgW: 121,
      imgH: 68,
      flipY: true,
      rotate: -175.85,
    },
  },
  {
    rotate: 5.36,
    w: 46.403,
    h: 28.712,
    marginLeft: -16.32,
    video: {
      left: -3.7,
      top: -5.27,
      w: 63.052,
      h: 39.317,
      imgW: 60.154,
      imgH: 33.847,
      flipY: false,
      rotate: -5.36,
    },
  },
  {
    rotate: -4.46,
    w: 46.403,
    h: 28.712,
    marginLeft: -7.41,
    video: {
      left: -37.2,
      top: -14.59,
      w: 88.472,
      h: 54.459,
      imgW: 85,
      imgH: 48,
      flipY: true,
      rotate: -175.54,
    },
  },
];

/** Mask baked AI copy + snippets on frame-2 while vector layer shows on top */
export const FRAME2_AI_MASK = { x: 370, y: 550, w: 1280, h: 260 };


export const BODY_SCALE = MODAL_EXPANDED.w / MINI_CARD_ZOOMED.w;

export const ZOOM_SCALE = MINI_CARD_ZOOMED.w / MINI_CARD.w;
export const ZOOM_PAN = {
  x: MINI_CARD_ZOOMED.x - MINI_CARD.x,
  y: MINI_CARD_ZOOMED.y - MINI_CARD.y,
};
export const ZOOM_ORIGIN = { x: MINI_CARD.x, y: MINI_CARD.y };

export const TIMING = {
  aiTextStart: 0,
  aiTextEnd: 70,
  /** Star appears and spins before the first word types in */
  aiStarLead: 14,
  /** Degrees of rotation per frame while AI text is loading */
  aiStarSpinSpeed: 5.5,
  /** Hide vector AI when zoom finishes — no overlay on frame-2 hold */
  aiTextHide: 123,
  zoomStart: 70,
  zoomEnd: 123,
  /** 4.17s — card expands from zoomed Julia mini card; dashboard fades behind */
  expandStart: 125,
  expandEnd: 180,
  populateStart: 180,
  /** Profile vector populate runs through entire settle/zoom-out */
  populateEnd: 275,
  /** Dashboard + AI summary fade as the card grows out of the zoomed screen */
  backgroundFadeStart: 125,
  backgroundFadeEnd: 162,
  settleStart: 215,
  settleEnd: 275,
  holdEnd: 300,
};

export const AI_LINES = [
  [
    { text: "Julia", hl: false },
    { text: "is", hl: false },
    { text: "a", hl: false },
    { text: "composed", hl: false },
    { text: "GK", hl: false },
    { text: "on", hl: false },
    { text: "2", hl: true },
    { text: "coaches’", hl: false },
    { text: "watchlists,", hl: false },
    { text: "known", hl: false },
    { text: "for", hl: false },
  ],
  [
    { text: "quick", hl: false },
    { text: "reactions,", hl: false },
    { text: "confident", hl: false },
    { text: "claiming,", hl: false },
    { text: "and", hl: false },
    { text: "strong", hl: false },
    { text: "distribution", hl: false },
    { text: "from", hl: false },
    { text: "the", hl: false },
    { text: "back.", hl: false },
  ],
  [
    { text: "Here", hl: false },
    { text: "are", hl: false },
    { text: "the", hl: false },
    { text: "snippets", hl: false },
    { text: "that", hl: false },
    { text: "you", hl: false },
    { text: "should", hl: false },
    { text: "watch", hl: false },
  ],
];

/** Profile card summary — Figma frame 6 (different from dashboard AI) */
export const PROFILE_SUMMARY = [
  { text: "Julia", hl: false },
  { text: "is", hl: false },
  { text: "a", hl: false },
  { text: "composed", hl: false },
  { text: "GK", hl: true },
  { text: "with", hl: false },
  { text: "a", hl: false },
  { text: "78%", hl: true },
  { text: "save", hl: false },
  { text: "rate", hl: false },
  { text: "—", hl: false },
  { text: "up", hl: false },
  { text: "6%", hl: true },
  { text: "vs", hl: false },
  { text: "team", hl: false },
  { text: "—", hl: false },
  { text: "known", hl: false },
  { text: "for", hl: false },
  { text: "vocal", hl: false },
  { text: "box", hl: false },
  { text: "command", hl: false },
  { text: "and", hl: false },
  { text: "distribution", hl: false },
  { text: "that", hl: false },
  { text: "breaks", hl: false },
  { text: "the", hl: false },
  { text: "first", hl: false },
  { text: "line.", hl: false },
];

export const PROFILE_META = [
  { label: "ACADEMIC", value: "3.9 GPA · transcript ready" },
  { label: "ELIGIBILITY", value: "NCAA EC registered" },
  { label: "CORE COURSES", value: "10/7 complete" },
  { label: "NEXT LIVE EVAL", value: "Nov 6-8 · Phoenix, AZ" },
];

export const lerpRect = (a, b, t) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
  r: a.r + (b.r - a.r) * t,
});

export const expandRectTopLeft = (start, end, t) => ({
  x: start.x,
  y: start.y,
  w: start.w + (end.w - start.w) * t,
  h: start.h + (end.h - start.h) * t,
  r: start.r + (end.r - start.r) * t,
});

export const asset = (name) => `/assets/kit-v2/${name}`;
