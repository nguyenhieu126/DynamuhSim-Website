import React from "react";
import { router } from "expo-router";
import { Screen } from "../components/common/AppShell";
import {
  Action,
  Badge,
  FilterChips,
  Label,
  SectionCard,
} from "../components/common/UI";
import { useRobot } from "../contexts/RobotContext";
import type { RobotState } from "../types/robot";
export default function More() {
  const { control, dispatch } = useRobot();
  return (
    <Screen title="More" subtitle="PBL6 · Robot Control & Monitoring">
      <Action icon="pulse-outline" onPress={() => router.push("/sensors")}>
        Sensors & Telemetry
      </Action>
      <Action icon="settings-outline" onPress={() => router.push("/settings")}>
        Settings
      </Action>
      <SectionCard
        title="Demo State Simulator"
        aside={<Badge>UI preview</Badge>}
      >
        <Label muted size={12} style={{ marginBottom: 12 }}>
          Preview status and fault states locally. This never connects to
          hardware or grants physical control.
        </Label>
        <FilterChips
          options={[
            "DEMO",
            "OFFLINE",
            "CONNECTING",
            "STOPPED",
            "MANUAL",
            "AUTONOMOUS",
            "FAULT",
          ]}
          value={control.state}
          onChange={(v) => dispatch({ type: "state", state: v as RobotState })}
        />
      </SectionCard>
      <SectionCard title="About PBL6">
        <Label size={13}>Mecanum Robotics Console · v1.0.0</Label>
        <Label muted size={12}>
          React Native + Expo · DEMO UI{"\n"}Physical robot control is
          unavailable.
        </Label>
      </SectionCard>
    </Screen>
  );
}
