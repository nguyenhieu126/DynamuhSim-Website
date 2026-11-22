import { LocateFixed, Maximize2, Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";
import map from "../../assets/mapping-navigation-map.svg";
import miniMap from "../../assets/dashboard-map.svg";
import { useRobot } from "../../contexts/RobotContext";
import { Badge, Button, Empty } from "../common/UI";
export function MapViewer({ compact = false }: { compact?: boolean }) {
  const { mode } = useRobot();
  const [zoom, setZoom] = useState(1);
  const root = useRef<HTMLDivElement>(null);
  if (mode !== "demo")
    return (
      <Empty
        title="Occupancy grid unavailable"
        detail="A verified ROS 2 map adapter has not been connected."
      />
    );
  return (
    <div className={`map-viewer ${compact ? "compact" : ""}`} ref={root}>
      <img
        style={{ transform: `scale(${zoom})` }}
        src={compact ? miniMap : map}
        alt="Demo occupancy grid with robot pose, planned path, current trajectory and goal"
      />
      <div className="map-tools">
        <Button
          className="icon-button"
          aria-label="Fullscreen map"
          onClick={() => void root.current?.requestFullscreen().catch(() => {})}
        >
          <Maximize2 size={16} />
        </Button>
        {!compact && (
          <>
            <Button
              className="icon-button"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
            >
              <Plus size={18} />
            </Button>
            <Button
              className="icon-button"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
            >
              <Minus size={18} />
            </Button>
            <Button
              className="icon-button"
              aria-label="Center map"
              onClick={() => setZoom(1)}
            >
              <LocateFixed size={18} />
            </Button>
          </>
        )}
      </div>
      <div className="map-demo">
        <Badge tone="purple">DEMO map · illustrative path</Badge>
      </div>
    </div>
  );
}
