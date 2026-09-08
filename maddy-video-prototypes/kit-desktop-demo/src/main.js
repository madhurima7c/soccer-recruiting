import gsap from "gsap";
import { fitStage, qs, moveCursor, clickCursor, setStep, resetScene } from "./helpers.js";

const STAGE_W = 1920;
const STAGE_H = 1080;
const GRAY = "#eef0f2";
const DESKTOP = { x: 142, y: 90, w: 1600, h: 900 };

const WINDOWS = [
  { el: () => qs("#win-messages"), x: 236, y: 198, w: 237, h: 225 },
  { el: () => qs("#win-excel-top"), x: 500, y: 124, w: 545, h: 337 },
  { el: () => qs("#win-excel-bottom"), x: 168, y: 468, w: 380, h: 200 },
  { el: () => qs("#win-safari"), x: 1010, y: 254, w: 401, h: 353 },
  { el: () => qs("#win-ecnl"), x: 796, y: 430, w: 401, h: 369 },
];

const els = {
  stage: qs("#stage"),
  desktopFrame: qs("#desktop-frame"),
  grayBackdrop: qs("#gray-backdrop"),
  popover: qs("#popover"),
  toolbar: qs("#toolbar"),
  selectionToolbar: qs("#selection-toolbar"),
  selectionWindows: qs("#selection-windows"),
  kitBall: qs("#kit-ball"),
  kitScene: qs("#kit-scene"),
  scheduleScene: qs("#schedule-scene"),
  aiIconGlow: qs("#ai-icon-glow"),
  aiOptionGlow: qs("#ai-option-glow"),
  cursor: qs("#cursor"),
  selWindows: [qs("#sel-mail"), qs("#sel-excel"), qs("#sel-safari")],
  btnPlay: qs("#btn-play"),
  btnPause: qs("#btn-pause"),
  btnRestart: qs("#btn-restart"),
  stepLabel: qs("#step-label"),
};

let master = null;
let paused = false;

function abs(x, y) {
  return { x: DESKTOP.x + x, y: DESKTOP.y + y };
}

