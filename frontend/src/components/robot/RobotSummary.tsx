import { Battery, Gauge, Layers, Wifi, Bot } from "lucide-react";
import { useRobot } from "../../contexts/RobotContext";
import { Badge, Metric, num } from "../common/UI";
export function RobotMetrics() {
  const { snapshot, telemetry: t, mode, owner, connection } = useRobot();
  const s = snapshot?.status;
  return (
    <div className="grid grid-four">
      <Metric
        label="Robot Status"
        value={connection}
        detail={
          mode === "demo"
            ? "Local simulation · hardware unavailable"
            : s?.hardwareConnected
              ? "Backend confirmed"
              : "Hardware unavailable"
        }
        icon={Wifi}
        tone={mode === "demo" ? "purple-text" : ""}
      />
      <Metric
        label="Battery"
        value={num(s?.battery, 0, "%")}
        detail={`${num(s?.voltage, 1, "V")} · ${mode === "demo" ? "simulated" : "measured"}`}
        icon={Battery}
      />
      <Metric
        label="Speed"
        value={num(
          t ? Math.hypot(t.velocity.vx, t.velocity.vy) : null,
          2,
          "m/s",
        )}
        detail={`Angular: ${num(t?.velocity.wz, 2, "rad/s")}`}
        icon={Gauge}
      />
      <Metric
        label="Operating Mode"
        value={
          mode === "demo"
            ? owner === "manual"
              ? "Manual preview"
              : owner === "autonomous"
                ? "Autonomous preview"
                : "Stopped"
            : s?.ownership || "Unavailable"
        }
        detail={
          mode === "demo"
            ? "DEMO · no physical commands"
            : "Live control disabled"
        }
        icon={Layers}
      />
    </div>
  );
}
export function RobotSummary() {
  const { snapshot, mode, telemetry, owner } = useRobot();
  return (
    <div className="card summary-strip">
      <strong>
        <Bot size={22} /> Robot Status
      </strong>
      <span>
        Battery <b className="mono">{num(snapshot?.status.battery, 0, "%")}</b>
      </span>
      <span>
        Velocity <b className="mono">{num(telemetry?.velocity.vx, 2, "m/s")}</b>
      </span>
      <span>
        Mode{" "}
        <Badge tone="blue">
          {mode === "demo"
            ? `${owner || "stopped"} · DEMO`
            : "Live · read-only"}
        </Badge>
      </span>
    </div>
  );
}
export function WheelTable() {
  const { telemetry, mode } = useRobot();
  return (
    <div className="wheel-grid">
      {(["FL", "FR", "RL", "RR"] as const).map((w, i) => (
        <div className="wheel-tile" key={w}>
          <span className="wheel-symbol">◉</span>
          <div>
            <strong>
              {["Front Left", "Front Right", "Rear Left", "Rear Right"][i]} ({w}
              )
            </strong>
            <div className="mono wheel-value">
              {num(telemetry?.wheels.find((x) => x.wheel === w)?.rpm, 1)}{" "}
              <small>RPM</small>
            </div>
            <span className="muted small">
              {mode === "demo" ? "Simulated feedback" : "Measured feedback"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
