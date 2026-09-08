import { CANVAS, TIMING } from "./constants.js";
import { Easing, interpolate } from "./interpolate.js";

const COLORS = [
  "#34d0bd",
  "#75eadc",
  "#ffd166",
  "#ff6b6b",
  "#ffffff",
  "#a78bfa",
  "#ff9500",
  "#007aff",
];

function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Bold confetti shower from the top of the screen */
export function renderConfetti(frame) {
  if (frame < TIMING.confettiStart) return "";

  const t = frame - TIMING.confettiStart;
  const rand = seedRand(42);
  const pieces = [];

  for (let i = 0; i < 160; i += 1) {
    const startX = rand() * CANVAS.width;
    const drift = (rand() - 0.5) * 100;
    const fallSpeed = 8 + rand() * 14;
    const delay = rand() * 12;
    const activeT = Math.max(0, t - delay);
    const wobble = Math.sin(activeT * 0.14 + i) * 22;
    const x = startX + drift * (activeT / 35) + wobble;
    const y = -30 - rand() * 80 + fallSpeed * activeT * 0.7 + 0.05 * activeT * activeT;
    const rot = rand() * 360 + activeT * (rand() > 0.5 ? 9 : -9);
    const w = 12 + rand() * 18;
    const h = 8 + rand() * 14;
    const opacity = interpolate(activeT, [0, 8, 70], [0, 1, 0.85], {
      easing: Easing.linear,
    }) * interpolate(t, [0, 55], [1, 0.7], { easing: Easing.outQuart });

    if (opacity <= 0.05 || y > CANVAS.height + 60) continue;

    pieces.push(`
      <span class="confetti-piece" style="
        left:${x}px;
        top:${y}px;
        width:${w}px;
        height:${h}px;
        background:${COLORS[i % COLORS.length]};
        opacity:${opacity};
        transform:rotate(${rot}deg);
        box-shadow:0 1px 3px rgba(0,0,0,0.25);
      "></span>`);
  }

  return `<div class="confetti-layer">${pieces.join("")}</div>`;
}

export function renderCursor(x, y, pressing) {
  const scale = pressing ? 0.9 : 1;
  return `
    <div class="cursor" style="left:${x}px;top:${y}px;transform:scale(${scale})">
      <svg width="52" height="52" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M4 2L4 22L10 16L14 24L17 22L13 14L20 14L4 2Z" fill="#111" stroke="#fff" stroke-width="1.8"/>
      </svg>
    </div>`;
}
