import { demoSnapshot } from "../data/demo";
import type { RobotDataProvider, Snapshot } from "../types/robot";

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);
export const demoProvider: RobotDataProvider = {
  subscribe(onData) {
    onData(demoSnapshot());
    const timer = window.setInterval(() => onData(demoSnapshot()), 500);
    return () => window.clearInterval(timer);
  },
  async requestStop() {
    return {
      acknowledged: false,
      simulated: true,
      message:
        "DEMO stopped locally. No physical stop was sent or acknowledged.",
    };
  },
};

// Fail closed at the network boundary. Invalid or incomplete live frames never reach a visualizer.
export function parseSnapshot(value: unknown): Snapshot {
  if (!value || typeof value !== "object")
    throw new Error("Invalid telemetry frame");
  const v = value as Snapshot;
  if (
    !["demo", "live", "unavailable"].includes(v.source) ||
    !Number.isFinite(Date.parse(v.timestamp)) ||
    !v.status ||
    !Array.isArray(v.events)
  )
    throw new Error("Invalid telemetry envelope");
  const s = v.status;
  if (v.source === "live" && s.state === "DEMO")
    throw new Error("Demo status cannot be presented as live telemetry");
  if (
    ![
      "DEMO",
      "OFFLINE",
      "CONNECTING",
      "STOPPED",
      "MANUAL",
      "AUTONOMOUS",
      "FAULT",
    ].includes(s.state) ||
    typeof s.robot !== "string" ||
    ![null, "manual", "autonomous"].includes(s.ownership) ||
    typeof s.hardwareConnected !== "boolean" ||
    typeof s.rosConnected !== "boolean" ||
    typeof s.controlVerified !== "boolean" ||
    ![true, false, null].includes(s.moving) ||
    ![s.battery, s.voltage, s.temperature].every(
      (n) => n === null || (typeof n === "number" && Number.isFinite(n)),
    )
  )
    throw new Error("Invalid robot status");
  if (
    v.events.some(
      (e) =>
        !e ||
        !["info", "warning", "critical"].includes(e.level) ||
        ![e.id, e.time, e.title, e.detail].every((x) => typeof x === "string"),
    )
  )
    throw new Error("Invalid event frame");
  const t = v.telemetry;
  if (t) {
    const finite = (ns: unknown[]) =>
      ns.every((n) => typeof n === "number" && Number.isFinite(n));
    if (
      !t.velocity ||
      !t.commanded ||
      !t.pose ||
      !t.imu ||
      !t.lidar ||
      !t.camera ||
      !t.navigation ||
      !Array.isArray(t.wheels) ||
      !Array.isArray(t.tracks)
    )
      throw new Error("Incomplete telemetry frame");
    if (
      !finite([
        t.velocity.vx,
        t.velocity.vy,
        t.velocity.wz,
        t.commanded.vx,
        t.commanded.vy,
        t.commanded.wz,
        t.pose.x,
        t.pose.y,
        t.pose.yaw,
      ]) ||
      ![t.imu.acceleration, t.imu.angular, t.imu.orientation].every(
        (a) => Array.isArray(a) && a.length === 3 && finite(a),
      )
    )
      throw new Error("Invalid velocity, pose or IMU data");
    if (
      !Array.isArray(t.lidar.ranges) ||
      t.lidar.ranges.length > 20000 ||
      !finite(t.lidar.ranges) ||
      !finite([t.lidar.rate, t.lidar.min, t.lidar.max, t.lidar.nearest]) ||
      t.wheels.length !== 4 ||
      new Set(t.wheels.map((w) => w.wheel)).size !== 4 ||
      t.wheels.some(
        (w) =>
          !["FL", "FR", "RL", "RR"].includes(w.wheel) ||
          !finite([w.rpm, w.velocity]),
      )
    )
      throw new Error("Invalid LiDAR or wheel data");
    if (
      typeof t.camera.rgb !== "boolean" ||
      typeof t.camera.depth !== "boolean" ||
      ![t.camera.rgbUrl, t.camera.depthUrl].every(
        (url) =>
          url === null ||
          (typeof url === "string" && /^(https?:\/\/|\/[^/])/.test(url)),
      ) ||
      (t.camera.fps !== null && !finite([t.camera.fps]))
    )
      throw new Error("Invalid camera data");
    if (
      t.tracks.some(
        (o) =>
          !finite([o.id, o.confidence, o.distance, o.velocity]) ||
          typeof o.label !== "string" ||
          !["High", "Medium", "Low"].includes(o.risk) ||
          !Array.isArray(o.box) ||
          o.box.length !== 4 ||
          !finite(o.box) ||
          o.box.some((n) => n < 0 || n > 100) ||
          (o.position != null &&
            (!Array.isArray(o.position) ||
              o.position.length !== 2 ||
              !finite(o.position))) ||
          o.confidence < 0 ||
          o.confidence > 1 ||
          o.distance < 0 ||
          !Array.isArray(o.predicted) ||
          o.predicted.some(
            (p) => !Array.isArray(p) || p.length !== 2 || !finite(p),
          ),
      )
    )
      throw new Error("Invalid detection data");
    if (
      ![t.navigation.mapping, t.navigation.localized, t.navigation.nav2].every(
        (x) => typeof x === "boolean",
      ) ||
      typeof t.navigation.status !== "string"
    )
      throw new Error("Invalid navigation status");
  }
  return v;
}

