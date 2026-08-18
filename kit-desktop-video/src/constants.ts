export const CANVAS = { width: 1920, height: 1080, fps: 30 };
export const GRAY = "#F7F7F7";

/** Shrunk desktop — Figma screen 15 (3349:17317) */
export const DESKTOP = { x: 413, y: 348, width: 1094, height: 615 };

/** Slight scale so windows read in front — full opacity always */
export const DESKTOP_BACK_SCALE = 0.88;

/** PopoverPill design size × this scale = Figma small pill (376×155) */
export const POPOVER_PILL_SCALE = 376 / 1143;

/** Full PopoverPill design dimensions */
export const POPOVER_PILL_DESIGN = { w: 1143, h: 470 };

/** Small pill screen position — Figma 3349:14981 */
export const POPOVER = {
  small: { x: 1330, y: 164, w: 376, h: 155 },
};

/** Camera zoom — scene scale so small pill (376px) becomes Figma zoom frame (1063px) */
export const OPENING_ZOOM = { target: 1063 / 376 };

/** Popover top-left at full zoom — Figma screen 14 (3349:17275) */
export const POPOVER_ZOOMED = { x: 652, y: 262 };

/** macOS dock on shrunk desktop — Figma DesktopDock 3324:8294 */
export const DOCK = { x: 606, y: 832, w: 389, h: 57 };

/** Toolbar on gray canvas — initial handoff (3324:8811) */
export const TOOLBAR_CANVAS = { x: 263, y: 33, w: 1393, h: 88 };

/** Toolbar on selection screens 6–8 (3324:8675 / 4260) */
export const SELECTION_TOOLBAR = { x: 303, y: 100, w: 1393, h: 88 };

export type ToolbarChipId = "mail" | "excel" | "safari";

export const TOOLBAR_CHIPS = [
  { id: "mail" as const, label: "Mail", icon: "chip-icon-mail.png" },
  { id: "excel" as const, label: "Excel", icon: "chip-icon-excel.png" },
  { id: "safari" as const, label: "Safari", icon: "chip-icon-safari.png" },
];

export type SelectionWindowId = "mail" | "excel" | "safari" | "ecnl";

/** Selection windows — Figma screen 7 exact layout */
export const SELECTION_WINDOWS = [
  {
    id: "mail" as const,
    src: "sel-mail.png",
    x: 516,
    y: 882,
    w: 382,
    h: 286,
    cursorX: 620,
    cursorY: 960,
  },
  {
    id: "excel" as const,
    src: "sel-excel.png",
    x: 735,
    y: 684,
    w: 609,
    h: 376,
    cursorX: 980,
    cursorY: 780,
  },
  {
    id: "safari" as const,
    src: "sel-safari.png",
    x: 1072,
    y: 562,
    w: 448,
    h: 394,
    cursorX: 1180,
    cursorY: 680,
  },
  {
    id: "ecnl" as const,
    src: "sel-ecnl.png",
    x: 1473,
    y: 677,
    w: 447,
    h: 394,
    cursorX: 1580,
    cursorY: 780,
  },
] as const;

/** Processing spread — Figma screen 8 */
export const PROCESSING_WINDOWS = [
  {
    id: "mail" as const,
    src: "proc-mail.png",
    x: 312,
    y: 753,
    w: 437,
    h: 328,
  },
  {
    id: "excel" as const,
    src: "proc-excel.png",
    x: 562,
    y: 525,
    w: 698,
    h: 431,
  },
  {
    id: "safari" as const,
    src: "proc-safari.png",
    x: 948,
    y: 386,
    w: 513,
    h: 451,
  },
  {
    id: "ecnl" as const,
    src: "proc-ecnl.png",
    x: 1409,
    y: 518,
    w: 512,
    h: 451,
  },
] as const;

export const PROCESSING_ZOOM = 1;
export const PROCESSING_PAN = { x: 0, y: 0 };

export const USE_SELECTION_BTN = { x: 1490, y: 122, w: 187, h: 49 };

/** Kit panel + docked ball (Figma screen 9 / 3324:5825) */
export const KIT_PANEL = { x: 607, y: 229, w: 600, h: 653 };
export const KIT_BALL = { x: 1253.5, y: 830, size: 186.4 };

/** Kit ball icon spin while docked (seconds → frames in KitDesktop) */
export const BALL_SPIN = { startSec: 21.23, endSec: 27.14, revPerSec: 1.2 };

/** AI thinking pill — cycles while ball spins (Figma 3355:1046) */
export const KIT_THINKING_STATES = [
  "Looking through Excel...",
  "Scraping the mail app...",
  "Looking at ECNL schedule...",
] as const;

/** ECNL schedule result card */
export const SCHEDULE_PANEL = { x: 607, y: 110, w: 600, h: 772 };
export const SCHEDULE_SHARE_BTN = { x: 766, y: 899, w: 441, h: 117 };

/** Desktop windows on gray canvas — Figma Group 71 (screens 13/15) */
export const CANVAS_WINDOWS = [
  { id: "messages", src: "win-messages.png", x: 402, y: 190, w: 238, h: 226 },
  { id: "excel-top", src: "win-excel-top.png", x: 666, y: 116, w: 546, h: 337 },
  { id: "excel-bottom", src: "win-excel-top.png", x: 343, y: 442, w: 546, h: 337 },
  { id: "ecnl", src: "win-ecnl.png", x: 962, y: 422, w: 401, h: 369 },
  { id: "safari", src: "win-safari.png", x: 1176, y: 246, w: 401, h: 353 },
] as const;

export const DURATION = 928;

/** Popover pill center in screen space (for zoom pan math) */
export const popoverCenter = () => ({
  x: POPOVER.small.x + (POPOVER_PILL_DESIGN.w * POPOVER_PILL_SCALE) / 2,
  y: POPOVER.small.y + (POPOVER_PILL_DESIGN.h * POPOVER_PILL_SCALE) / 2,
});
