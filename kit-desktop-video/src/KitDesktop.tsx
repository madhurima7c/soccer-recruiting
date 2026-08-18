import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CANVAS,
  CANVAS_WINDOWS,
  DESKTOP,
  DESKTOP_BACK_SCALE,
  GRAY,
  BALL_SPIN,
  KIT_BALL,
  OPENING_ZOOM,
  POPOVER,
  POPOVER_PILL_SCALE,
  POPOVER_ZOOMED,
  PROCESSING_PAN,
  PROCESSING_WINDOWS,
  PROCESSING_ZOOM,
  SELECTION_TOOLBAR,
  SELECTION_WINDOWS,
  USE_SELECTION_BTN,
  type ToolbarChipId,
} from "./constants";
import { DesktopWindow } from "./components/DesktopWindow";
import { ecnlOptionCursor, KitPanel } from "./components/KitPanel";
import { KitBall } from "./components/KitBall";
import { KitThinkingPill } from "./components/KitThinkingPill";
import { MacCursor, sceneToScreen } from "./components/MacCursor";
import { PopoverPill, popoverPenLocal } from "./components/PopoverPill";
import { SchedulePanel, shareButtonCursor } from "./components/SchedulePanel";
import { clusterCenterPan, ProcessingBall } from "./components/SelectionScene";
import {
  SelectionWindowBody,
  SelectionWindowGlow,
} from "./components/SelectionWindow";
import { Toolbar } from "./components/Toolbar";

const asset = (p: string) => staticFile(`assets/parts/${p}`);

const fade = (frame: number, start: number, end: number, from = 0, to = 1) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

