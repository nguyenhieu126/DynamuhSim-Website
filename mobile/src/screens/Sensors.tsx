import React, { useState } from "react";
import { View } from "react-native";
import { Screen } from "../components/common/AppShell";
import {
  Badge,
  FilterChips,
  KeyValue,
  Label,
  SectionCard,
  Segments,
  StatCard,
  styles,
} from "../components/common/UI";
import { TelemetryChart } from "../components/charts/TelemetryChart";
import {
  TelemetryCard,
  WheelCards,
  SensorStatusCard,
} from "../components/robot/Telemetry";
import { CameraPanel } from "../components/camera/CameraPanel";
import { useRobot } from "../contexts/RobotContext";
export default function Sensors() {
  const [range, setRange] = useState("10s"),
    [filter, setFilter] = useState("All");
  const { control } = useRobot();
  const show = (name: string) => filter === "All" || filter === name;
  return (
    <Screen
      title="Sensors & Telemetry"
      subtitle="Simulated sensor data, robot state & system telemetry"
    >
      <Segments
        label="Chart time range"
        options={["10s", "1m", "5m", "15m", "1h"]}
        value={range}
        onChange={setRange}
      />
      <FilterChips
        options={["All", "IMU", "LiDAR", "Encoders", "RGB-D Camera", "Health"]}
        value={filter}
        onChange={setFilter}
      />
      <View style={styles.grid}>
        <StatCard
          label="Battery & Power"
          value="24.1 V"
          detail="78% · 52.0 °C · SIM · I: N/A"
          icon="flash-outline"
        />
        <StatCard
          label="Robot State"
          value={control.state}
          detail={`Linear v: ${control.velocity.vx.toFixed(2)} m/s · SIM`}
        />
      </View>
      {show("IMU") && (
        <>
          <SectionCard title="IMU – Acceleration (m/s²)" icon="pulse-outline">
            <KeyValue label="ax / ay / az" value="0.05 / -0.10 / 9.83" />
            <TelemetryChart range={range} />
          </SectionCard>
          <SectionCard
            title="IMU – Angular Velocity (rad/s)"
            icon="compass-outline"
          >
            <TelemetryChart angular range={range} />
          </SectionCard>
        </>
      )}
      {show("LiDAR") && <TelemetryCard />}
      {show("RGB-D Camera") && <CameraPanel />}
      {show("Encoders") && (
        <SectionCard
          title="Wheel Encoders – RPM"
          icon="sync-outline"
          aside={<Badge>SIM</Badge>}
        >
          <WheelCards />
          <KeyValue
            label="Command vx / vy / ω"
            value={`${control.velocity.vx.toFixed(2)} / ${control.velocity.vy.toFixed(2)} / ${control.velocity.wz.toFixed(2)}`}
          />
          <Label muted size={11}>
            Local command vs simulated feedback. Not hardware measurements.
          </Label>
        </SectionCard>
      )}
      {show("Health") && (
        <SectionCard
          title="ROS 2 Nodes & Hardware"
          icon="hardware-chip-outline"
        >
          {[
            "/slam_toolbox",
            "/nav2_controller",
            "/micro_ros_agent",
            "Jetson Orin Nano",
            "ESP32-S3 Microcontroller",
          ].map((name) => (
            <SensorStatusCard key={name} name={name} />
          ))}
          <KeyValue label="Hardware temperature" value="N/A" />
          <KeyValue label="Physical camera FPS" value="N/A" />
        </SectionCard>
      )}
      <Label muted size={11}>
        DEMO fixtures · Physical E-stop required separately
      </Label>
    </Screen>
  );
}