function buildTimeline() {
  if (master) master.kill();
  resetScene(els);
  paused = false;
  els.btnPause.textContent = "Pause";
  els.btnPause.classList.remove("is-active");

  // Position windows inside desktop frame
  WINDOWS.forEach(({ el, x, y, w, h }) => {
    const node = el();
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.width = `${w}px`;
    node.style.height = `${h}px`;
  });

  master = gsap.timeline({
    defaults: { ease: "cubic-bezier(0.22, 1, 0.36, 1)" },
    onComplete: () => setStep(els.stepLabel, "Complete"),
  });

  // 1 — Desktop visible on gray; windows pop up
  master.add(() => setStep(els.stepLabel, "1 · Desktop + windows"));
  WINDOWS.forEach(({ el }, i) => {
    master.to(el(), { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.38, ease: "back.out(1.4)" }, 0.3 + i * 0.22);
  });
  master.to({}, { duration: 0.4 });

  // 2 — Popover tab + zoom into assistant area
  master.add(() => setStep(els.stepLabel, "2 · Popover & zoom"));
  master.fromTo(els.popover, { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.5 });
  master.to(els.desktopFrame, { scale: 1.18, transformOrigin: "78% 42%", duration: 0.85 }, "<0.1");
  master.to({}, { duration: 0.3 });

  // 3 — Select draw + select
  master.add(() => setStep(els.stepLabel, "3 · Draw + select"));
  master.set(els.cursor, { opacity: 1 });
  const draw = abs(580, 680);
  master.add(moveCursor(els.cursor, draw.x, draw.y, 0.7));
  master.call(() => els.aiIconGlow.classList.add("is-active"));
  master.add(clickCursor(els.cursor));

  // 4 — Toolbar drops, popover text clips out
  master.add(() => setStep(els.stepLabel, "4 · Toolbar"));
  master.call(() => els.aiIconGlow.classList.remove("is-active"));
  master.to(els.popover, { clipPath: "inset(0 0 62% 0)", opacity: 0, duration: 0.4 });
  master.to(els.desktopFrame, { scale: 1, duration: 0.4 }, "<");
  master.fromTo(els.toolbar, { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "<0.08");
  master.to({}, { duration: 0.25 });

  // 5-6
  master.add(() => setStep(els.stepLabel, "5 · Desktop pop-ups"));
  master.to(els.toolbar, { opacity: 0, duration: 0.25 });
  master.add(() => setStep(els.stepLabel, "6 · Click"));
  master.add(moveCursor(els.cursor, DESKTOP.x + 800, DESKTOP.y + 450, 0.6));
  master.add(clickCursor(els.cursor));

  // 7 — Selection on gray (desktop fades, windows on gray in same footprint)
  master.add(() => setStep(els.stepLabel, "7 · Selection"));
  master.to(els.desktopFrame, { opacity: 0, duration: 0.4 });
  master.set(els.selectionWindows, { opacity: 1 });
  master.fromTo(els.selectionToolbar, { y: -70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 });

  const selClicks = [
    { win: els.selWindows[0], ...abs(260, 470) },
    { win: els.selWindows[1], ...abs(620, 380) },
    { win: els.selWindows[2], ...abs(920, 360) },
  ];
  selClicks.forEach(({ win, x, y }) => {
    master.add(moveCursor(els.cursor, x, y, 0.55));
    master.to(win, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.3)" });
    master.add(clickCursor(els.cursor));
  });
  master.add(moveCursor(els.cursor, DESKTOP.x + 1220, DESKTOP.y + 155, 0.6));
  master.add(clickCursor(els.cursor));

  // 8-11 — ball, kit, schedule, share
  master.add(() => setStep(els.stepLabel, "8 · Ball magic"));
  master.to(els.selectionToolbar, { opacity: 0, duration: 0.3 });
  master.to(els.selectionWindows, { opacity: 0, duration: 0.3 }, "<");
  master.set(els.kitBall, { opacity: 1, left: DESKTOP.x + 1100, top: DESKTOP.y + 200 });
  master.call(() => els.kitBall.classList.add("is-magic"));
  [[800, 450], [1100, 550], [900, 400], [1253, 830]].forEach(([x, y]) => {
    master.to(els.kitBall, { left: x - 93, top: y - 93, duration: 0.5, ease: "sine.inOut" });
  });

  master.add(() => setStep(els.stepLabel, "9 · Kit modal"));
  master.to(els.kitBall, { opacity: 0, duration: 0.25 });
  master.set(els.kitScene, { opacity: 1 });
  master.fromTo(els.kitScene, { opacity: 0 }, { opacity: 1, duration: 0.4 });
  master.add(moveCursor(els.cursor, 900, 350, 0.6));
  master.to(els.aiOptionGlow, { opacity: 1, duration: 0.3 });
  master.add(clickCursor(els.cursor));

  master.add(() => setStep(els.stepLabel, "10 · Schedule"));
  master.set(els.scheduleScene, { opacity: 1 });
  master.to(els.kitScene, { opacity: 0, duration: 0.3 });
  master.fromTo(els.scheduleScene.querySelector(".schedule-panel"), { clipPath: "inset(0 0 55% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.0 });

  master.add(() => setStep(els.stepLabel, "11 · Share"));
  master.add(moveCursor(els.cursor, 980, 950, 0.7));
  master.add(clickCursor(els.cursor));
  master.to({}, { duration: 0.6 });

  return master;
}

function play() {
  buildTimeline().play(0);
}

function togglePause() {
  if (!master) return;
  paused = !paused;
  if (paused) {
    master.pause();
    els.btnPause.textContent = "Resume";
    els.btnPause.classList.add("is-active");
  } else {
    master.resume();
    els.btnPause.textContent = "Pause";
    els.btnPause.classList.remove("is-active");
  }
}

function init() {
  fitStage(els.stage, STAGE_W, STAGE_H);
  window.addEventListener("resize", () => fitStage(els.stage, STAGE_W, STAGE_H));
  els.btnPlay.addEventListener("click", play);
  els.btnRestart.addEventListener("click", play);
  els.btnPause.addEventListener("click", togglePause);
  setTimeout(play, 500);
}

init();