export const liveProvider: RobotDataProvider = {
  subscribe(onData, onError) {
    let closed = false;
    let socket: WebSocket | undefined;
    let retry: number | undefined;
    let abort: AbortController | undefined;
    const accept = (data: unknown) => {
      const snapshot = parseSnapshot(data);
      if (snapshot.source !== "live")
        throw new Error(
          snapshot.source === "demo"
            ? "Backend is in DEMO mode. A verified live adapter is required."
            : "Backend available; hardware/ROS adapter unavailable.",
        );
      const age = Date.now() - Date.parse(snapshot.timestamp);
      if (age > 5000 || age < -5000)
        throw new Error(
          "Telemetry is stale or backend clock differs by more than 5 seconds.",
        );
      if (!closed) onData(snapshot);
    };
    const connect = async () => {
      abort = new AbortController();
      const timeout = window.setTimeout(() => abort?.abort(), 4000);
      try {
        const response = await fetch(`${API_BASE}/api/robot/telemetry`, {
          signal: abort.signal,
        });
        if (!response.ok)
          throw new Error(`Backend returned HTTP ${response.status}`);
        accept(await response.json());
        if (closed) return;
        const url = new URL(
          import.meta.env.VITE_WS_URL ||
            `${API_BASE || window.location.origin}/ws/telemetry`,
          window.location.origin,
        );
        url.protocol =
          url.protocol === "https:" || url.protocol === "wss:" ? "wss:" : "ws:";
        socket = new WebSocket(url);
        socket.onmessage = (e) => {
          try {
            accept(JSON.parse(e.data));
          } catch (error) {
            onError(String(error));
            socket?.close();
          }
        };
        socket.onerror = () => {
          if (!closed)
            onError("WebSocket unavailable. Live control remains disabled.");
        };
        socket.onclose = () => {
          if (!closed) {
            onError("Telemetry disconnected. No motion will resume.");
            retry = window.setTimeout(connect, 3000);
          }
        };
      } catch (error) {
        if (!closed) {
          onError(
            error instanceof Error ? error.message : "Backend unavailable",
          );
          retry = window.setTimeout(connect, 3000);
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };
    void connect();
    return () => {
      closed = true;
      abort?.abort();
      socket?.close();
      window.clearTimeout(retry);
    };
  },
  async requestStop() {
    // No verified control/STOP endpoint exists. Never turn a local click into a physical acknowledgment.
    throw new Error(
      "STOP NOT ACKNOWLEDGED: no verified physical STOP endpoint is configured. Use the physical emergency stop.",
    );
  },
};
