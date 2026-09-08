import { Img, staticFile } from "remotion";
import { DOCK } from "../constants";

const ICONS = [
  { src: "dock-icon-finder.png", size: 42.19 },
  { src: "dock-icon-safari.png", size: 42.19 },
  { src: "dock-icon-books.png", size: 42.19 },
  { src: "dock-icon-calendar.png", size: 42.19 },
  { src: "dock-icon-figma.png", size: 42.19 },
  { src: "dock-icon-notion.png", size: 42.19 },
] as const;

const DockIcon: React.FC<{ src: string; size: number }> = ({ src, size }) => (
  <div
    style={{
      width: 42.19,
      height: 42.19,
      borderRadius: 12.305,
      overflow: "hidden",
      flexShrink: 0,
      boxShadow: "0px 5.274px 21.095px rgba(0,0,0,0.35)",
    }}
  >
    <Img
      src={staticFile(`assets/parts/${src}`)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
  </div>
);

/** Figma DesktopDock 3324:8294 — CSS frosted pill + individual icon assets */
export const Dock: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: DOCK.x,
      top: DOCK.y,
      width: DOCK.w,
      height: DOCK.h,
      display: "flex",
      alignItems: "center",
      gap: 3.516,
      padding: "7.471px 5.713px",
      boxSizing: "border-box",
      borderRadius: 21.095,
      background: "rgba(255,255,255,0.2)",
      border: "0.439px solid rgba(0,0,0,0.05)",
      boxShadow: "0px 15.821px 43.947px rgba(0,0,0,0.35)",
    }}
  >
    {ICONS.map((icon) => (
      <DockIcon key={icon.src} src={icon.src} size={icon.size} />
    ))}

    <div
      style={{
        flexShrink: 0,
        padding: "0 5.274px",
        display: "flex",
        alignItems: "center",
        height: 35.158,
      }}
    >
      <div
        style={{
          width: 0.879,
          height: 35.158,
          background: "rgba(0,0,0,0.3)",
        }}
      />
    </div>

    <DockIcon src="dock-icon-kit.png" size={42.19} />

    <div
      style={{
        width: 42.19,
        height: 42.19,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 35.158,
          height: 35.158,
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0px 5.274px 21.095px rgba(0,0,0,0.35)",
        }}
      >
        <Img
          src={staticFile("assets/parts/dock-icon-trash.png")}
          style={{
            width: 35.158,
            height: 35.158,
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  </div>
);
