import { Img, staticFile, useCurrentFrame } from "remotion";
import { KIT_PANEL, TOOLBAR_CHIPS } from "../constants";

const asset = (p: string) => staticFile(`assets/parts/${p}`);

type Props = {
  cardOpacity: number;
  cardScale: number;
  ecnlSelected: boolean;
  ecnlSelectFrame: number;
};

const OPTIONS = [
  { id: "ecnl", label: "Help me prepare for ECNL Phoenix", hasArrow: false },
  { id: "gaps", label: "Find gaps in my tournament coverage", hasArrow: true },
  { id: "organize", label: "Organize the players I should watch", hasArrow: true },
] as const;

export const KitPanel: React.FC<Props> = ({
  cardOpacity,
  cardScale,
  ecnlSelected,
  ecnlSelectFrame,
}) => {
  const frame = useCurrentFrame();
  const pulse =
    ecnlSelected && frame >= ecnlSelectFrame
      ? 0.75 + Math.sin((frame - ecnlSelectFrame) * 0.18) * 0.25
      : 0;

  return (
    <>
      {cardOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: KIT_PANEL.x,
            top: KIT_PANEL.y,
            width: KIT_PANEL.w,
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
            transformOrigin: "center top",
            zIndex: 40,
          }}
        >
          <div
            style={{
              background: "#181a1b",
              border: "1.5px solid rgba(255,255,255,0.12)",
              borderRadius: 36,
              boxShadow: "0 42px 120px rgba(0,0,0,0.32)",
              overflow: "hidden",
            }}
          >
            {/* Close row */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "18px 24px 19px",
                borderBottom: "1.5px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Img src={asset("icon-close.svg")} style={{ width: 15, height: 15, opacity: 0.7 }} />
              </div>
            </div>

            <div style={{ padding: "6px 18px 24px", display: "flex", flexDirection: "column", gap: 21 }}>
              {/* Heading */}
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ fontSize: 35, color: "#34d0bd", lineHeight: 1, marginTop: 2 }}>✦</span>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: 33,
                    fontWeight: 600,
                    lineHeight: 1.27,
                    letterSpacing: -0.66,
                    color: "#fff",
                  }}
                >
                  I can see the selected windows. What should we prep?
                </h2>
              </div>

              {/* App chips */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {TOOLBAR_CHIPS.map((chip) => (
                  <div
                    key={chip.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 21,
                      padding: "9px 15px 9px 12px",
                    }}
                  >
                    <Img src={asset(chip.icon)} style={{ width: 33, height: 33, objectFit: "contain" }} />
                    <span
                      style={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: 18,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      {chip.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Suggestion buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {OPTIONS.map((opt) => {
                  const isEcnl = opt.id === "ecnl";
                  const selected = isEcnl && ecnlSelected;

                  return (
                    <div
                      key={opt.id}
                      style={{
                        position: "relative",
                        borderRadius: 24,
                        background: selected
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(255,255,255,0.06)",
                        padding: selected ? 3 : 0,
                      }}
                    >
                      {selected && (
                        <>
                          <div
                            style={{
                              position: "absolute",
                              inset: -6,
                              borderRadius: 28,
                              background: `linear-gradient(135deg,
                                rgba(41,209,194,${0.5 * pulse}) 0%,
                                rgba(210,230,70,${0.45 * pulse}) 50%,
                                rgba(70,210,120,${0.5 * pulse}) 100%)`,
                              filter: "blur(14px)",
                              opacity: 0.9,
                              zIndex: 0,
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              borderRadius: 24,
                              padding: 3,
                              background: `linear-gradient(135deg, #29d1c2 0%, #dce646 50%, #46d278 100%)`,
                              WebkitMask:
                                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                              WebkitMaskComposite: "xor",
                              maskComposite: "exclude",
                              zIndex: 1,
                              opacity: 0.85 + pulse * 0.15,
                            }}
                          />
                        </>
                      )}
                      <div
                        style={{
                          position: "relative",
                          zIndex: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: selected ? "18px 21px" : "19px 22px",
                          borderRadius: 24,
                          background: selected ? "rgba(255,255,255,0.08)" : "transparent",
                          border: selected
                            ? "none"
                            : "1.5px solid transparent",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "Inter, system-ui, sans-serif",
                            fontSize: 21,
                            fontWeight: 400,
                            lineHeight: 1.35,
                            color: selected ? "#fff" : "rgba(255,255,255,0.55)",
                          }}
                        >
                          {opt.label}
                        </span>
                        {opt.hasArrow && (
                          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 20 }}>→</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div
                style={{
                  background: "#000",
                  borderRadius: 27,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 12,
                  padding: "15px 15px 15px 21px",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: 24,
                    color: "rgba(255,255,255,0.35)",
                    padding: "9px 0",
                  }}
                >
                  Ask Kit anything...
                </span>
                <Img
                  src={asset("icon-send-btn.png")}
                  style={{
                    width: 54,
                    height: 54,
                    flexShrink: 0,
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/** Cursor target for ECNL Phoenix option */
export const ecnlOptionCursor = () => ({
  x: KIT_PANEL.x + 280,
  y: KIT_PANEL.y + 318,
});
