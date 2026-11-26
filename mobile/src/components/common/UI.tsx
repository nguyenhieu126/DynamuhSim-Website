import React, { type PropsWithChildren, type ComponentProps } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  type TextStyle,
  type StyleProp,
  type ViewStyle,
  type TextInputProps,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../contexts/ThemeContext";
import { fonts, type as sizes } from "../../theme/tokens";
export type IconName = ComponentProps<typeof Ionicons>["name"];
export function Icon({
  name,
  size = 20,
  color,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const { colors } = useTheme();
  return <Ionicons name={name} size={size} color={color ?? colors.cyan} />;
}
export function Label({
  children,
  muted = false,
  mono = false,
  bold = false,
  size = sizes.body,
  color,
  style,
  ...props
}: PropsWithChildren<{
  muted?: boolean;
  mono?: boolean;
  bold?: boolean;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}> &
  ComponentProps<typeof Text>) {
  const { colors } = useTheme();
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: mono
            ? bold
              ? fonts.numeric
              : fonts.mono
            : bold
              ? fonts.semibold
              : fonts.regular,
          fontSize: size,
          lineHeight: Math.round(size * 1.45),
          color: color ?? (muted ? colors.muted : colors.text),
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Row({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[s.row, style]}>{children}</View>;
}
export function Badge({
  children,
  tone = "purple",
}: PropsWithChildren<{
  tone?: "purple" | "cyan" | "red" | "green" | "muted" | "amber";
}>) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        s.badge,
        { borderColor: colors[tone], backgroundColor: colors[tone] + "18" },
      ]}
    >
      <Label size={10} mono color={colors[tone]}>
        {children}
      </Label>
    </View>
  );
}
export const DataSourceBadge = () => <Badge>DEMO</Badge>;
export function RobotStatusBadge({ state }: { state: string }) {
  return (
    <Badge
      tone={
        state === "FAULT"
          ? "red"
          : state === "OFFLINE"
            ? "muted"
            : state === "MANUAL"
              ? "cyan"
              : "purple"
      }
    >
      {state}
    </Badge>
  );
}
export function Action({
  children,
  onPress,
  icon,
  disabled = false,
  tone = "neutral",
  testID,
  style,
  ...rest
}: PropsWithChildren<{
  onPress?: () => void;
  icon?: IconName;
  disabled?: boolean;
  tone?: "neutral" | "primary" | "danger";
  testID?: string;
  style?: StyleProp<ViewStyle>;
}> &
  Omit<ComponentProps<typeof Pressable>, "style" | "children" | "onPress">) {
  const { colors } = useTheme();
  const c =
    tone === "danger"
      ? colors.red
      : tone === "primary"
        ? colors.white
        : colors.text;
  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityLabel={
        rest.accessibilityLabel ??
        (typeof children === "string" ? children : undefined)
      }
      accessibilityState={{ disabled }}
      disabled={disabled}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        s.action,
        {
          backgroundColor: tone === "primary" ? colors.primary : colors.inset,
          borderColor: tone === "danger" ? colors.red : colors.border,
          opacity: disabled ? 0.4 : pressed ? 0.65 : 1,
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} color={c} />}
      {typeof children === "string" ? (
        <Label bold color={c} style={{ flexShrink: 1, textAlign: "center" }}>
          {children}
        </Label>
      ) : (
        children
      )}
    </Pressable>
  );
}
export function Segments({
  options,
  value,
  onChange,
  label = "Selection",
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={label}
      style={[
        s.segments,
        { backgroundColor: colors.inset, borderColor: colors.border },
      ]}
    >
      {options.map((o) => (
        <Pressable
          key={o}
          accessibilityRole="button"
          accessibilityLabel={o}
          accessibilityState={{ selected: value === o }}
          onPress={() => onChange(o)}
          style={[
            s.segment,
            { backgroundColor: value === o ? colors.primary : "transparent" },
          ]}
        >
          <Label
            size={12}
            bold
            color={value === o ? colors.white : colors.muted}
            style={{ textAlign: "center" }}
          >
            {o}
          </Label>
        </Pressable>
      ))}
    </View>
  );
}
export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {options.map((v) => (
        <Action
          key={v}
          tone={v === value ? "primary" : "neutral"}
          onPress={() => onChange(v)}
        >
          {v}
        </Action>
      ))}
    </ScrollView>
  );
}
export function SectionCard({
  title,
  icon,
  aside,
  children,
  style,
}: PropsWithChildren<{
  title?: string;
  icon?: IconName;
  aside?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}>) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        s.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      {title && (
        <Row
          style={{
            justifyContent: "space-between",
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <Row style={{ flex: 1, minWidth: 100 }}>
            {icon && <Icon name={icon} size={18} />}
            <Label bold size={16} style={{ flexShrink: 1 }}>
              {title}
            </Label>
          </Row>
          {aside}
        </Row>
      )}
      {children}
    </View>
  );
}
export const SettingsSection = SectionCard;
export function StatCard({
  label,
  value,
  detail,
  icon,
  color,
  compact = false,
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: IconName;
  color?: string;
  compact?: boolean;
}) {
  return (
    <SectionCard
      style={{ flexGrow: 1, flexBasis: compact ? "29%" : "45%", minWidth: 0 }}
    >
      <Row style={{ justifyContent: "space-between" }}>
        <Label size={12} muted style={{ flexShrink: 1 }}>
          {label}
        </Label>
        {icon && <Icon name={icon} size={16} />}
      </Row>
      <Label
        size={compact ? 22 : 26}
        mono
        bold
        color={color}
        style={{ marginVertical: 5 }}
      >
        {value}
      </Label>
      {detail && (
        <Label size={11} muted>
          {detail}
        </Label>
      )}
    </SectionCard>
  );
}
export function Field({ label, ...props }: { label: string } & TextInputProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6, marginBottom: 12 }}>
      <Label size={12}>{label}</Label>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[
          s.input,
          {
            color: colors.text,
            backgroundColor: colors.inset,
            borderColor: colors.border,
          },
          props.style,
        ]}
      />
    </View>
  );
}
export function KeyValue({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Row
      style={{
        justifyContent: "space-between",
        paddingVertical: 5,
        flexWrap: "wrap",
      }}
    >
      <Label muted size={12}>
        {label}
      </Label>
      <Label mono size={12} color={color}>
        {value}
      </Label>
    </Row>
  );
}
export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <SectionCard>
      <Label bold>{title}</Label>
      <Label muted size={12} style={{ marginTop: 4 }}>
        {detail}
      </Label>
    </SectionCard>
  );
}
export const ConnectionErrorState = () => (
  <EmptyState
    title="Hardware connection unavailable"
    detail="API integration is not enabled in this UI preview. Physical controls remain disabled."
  />
);
const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  card: { borderWidth: 1, borderRadius: 16, padding: 12 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 5,
  },
  action: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  segments: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stack: { gap: 12 },
});

export const styles = s;
