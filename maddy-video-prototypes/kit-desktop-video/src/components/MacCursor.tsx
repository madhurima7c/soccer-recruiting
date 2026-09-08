/** Standard macOS arrow — same size on every screen (not scaled with scene zoom) */
export const MacCursor: React.FC = () => (
  <div
    style={{
      position: "relative",
      pointerEvents: "none",
      transformOrigin: "top left",
      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
    }}
  >
    <svg width="22" height="27" viewBox="0 0 28 34" fill="none">
      <path
        d="M2 2L2 26.5L8.2 20.8L12.5 32L16.2 30.5L11.9 19.3L20.5 19.3L2 2Z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

/** Map scene-local coords → screen coords (inverse of scene zoom transform) */
export const sceneToScreen = (
  localX: number,
  localY: number,
  sceneScale: number,
  scenePanX: number,
  scenePanY: number,
  originX: number,
  originY: number,
) => ({
  x: scenePanX + originX + (localX - originX) * sceneScale,
  y: scenePanY + originY + (localY - originY) * sceneScale,
});