export const KitDesktop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = {
    desktopIn: 0,
    winStart: 4,
    winStagger: 8,
    popoverIn: 44,
    popoverLand: 72,
    zoomStart: 78,
    zoomEnd: 118,
    cursorMove: 108,
    penClick: 128,
    handoff: 192,
    selStart: 220,
    selMail: 255,
    selExcel: 300,
    selSafari: 345,
    cursorToBtn: 390,
    btnClick: 410,
    toolbarOut: 424,
    processingStart: 438,
    processingEnd: 530,
    windowsOut: 530,
    ballSettleStart: 538,
    ballSettleEnd: 588,
    kitIn: 590,
    ecnlCursorMove: 618,
    ecnlClick: 638,
    scheduleTransitionStart: 817,
    scheduleMorphEnd: 835,
    scheduleContentEnd: 855,
    scheduleButtonEnd: 871,
    shareCursorMove: 876,
    shareClick: 900,
    shareFadeStart: 908,
    shareFadeEnd: 928,
  };

  const desktopEnter = spring({
    frame: frame - t.desktopIn,
    fps,
    config: { damping: 18, stiffness: 90 },
  });
  const desktopEnterOpacity = fade(frame, t.desktopIn, t.desktopIn + 10);
  const desktopEnterScale = interpolate(desktopEnter, [0, 1], [0.96, 1], {
    extrapolateRight: "clamp",
  });

  const popoverTravel = interpolate(frame, [t.popoverIn, t.popoverLand], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const popoverSlideX = interpolate(
    popoverTravel,
    [0, 1],
    [CANVAS.width + 56, POPOVER.small.x],
  );
  const popoverX =
    frame >= t.popoverLand
      ? POPOVER.small.x
      : frame >= t.popoverIn
        ? popoverSlideX
        : POPOVER.small.x;

  const showDesktopPhase = frame < t.handoff + 22;

  const openingExitOpacity =
    frame < t.penClick + 14
      ? 1
      : interpolate(frame, [t.penClick + 14, t.handoff], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.cubic),
        });

  const popoverOpacity = (() => {
    if (frame < t.popoverIn || !showDesktopPhase) {
      return frame >= t.handoff
        ? fade(frame, t.handoff, t.handoff + 18, 1, 0)
        : 0;
    }
    if (frame < t.penClick + 14) {
      return fade(frame, t.popoverIn, t.popoverIn + 8);
    }
    return openingExitOpacity;
  })();

  const zoomProg = fade(frame, t.zoomStart, t.zoomEnd);

  const zoomOriginX = CANVAS.width / 2;
  const zoomOriginY = CANVAS.height / 2;
  const sceneScale =
    frame >= t.zoomStart
      ? interpolate(zoomProg, [0, 1], [1, OPENING_ZOOM.target])
      : 1;

  const endPanX =
    POPOVER_ZOOMED.x -
    zoomOriginX -
    (POPOVER.small.x - zoomOriginX) * OPENING_ZOOM.target;
  const endPanY =
    POPOVER_ZOOMED.y -
    zoomOriginY -
    (POPOVER.small.y - zoomOriginY) * OPENING_ZOOM.target;
  const scenePanX = interpolate(zoomProg, [0, 1], [0, endPanX]);
  const sceneZoomPanY = interpolate(zoomProg, [0, 1], [0, endPanY]);

  const desktopScale = desktopEnterScale * DESKTOP_BACK_SCALE;

  const penSelected = frame >= t.penClick;

  const desktopDropY = interpolate(
    frame,
    [t.handoff, t.handoff + 22],
    [0, 1200],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    },
  );
  const desktopPhaseOpacity =
    desktopEnterOpacity *
    openingExitOpacity *
    (frame < t.handoff
      ? 1
      : interpolate(frame, [t.handoff, t.handoff + 18], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.cubic),
        }));

  const toolbarOpacity =
    frame >= t.handoff && frame < t.toolbarOut + 8
      ? frame < t.toolbarOut
        ? fade(frame, t.handoff, t.handoff + 14)
        : fade(frame, t.toolbarOut, t.toolbarOut + 8, 1, 0)
      : 0;

  const activeChips: ToolbarChipId[] = [];
  if (frame >= t.selMail + 12) activeChips.push("mail");
  if (frame >= t.selExcel + 12) activeChips.push("excel");
  if (frame >= t.selSafari + 12) activeChips.push("safari");

  const useSelectionActive = activeChips.length === 3;

  const btnPress = (() => {
    if (frame < t.btnClick) return { scale: 1, y: 0 };
    if (frame < t.btnClick + 5) {
      const p = interpolate(frame, [t.btnClick, t.btnClick + 5], [0, 1], {
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.quad),
      });
      return {
        scale: interpolate(p, [0, 1], [1, 0.86]),
        y: interpolate(p, [0, 1], [0, 4]),
      };
    }
    if (frame < t.btnClick + 12) {
      const p = interpolate(frame, [t.btnClick + 5, t.btnClick + 12], [0, 1], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.back(1.8)),
      });
      return {
        scale: interpolate(p, [0, 1], [0.86, 1]),
        y: interpolate(p, [0, 1], [4, 0]),
      };
    }
    return { scale: 1, y: 0 };
  })();

  const windowsFade = fade(frame, t.selStart, t.selStart + 16);
  const windowsOutOpacity =
    frame < t.windowsOut
      ? 1
      : interpolate(frame, [t.windowsOut, t.windowsOut + 14], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.cubic),
        });

  const inProcessing = frame >= t.processingStart && frame < t.ballSettleStart;
  const showProcessingBall =
    frame >= t.processingStart && frame < t.ballSettleStart;

  const spreadProg = inProcessing
    ? fade(frame, t.processingStart, t.processingStart + 36)
    : 0;

  const layoutWindows = SELECTION_WINDOWS.map((sel, i) => {
    const proc = PROCESSING_WINDOWS[i];
    const useProcAssets = spreadProg > 0.45;
    return {
      id: sel.id,
      src: useProcAssets ? proc.src : sel.src,
      x: interpolate(spreadProg, [0, 1], [sel.x, proc.x]),
      y: interpolate(spreadProg, [0, 1], [sel.y, proc.y]),
      w: interpolate(spreadProg, [0, 1], [sel.w, proc.w]),
      h: interpolate(spreadProg, [0, 1], [sel.h, proc.h]),
    };
  });

  const clusterScale = interpolate(spreadProg, [0, 1], [1, PROCESSING_ZOOM]);
  const clusterPanX = interpolate(spreadProg, [0, 1], [0, PROCESSING_PAN.x]);
  const clusterPanY = interpolate(spreadProg, [0, 1], [0, PROCESSING_PAN.y]);
  const centerPan = clusterCenterPan(layoutWindows);
  const totalPanX = clusterPanX + centerPan.x;
  const totalPanY = clusterPanY + centerPan.y;

  const selectedRects = layoutWindows.filter((w) => {
    if (w.id === "mail") return frame >= t.selMail + 8;
    if (w.id === "excel") return frame >= t.selExcel + 8;
    if (w.id === "safari" || w.id === "ecnl") return frame >= t.selSafari + 8;
    return false;
  });

  const selectedIds = new Set(selectedRects.map((w) => w.id));

  const orbitFrame = Math.min(frame, t.ballSettleStart - 1);
  const ballPos =
    frame >= t.processingStart
      ? processingBallAtFrame(orbitFrame, t, layoutWindows)
      : null;

  const ballSettleProg = fade(frame, t.ballSettleStart, t.ballSettleEnd);
  const settleFrom = ballPos ??
    processingBallAtFrame(t.ballSettleStart - 1, t, layoutWindows) ?? {
      x: KIT_BALL.x,
      y: KIT_BALL.y,
    };
  const clusterOrigin = { x: CANVAS.width / 2, y: CANVAS.height / 2 };
  const settleStartX = clusterOrigin.x + (settleFrom.x - clusterOrigin.x);
  const settleStartY = clusterOrigin.y + (settleFrom.y - clusterOrigin.y);

  const scheduleMorph = fade(
    frame,
    t.scheduleTransitionStart,
    t.scheduleMorphEnd,
  );
  const scheduleContent = fade(
    frame,
    t.scheduleMorphEnd - 8,
    t.scheduleContentEnd,
  );
  const scheduleButton = fade(frame, t.scheduleContentEnd, t.scheduleButtonEnd);

  const kitCardOpacity = (() => {
    if (frame < t.kitIn) return 0;
    if (frame < t.kitIn + 18) return fade(frame, t.kitIn, t.kitIn + 18);
    if (frame < t.scheduleTransitionStart) return 1;
    return interpolate(scheduleMorph, [0, 0.35], [1, 0], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  })();
  const kitCardScale = interpolate(
    spring({
      frame: frame - t.kitIn,
      fps,
      config: { damping: 16, stiffness: 120 },
    }),
    [0, 1],
    [0.94, 1],
    { extrapolateRight: "clamp" },
  );

  const ecnlSelected = frame >= t.ecnlClick + 6;
  const kitCursor = kitCursorAtFrame(frame, t);

  const shareBtnPress = (() => {
    if (frame < t.shareClick) return 1;
    if (frame < t.shareClick + 4) {
      return interpolate(frame, [t.shareClick, t.shareClick + 4], [1, 0.94], {
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.quad),
      });
    }
    if (frame < t.shareClick + 8) {
      return interpolate(
        frame,
        [t.shareClick + 4, t.shareClick + 8],
        [0.94, 1],
        {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        },
      );
    }
    return 1;
  })();

  const shareUiOpacity =
    frame < t.shareFadeStart
      ? 1
      : interpolate(frame, [t.shareFadeStart, t.shareFadeEnd], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.cubic),
        });

  const shareCursor = shareCursorAtFrame(frame, t);

  const ballSettled = frame >= t.ballSettleEnd;
  const ballX = ballSettled
    ? KIT_BALL.x
    : interpolate(ballSettleProg, [0, 1], [settleStartX, KIT_BALL.x]);
  const ballY = ballSettled
    ? KIT_BALL.y
    : interpolate(ballSettleProg, [0, 1], [settleStartY, KIT_BALL.y]);
  const ballScreenSize = ballSettled
    ? KIT_BALL.size
    : interpolate(ballSettleProg, [0, 1], [102, KIT_BALL.size]);

  const ballSpinStart = Math.round(BALL_SPIN.startSec * fps);
  const ballSpinEnd = Math.round(BALL_SPIN.endSec * fps);
  const ballIsSpinning = frame >= ballSpinStart && frame <= ballSpinEnd;
  const ballRotation = ballIsSpinning
    ? ((frame - ballSpinStart) / fps) * 360 * BALL_SPIN.revPerSec
    : 0;

  const sceneDropY = desktopDropY;
  const scenePanY = sceneZoomPanY + sceneDropY;

  const selCursor = selectionCursorAtFrame(
    frame,
    t,
    popoverX,
    sceneScale,
    scenePanX,
    scenePanY,
    zoomOriginX,
    zoomOriginY,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: GRAY, overflow: "hidden" }}>
      {showDesktopPhase && desktopPhaseOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${scenePanX}px, ${scenePanY}px) scale(${sceneScale})`,
            transformOrigin: `${zoomOriginX}px ${zoomOriginY}px`,
            zIndex: 50,
          }}
        >
          {/* Shrunk desktop — full opacity */}
          <div
            style={{
              position: "absolute",
              left: DESKTOP.x,
              top: DESKTOP.y + 28,
              width: DESKTOP.width,
              height: DESKTOP.height,
              opacity: desktopPhaseOpacity,
              transform: `scale(${desktopScale})`,
              transformOrigin: "center center",
              zIndex: 1,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Img
              src={asset("desktop-shrunk.png")}
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>

          {/* Pop-up windows */}
          {CANVAS_WINDOWS.map((w, i) => {
            const start = t.winStart + i * t.winStagger;
            const prog = fade(frame - start, 0, 12);
            const winOpacity = (frame >= start ? prog : 0) * desktopPhaseOpacity;
            if (winOpacity <= 0.01) return null;
            return (
              <DesktopWindow
                key={w.id}
                src={w.src}
                x={w.x}
                y={w.y}
                w={w.w}
                h={w.h}
                opacity={winOpacity}
                zIndex={10 + i}
              />
            );
          })}

          {/* Kit popover — CSS-built, no white PNG patch */}
          {popoverOpacity > 0 && (
            <div
              style={{
                position: "absolute",
                left: popoverX,
                top: POPOVER.small.y,
                opacity: popoverOpacity,
                zIndex: 120,
              }}
            >
              <PopoverPill
                scale={POPOVER_PILL_SCALE}
                penSelected={penSelected}
                penSelectFrame={t.penClick}
              />
            </div>
          )}
        </div>
      )}

      {selCursor.phase === "pen" && selCursor.visible && (
        <div
          style={{
            position: "absolute",
            left: selCursor.x,
            top: selCursor.y,
            zIndex: 115,
          }}
        >
          <MacCursor />
        </div>
      )}
      {toolbarOpacity > 0 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200 }}>
          <Toolbar
            canvas={SELECTION_TOOLBAR}
            slideY={0}
            opacity={toolbarOpacity}
            chips={activeChips}
            useSelectionActive={useSelectionActive}
            useSelectionPress={btnPress.scale}
            useSelectionPressY={btnPress.y}
          />
        </div>
      )}
      {frame >= t.selStart && frame < t.ballSettleStart && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${totalPanX}px, ${totalPanY}px) scale(${clusterScale})`,
            transformOrigin: "center center",
          }}
        >
          {layoutWindows.map((w, i) => {
            const winSpring = spring({
              frame: frame - t.selStart,
              fps,
              config: { damping: 18, stiffness: 85 },
            });
            const winOpacity =
              windowsFade *
              interpolate(winSpring, [0, 1], [0, 1]) *
              windowsOutOpacity;
            const isSelected = selectedIds.has(w.id);

            return (
              <SelectionWindowGlow
                key={`glow-${w.id}`}
                x={w.x}
                y={w.y}
                w={w.w}
                h={w.h}
                opacity={winOpacity}
                zIndex={i + 1}
                selected={isSelected}
                processing={inProcessing && isSelected}
              />
            );
          })}

          {layoutWindows.map((w, i) => {
            const winSpring = spring({
              frame: frame - t.selStart,
              fps,
              config: { damping: 18, stiffness: 85 },
            });
            const winOpacity =
              windowsFade *
              interpolate(winSpring, [0, 1], [0, 1]) *
              windowsOutOpacity;

            return (
              <SelectionWindowBody
                key={`body-${w.id}`}
                src={w.src}
                x={w.x}
                y={w.y}
                w={w.w}
                h={w.h}
                opacity={winOpacity}
                zIndex={100 + i}
              />
            );
          })}

          {showProcessingBall && ballPos && (
            <ProcessingBall
              x={ballPos.x}
              y={ballPos.y}
              size={102}
              spinning={inProcessing}
            />
          )}

          {selCursor.phase === "selection" && selCursor.visible && (
            <div
              style={{
                position: "absolute",
                left: selCursor.x,
                top: selCursor.y,
                zIndex: 600,
              }}
            >
              <MacCursor />
            </div>
          )}
        </div>
      )}
      {(ballSettleProg > 0 || frame >= t.kitIn) &&
        frame < t.scheduleTransitionStart + 4 &&
        kitCardOpacity > 0.01 && (
          <KitPanel
            cardOpacity={kitCardOpacity}
            cardScale={kitCardScale}
            ecnlSelected={ecnlSelected}
            ecnlSelectFrame={t.ecnlClick + 6}
          />
        )}
      {ballIsSpinning && kitCardOpacity > 0.01 && (
        <KitThinkingPill
          spinStartFrame={ballSpinStart}
          spinEndFrame={ballSpinEnd}
          opacity={kitCardOpacity}
        />
      )}
      {ballSettleProg > 0 && shareUiOpacity > 0.01 && (
        <KitBall
          x={ballX}
          y={ballY}
          size={ballScreenSize}
          opacity={shareUiOpacity}
          rotation={ballRotation}
        />
      )}
      {(scheduleMorph > 0.01 || scheduleContent > 0.01) && (
        <SchedulePanel
          morphProgress={scheduleMorph}
          contentProgress={scheduleContent}
          buttonProgress={scheduleButton}
          buttonFade={shareUiOpacity}
          shareBtnPress={shareBtnPress}
        />
      )}
      {shareCursor.visible && shareUiOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: shareCursor.x,
            top: shareCursor.y,
            zIndex: 700,
          }}
        >
          <MacCursor />
        </div>
      )}
      {kitCursor.visible && (
        <div
          style={{
            position: "absolute",
            left: kitCursor.x,
            top: kitCursor.y,
            zIndex: 700,
          }}
        >
          <MacCursor />
        </div>
      )}
    </AbsoluteFill>
  );
};

