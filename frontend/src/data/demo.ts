import type { Snapshot } from "../types/robot";

export function demoSnapshot(t = Date.now()): Snapshot {
  const wave = Math.sin(t / 1600);
  return {
    source: "demo",
    timestamp: new Date(t).toISOString(),
    status: {
      state: "DEMO",
      robot: "PBL6-01",
      hardwareConnected: false,
      rosConnected: false,
      ownership: null,
      battery: 78,
      voltage: 24.1,
      temperature: 52,
      moving: false,
      controlVerified: false,
    },
    telemetry: {
      velocity: { vx: 0, vy: 0, wz: 0 },
      commanded: { vx: 0, vy: 0, wz: 0 },
      pose: { x: 2.416, y: 1.983, yaw: 27.6 },
      wheels: (["FL", "FR", "RL", "RR"] as const).map((wheel) => ({
        wheel,
        rpm: 0,
        velocity: 0,
      })),
      imu: {
        acceleration: [
          wave * 0.06,
          Math.cos(t / 1300) * 0.1,
          9.81 + wave * 0.02,
        ],
        angular: [0.02 * wave, -0.04 * wave, 0.01 * wave],
        orientation: [0.5, -1.2, 27.6],
      },
      lidar: {
        ranges: Array.from(
          { length: 180 },
          (_, i) => 3.4 + 0.65 * Math.sin(i * 0.13) + 0.3 * Math.cos(i * 0.41),
        ),
        rate: 10,
        min: 0.15,
        max: 12,
        nearest: 0.68,
      },
      camera: {
        rgb: false,
        depth: false,
        fps: null,
        rgbUrl: null,
        depthUrl: null,
      },
      tracks: [
        {
          id: 1,
          label: "Person",
          confidence: 0.96,
          distance: 1.42,
          velocity: 0.73,
          risk: "High",
          box: [27, 17, 19, 63],
          position: [-0.8, 1.17],
          predicted: [
            [-0.8, 1.4],
            [-0.4, 0.5],
          ],
        },
        {
          id: 2,
          label: "Person",
          confidence: 0.91,
          distance: 3.26,
          velocity: 0.41,
          risk: "Low",
          box: [56, 30, 12, 43],
          position: [1.4, 2.94],
          predicted: [
            [1.4, 2.5],
            [0.8, 1.5],
          ],
        },
        {
          id: 3,
          label: "Object",
          confidence: 0.89,
          distance: 2.18,
          velocity: 0,
          risk: "Medium",
          box: [77, 60, 17, 28],
          position: [1.9, 1.06],
          predicted: [],
        },
      ],
      navigation: {
        mapping: false,
        localized: false,
        nav2: false,
        status: "Demo preview · Nav2 unavailable",
        goal: null,
      },
    },
    events: [
      {
        id: "d1",
        time: "14:32:18",
        level: "critical",
        title: "Example: high collision risk · ID #1",
        detail: "Simulated person at 1.42 m. No inference service connected.",
      },
      {
        id: "d2",
        time: "14:32:14",
        level: "info",
        title: "Example: object tracked · ID #3",
        detail: "Demonstration confidence 0.89, distance 2.18 m.",
      },
      {
        id: "d3",
        time: "14:32:10",
        level: "warning",
        title: "Example: human detected · ID #2",
        detail: "Simulated detection. No live camera stream.",
      },
      {
        id: "d4",
        time: "14:32:08",
        level: "info",
        title: "Demo environment loaded",
        detail: "Jetson, ESP32, ROS 2 and hardware are unavailable.",
      },
    ],
  };
}
