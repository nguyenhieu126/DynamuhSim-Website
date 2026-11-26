export const dark = {
  background: "#0b1326",
  card: "#131b2e",
  inset: "#0b1526",
  elevated: "#222a3d",
  border: "#25334d",
  text: "#dae2fd",
  muted: "#94a3b8",
  primary: "#1769e0",
  cyan: "#00c2d6",
  purple: "#b391ff",
  red: "#ff6868",
  green: "#32d4a0",
  amber: "#fbbf24",
  white: "#ffffff",
  demo: "#20123e",
};
export type Palette = typeof dark;
export const light: Palette = {
  ...dark,
  background: "#f3f6fc",
  card: "#ffffff",
  inset: "#eaf0f9",
  elevated: "#dce6f5",
  border: "#cbd5e1",
  text: "#0f172a",
  muted: "#51627c",
  cyan: "#007c90",
  purple: "#7137cf",
  red: "#c62836",
  green: "#087e5c",
  amber: "#956000",
  demo: "#eee5ff",
};
export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  mono: "JetBrainsMono_500Medium",
  numeric: "JetBrainsMono_700Bold",
};
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { small: 8, card: 16, pill: 999 };
export const type = {
  title: 24,
  heading: 20,
  section: 16,
  body: 14,
  caption: 12,
  micro: 10,
  metric: 28,
};
