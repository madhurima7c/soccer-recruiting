import { Img, staticFile } from "remotion";

const asset = (p: string) => staticFile(`assets/parts/${p}`);

export type DesktopWindowProps = {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity?: number;
  zIndex?: number;
  borderRadius?: number;
};

/** Opaque window — downward shadow only so stacked cards stay solid white */
export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  src,
  x,
  y,
  w,
  h,
  opacity = 1,
  zIndex = 10,
  borderRadius = 10,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      opacity,
      zIndex,
      isolation: "isolate",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 6,
        right: 6,
        top: 8,
        bottom: -10,
        borderRadius,
        boxShadow: "0 14px 32px rgba(0,0,0,0.13)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius,
        overflow: "hidden",
        background: "#ffffff",
        outline: "1px solid #ffffff",
        backfaceVisibility: "hidden",
      }}
    >
      <Img
        src={asset(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "fill",
          display: "block",
          background: "#ffffff",
        }}
      />
    </div>
  </div>
);
