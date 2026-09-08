/** Remotion-style interpolate — tweak easing here */
export function interpolate(value, inputRange, outputRange, options = {}) {
  const [i0, i1] = inputRange;
  const [o0, o1] = outputRange;
  let t = i1 === i0 ? 0 : (value - i0) / (i1 - i0);
  if (options.extrapolateLeft === "clamp") t = Math.max(0, t);
  if (options.extrapolateRight === "clamp") t = Math.min(1, t);
  if (options.easing) t = options.easing(t);
  return o0 + (o1 - o0) * t;
}

const cubic = (t) => t * t * t;

const back =
  (s = 1.2) =>
  (t) => {
    const c = s + 1;
    return 1 + c * (t - 1) ** 3 + s * (t - 1) ** 2;
  };

export const Easing = {
  cubic,
  back,
  inOut: (fn) => (t) =>
    t < 0.5 ? fn(2 * t) / 2 : (2 - fn(2 * (1 - t))) / 2,
  out: (fn) => (t) => 1 - fn(1 - t),
};

export const morphEase = (t) =>
  interpolate(t, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
