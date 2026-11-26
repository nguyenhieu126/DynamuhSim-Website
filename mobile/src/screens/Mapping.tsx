import React, { useState } from "react";
import { View } from "react-native";
import { Screen } from "../components/common/AppShell";
import {
  Action,
  Badge,
  Field,
  KeyValue,
  Label,
  Row,
  SectionCard,
  Segments,
  styles,
} from "../components/common/UI";
import { MapPanel } from "../components/mapping/MapPanel";
import { useRobot } from "../contexts/RobotContext";
export default function Mapping() {
  const { setNotice } = useRobot();
  const [layer, setLayer] = useState("2D Map");
  const [goal, setGoal] = useState(false);
  const [x, setX] = useState("7.50"),
    [y, setY] = useState("4.20"),
    [yaw, setYaw] = useState("0.0");
  const [saved, setSaved] = useState<null | {
    x: string;
    y: string;
    yaw: string;
  }>(null);
  const preview = () => {
    if ([x, y, yaw].some((v) => !v.trim() || !Number.isFinite(Number(v)))) {
      setNotice("Enter finite X, Y and yaw values.");
      return;
    }
    setGoal(true);
    setNotice(
      `DEMO goal preview: (${x}, ${y}), yaw ${yaw}°. No navigation command sent.`,
    );
  };
  return (
    <Screen
      title="Mapping & Navigation"
      subtitle="ROS 2 Nav2 stack · Occupancy Grid"
    >
      <Row style={{ justifyContent: "space-between" }}>
        <Badge tone="cyan">2D SLAM · DEMO</Badge>
        <Badge tone="muted">Nav2 Offline</Badge>
      </Row>
      <Segments
        options={["2D Map", "LiDAR View"]}
        value={layer}
        onChange={setLayer}
      />
      <MapPanel controls goal={goal} lidar={layer === "LiDAR View"} />
      <SectionCard
        title="Robot Pose (map frame)"
        icon="compass-outline"
        aside={<Badge>Simulated SLAM</Badge>}
      >
        <Row style={{ justifyContent: "space-around" }}>
          {[
            ["X (m)", "2.416"],
            ["Y (m)", "1.983"],
            ["Yaw (°)", "27.6"],
          ].map(([label, value]) => (
            <View key={label}>
              <Label muted size={12}>
                {label}
              </Label>
              <Label mono bold>
                {value}
              </Label>
            </View>
          ))}
        </Row>
      </SectionCard>
      <SectionCard title="Navigation Status" icon="navigate-outline">
        <KeyValue
          label="Status"
          value={goal ? "Preview only" : "Idle / unavailable"}
        />
        <Label size={13}>
          {goal ? "DEMO goal selected" : "Goal not requested"}
        </Label>
        <Label muted size={12}>
          Path planner · unavailable{"\n"}Nav2 execution · unavailable{"\n"}Goal
          reached · not confirmed
        </Label>
        <Label bold style={{ marginTop: 20, marginBottom: 12 }}>
          Goal Specification (NavigateToPose)
        </Label>
        <View style={styles.grid}>
          {[
            ["Target X", x, setX],
            ["Target Y", y, setY],
            ["Yaw (°)", yaw, setYaw],
          ].map(([label, value, set]) => (
            <View key={label as string} style={{ flex: 1, minWidth: 70 }}>
              <Field
                label={label as string}
                value={value as string}
                onChangeText={set as (v: string) => void}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          ))}
        </View>
        <Row>
          <Action onPress={preview} icon="play-outline" style={{ flex: 1 }}>
            Preview Goal
          </Action>
          <Action onPress={() => setGoal(false)} style={{ flex: 1 }}>
            Cancel Goal
          </Action>
        </Row>
        <Label muted size={12} style={{ marginTop: 12 }}>
          Local preview only. Hardware connection and Nav2 action servers are
          unavailable. The path shows sample waypoints, not a planned route.
        </Label>
      </SectionCard>
      <SectionCard title="Map Management" icon="layers-outline">
        <KeyValue label="Demo map" value="384 × 384 @ 0.05 m" />
        <Row>
          <Action
            icon="save-outline"
            onPress={() => {
              setSaved({ x, y, yaw });
              setNotice(
                "Demo goal saved in this session. No ROS map exported.",
              );
            }}
            style={{ flex: 1 }}
          >
            Save Map
          </Action>
          <Action
            icon="folder-open-outline"
            onPress={() => {
              if (saved) {
                setX(saved.x);
                setY(saved.y);
                setYaw(saved.yaw);
                setGoal(true);
              }
              setNotice(
                saved
                  ? "Session demo goal loaded."
                  : "No session demo goal has been saved.",
              );
            }}
            style={{ flex: 1 }}
          >
            Load Map
          </Action>
        </Row>
        <Label muted size={12} style={{ marginTop: 12 }}>
          ROS 2 map export (.yaml / .pgm) requires a future physical bridge.
        </Label>
      </SectionCard>
    </Screen>
  );
}
