export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export const Easing = {
  linear: (t) => t,
  inOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2,
  outCubic: (t) => 1 - (1 - t) ** 3,
  outQuart: (t) => 1 - (1 - t) ** 4,
};

export function interpolate(frame, [a, b], [y0, y1], opts = {}) {
  const t = clamp((frame - a) / (b - a), 0, 1);
  const eased = opts.easing ? opts.easing(t) : t;
  return y0 + (y1 - y0) * eased;
}
