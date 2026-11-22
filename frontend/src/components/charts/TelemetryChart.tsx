import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRobot } from "../../contexts/RobotContext";
import type { ChartSample } from "../../types/robot";
import { Empty } from "../common/UI";
const colors = [
  "#1769e0",
  "#00bac9",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
];
export function TelemetryChart({
  series,
  unit,
  seconds = 10,
  height = 185,
}: {
  series: { key: keyof ChartSample; label: string; dashed?: boolean }[];
  unit: string;
  seconds?: number;
  height?: number;
}) {
  const { history, connection } = useRobot();
  const points = history.slice(-Math.ceil(seconds * 2));
  if (!points.length)
    return (
      <Empty
        title={
          connection === "CONNECTING" ? "Connecting…" : "Telemetry unavailable"
        }
        loading={connection === "CONNECTING"}
      />
    );
  return (
    <div
      style={{ height }}
      className="telemetry-chart"
      role="img"
      aria-label={`${series.map((s) => s.label).join(", ")} in ${unit}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={points}
          margin={{ top: 8, right: 40, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            minTickGap={70}
            tick={{ fontSize: "var(--font-caption)", fill: "var(--muted)" }}
          />
          <YAxis
            width={64}
            tick={{ fontSize: "var(--font-caption)", fill: "var(--muted)" }}
            label={{
              value: unit,
              angle: -90,
              position: "insideLeft",
              fill: "var(--muted)",
              fontSize: "var(--font-caption)",
            }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text)",
            }}
            formatter={(v: number) => v.toFixed(3)}
          />
          <Legend wrapperStyle={{ fontSize: "var(--font-label)", lineHeight: 1.5 }} />
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={colors[i % colors.length]}
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={false}
              strokeDasharray={s.dashed ? "5 4" : undefined}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