function selectionCursorAtFrame(
  frame: number,
  t: Record<string, number>,
  popoverX: number,
  sceneScale: number,
  scenePanX: number,
  scenePanY: number,
  originX: number,
  originY: number,
) {
  if (frame >= t.cursorMove && frame < t.handoff) {
    return penCursorAtFrame(
      frame,
      t,
      popoverX,
      sceneScale,
      scenePanX,
      scenePanY,
      originX,
      originY,
    );
  }

  if (frame < t.selStart || frame >= t.processingStart) {
    return { visible: false, x: 0, y: 0, phase: "none" as const };
  }

  const mail = SELECTION_WINDOWS[0];
  const excel = SELECTION_WINDOWS[1];
  const safari = SELECTION_WINDOWS[2];
  const btn = USE_SELECTION_BTN;

  if (frame < t.selMail) {
    return { visible: false, x: 0, y: 0, phase: "selection" as const };
  }

  if (frame < t.selExcel) {
    const prog = fade(frame, t.selMail, t.selMail + 20);
    return {
      visible: true,
      phase: "selection" as const,
      x: interpolate(prog, [0, 1], [mail.cursorX + 80, mail.cursorX]),
      y: interpolate(prog, [0, 1], [mail.cursorY + 60, mail.cursorY]),
    };
  }

  if (frame < t.selSafari) {
    const prog = fade(frame, t.selExcel, t.selExcel + 20);
    return {
      visible: true,
      phase: "selection" as const,
      x: interpolate(prog, [0, 1], [mail.cursorX, excel.cursorX]),
      y: interpolate(prog, [0, 1], [mail.cursorY, excel.cursorY]),
    };
  }

  if (frame < t.cursorToBtn) {
    const prog = fade(frame, t.selSafari, t.selSafari + 20);
    return {
      visible: true,
      phase: "selection" as const,
      x: interpolate(prog, [0, 1], [excel.cursorX, safari.cursorX]),
      y: interpolate(prog, [0, 1], [excel.cursorY, safari.cursorY]),
    };
  }

  if (frame < t.btnClick + 10) {
    const prog = fade(frame, t.cursorToBtn, t.cursorToBtn + 16);
    return {
      visible: true,
      phase: "selection" as const,
      x: interpolate(prog, [0, 1], [safari.cursorX, btn.x + btn.w / 2]),
      y: interpolate(prog, [0, 1], [safari.cursorY, btn.y + btn.h / 2]),
    };
  }

  return { visible: false, x: 0, y: 0, phase: "selection" as const };
}

