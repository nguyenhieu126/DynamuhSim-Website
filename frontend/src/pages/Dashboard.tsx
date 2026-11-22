import { Activity, Compass, Gauge, Map, Radar } from "lucide-react";
import { Link } from "react-router-dom";
import { RobotMetrics } from "../components/robot/RobotSummary";
import { CameraViewer } from "../components/camera/CameraViewer";
import { Card, Badge, DataTable, num } from "../components/common/UI";
import { MapViewer } from "../components/mapping/MapViewer";
import { LidarView } from "../components/mapping/LidarView";
import { TelemetryChart } from "../components/charts/TelemetryChart";
import { EventList } from "../components/robot/EventList";
import { useRobot } from "../contexts/RobotContext";
export default function Dashboard() {
  const { telemetry: t, mode } = useRobot();
  return (
    <div className="page-stack">
      <RobotMetrics />
      <div className="grid dashboard-vision">
        <CameraViewer />
        <Card
          title="SLAM Map (2D)"
          icon={Map}
          action={<Link to="/mapping-navigation">Open map</Link>}
        >
          <MapViewer compact />
          <div className="pose-inline">
            <span>Pose (map)</span>
            <span className="mono">
              x: {num(t?.pose.x)} m · y: {num(t?.pose.y)} m · θ:{" "}
              {num(t?.pose.yaw, 1)}°
            </span>
          </div>
        </Card>
      </div>
      <div className="grid dashboard-bottom">
        <Card
          title="Sensors & Telemetry"
          icon={Activity}
          action={<Link to="/sensors-telemetry">Details</Link>}
        >
          <div className="grid sensor-subgrid">
            <div className="subcard">
              <h3>
                <Radar size={16} />
                LiDAR{" "}
                <Badge tone={mode === "demo" ? "purple" : "neutral"}>
                  {mode === "demo" ? "SIM" : "N/A"}
                </Badge>
              </h3>
              <dl>
                <div>
                  <dt>Scan rate</dt>
                  <dd>{num(t?.lidar.rate, 1, "Hz")}</dd>
                </div>
                <div>
                  <dt>Points / scan</dt>
                  <dd>{t?.lidar.ranges.length ?? "N/A"}</dd>
                </div>
                <div>
                  <dt>Nearest obstacle</dt>
                  <dd>{num(t?.lidar.nearest, 2, "m")}</dd>
                </div>
              </dl>
              <LidarView compact />
            </div>
            <div className="subcard">
              <h3>
                <Compass size={16} />
                IMU · ICM-20948
              </h3>
              <dl>
                <div>
                  <dt>Acceleration (m/s²)</dt>
                  <dd>
                    {t?.imu.acceleration.map((n) => n.toFixed(2)).join(" / ") ||
                      "N/A"}
                  </dd>
                </div>
                <div>
                  <dt>Yaw</dt>
                  <dd>{num(t?.imu.orientation[2], 1, "°")}</dd>
                </div>
              </dl>
              <TelemetryChart
                height={160}
                unit="m/s²"
                series={[
                  { key: "ax", label: "Ax" },
                  { key: "ay", label: "Ay" },
                  { key: "az", label: "Az" },
                ]}
              />
            </div>
            <div className="subcard">
              <h3>
                <Gauge size={16} />
                Encoder · 4 wheels
              </h3>
              <DataTable
                columns={["Wheel", "RPM", "m/s"]}
                rows={
                  t?.wheels.map((w) => [
                    w.wheel,
                    num(w.rpm, 1),
                    num(w.velocity),
                  ]) || []
                }
              />
              <div className="rpm-bars">
                {t?.wheels.map((w) => (
                  <div key={w.wheel}>
                    <span className="mono">{num(w.rpm, 1)}</span>
                    <i
                      style={{
                        height: `${Math.max(5, Math.min(85, Math.abs(w.rpm)))}px`,
                      }}
                    />
                    <span>{w.wheel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <EventList />
      </div>
    </div>
  );
}
