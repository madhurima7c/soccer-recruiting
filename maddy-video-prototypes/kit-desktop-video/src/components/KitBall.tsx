import { Img, staticFile } from "remotion";
import { KIT_BALL } from "../constants";

const asset = (p: string) => staticFile(`assets/parts/${p}`);

type KitBallProps = {
  x?: number;
  y?: number;
  size?: number;
  opacity?: number;
  /** Degrees — rotates the icon inside the fixed circle */
  rotation?: number;
};

/** Shared soccer ball — fixed anchor between kit + schedule screens. */
export const KitBall: React.FC<KitBallProps> = ({
  x = KIT_BALL.x,
  y = KIT_BALL.y,
  size = KIT_BALL.size,
  opacity = 1,
  rotation = 0,
}) => {
  if (opacity <= 0.01) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        opacity,
        zIndex: 55,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "#1a1a1a",
          boxShadow: "0 50px 76px rgba(0,0,0,0.17)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Img
          src={asset("kit-ball.png")}
          style={{
            width: size * 0.82,
            height: size * 0.82,
            objectFit: "contain",
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        />
      </div>
    </div>
  );
};