function shareCursorAtFrame(frame: number, t: Record<string, number>) {
  if (frame < t.shareCursorMove) {
    return { visible: false, x: 0, y: 0 };
  }

  const target = shareButtonCursor();
  const from = ecnlOptionCursor();

  if (frame < t.shareClick) {
    const prog = fade(frame, t.shareCursorMove, t.shareCursorMove + 18);
    return {
      visible: true,
      x: interpolate(prog, [0, 1], [from.x + 80, target.x]),
      y: interpolate(prog, [0, 1], [from.y + 120, target.y]),
    };
  }

  return { visible: true, x: target.x, y: target.y };
}

function kitCursorAtFrame(frame: number, t: Record<string, number>) {
  if (frame < t.ecnlCursorMove || frame >= t.scheduleTransitionStart) {
    return { visible: false, x: 0, y: 0 };
  }

  const target = ecnlOptionCursor();

  if (frame < t.ecnlClick) {
    const prog = fade(frame, t.ecnlCursorMove, t.ecnlCursorMove + 18);
    return {
      visible: true,
      x: interpolate(prog, [0, 1], [target.x + 120, target.x]),
      y: interpolate(prog, [0, 1], [target.y + 80, target.y]),
    };
  }

  return { visible: true, x: target.x, y: target.y };
}

