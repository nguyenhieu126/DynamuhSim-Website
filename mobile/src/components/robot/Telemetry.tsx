import React from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Polyline, Polygon } from "react-native-svg";
import { useTheme } from "../../contexts/ThemeContext";
import { useRobot } from "../../contexts/RobotContext";
import {
  Action,
  Badge,
  KeyValue,
  Label,
  Row,
  SectionCard,
  styles,
} from "../common/UI";
import { TelemetryChart } from "../charts/TelemetryChart";
export function LidarPlot() {
  const { colors } = useTheme();
  const points = Array.from({ length: 60 }, (_, i) => {
    const a = (i * Math.PI) / 30,
      r = 51 + 6 * Math.sin(i * 0.4);
    return `${80 + Math.cos(a) * r},${80 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <Svg viewBox="0 0 160 160" width="100%" height={140}>
      {[25, 50, 70].map((r) => (
        <Circle
          key={r}
          cx={80}
          cy={80}
          r={r}
          fill="none"
          stroke={colors.border}
        />
      ))}
      <Line x1={0} x2={160} y1={80} y2={80} stroke={colors.border} />
      <Line x1={80} x2={80} y1={0} y2={160} stroke={colors.border} />
      <Polyline
        points={points}
        fill="none"
        stroke={colors.cyan}
        strokeDasharray="2 3"
        strokeWidth={2}
      />
      <Polygon points="80,72 75,84 85,84" fill={colors.cyan} />
    </Svg>
  );
}
export function TelemetryCard() {
  const { colors } = useTheme();
  return (
    <SectionCard title="LiDAR" icon="radio-outline" aside={<Badge>SIM</Badge>}>
      <Row>
        <View style={{ flex: 1 }}>
          <KeyValue label="Scan rate" value="10.0 Hz" />
          <KeyValue label="Points / scan" value="180" />
          <KeyValue
            label="Nearest obstacle"
            value="0.68 m"
            color={colors.cyan}
          />
        </View>
        <View style={{ width: "42%" }}>
          <LidarPlot />
        </View>
      </Row>
    </SectionCard>
  );
}
export function SensorStatusCard({
  name,
  status = "Unavailable",
}: {
  name: string;
  status?: string;
}) {
  return (
    <Row
      style={{
        justifyContent: "space-between",
        paddingVertical: 9,
        flexWrap: "wrap",
      }}
    >
      <Label size={12}>{name}</Label>
      <Badge tone="muted">{status}</Badge>
    </Row>
  );
}
export function WheelCards() {
  const { control } = useRobot();
  const { vx, vy, wz } = control.velocity;
  return (
    <Row style={{ gap: 6 }}>
      {["FL", "FR", "RL", "RR"].map((wheel, i) => {
        const rpm = (vx + (i % 2 ? vy : -vy) + (i % 2 ? wz : -wz) * 0.1) * 100;
        return (
          <View key={wheel} style={{ flex: 1, minWidth: 0 }}>
            <SectionCard style={{ padding: 8 }}>
              <Label size={11} muted mono>
                {wheel}
              </Label>
              <Label mono bold size={13}>
                {rpm.toFixed(1)}
              </Label>
              <Label mono size={9} muted>
                rpm · SIM
              </Label>
            </SectionCard>
          </View>
        );
      })}
    </Row>
  );
}
export function SensorSummary({ onDetails }: { onDetails: () => void }) {
  return (
    <SectionCard
      title="Sensors & Telemetry"
      icon="pulse-outline"
      aside={<Action onPress={onDetails}>Details ↗</Action>}
    >
      <View style={styles.stack}>
        <TelemetryCard />
        <SectionCard title="IMU · ICM-20948" icon="compass-outline">
          <KeyValue label="Yaw" value="27.6°" />
          <KeyValue label="Acceleration (m/s²)" value="0.05 / -0.10 / 9.83" />
          <TelemetryChart />
        </SectionCard>
        <SectionCard title="Encoder · 4 wheels" icon="sync-outline">
          <WheelCards />
        </SectionCard>
      </View>
    </SectionCard>
  );
}
