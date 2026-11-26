import React, { useState } from "react";
import { View } from "react-native";
import { Screen } from "../components/common/AppShell";
import {
  Action,
  Badge,
  KeyValue,
  Label,
  Row,
  SectionCard,
  StatCard,
  styles,
} from "../components/common/UI";
import { CameraPanel } from "../components/camera/CameraPanel";
import { DangerSectors } from "../components/mapping/MapPanel";
import { EventTimeline } from "../components/robot/EventTimeline";
import { tracks } from "../data/demo";
import { useTheme } from "../contexts/ThemeContext";
export default function AI() {
  const [id, setId] = useState(1);
  const target = tracks.find((t) => t.id === id)!;
  const { colors } = useTheme();
  return (
    <Screen
      title="AI Monitoring"
      subtitle="Human tracking, detection & motion prediction"
    >
      <Badge tone="muted">Inference Offline · DEMO fixture</Badge>
      <View style={styles.grid}>
        {[
          ["FPS", "30.1", "Simulated loop"],
          ["Targets", "3", "2 people · 1 object"],
          ["Risk index", "0.78", "High · proximity alert"],
          ["Confidence", "92%", "Demo model mean"],
          ["Latency", "32 ms", "Illustrative estimate"],
          ["State", "DEMO", "No ROS link"],
        ].map(([label, value, detail]) => (
          <StatCard
            compact
            key={label}
            label={label}
            value={value}
            detail={detail}
          />
        ))}
      </View>
      <CameraPanel detection initialMode="RGB" onTrack={setId} />
      <SectionCard
        title={`Detection Details: ID #${id}`}
        icon="person-circle-outline"
      >
        <Row>
          {tracks.map((t) => (
            <Action
              key={t.id}
              tone={id === t.id ? "primary" : "neutral"}
              onPress={() => setId(t.id)}
              style={{ flex: 1 }}
            >
              {"#" + t.id}
            </Action>
          ))}
        </Row>
        <KeyValue label="Target class" value={target.label} />
        <KeyValue label="Distance" value={`${target.distance.toFixed(2)} m`} />
        <KeyValue
          label="Velocity"
          value={`${target.velocity.toFixed(2)} m/s`}
        />
        <KeyValue
          label="Confidence"
          value={`${(target.confidence * 100).toFixed(0)}%`}
        />
        <KeyValue
          label="Collision status"
          value={`${target.risk.toUpperCase()} RISK · SIM`}
          color={target.risk === "High" ? colors.red : colors.cyan}
        />
        <KeyValue
          label="Prediction"
          value={
            target.velocity ? "Illustrative inward path" : "Stationary fixture"
          }
        />
      </SectionCard>
      <DangerSectors />
      <SectionCard
        title="Tracked Targets (3)"
        icon="list-outline"
        aside={<Badge>Mock</Badge>}
      >
        {tracks.map((t) => (
          <Action
            key={t.id}
            onPress={() => setId(t.id)}
            style={{ marginBottom: 8, justifyContent: "space-between" }}
          >
            <View style={{ flex: 1 }}>
              <Label bold size={12}>
                #{t.id}
                {t.label}
              </Label>
              <Label muted size={11}>
                {t.distance.toFixed(2)} m · {t.velocity.toFixed(2)} m/s
              </Label>
            </View>
            <Badge
              tone={
                t.risk === "High" ? "red" : t.risk === "Low" ? "green" : "amber"
              }
            >
              {t.risk} risk
            </Badge>
          </Action>
        ))}
      </SectionCard>
      <EventTimeline filterable />
      <Label muted size={11}>
        Jetson Orin: Offline · ROS 2: Unavailable · ESP32: Unavailable
      </Label>
    </Screen>
  );
}