function penCursorAtFrame(
  frame: number,
  t: Record<string, number>,
  popoverX: number,
  sceneScale: number,
  scenePanX: number,
  scenePanY: number,
  originX: number,
  originY: number,
) {
  const pen = popoverPenLocal();
  const pillScale = POPOVER_PILL_SCALE;
  const iconTipLocalX = popoverX + (pen.x + 26) * pillScale;
  const iconTipLocalY = POPOVER.small.y + (pen.y + 32) * pillScale;

  const toScreen = (lx: number, ly: number) =>
    sceneToScreen(lx, ly, sceneScale, scenePanX, scenePanY, originX, originY);

  if (frame < t.penClick) {
    const prog = fade(frame, t.cursorMove, t.penClick);
    const from = toScreen(iconTipLocalX + 90, iconTipLocalY + 60);
    const to = toScreen(iconTipLocalX, iconTipLocalY);
    return {
      visible: true,
      phase: "pen" as const,
      x: interpolate(prog, [0, 1], [from.x, to.x]),
      y: interpolate(prog, [0, 1], [from.y, to.y]),
    };
  }

  return { visible: false, phase: "pen" as const, x: 0, y: 0 };
}

function processingBallAtFrame(
  frame: number,
  t: Record<string, number>,
  windows: { x: number; y: number; w: number; h: number }[],
) {
  if (frame < t.processingStart || frame >= t.ballSettleStart) return null;

  const local = frame - t.processingStart;
  const duration = t.ballSettleStart - t.processingStart;

  const targets = windows.map((w) => ({
    x: w.x + w.w / 2 - 51,
    y: w.y + w.h / 2 - 51,
  }));

  const seg = duration / Math.max(targets.length, 1);
  const idx = Math.min(Math.floor(local / seg), targets.length - 1);
  const segProg = (local - idx * seg) / seg;
  const eased = Easing.inOut(Easing.cubic)(Math.min(Math.max(segProg, 0), 1));

  const a = targets[idx];
  const b = targets[(idx + 1) % targets.length];

  return {
    x: interpolate(eased, [0, 1], [a.x, b.x]),
    y: interpolate(eased, [0, 1], [a.y, b.y]),
  };
}
