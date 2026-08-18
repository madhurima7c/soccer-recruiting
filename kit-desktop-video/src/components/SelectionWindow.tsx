import { Img, staticFile, useCurrentFrame } from "remotion";

const asset = (p: string) => staticFile(`assets/parts/${p}`);

const RADIUS = 10;
const STROKE = 2.5;
const RING = 3;

export type SelectionWindowProps = {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity?: number;
  zIndex?: number;
  selected?: boolean;
  processing?: boolean;
};

type WindowLayerProps = Omit<SelectionWindowProps, "src">;

/** Glow / stroke only — rendered in a layer below all window bodies. */
export const SelectionWindowGlow: React.FC<WindowLayerProps> = ({
  x,
  y,
  w,
  h,
  opacity = 1,
  zIndex = 1,
  selected = false,
  processing = false,
}) => {
  const frame = useCurrentFrame();
  const sweep = frame * 10;
  const pulse = 0.82 + Math.sin(frame * 0.18) * 0.18;

  if (!selected || opacity <= 0.01) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity,
        zIndex,
        pointerEvents: "none",
      }}
    >
      {processing && (
        <div
          style={{
            position: "absolute",
            left: -16,
            top: -16,
            width: w + 32,
            height: h + 32,
            borderRadius: RADIUS + 16,
            background: `linear-gradient(${sweep}deg, rgba(41,209,194,${0.42 * pulse}), rgba(210,230,70,${0.32 * pulse}), rgba(70,210,120,${0.42 * pulse}))`,
            filter: "blur(14px)",
          }}
        />
      )}

      {processing && (
        <div
          style={{
            position: "absolute",
            left: -RING,
            top: -RING,
            width: w + RING * 2,
            height: h + RING * 2,
            borderRadius: RADIUS + RING,
            background: `linear-gradient(${sweep}deg, #29d1c2 0%, #eef070 20%, #46d278 42%, #29d1c2 60%, #dce646 80%, #29d1c2 100%)`,
          }}
        />
      )}

      {!processing && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: w,
            height: h,
            borderRadius: RADIUS,
            boxShadow: `0 0 0 ${STROKE}px #29d1c2`,
          }}
        />
      )}
    </div>
  );
};

/** Opaque window PNG — always above the glow layer. */
export const SelectionWindowBody: React.FC<
  Pick<SelectionWindowProps, "src" | "x" | "y" | "w" | "h" | "opacity" | "zIndex">
> = ({ src, x, y, w, h, opacity = 1, zIndex = 100 }) => {
  if (opacity <= 0.01) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity,
        zIndex,
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          borderRadius: RADIUS,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <Img
          src={asset(src)}
          style={{
            width: w,
            height: h,
            objectFit: "fill",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

/** Combined window — use split glow/body passes when windows overlap. */
export const SelectionWindow: React.FC<SelectionWindowProps> = (props) => (
  <>
    <SelectionWindowGlow {...props} />
    <SelectionWindowBody {...props} zIndex={(props.zIndex ?? 10) + 1000} />
  </>
);
