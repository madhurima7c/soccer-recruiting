import { Composition } from "remotion";
import { CANVAS, DURATION } from "./constants";
import { KitDesktop } from "./KitDesktop";

export const MyComposition = () => {
  return (
    <Composition
      id="KitDesktop"
      component={KitDesktop}
      durationInFrames={DURATION}
      fps={CANVAS.fps}
      width={CANVAS.width}
      height={CANVAS.height}
    />
  );
};
