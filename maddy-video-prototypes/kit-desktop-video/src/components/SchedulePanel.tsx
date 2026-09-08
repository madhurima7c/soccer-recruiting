import { Easing, Img, interpolate, staticFile } from "remotion";
import {
  KIT_PANEL,
  SCHEDULE_PANEL,
  SCHEDULE_SHARE_BTN,
} from "../constants";

const asset = (p: string) => staticFile(`assets/parts/${p}`);

const KIT_BOTTOM = KIT_PANEL.y + KIT_PANEL.h;

const CARD_SHELL = {
  background: "#181a1b",
  border: "1.5px solid rgba(255,255,255,0.12)",
  borderRadius: 36,
  boxShadow: "0 42px 120px rgba(0,0,0,0.32)",
};

const SHARE_TEAL = "#34d0bd";

type SchedulePanelProps = {
  morphProgress: number;
  contentProgress: number;
  buttonProgress: number;
  buttonFade?: number;
  shareBtnPress?: number;
};

/** Figma 3324:6026 — rounded 21px (not full pill), Inter Medium 35.339px */
const ShareWithStaffButton: React.FC<{ press: number }> = ({ press }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      borderRadius: 21,
      background: SHARE_TEAL,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 25.701,
      padding: "32.126px 51.402px",
      boxSizing: "border-box",
      transform: `scale(${press})`,
      transformOrigin: "center center",
    }}
  >
    <span
      style={{
        fontSize: 35.339,
        fontWeight: 500,
        lineHeight: "53.008px",
        color: "#181a1b",
        fontFamily: "Inter, system-ui, sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      Share with staff
    </span>
    <Img
      src={asset("icon-share-external.svg")}
      style={{
        width: 44.977,
        height: 44.977,
        flexShrink: 0,
        display: "block",
      }}
    />
  </div>
);

/**
 * ECNL schedule — CSS shell + shadow, inner content reveals top → bottom.
 * Share button is CSS (PNG export had gray corners + bottom stroke).
 */
export const SchedulePanel: React.FC<SchedulePanelProps> = ({
  morphProgress,
  contentProgress,
  buttonProgress,
  buttonFade = 1,
  shareBtnPress = 1,
}) => {
  if (morphProgress <= 0.01 && contentProgress <= 0.01) return null;

  const cardW = interpolate(morphProgress, [0, 1], [KIT_PANEL.w, SCHEDULE_PANEL.w], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const cardH = interpolate(morphProgress, [0, 1], [KIT_PANEL.h, SCHEDULE_PANEL.h], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const cardX = KIT_PANEL.x;
  const cardY = KIT_BOTTOM - cardH;
  const shellOpacity = interpolate(morphProgress, [0, 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const contentClip = interpolate(contentProgress, [0, 1], [100, 0], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const contentVisible = contentProgress > 0.01;
  const btnY =
    SCHEDULE_PANEL.y +
    SCHEDULE_PANEL.h +
    (SCHEDULE_SHARE_BTN.y - (SCHEDULE_PANEL.y + SCHEDULE_PANEL.h));

  return (
    <>
      {morphProgress > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: cardX,
            top: cardY,
            width: cardW,
            height: cardH,
            opacity: shellOpacity,
            zIndex: 41,
            ...CARD_SHELL,
            overflow: "hidden",
          }}
        >
          {contentVisible && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#181a1b",
                clipPath: `inset(0 0 ${contentClip}% 0)`,
              }}
            >
              <Img
                src={asset("schedule-card-content.png")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top center",
                  display: "block",
                }}
              />
            </div>
          )}
        </div>
      )}

      {buttonProgress > 0.01 && buttonFade > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: SCHEDULE_SHARE_BTN.x,
            top: btnY,
            width: SCHEDULE_SHARE_BTN.w,
            height: SCHEDULE_SHARE_BTN.h,
            opacity: buttonProgress * buttonFade,
            transform: `translateY(${interpolate(buttonProgress, [0, 1], [12, 0], { extrapolateRight: "clamp" })}px)`,
            transformOrigin: "center center",
            zIndex: 42,
          }}
        >
          <ShareWithStaffButton press={shareBtnPress} />
        </div>
      )}
    </>
  );
};

/** Cursor target — center of Share with staff button */
export const shareButtonCursor = () => ({
  x: SCHEDULE_SHARE_BTN.x + SCHEDULE_SHARE_BTN.w / 2,
  y:
    SCHEDULE_PANEL.y +
    SCHEDULE_PANEL.h +
    (SCHEDULE_SHARE_BTN.y - (SCHEDULE_PANEL.y + SCHEDULE_PANEL.h)) +
    SCHEDULE_SHARE_BTN.h / 2,
});
