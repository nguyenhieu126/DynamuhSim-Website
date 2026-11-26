import React, { useState } from "react";
import { Share, Switch, View } from "react-native";
import Slider from "@react-native-community/slider";
import { Screen } from "../components/common/AppShell";
import {
  Action,
  Badge,
  Field,
  FilterChips,
  KeyValue,
  Label,
  Row,
  Segments,
  SettingsSection,
} from "../components/common/UI";
import { SensorStatusCard } from "../components/robot/Telemetry";
import { useTheme, type ThemeChoice } from "../contexts/ThemeContext";
import { useRobot } from "../contexts/RobotContext";
import { defaultSettings, type LocalSettings } from "../data/demo";
const numericKeys = [
  "maxSpeed",
  "maxAcceleration",
  "wheelRadius",
  "robotLength",
  "robotWidth",
  "commandTimeout",
  "watchdogTimeout",
] as const;
type NumericKey = (typeof numericKeys)[number];
const strings = (v: LocalSettings) =>
  Object.fromEntries(numericKeys.map((k) => [k, String(v[k])])) as Record<
    NumericKey,
    string
  >;
export default function Settings() {
  const { settings } = useRobot();
  return <SettingsForm key={JSON.stringify(settings)} />;
}
function SettingsForm() {
  const { theme, setTheme, colors } = useTheme();
  const { settings, saveSettings, setNotice, control, dispatch } = useRobot();
  const [draft, setDraft] = useState(settings),
    [values, setValues] = useState(strings(settings)),
    [section, setSection] = useState("All");
  const show = (name: string) => section === "All" || section === name;
  const resetDraft = (v: LocalSettings) => {
    setDraft(v);
    setValues(strings(v));
  };
  const save = async () => {
    const merged = {
      ...draft,
      ...Object.fromEntries(
        numericKeys.map((k) => [k, values[k].trim() ? Number(values[k]) : NaN]),
      ),
    } as LocalSettings;
    await saveSettings(merged);
  };
  const number = (key: NumericKey, label: string, unit: string) => (
    <Field
      key={key}
      label={`${label} (${unit})`}
      keyboardType="decimal-pad"
      value={values[key]}
      onChangeText={(v) => setValues({ ...values, [key]: v })}
    />
  );
  const toggle = (key: "tracking" | "prediction", label: string) => (
    <Row style={{ justifyContent: "space-between", minHeight: 48 }}>
      <Label style={{ flex: 1 }}>{label}</Label>
      <Switch
        accessibilityLabel={label}
        value={draft[key]}
        onValueChange={(v) => setDraft({ ...draft, [key]: v })}
        trackColor={{ true: colors.primary, false: colors.border }}
      />
    </Row>
  );
  return (
    <Screen
      title="Settings"
      subtitle="Local mobile preferences · Hardware configuration unavailable"
    >
      <FilterChips
        options={[
          "All",
          "General",
          "Connections",
          "Motion",
          "Sensors",
          "AI Config",
          "Safety",
          "Advanced",
        ]}
        value={section}
        onChange={setSection}
      />
      {show("General") && (
        <SettingsSection title="General Settings" icon="settings-outline">
          <Label muted size={12} style={{ marginBottom: 12 }}>
            Basic robot identifier and mobile application appearance
          </Label>
          <Field
            label="Robot Name"
            value={draft.robotName}
            maxLength={48}
            onChangeText={(v) => setDraft({ ...draft, robotName: v })}
          />
          <Label size={12}>Language preference (translation pending)</Label>
          <Segments
            options={["English", "Vietnamese"]}
            value={draft.language}
            onChange={(v) => setDraft({ ...draft, language: v })}
          />
          <Label size={12} style={{ marginTop: 12 }}>
            Theme
          </Label>
          <Segments
            options={["Light", "Dark", "System"]}
            value={theme[0].toUpperCase() + theme.slice(1)}
            onChange={(v) => setTheme(v.toLowerCase() as ThemeChoice)}
          />
          <Label muted size={11} style={{ marginTop: 8 }}>
            Theme applies immediately and is saved on this device.
          </Label>
        </SettingsSection>
      )}
      {show("Connections") && (
        <SettingsSection
          title="Backend Connection (FastAPI)"
          icon="link-outline"
        >
          <Field
            label="Backend Base URL"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="Enter your robot bridge URL"
            value={draft.backendUrl}
            onChangeText={(v) => setDraft({ ...draft, backendUrl: v })}
          />
          <Label muted size={11}>
            Use a device-accessible network URL. No connection is made in this
            UI phase.
          </Label>
          <KeyValue label="API status" value="Not connected" />
          <KeyValue label="WebSocket" value="Not started" />
          <Label size={12}>Data source</Label>
          <Segments
            options={["Demo", "Live ROS 2"]}
            value={control.source === "demo" ? "Demo" : "Live ROS 2"}
            onChange={(v) =>
              dispatch({
                type: "source",
                source: v === "Demo" ? "demo" : "live",
              })
            }
          />
          <Row style={{ marginTop: 10 }}>
            <Action
              onPress={() =>
                setNotice(
                  "Connection testing is not implemented in this UI phase. No network request was made.",
                )
              }
              style={{ flex: 1 }}
            >
              Test Connection
            </Action>
            <Action onPress={save} tone="primary" style={{ flex: 1 }}>
              Save Config
            </Action>
          </Row>
          <Label bold size={12} style={{ marginTop: 16 }}>
            Hardware Nodes & ROS 2 Bridge
          </Label>
          {[
            "Jetson Orin Nano",
            "ESP32-S3 (USB Serial)",
            "ROS 2 (Jazzy Jalisco)",
            "micro-ROS Agent",
          ].map((name) => (
            <SensorStatusCard key={name} name={name} />
          ))}
        </SettingsSection>
      )}
      {show("Motion") && (
        <SettingsSection
          title="Motion & Velocity Limits"
          icon="speedometer-outline"
          aside={<Badge>Local preview</Badge>}
        >
          {number("maxSpeed", "Maximum speed", "m/s")}
          {number("maxAcceleration", "Max acceleration", "m/s²")}
          <Label bold size={13} style={{ marginBottom: 12 }}>
            Mecanum Wheel Parameters
          </Label>
          {number("wheelRadius", "Wheel radius (r)", "m")}
          {number("robotLength", "Robot length (L)", "m")}
          {number("robotWidth", "Robot width (W)", "m")}
          <Label muted size={11}>
            Preview only. No motor configuration is transmitted.
          </Label>
        </SettingsSection>
      )}
      {show("Sensors") && (
        <SettingsSection
          title="Sensors Calibration Status"
          icon="radio-outline"
        >
          {[
            "LiDAR 2D",
            "Depth Camera",
            "IMU (ICM-20948)",
            "Wheel Encoders",
          ].map((name) => (
            <Row
              key={name}
              style={{ justifyContent: "space-between", marginBottom: 12 }}
            >
              <View style={{ flex: 1 }}>
                <Label size={12}>{name}</Label>
                <Label size={11} color={colors.amber}>
                  Unverified
                </Label>
              </View>
              <Action disabled>Calibrate</Action>
            </Row>
          ))}
          <Label muted size={11}>
            Calibration is unavailable until authenticated hardware integration
            is implemented.
          </Label>
        </SettingsSection>
      )}
      {show("AI Config") && (
        <SettingsSection title="AI Vision Configuration" icon="eye-outline">
          <Label size={12}>AI Model Pipeline</Label>
          {["YOLOv8 (Human Detection)", "MobileNet-SSD", "Faster R-CNN"].map(
            (v) => (
              <Action
                key={v}
                tone={draft.aiModel === v ? "primary" : "neutral"}
                onPress={() => setDraft({ ...draft, aiModel: v })}
                style={{ marginTop: 6 }}
              >
                {v}
              </Action>
            ),
          )}
          <KeyValue
            label="Confidence Threshold"
            value={draft.confidence.toFixed(2)}
          />
          <Slider
            accessibilityLabel="Confidence threshold"
            minimumValue={0.1}
            maximumValue={1}
            step={0.05}
            value={draft.confidence}
            onValueChange={(v) => setDraft({ ...draft, confidence: v })}
            minimumTrackTintColor={colors.primary}
            thumbTintColor={colors.cyan}
            style={{ height: 48 }}
          />
          {toggle("tracking", "Person Tracking")}
          {toggle("prediction", "Motion Prediction (Kalman)")}
          <Badge>Configuration preview · inference offline</Badge>
        </SettingsSection>
      )}
      {show("Safety") && (
        <SettingsSection
          title="Safety & Watchdog Limits"
          icon="shield-checkmark-outline"
        >
          <Label color={colors.amber} size={12} style={{ marginBottom: 12 }}>
            Hardware watchdog integration is pending. Physical STOP
            acknowledgment is unavailable.
          </Label>
          {number("commandTimeout", "Command timeout preview", "s")}
          {number("watchdogTimeout", "Watchdog timeout preview", "s")}
          <Row style={{ justifyContent: "space-between" }}>
            <Label size={12}>Auto Stop on Signal Loss</Label>
            <Switch
              value
              disabled
              accessibilityLabel="Auto Stop on Signal Loss, always enabled"
            />
          </Row>
          <KeyValue label="UI watchdog" value="0.5 s · demo" />
          <KeyValue label="Hardware watchdog" value="Unverified" />
          <Label muted size={11}>
            Numeric safety fields are stored as preview preferences. The UI
            keeps its fixed 0.5 s local watchdog.
          </Label>
        </SettingsSection>
      )}
      {show("Advanced") && (
        <SettingsSection
          title="Advanced & System Diagnostics"
          icon="code-slash-outline"
        >
          <KeyValue label="App version" value="1.0.0 · UI preview" />
          <KeyValue label="FastAPI bridge" value="Not connected" />
          <KeyValue label="Storage" value="On-device preferences" />
          <Row style={{ flexWrap: "wrap" }}>
            <Action
              tone="danger"
              onPress={() => {
                resetDraft(defaultSettings);
                setNotice(
                  "Defaults loaded into the form. Save Changes to store them.",
                );
              }}
            >
              Clear Demo Cache
            </Action>
            <Action
              onPress={() =>
                void Share.share({
                  message: JSON.stringify(
                    {
                      app: "PBL6 Mobile",
                      version: "1.0.0",
                      source: control.source,
                      state: control.state,
                      hardwareConnected: false,
                      controlVerified: false,
                    },
                    null,
                    2,
                  ),
                }).catch(() =>
                  setNotice("Sharing is unavailable on this device."),
                )
              }
            >
              Export Diagnostics
            </Action>
          </Row>
        </SettingsSection>
      )}
      <Row style={{ flexWrap: "wrap" }}>
        <Action onPress={() => resetDraft(defaultSettings)} style={{ flex: 1 }}>
          Reset
        </Action>
        <Action
          onPress={() => {
            resetDraft(settings);
            setNotice("Unsaved form edits cancelled. Theme remains applied.");
          }}
          style={{ flex: 1 }}
        >
          Cancel
        </Action>
        <Action
          testID="save-settings"
          tone="primary"
          onPress={save}
          style={{ flexGrow: 2 }}
        >
          Save Changes
        </Action>
      </Row>
    </Screen>
  );
}
