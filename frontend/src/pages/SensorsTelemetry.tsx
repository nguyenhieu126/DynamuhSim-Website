import { Activity, Battery, Camera, Cpu, Gauge, Radar } from "lucide-react";
import { useState } from "react";
import { useRobot } from "../contexts/RobotContext";
import { Badge, Card, DataTable, num } from "../components/common/UI";
import { TelemetryChart } from "../components/charts/TelemetryChart";
import { LidarView } from "../components/mapping/LidarView";
import { CameraViewer } from "../components/camera/CameraViewer";
const ranges = [
  ["Live (10s)", 10],
  ["1 min", 60],
  ["5 min", 300],
  ["15 min", 900],
  ["1 h", 3600],
] as const;
export default function SensorsTelemetry() {
  const { telemetry: t, mode, snapshot } = useRobot();
  const [seconds, setSeconds] = useState(10);
  const [topics, setTopics] = useState("all");
  const showIMU = topics === "all" || topics === "imu";
  const showVision = topics === "all" || topics === "vision";
  return (
    <div className="page-stack">
      <div className="page-heading">
        <Activity />
        <div>
          <h1>Sensors & Telemetry</h1>
          <p>Real-time sensor data, robot state and system telemetry</p>
        </div>
      </div>
      <div className="telemetry-filters">
        <span>Time Range:</span>
        <div className="segmented">
          {ranges.map(([label, sec]) => (
            <button
              key={sec}
              className={seconds === sec ? "active" : ""}
              onClick={() => setSeconds(sec)}
            >
              {label}
            </button>
          ))}
        </div>
        <label>
          Topics:{" "}
          <select value={topics} onChange={(e) => setTopics(e.target.value)}>
            <option value="all">All Sensors</option>
            <option value="imu">IMU & Encoders</option>
            <option value="vision">LiDAR & Vision</option>
            <option value="power">Power Diagnostics</option>
          </select>
        </label>
        <Badge tone={mode === "demo" ? "purple" : "neutral"}>
          {mode === "demo" ? "Simulated feedback" : "Measured feedback"}
        </Badge>
      </div>
      {showIMU && (
        <div className="grid grid-two">
          <Card title="IMU – Acceleration (m/s²)" icon={Activity}>
            <TelemetryChart
              seconds={seconds}
              unit="m/s²"
              series={[
                { key: "ax", label: "ax" },
                { key: "ay", label: "ay" },
                { key: "az", label: "az" },
              ]}
            />
          </Card>
          <Card title="IMU – Angular Velocity (rad/s)" icon={Activity}>
            <TelemetryChart
              seconds={seconds}
              unit="rad/s"
              series={[
                { key: "wx", label: "ωx" },
                { key: "wy", label: "ωy" },
                { key: "wz", label: "ωz" },
              ]}
            />
          </Card>
        </div>
      )}
      {showVision && (
        <div className="grid grid-two">
          <Card title="LiDAR Scan (2D)" icon={Radar}>
            <div className="lidar-detail">
              <LidarView />
              <dl>
                <div>
                  <dt>Range</dt>
                  <dd>{t ? `${t.lidar.min}–${t.lidar.max} m` : "N/A"}</dd>
                </div>
                <div>
                  <dt>Scan rate</dt>
                  <dd>{num(t?.lidar.rate, 1, "Hz")}</dd>
                </div>
                <div>
                  <dt>Points / scan</dt>
                  <dd>{t?.lidar.ranges.length ?? "N/A"}</dd>
                </div>
                <div>
                  <dt>FOV</dt>
                  <dd>{t ? "360°" : "N/A"}</dd>
                </div>
              </dl>
            </div>
          </Card>
          <CameraViewer variant="sensor" />
        </div>
      )}
      {showIMU && (
        <div className="grid grid-two">
          <Card title="Wheel Encoders – RPM" icon={Gauge}>
            <TelemetryChart
              seconds={seconds}
              unit="RPM"
              series={(["FL", "FR", "RL", "RR"] as const).map((key) => ({
                key,
                label: key,
              }))}
            />
          </Card>
          <Card title="Motor – Command vs Feedback" icon={Gauge}>
            <TelemetryChart
              seconds={seconds}
              unit="m/s · rad/s"
              series={[
                { key: "cmdVx", label: "Cmd vₓ", dashed: true },
                { key: "fbVx", label: "Feedback vₓ" },
                { key: "cmdVy", label: "Cmd vᵧ", dashed: true },
                { key: "fbVy", label: "Feedback vᵧ" },
                { key: "cmdWz", label: "Cmd ω", dashed: true },
                { key: "fbWz", label: "Feedback ω" },
              ]}
            />
            <p className="small muted">
              Commanded velocity vs {mode === "demo" ? "simulated" : "measured"}{" "}
              feedback. History contains only samples received during this
              session; longer ranges fill over time.
            </p>
          </Card>
        </div>
      )}
      <div className="grid telemetry-summary">
        <Card title="Battery & Power" icon={Battery}>
          <div className="power-value">
            {num(snapshot?.status.voltage, 1, "V")}
          </div>
          <dl>
            <div>
              <dt>State of charge (estimated)</dt>
              <dd>{num(snapshot?.status.battery, 0, "%")}</dd>
            </div>
            <div>
              <dt>Current / Power</dt>
              <dd>N/A</dd>
            </div>
            <div>
              <dt>Temperature</dt>
              <dd>{num(snapshot?.status.temperature, 1, "°C")}</dd>
            </div>
          </dl>
          <progress max="100" value={snapshot?.status.battery ?? 0} />
        </Card>
        <Card title="Sensor Health" icon={Activity}>
          <dl>
            {["LiDAR", "Depth Camera", "IMU (ICM-20948)", "Encoders (×4)"].map(
              (name) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>
                    <Badge tone="neutral">
                      {mode === "demo" ? "Not connected" : "Unverified"}
                    </Badge>
                  </dd>
                </div>
              ),
            )}
          </dl>
        </Card>
        <Card title="ROS 2 Node Status" icon={Cpu}>
          <dl>
            {[
              "slam_toolbox",
              "nav2_controller",
              "detect_tracking",
              "micro_ros_agent",
              "robot_state_publisher",
            ].map((name) => (
              <div key={name}>
                <dt className="mono">/{name}</dt>
                <dd>
                  <Badge>Unavailable</Badge>
                </dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card title="Robot State (Summary)" icon={Camera}>
          <DataTable
            columns={["Property", "Value"]}
            rows={[
              ["State", snapshot?.status.state ?? "OFFLINE"],
              ["Linear velocity", num(t?.velocity.vx, 2, "m/s")],
              ["Angular velocity", num(t?.velocity.wz, 2, "rad/s")],
              [
                "Pose (estimated)",
                t
                  ? `(${t.pose.x.toFixed(2)}, ${t.pose.y.toFixed(2)}, ${t.pose.yaw.toFixed(1)}°)`
                  : "N/A",
              ],
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
