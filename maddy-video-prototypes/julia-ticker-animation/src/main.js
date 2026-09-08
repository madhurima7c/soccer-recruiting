import { CANVAS, DURATION, TIMING } from "./constants.js";
import { frameToTime, renderFrame } from "./render.js";

const stageViewport = document.getElementById("stage-viewport");
const stage = document.getElementById("stage");
const scrubber = document.getElementById("scrubber");
const frameLabel = document.getElementById("frame-label");
const timeLabel = document.getElementById("time-label");
const phaseLabel = document.getElementById("phase-label");
const btnPlay = document.getElementById("btn-play");
const btnRestart = document.getElementById("btn-restart");

let currentFrame = 0;
let playing = false;
let lastTs = 0;

scrubber.min = 0;
scrubber.max = DURATION - 1;
scrubber.value = 0;

function getPhase(frame) {
  if (frame < TIMING.scrollStart) return "1 — Julia profile card (Figma frame 1)";
  if (frame < TIMING.scrollEnd) return "2 — Ticker scroll left";
  if (frame < TIMING.cursorMoveStart) return "3 — Stopped at Make Offer";
  if (frame < TIMING.confettiStart) return "3 — Cursor click";
  return "3 — Confetti celebration";
}

function fitStage() {
  const pad = 24;
  const controlsH = 120;
  const availW = window.innerWidth - pad * 2;
  const availH = window.innerHeight - controlsH - pad * 2;
  const scale = Math.min(availW / CANVAS.width, availH / CANVAS.height);
  stageViewport.style.width = `${CANVAS.width * scale}px`;
  stageViewport.style.height = `${CANVAS.height * scale}px`;
  stage.style.transform = `scale(${scale})`;
}

function updateUI() {
  scrubber.value = currentFrame;
  frameLabel.textContent = `Frame ${currentFrame} / ${DURATION - 1}`;
  timeLabel.textContent = `${frameToTime(currentFrame).toFixed(2)}s / ${frameToTime(DURATION).toFixed(2)}s`;
  phaseLabel.textContent = getPhase(currentFrame);
  btnPlay.textContent = playing ? "Pause" : "Play";
}

function paint() {
  renderFrame(stage, currentFrame);
  updateUI();
}

function tick(ts) {
  if (!playing) return;
  if (!lastTs) lastTs = ts;
  const dt = (ts - lastTs) / 1000;
  lastTs = ts;
  currentFrame += dt * CANVAS.fps;
  if (currentFrame >= DURATION) {
    currentFrame = DURATION - 1;
    playing = false;
  }
  paint();
  if (playing) requestAnimationFrame(tick);
}

btnPlay.addEventListener("click", () => {
  playing = !playing;
  lastTs = 0;
  updateUI();
  if (playing) requestAnimationFrame(tick);
});

btnRestart.addEventListener("click", () => {
  playing = false;
  currentFrame = 0;
  lastTs = 0;
  paint();
});

scrubber.addEventListener("input", () => {
  playing = false;
  currentFrame = Number(scrubber.value);
  paint();
});

window.addEventListener("resize", fitStage);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    btnPlay.click();
  }
});

fitStage();
paint();
