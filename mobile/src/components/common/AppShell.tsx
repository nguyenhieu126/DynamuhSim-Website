import React, { type PropsWithChildren } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { useRobot } from "../../contexts/RobotContext";
import {
  Action,
  Badge,
  Icon,
  Label,
  Row,
  RobotStatusBadge,
  type IconName,
} from "./UI";
export function StopButton() {
  const { stop } = useRobot();
  return (
    <Action
      testID="stop-button"
      accessibilityLabel="STOP simulated motion"
      tone="danger"
      onPress={stop}
      style={{
        backgroundColor: "#dc2626",
        borderColor: "#ef4444",
        paddingHorizontal: 12,
      }}
    >
      <Label color="#ffffff" bold>
        ■ STOP
      </Label>
    </Action>
  );
}
export function AppHeader() {
  const { colors } = useTheme();
  const { control, setNotice, settings } = useRobot();
  const path = usePathname();
  const heading = path.includes("control")
    ? "Manual Control"
    : path.includes("settings")
      ? "Settings"
      : "Robot " + settings.robotName.replace("PBL6-Robot01", "PBL6-01");
  return (
    <View
      style={[
        s.header,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      <Image
        source={require("../../../assets/pbl6-logo.png")}
        style={{ width: 36, height: 36 }}
        accessibilityLabel="Official PBL6 logo"
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Label bold size={15} numberOfLines={1}>
          {heading}
        </Label>
        <Label muted size={10} numberOfLines={1}>
          PBL6 · Mecanum robotics
        </Label>
      </View>
      <RobotStatusBadge state={control.state} />
      <StopButton />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Show recent alerts"
        onPress={() =>
          setNotice(
            "DEMO events: collision risk #1, tracked object #3, detected person #2. Hardware is unavailable.",
          )
        }
        style={{
          minWidth: 48,
          minHeight: 48,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="notifications-outline" color={colors.muted} size={21} />
      </Pressable>
    </View>
  );
}
export function DemoBanner() {
  const { colors } = useTheme();
  const { control, dispatch } = useRobot();
  return (
    <Row
      style={{
        backgroundColor: colors.demo,
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderColor: colors.purple + "40",
      }}
    >
      <View style={{ flex: 1 }}>
        <Label size={11} color={colors.purple}>
          <Label size={11} bold color={colors.purple}>
            {control.source === "demo" ? "DEMO MODE" : "LIVE UNAVAILABLE"}:{" "}
          </Label>
          {control.source === "demo"
            ? "Simulated telemetry. Hardware & ROS 2 offline."
            : "No API connection. Physical controls disabled."}
        </Label>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Switch data source"
        onPress={() =>
          dispatch({
            type: "source",
            source: control.source === "demo" ? "live" : "demo",
          })
        }
        style={{
          minHeight: 48,
          justifyContent: "center",
          paddingHorizontal: 7,
        }}
      >
        <Badge>{control.source === "demo" ? "Demo ▾" : "Live ▾"}</Badge>
      </Pressable>
    </Row>
  );
}
const nav: [string, string, IconName][] = [
  ["/", "Home", "grid-outline"],
  ["/control", "Control", "game-controller-outline"],
  ["/map", "Map", "map-outline"],
  ["/ai", "AI", "hardware-chip-outline"],
  ["/more", "More", "options-outline"],
];
export function BottomNavigation() {
  const { colors } = useTheme();
  const { revoke } = useRobot();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        s.nav,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {nav.map(([href, label, icon]) => {
        const active =
          path === href ||
          (href === "/more" && ["/sensors", "/settings"].includes(path));
        return (
          <Pressable
            key={href}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
            onPress={() => {
              revoke();
              if (path !== href) router.navigate(href as "/");
            }}
            style={s.tab}
          >
            <Icon
              name={icon}
              color={active ? colors.cyan : colors.muted}
              size={23}
            />
            <Label size={11} color={active ? colors.cyan : colors.muted}>
              {label}
            </Label>
          </Pressable>
        );
      })}
    </View>
  );
}
export function Screen({
  children,
  title,
  subtitle,
}: PropsWithChildren<{ title?: string; subtitle?: string }>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  return (
    <ScrollView
      testID="screen-scroll"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: width >= 600 ? 24 : 14,
        gap: 14,
        paddingBottom: 24,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {title && (
        <View>
          <Label bold size={22}>
            {title}
          </Label>
          {subtitle && (
            <Label muted size={13}>
              {subtitle}
            </Label>
          )}
        </View>
      )}
      {children}
    </ScrollView>
  );
}
export function Notice() {
  const { notice, setNotice } = useRobot();
  const { colors } = useTheme();
  if (!notice) return null;
  return (
    <Row
      style={{
        paddingHorizontal: 12,
        backgroundColor: colors.demo,
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Label
        accessibilityLiveRegion="polite"
        size={12}
        style={{ flex: 1, paddingVertical: 8 }}
      >
        {notice}
      </Label>
      <Action
        accessibilityLabel="Dismiss message"
        icon="close"
        onPress={() => setNotice("")}
      />
    </Row>
  );
}
const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  nav: { flexDirection: "row", paddingTop: 8, borderTopWidth: 1 },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
});
