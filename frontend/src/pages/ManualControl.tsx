import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  Compass,
  Gamepad2,
  Gauge,
  RotateCcw,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useRobot } from "../contexts/RobotContext";
import { useManualControl, type Direction } from "../hooks/useManualControl";
import { CameraViewer } from "../components/camera/CameraViewer";
import { RobotSummary, WheelTable } from "../components/robot/RobotSummary";
import { Badge, Button, Card, Notice, num } from "../components/common/UI";
const keys = [
  ["q", "Rotate Left", RotateCcw],
  ["w", "Forward", ArrowUp],
  ["e", "Rotate Right", RotateCw],
  ["a", "Left", ArrowLeft],
  ["d", "Right", ArrowRight],
  ["s", "Backward", ArrowDown],
] as const;
export default function ManualControl() {
  const [speed, setSpeed] = useState(60);
  const { active, press, release, enabled } = useManualControl(speed);
  const {
    mode,
    owner,
    claim,
    command,
    telemetry: t,
    snapshot,
    requestStop,
  } = useRobot();
  return (
    <div className="page-stack">
      <RobotSummary />
      <div className="grid manual-grid">
        <div className="page-stack">
          <CameraViewer variant="manual" />
          <div className="grid velocity-wheels">
            <Card title="Current Velocity" icon={Gauge}>
              <div className="velocity-list">
                {(["vx", "vy", "wz"] as const).map((k, i) => (
                  <div key={k}>
                    <i>{["vₓ", "vᵧ", "ω (yaw)"][i]}</i>
                    <strong className="mono">
                      {num(mode === "demo" ? command[k] : t?.velocity[k], 2)}{" "}
                      <small>{i === 2 ? "rad/s" : "m/s"}</small>
                    </strong>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Motor / Wheel Status" icon={Gauge}>
              <WheelTable />
            </Card>
          </div>
        </div>
        <div className="page-stack">
          <Card
            title="Drive Control"
            icon={Gamepad2}
            action={<Badge tone="purple">Preview only</Badge>}
          >
            <div className="control-authorization">
              <span>
                {mode === "live"
                  ? "Live movement disabled"
                  : owner === "manual"
                    ? "Manual demo ownership acquired"
                    : "Acquire manual demo ownership"}
              </span>
              <Button
                variant="primary"
                disabled={mode === "live"}
                onClick={() => claim(owner === "manual" ? null : "manual")}
              >
                {owner === "manual" ? "Release control" : "Enable demo control"}
              </Button>
            </div>
            <div className="dpad" aria-label="Mecanum drive controls">
              {keys.map(([key, label, Icon]) => (
                <button
                  key={key}
                  className={`drive-key key-${key} ${active === key ? "held" : ""}`}
                  disabled={!enabled}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    press(key as Direction);
                  }}
                  onPointerUp={release}
                  onPointerCancel={release}
                  onLostPointerCapture={release}
                  onKeyDown={(e) => {
                    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                      e.preventDefault();
                      press(key);
                    }
                  }}
                  onKeyUp={release}
                  onBlur={release}
                >
                  <Icon size={28} />
                  <span>{label}</span>
                  <kbd>({key.toUpperCase()})</kbd>
                </button>
              ))}
              <button
                className="dpad-center"
                aria-label="Stop demo motion"
                onClick={() => void requestStop()}
              >
                <Bot size={35} />
              </button>
            </div>
            <div className="keyboard-hint">
              <strong>Keyboard Hint</strong>
              <p>
                <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> Move ·{" "}
                <kbd>Q</kbd> <kbd>E</kbd> Rotate
              </p>
              <span className="small muted">
                Hold to move. Release to stop. One direction at a time.
              </span>
            </div>
            <div className="speed-control">
              <label htmlFor="speed">
                <Gauge size={18} /> Speed{" "}
                <strong className="mono">{speed}%</strong>
              </label>
              <input
                id="speed"
                type="range"
                min="0"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(+e.target.value)}
              />
              <div className="speed-presets">
                {[25, 50, 60, 75, 100].map((v) => (
                  <Button
                    key={v}
                    variant={v === speed ? "primary" : "secondary"}
                    onClick={() => setSpeed(v)}
                  >
                    {v}%
                  </Button>
                ))}
              </div>
            </div>
          </Card>
          <Card title="Safety Timeout" icon={ShieldCheck}>
            <p>
              Demo watchdog: <b className="mono">0.5 s</b> without heartbeat.
            </p>
            <p className="muted small">
              Stops on release, lost focus, hidden page, ownership change and
              route departure.
            </p>
            <Notice>
              Physical control requires backend ownership, dead-man heartbeat
              and a hardware watchdog. No verified interface is configured.
            </Notice>
          </Card>
          <Card title="Telemetry" icon={Compass}>
            <div className="grid grid-four mini-metrics">
              <div>
                IMU yaw<strong>{num(t?.imu.orientation[2], 1, "°")}</strong>
              </div>
              <div>
                Accel |a|
                <strong>
                  {num(t ? Math.hypot(...t.imu.acceleration) : null, 2, "m/s²")}
                </strong>
              </div>
              <div>
                LiDAR<strong>{num(t?.lidar.rate, 1, "Hz")}</strong>
              </div>
              <div>
                Jetson temp
                <strong>{num(snapshot?.status.temperature, 1, "°C")}</strong>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
