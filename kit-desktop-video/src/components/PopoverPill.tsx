import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const asset = (p: string) => staticFile(`assets/parts/${p}`);

type PopoverPillProps = {
  scale?: number;
  penSelected?: boolean;
  penSelectFrame?: number;
};

/** Figma 3324:8376 SidelineEdgePill — design canvas 1143×470 */
const LAYOUT = {
  cardTop: 16.937,
  cardW: 872.252,
  cardH: 453.063,
  cardRadius: 50.811,
  cardInset: 4.234,
  padTop: 59.279,
  padX: 67.748,
  padBottom: 50.811,
  titleSize: 63.514,
  titleLine: 93.153,
  titlePadX: 16.937,
  titlePadY: 8.468,
  dividerPadTop: 42.342,
  dividerH: 4.234,
  dividerW: 694.414,
  toolbarPadTop: 42.342,
  iconBtn: 135.495,
  iconGraphic: 76.216,
  iconGap: 16.937,
  arrowSize: 50.811,
  arrowLeft: 832.09,
  arrowTop: 61.46,
  ballLeft: 906.126,
  ballSize: 186.306,
  ballBorder: 4.234,
  closeLeft: 766.395,
  closeTop: 33.872,
  closePad: 12.703,
  closeIcon: 38.108,
};

const IconButton: React.FC<{
  src: string;
  btnSize: number;
  iconSize: number;
  selected?: boolean;
  pressY?: number;
}> = ({ src, btnSize, iconSize, selected, pressY = 0 }) => (
  <div
    style={{
      width: btnSize,
      height: btnSize,
      borderRadius: btnSize / 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      transform: `translateY(${pressY}px)`,
      transformOrigin: "center center",
      flexShrink: 0,
    }}
  >
    <Img
      src={asset(src)}
      style={{ width: iconSize, height: iconSize, display: "block" }}
    />
    {selected && (
      <div
        style={{
          position: "absolute",
          inset: (btnSize - iconSize) / 2 - 4,
          borderRadius: 12,
          border: "1.5px solid #29d1c2",
          pointerEvents: "none",
        }}
      />
    )}
  </div>
);

/** Figma SidelineEdgePill — card + ball tab */
export const PopoverPill: React.FC<PopoverPillProps> = ({
  scale = 1,
  penSelected = false,
  penSelectFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pressSpring =
    penSelected && penSelectFrame
      ? spring({
          frame: frame - penSelectFrame,
          fps,
          config: { damping: 14, stiffness: 380, mass: 0.45 },
        })
      : 0;

  const pressY = penSelected
    ? interpolate(pressSpring, [0, 0.35, 0.7, 1], [0, 4, -1, 0], {
        extrapolateRight: "clamp",
      }) * scale
    : 0;

  const s = scale;
  const btn = LAYOUT.iconBtn * s;
  const icon = LAYOUT.iconGraphic * s;

  return (
    <div
      style={{
        position: "relative",
        width: 1143 * s,
        height: (LAYOUT.cardTop + LAYOUT.cardH) * s,
        transformOrigin: "top left",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: LAYOUT.cardTop * s,
          width: LAYOUT.cardW * s,
          height: LAYOUT.cardH * s,
          borderRadius: LAYOUT.cardRadius * s,
          background: "#181a1b",
          boxShadow: "0 59.279px 84.685px rgba(0,0,0,0.55)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: LAYOUT.cardInset * s,
            top: LAYOUT.cardInset * s,
            right: LAYOUT.cardInset * s,
            bottom: LAYOUT.cardInset * s,
            padding: `${LAYOUT.padTop * s}px ${LAYOUT.padX * s}px ${LAYOUT.padBottom * s}px`,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: `${LAYOUT.titlePadY * s}px ${LAYOUT.titlePadX * s}px`,
              textAlign: "center",
              fontSize: LAYOUT.titleSize * s,
              lineHeight: `${LAYOUT.titleLine * s}px`,
              fontWeight: 400,
              color: "#fff",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            Need a hand?
          </div>

          <div
            style={{
              paddingTop: LAYOUT.dividerPadTop * s,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: LAYOUT.dividerW * s,
                height: LAYOUT.dividerH * s,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 2 * s,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: LAYOUT.iconGap * s,
              paddingTop: LAYOUT.toolbarPadTop * s,
            }}
          >
            <IconButton
              src={penSelected ? "icon-annotate-teal.svg" : "icon-annotate.svg"}
              btnSize={btn}
              iconSize={icon}
              selected={penSelected}
              pressY={pressY}
            />
            <IconButton src="icon-grid.svg" btnSize={btn} iconSize={icon} />
            <IconButton src="icon-clapper.svg" btnSize={btn} iconSize={icon} />
            <IconButton src="icon-calendar.svg" btnSize={btn} iconSize={icon} />
          </div>

          <div
            style={{
              position: "absolute",
              left: LAYOUT.closeLeft * s,
              top: LAYOUT.closeTop * s,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 21.171 * s,
              padding: LAYOUT.closePad * s,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Img
              src={asset("icon-close.svg")}
              style={{
                width: LAYOUT.closeIcon * s,
                height: LAYOUT.closeIcon * s,
                display: "block",
              }}
            />
          </div>
        </div>
      </div>

      {/* Arrow tab — rotated square per Figma */}
      <div
        style={{
          position: "absolute",
          left: LAYOUT.arrowLeft * s,
          top: (LAYOUT.cardTop + LAYOUT.arrowTop) * s,
          width: LAYOUT.arrowSize * s,
          height: LAYOUT.arrowSize * s,
          background: "#181a1b",
          transform: "rotate(45deg)",
          transformOrigin: "center center",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: LAYOUT.ballLeft * s,
          top: 0,
          width: LAYOUT.ballSize * s,
          height: LAYOUT.ballSize * s,
          borderRadius: "50%",
          background: "#181a1b",
          border: `${LAYOUT.ballBorder * s}px solid rgba(255,255,255,0.12)`,
          boxShadow: "0 50.811px 84.685px rgba(0,0,0,0.55)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Img
          src={asset("kit-ball.png")}
          style={{
            width: 152.432 * s,
            height: 152.432 * s,
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
};

/** Pen icon center in PopoverPill local coords (design scale 1) */
export const popoverPenLocal = () => {
  const toolbarTop =
    LAYOUT.cardTop +
    LAYOUT.cardInset +
    LAYOUT.padTop +
    LAYOUT.titlePadY * 2 +
    LAYOUT.titleLine +
    LAYOUT.dividerPadTop +
    LAYOUT.dividerH +
    LAYOUT.toolbarPadTop;

  const toolbarWidth =
    4 * LAYOUT.iconBtn + 3 * LAYOUT.iconGap;
  const toolbarLeft =
    LAYOUT.cardInset +
    LAYOUT.padX +
    (LAYOUT.cardW - LAYOUT.cardInset * 2 - LAYOUT.padX * 2 - toolbarWidth) / 2;

  return {
    x: toolbarLeft + LAYOUT.iconBtn / 2,
    y: toolbarTop + LAYOUT.iconBtn / 2,
  };
};
