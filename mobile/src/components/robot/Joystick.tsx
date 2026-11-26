import React, { useRef, useMemo } from "react";
import { PanResponder, View } from "react-native";
import { useRobot } from "../../contexts/RobotContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Action, Icon, Label, Row } from "../common/UI";
import type { RobotVelocity } from "../../types/robot";
export function Joystick() {
  const { control, move, release } = useRobot();
  const { colors } = useTheme();
  const offset = {
    x: (-control.velocity.vy / (0.5 * control.speed)) * 40,
    y: (-control.velocity.vx / (0.5 * control.speed)) * 40,
  };
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => control.enabled,
        onMoveShouldSetPanResponder: () => control.enabled,
        onPanResponderGrant: release,
        onPanResponderMove: (_, g) => {
          const x = Math.max(-40, Math.min(40, g.dx));
          const y = Math.max(-40, Math.min(40, g.dy));
          move({ vx: -y / 40, vy: -x / 40, wz: 0 });
        },
        onPanResponderRelease: release,
        onPanResponderTerminate: release,
        onPanResponderTerminationRequest: () => true,
      }),
    [control.enabled, move, release],
  );
  const hold = useRef<ReturnType<typeof setInterval> | null>(null);
  const end = () => {
    if (hold.current) clearInterval(hold.current);
    hold.current = null;
    release();
  };
  React.useEffect(() => {
    if (!control.enabled) {
      if (hold.current) clearInterval(hold.current);
    }
    return () => {
      if (hold.current) clearInterval(hold.current);
    };
  }, [control.enabled]);
  const direction = (
    label: string,
    icon: Parameters<typeof Icon>[0]["name"],
    v: RobotVelocity,
  ) => (
    <Action
      key={label}
      accessibilityLabel={label}
      disabled={!control.enabled}
      icon={icon}
      style={{ flex: 1, paddingHorizontal: 5 }}
      onPressIn={() => {
        end();
        move(v);
        hold.current = setInterval(() => move(v), 100);
      }}
      onPressOut={end}
    >
      {label}
    </Action>
  );
  return (
    <View style={{ gap: 10 }}>
      <Row>{direction("Forward", "arrow-up", { vx: 1, vy: 0, wz: 0 })}</Row>
      <Row>
        {direction("Left", "arrow-back", { vx: 0, vy: 1, wz: 0 })}
        <View
          {...responder.panHandlers}
          accessibilityLabel="Demo joystick, drag to move and release to stop"
          testID="joystick"
          style={{
            width: 104,
            height: 104,
            borderRadius: 52,
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: control.enabled ? colors.cyan : colors.border,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.inset,
          }}
        >
          <View
            style={{
              transform: [
                { translateX: control.enabled ? offset.x : 0 },
                { translateY: control.enabled ? offset.y : 0 },
              ],
              alignItems: "center",
            }}
          >
            <Icon name="game-controller" size={30} />
            <Label mono muted size={9}>
              DEMO
            </Label>
          </View>
        </View>
        {direction("Right", "arrow-forward", { vx: 0, vy: -1, wz: 0 })}
      </Row>
      <Row>{direction("Backward", "arrow-down", { vx: -1, vy: 0, wz: 0 })}</Row>
      <Row>
        {direction("Rotate L", "return-up-back", { vx: 0, vy: 0, wz: 1 })}
        {direction("Rotate R", "return-up-forward", { vx: 0, vy: 0, wz: -1 })}
      </Row>
      <Label size={11} muted style={{ textAlign: "center" }}>
        Touch & hold or drag. Release to stop locally.
      </Label>
    </View>
  );
}
