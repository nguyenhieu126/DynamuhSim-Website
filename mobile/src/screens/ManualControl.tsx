import React from "react";
import { View } from "react-native";
import Slider from "@react-native-community/slider";
import { Screen, StopButton } from "../components/common/AppShell";
import {
  Action,
  Badge,
  ConnectionErrorState,
  KeyValue,
  Label,
  Row,
  SectionCard,
  Segments,
} from "../components/common/UI";
import { CameraPanel } from "../components/camera/CameraPanel";
import { WheelCards } from "../components/robot/Telemetry";
import { Joystick } from "../components/robot/Joystick";
import { useRobot } from "../contexts/RobotContext";
import { useTheme } from "../contexts/ThemeContext";
import { useDeadman } from "../hooks/useDeadman";
export default function ManualControl() {
  const { control, dispatch } = useRobot();
  const { colors } = useTheme();
  useDeadman();
  return (
    <Screen>
      <Segments
        label="Control ownership"
        options={["Manual", "Auto"]}
        value={control.state === "AUTONOMOUS" ? "Auto" : "Manual"}
        onChange={(v) =>
          dispatch({
            type: "state",
            state: v === "Auto" ? "AUTONOMOUS" : "STOPPED",
          })
        }
      />
      <SectionCard>
        <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Label mono size={12}>
            Batt: {control.source === "demo" ? "78%" : "N/A"}
          </Label>
          <Label mono size={12} color={colors.cyan}>
            Vel:{" "}
            {Math.hypot(control.velocity.vx, control.velocity.vy).toFixed(2)}{" "}
            m/s
          </Label>
          <Badge>{control.state}</Badge>
        </Row>
      </SectionCard>
      {control.source === "live" && <ConnectionErrorState />}
      <CameraPanel initialMode="RGB" />
      <SectionCard
        title="Drive Control"
        icon="game-controller-outline"
        aside={<Badge>Preview only</Badge>}
      >
        <View style={{ gap: 16 }}>
          <Action
            testID="enable-control"
            tone="primary"
            icon="lock-open-outline"
            disabled={
              control.source !== "demo" ||
              !["DEMO", "STOPPED", "MANUAL"].includes(control.state)
            }
            onPress={() => dispatch({ type: "enable" })}
          >
            {control.enabled ? "Demo control enabled" : "Enable demo control"}
          </Action>
          <Joystick />
          <SectionCard
            title="Speed Control"
            icon="speedometer-outline"
            aside={
              <Label mono color={colors.cyan}>
                {Math.round(control.speed * 100)}%
              </Label>
            }
          >
            <Slider
              accessibilityLabel="Demo speed"
              minimumValue={0.25}
              maximumValue={1}
              step={0.05}
              value={control.speed}
              onValueChange={(speed) => dispatch({ type: "speed", speed })}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.cyan}
              style={{ height: 48 }}
            />
            <Row style={{ flexWrap: "wrap" }}>
              {[0.25, 0.5, 0.6, 0.75, 1].map((v) => (
                <Action
                  key={v}
                  style={{ flexGrow: 1 }}
                  onPress={() => dispatch({ type: "speed", speed: v })}
                >
                  {Math.round(v * 100) + "%"}
                </Action>
              ))}
            </Row>
            <KeyValue
              label="Target speed limit"
              value={`${(0.5 * control.speed).toFixed(2)} m/s · SIM`}
            />
          </SectionCard>
        </View>
      </SectionCard>
      <SectionCard title="Current Velocity & Motors" icon="pulse-outline">
        {(["vx", "vy", "wz"] as const).map((k) => (
          <KeyValue
            key={k}
            label={k === "wz" ? "ω (yaw)" : k}
            value={`${control.velocity[k].toFixed(2)} ${k === "wz" ? "rad/s" : "m/s"} · SIM`}
          />
        ))}
        <Label size={12} bold style={{ marginVertical: 12 }}>
          Motor / Wheel Feedback
        </Label>
        <WheelCards />
        <KeyValue label="IMU yaw" value="27.6° · SIM" />
        <KeyValue label="LiDAR" value="10.0 Hz · SIM" />
      </SectionCard>
      <SectionCard
        title="Safety & Watchdog Status"
        icon="shield-checkmark-outline"
      >
        <Label size={12} muted>
          Demo watchdog: 0.5 s without fresh commands. Stops locally on release,
          gesture cancellation, route change, backgrounding or ownership loss.
        </Label>
        <Label size={12} color={colors.amber} style={{ marginVertical: 12 }}>
          Physical control and hardware watchdog are unverified. A physical
          E-stop is a separate requirement.
        </Label>
        <StopButton />
      </SectionCard>
    </Screen>
  );
}
