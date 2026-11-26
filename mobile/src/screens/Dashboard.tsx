import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../components/common/AppShell";
import {
  Action,
  ConnectionErrorState,
  KeyValue,
  Label,
  SectionCard,
  StatCard,
  styles,
} from "../components/common/UI";
import { CameraPanel } from "../components/camera/CameraPanel";
import { MapPanel } from "../components/mapping/MapPanel";
import { SensorSummary, SensorStatusCard } from "../components/robot/Telemetry";
import { EventTimeline } from "../components/robot/EventTimeline";
import { useRobot } from "../contexts/RobotContext";
import { useTheme } from "../contexts/ThemeContext";
export default function Dashboard() {
  const { control } = useRobot();
  const { colors } = useTheme();
  const speed = Math.hypot(control.velocity.vx, control.velocity.vy);
  return (
    <Screen>
      {control.source === "live" ? (
        <ConnectionErrorState />
      ) : (
        <>
          <View style={styles.grid}>
            <StatCard
              label="Robot Status"
              value={control.state}
              icon="wifi"
              color={colors.purple}
              detail="Local simulation · hardware unavailable"
            />
            <StatCard
              label="Battery"
              value="78%"
              icon="battery-half"
              detail="24.1 V · simulated"
            />
            <StatCard
              label="Speed"
              value={`${speed.toFixed(2)} m/s`}
              icon="speedometer-outline"
              detail={`Angular: ${control.velocity.wz.toFixed(2)} rad/s`}
            />
            <StatCard
              label="Operating Mode"
              value={speed ? "Moving" : "Stopped"}
              icon="layers-outline"
              detail="DEMO · no physical commands"
            />
          </View>
          <CameraPanel />
          <SectionCard
            title="SLAM Map (2D)"
            icon="map-outline"
            aside={
              <Action onPress={() => router.push("/map")}>Open map ↗</Action>
            }
          >
            <MapPanel />
            <KeyValue label="Pose (map)" value="x: 2.42 · y: 1.98 · θ: 27.6°" />
          </SectionCard>
          <SensorSummary onDetails={() => router.push("/sensors")} />
          <EventTimeline />
        </>
      )}
      <SectionCard>
        <SensorStatusCard name="Jetson Orin Nano" />
        <SensorStatusCard name="ESP32-S3" />
        <SensorStatusCard name="ROS 2 Jazzy" />
        <Label muted size={10}>
          PBL6 · Mecanum Robotics Console · DEMO session
        </Label>
      </SectionCard>
    </Screen>
  );
}
