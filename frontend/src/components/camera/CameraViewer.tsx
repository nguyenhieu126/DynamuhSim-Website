import { Camera, Maximize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRobot } from "../../contexts/RobotContext";
import { Badge, Button, Card, Empty } from "../common/UI";
import dashboardScene from "../../assets/dashboard-scene.png";
import manualScene from "../../assets/manual-control-scene.png";
import aiScene from "../../assets/ai-monitoring-scene.png";
import sensorDepth from "../../assets/sensors-telemetry-depth.svg";
import dashboardDepth from "../../assets/dashboard-depth.svg";

export function CameraViewer({
  variant = "dashboard",
  depthOnly = false,
  selectable = false,
  selected = 1,
  onSelect,
}: {
  variant?: "dashboard" | "manual" | "ai" | "sensor";
  depthOnly?: boolean;
  selectable?: boolean;
  selected?: number;
  onSelect?: (id: number) => void;
}) {
  const { mode, telemetry } = useRobot();
  const [view, setView] = useState<"rgb" | "depth" | "split">(
    depthOnly
      ? "depth"
      : variant === "dashboard" || variant === "sensor"
        ? "split"
        : "rgb",
  );
  const [imageFailed, setImageFailed] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const camera = telemetry?.camera;
  const title = depthOnly
    ? "Depth Camera (Depth Map)"
    : variant === "ai"
      ? "RGB Camera · Detection & Tracking"
      : variant === "manual"
        ? "Live Camera (RGB)"
        : variant === "sensor"
          ? "Depth Camera (RGB-D)"
          : "Live Camera";
  const scene =
    variant === "manual"
      ? manualScene
      : variant === "ai"
        ? aiScene
        : dashboardScene;
  const rgbAvailable = mode === "demo" || (camera?.rgb && camera.rgbUrl);
  const depthAvailable = mode === "demo" || (camera?.depth && camera.depthUrl);
  const available =
    view === "rgb"
      ? rgbAvailable
      : view === "depth"
        ? depthAvailable
        : rgbAvailable || depthAvailable;
  useEffect(
    () => setImageFailed(false),
    [mode, camera?.rgbUrl, camera?.depthUrl],
  );
  return (
    <Card
      title={title}
      icon={Camera}
      className={`camera-card ${variant}`}
      action={
        <>
          <Badge tone={mode === "demo" ? "purple" : "neutral"}>
            {mode === "demo"
              ? "DEMO image"
              : camera?.fps
                ? `${camera.fps} FPS`
                : "No stream"}
          </Badge>
          {!depthOnly && (
            <div className="segmented camera-tabs">
              {(["rgb", "depth", "split"] as const).map((v) => (
                <button
                  key={v}
                  className={view === v ? "active" : ""}
                  onClick={() => {
                    setView(v);
                    setImageFailed(false);
                  }}
                >
                  {v === "split" ? "RGB-D" : v.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          <Button
            className="icon-button"
            aria-label="Fullscreen camera"
            onClick={() =>
              void root.current?.requestFullscreen().catch(() => {})
            }
          >
            <Maximize2 size={15} />
          </Button>
        </>
      }
    >
      <div
        ref={root}
        className={`camera-viewport ${variant === "manual" ? "tall" : ""} ${view === "split" ? "split" : ""}`}
      >
        {!available || imageFailed ? (
          <Empty
            title={imageFailed ? "Camera stream error" : "Camera unavailable"}
            detail="RGB and depth capabilities must be confirmed independently."
          />
        ) : (
          <>
            {view !== "depth" && (
              <div className="camera-pane">
                {mode === "demo" && variant === "manual" ? (
                  <svg
                    className="manual-reference"
                    viewBox="94 88 228 150"
                    preserveAspectRatio="xMidYMid slice"
                    role="img"
                    aria-label="Robot camera photograph from the Stitch reference"
                  >
                    <image
                      href={manualScene}
                      x="0"
                      y="0"
                      width="512"
                      height="364"
                    />
                  </svg>
                ) : rgbAvailable ? (
                  <img
                    src={mode === "demo" ? scene : camera?.rgbUrl || ""}
                    onError={() => setImageFailed(true)}
                    alt={
                      mode === "demo"
                        ? "Stitch reference scene · simulated camera"
                        : "Backend RGB stream"
                    }
                  />
                ) : (
                  <Empty
                    title="RGB stream unavailable"
                    detail="Depth capability does not imply an RGB stream."
                  />
                )}
                {rgbAvailable &&
                  (variant === "ai" || variant === "dashboard") &&
                  telemetry?.tracks
                    .slice(0, variant === "ai" ? 3 : 1)
                    .map((o) => (
                      <button
                        disabled={!selectable}
                        aria-label={`Select ${o.label} ${o.id}`}
                        key={o.id}
                        className={`detection-box ${o.risk.toLowerCase()} ${selected === o.id ? "selected" : ""}`}
                        style={{
                          left: `${o.box[0]}%`,
                          top: `${o.box[1]}%`,
                          width: `${o.box[2]}%`,
                          height: `${o.box[3]}%`,
                        }}
                        onClick={() => onSelect?.(o.id)}
                      >
                        <span>
                          #{o.id} {o.label} · {o.confidence.toFixed(2)}
                        </span>
                      </button>
                    ))}
              </div>
            )}
            {view !== "rgb" && (
              <div className="camera-pane depth-pane">
                {mode === "demo" ? (
                  <>
                    <img
                      src={variant === "sensor" ? sensorDepth : dashboardDepth}
                      alt="Illustrative pseudocolor depth map"
                    />
                    <div className="depth-scale">
                      <span>5.0 m</span>
                      <i />
                      <span>0.0 m</span>
                    </div>
                  </>
                ) : camera?.depth && camera.depthUrl ? (
                  <img
                    src={camera.depthUrl}
                    onError={() => setImageFailed(true)}
                    alt="Backend depth stream"
                  />
                ) : (
                  <Empty title="Depth stream unavailable" />
                )}
              </div>
            )}
            <div className="camera-hud">
              {mode === "demo"
                ? "REFERENCE IMAGE · NOT A LIVE STREAM"
                : `LIVE · ${camera?.fps ?? "N/A"} FPS`}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
