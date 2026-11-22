import { useId } from "react";
import { useRobot } from "../../contexts/RobotContext";
import { Empty } from "../common/UI";
export function LidarView({ compact = false }: { compact?: boolean }) {
  const { telemetry, mode } = useRobot();
  const id = useId();
  if (!telemetry) return <Empty title="LiDAR unavailable" />;
  return (
    <div className={`lidar-view ${compact ? "compact" : ""}`}>
      <svg
        viewBox="0 0 320 270"
        role="img"
        aria-label={`${mode === "demo" ? "Simulated" : "Measured"} LiDAR scan in meters`}
      >
        <defs>
          <radialGradient id={id}>
            <stop stopColor="#183757" />
            <stop offset="1" stopColor="#091322" />
          </radialGradient>
        </defs>
        <rect width="320" height="270" rx="8" fill={`url(#${id})`} />
        {[30, 60, 90, 120].map((r) => (
          <circle
            key={r}
            cx="160"
            cy="135"
            r={r}
            fill="none"
            stroke="#365477"
            strokeDasharray="4 5"
          />
        ))}
        <path d="M15 135H305M160 10V260" stroke="#365477" />
        {telemetry.lidar.ranges.map((r, i) => (
          <circle
            key={i}
            cx={
              160 +
              Math.cos((i * Math.PI * 2) / telemetry.lidar.ranges.length) *
                r *
                26
            }
            cy={
              135 +
              Math.sin((i * Math.PI * 2) / telemetry.lidar.ranges.length) *
                r *
                26
            }
            r="1.6"
            fill="#00dcec"
          />
        ))}
        <path d="m160 125 8 17-8-4-8 4Z" fill="#2994ff" />
        {[-4, -2, 0, 2, 4].map((n, i) => (
          <text key={n} x={45 + i * 57} y="260" fill="#92a8c4" fontSize="10">
            {n} m
          </text>
        ))}
      </svg>
    </div>
  );
}
