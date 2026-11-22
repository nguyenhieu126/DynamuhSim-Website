import {
  Camera,
  Crosshair,
  Eye,
  Layers,
  ShieldAlert,
  Target,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useRobot } from "../contexts/RobotContext";
import { CameraViewer } from "../components/camera/CameraViewer";
import {
  Badge,
  Card,
  DataTable,
  Empty,
  Metric,
  num,
} from "../components/common/UI";
import { EventList } from "../components/robot/EventList";
function RiskView({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (id: number) => void;
}) {
  const { telemetry, mode } = useRobot();
  if (!telemetry?.tracks.length) return <Empty title="No tracked objects" />;
  const positionedTracks = telemetry.tracks.filter((o) => o.position);
  if (!positionedTracks.length)
    return (
      <Empty
        title="Robot-frame positions unavailable"
        detail="Distance alone cannot determine a track position or trajectory."
      />
    );
  return (
    <div className="risk-layout">
      <svg
        className="risk-view"
        viewBox="0 0 280 280"
        role="img"
        aria-label={`${mode === "demo" ? "Simulated" : "Backend"} tracked objects and predicted trajectories in robot coordinates`}
      >
        <defs>
          <pattern
            id="risk-grid"
            width="35"
            height="35"
            patternUnits="userSpaceOnUse"
          >
            <path d="M35 0H0V35" fill="none" stroke="#294663" />
          </pattern>
        </defs>
        <rect width="280" height="280" fill="#0b2038" rx="8" />
        <rect width="280" height="280" fill="url(#risk-grid)" />
        {[
          [170, "#10b981"],
          [115, "#f59e0b"],
          [60, "#ef4444"],
        ].map(([r, c]) => (
          <path
            key={r}
            d={`M140 245 L${140 - Number(r) * 0.75} ${245 - Number(r) * 0.66} A${r} ${r} 0 0 1 ${140 + Number(r) * 0.75} ${245 - Number(r) * 0.66}Z`}
            fill={String(c)}
            opacity=".22"
          />
        ))}
        {positionedTracks.map((o) => {
          const x = 140 + o.position![0] * 48;
          const y = 245 - o.position![1] * 48;
          return (
            <g
              key={o.id}
              onClick={() => onSelect(o.id)}
              style={{ cursor: "pointer" }}
            >
              {o.predicted.length > 0 && (
                <path
                  d={`M${x},${y} ${o.predicted.map((p) => `L${140 + p[0] * 48},${245 - p[1] * 48}`).join(" ")}`}
                  stroke={o.risk === "High" ? "#ff6175" : "#4ade80"}
                  strokeWidth="2"
                  strokeDasharray="5 4"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={selected === o.id ? 18 : 14}
                fill={
                  o.risk === "High"
                    ? "#ef4444"
                    : o.risk === "Low"
                      ? "#10b981"
                      : "#1769e0"
                }
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y + 4}
                fill="white"
                fontSize="12"
                textAnchor="middle"
              >
                #{o.id}
              </text>
            </g>
          );
        })}
        <rect
          x="127"
          y="232"
          width="26"
          height="24"
          rx="5"
          fill="#1769e0"
          stroke="white"
        />
        <text x="140" y="273" fill="#a5bad4" fontSize="10" textAnchor="middle">
          X (m) · Y (m) · {mode === "demo" ? "demo" : "backend positions"}
        </text>
      </svg>
      <div className="risk-legend">
        <Badge tone="red">High risk</Badge>
        <Badge tone="amber">Caution</Badge>
        <Badge tone="green">Low risk</Badge>
        <p className="small muted">
          Dashed lines: predicted trajectory when available. Demo risk values
          are examples, not collision decisions.
        </p>
      </div>
    </div>
  );
}
export default function AIMonitoring() {
  const { mode, telemetry } = useRobot();
  const [selected, setSelected] = useState(1);
  const [filter, setFilter] = useState("all");
  const tracks = telemetry?.tracks;
  const target = tracks?.find((o) => o.id === selected);
  const demo = mode === "demo";
  return (
    <div className="page-stack">
      <div className="page-heading">
        <Eye />
        <div>
          <h1>AI Monitoring</h1>
          <p>
            Human detection, object tracking and motion prediction for safe
            navigation
          </p>
        </div>
        <Badge>AI inference unavailable</Badge>
      </div>
      <div className="grid grid-five">
        <Metric
          label="FPS"
          value={demo ? "30.1" : num(telemetry?.camera.fps, 1)}
          detail={demo ? "Simulated display rate" : "Backend reported"}
          icon={Camera}
        />
        <Metric
          label="Detections"
          value={tracks?.length ?? "N/A"}
          detail={demo ? "Example detections" : "Backend detections"}
          icon={Crosshair}
        />
        <Metric
          label="Tracked Objects"
          value={tracks?.length ?? "N/A"}
          detail={tracks?.map((o) => `#${o.id}`).join(", ") || "No tracks"}
          icon={Users}
        />
        <Metric
          label="Collision Risk"
          value={demo ? "0.78" : (target?.risk ?? "N/A")}
          detail={demo ? "High · simulated scenario" : "Backend classification"}
          icon={ShieldAlert}
          tone="red-text"
        />
        <Metric
          label="Avg. Confidence"
          value={
            tracks?.length
              ? num(
                  tracks.reduce((sum, t) => sum + t.confidence, 0) /
                    tracks.length,
                )
              : "N/A"
          }
          detail={demo ? "Example confidence" : "Backend confidence"}
          icon={Target}
        />
      </div>
      <div className="grid ai-vision">
        <CameraViewer
          variant="ai"
          selectable
          selected={selected}
          onSelect={setSelected}
        />
        <div className="page-stack">
          <CameraViewer variant="ai" depthOnly />
          <Card
            title={`Detection Info · ${target ? `Selected ID #${selected}` : "No selection"}`}
            icon={Users}
          >
            {target ? (
              <dl className="detection-info">
                <div>
                  <dt>Class</dt>
                  <dd>{target.label}</dd>
                </div>
                <div>
                  <dt>Distance</dt>
                  <dd>{num(target.distance, 2, "m")}</dd>
                </div>
                <div>
                  <dt>Track ID</dt>
                  <dd>#{target.id}</dd>
                </div>
                <div>
                  <dt>Velocity (estimated)</dt>
                  <dd>{num(target.velocity, 2, "m/s")}</dd>
                </div>
                <div>
                  <dt>Confidence</dt>
                  <dd>{num(target.confidence)}</dd>
                </div>
                <div>
                  <dt>Collision risk</dt>
                  <dd>
                    <Badge
                      tone={
                        target.risk === "High"
                          ? "red"
                          : target.risk === "Medium"
                            ? "amber"
                            : "green"
                      }
                    >
                      {target.risk}
                    </Badge>
                  </dd>
                </div>
              </dl>
            ) : (
              <Empty title="No detection data" />
            )}
          </Card>
        </div>
      </div>
      <div className="grid ai-bottom">
        <Card title="Top View & Risk Zone" icon={Layers}>
          <RiskView selected={selected} onSelect={setSelected} />
        </Card>
        <Card title="Tracked Objects" icon={Users}>
          <DataTable
            columns={["ID", "Class", "Distance", "Velocity", "Risk", "Conf."]}
            rows={
              tracks?.map((o) => [
                <button
                  className="text-button"
                  onClick={() => setSelected(o.id)}
                >
                  #{o.id}
                </button>,
                o.label,
                num(o.distance, 2, "m"),
                num(o.velocity, 2, "m/s"),
                <Badge
                  tone={
                    o.risk === "High"
                      ? "red"
                      : o.risk === "Low"
                        ? "green"
                        : "amber"
                  }
                >
                  {o.risk}
                </Badge>,
                num(o.confidence),
              ]) || []
            }
          />
          <p className="muted small">
            Distance & velocity are estimates.{" "}
            {demo
              ? "All tracks are simulated."
              : "No example tracks are inserted into live data."}
          </p>
        </Card>
        <div className="page-stack">
          <label className="event-filter">
            Timeline filter
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All events</option>
              <option value="critical">Critical</option>
              <option value="warning">Warnings</option>
              <option value="info">Information</option>
            </select>
          </label>
          <EventList title="Event Timeline" filter={filter} />
        </div>
      </div>
    </div>
  );
}
