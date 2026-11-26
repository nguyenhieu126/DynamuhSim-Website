import type { RobotState, RobotVelocity } from "../types/robot";
export interface DemoControl {
  source: "demo" | "live";
  state: RobotState;
  enabled: boolean;
  speed: number;
  velocity: RobotVelocity;
}
export const zero = (): RobotVelocity => ({ vx: 0, vy: 0, wz: 0 });
export const initialControl: DemoControl = {
  source: "demo",
  state: "DEMO",
  enabled: false,
  speed: 0.6,
  velocity: zero(),
};
export type ControlAction =
  | { type: "source"; source: "demo" | "live" }
  | { type: "state"; state: RobotState }
  | { type: "enable" }
  | { type: "move"; velocity: RobotVelocity }
  | { type: "speed"; speed: number }
  | { type: "stop" | "release" | "blur" | "background" | "timeout" };
export function controlReducer(s: DemoControl, a: ControlAction): DemoControl {
  switch (a.type) {
    case "source":
      return {
        ...s,
        source: a.source,
        state: a.source === "live" ? "OFFLINE" : "DEMO",
        enabled: false,
        velocity: zero(),
      };
    case "state":
      return { ...s, state: a.state, enabled: false, velocity: zero() };
    case "enable":
      return s.source === "demo" &&
        ["DEMO", "STOPPED", "MANUAL"].includes(s.state)
        ? { ...s, state: "MANUAL", enabled: true }
        : s;
    case "speed":
      return {
        ...s,
        speed: Number.isFinite(a.speed)
          ? Math.max(0.25, Math.min(1, a.speed))
          : s.speed,
        velocity: zero(),
      };
    case "move":
      if (!Object.values(a.velocity).every(Number.isFinite))
        return { ...s, velocity: zero() };
      return s.enabled && s.source === "demo" && s.state === "MANUAL"
        ? {
            ...s,
            velocity: {
              vx: Math.max(-1, Math.min(1, a.velocity.vx)) * 0.5 * s.speed,
              vy: Math.max(-1, Math.min(1, a.velocity.vy)) * 0.5 * s.speed,
              wz: Math.max(-1, Math.min(1, a.velocity.wz)) * s.speed,
            },
          }
        : s;
    default:
      return {
        ...s,
        enabled: a.type === "release" && s.enabled,
        state:
          a.type === "stop"
            ? s.source === "demo"
              ? "STOPPED"
              : "OFFLINE"
            : s.state,
        velocity: zero(),
      };
  }
}
export function validBackendUrl(value: string) {
  try {
    const u = new URL(value);
    return (
      /^https?:$/.test(u.protocol) &&
      !u.username &&
      !u.password &&
      !!u.hostname &&
      !["localhost", "127.0.0.1", "[::1]"].includes(u.hostname)
    );
  } catch {
    return false;
  }
}
export function validateSettings(
  s: import("../data/demo").LocalSettings,
): string | null {
  if (!s.robotName.trim() || s.robotName.trim().length > 48)
    return "Robot name must contain 1–48 characters.";
  if (s.backendUrl && !validBackendUrl(s.backendUrl))
    return "Use an HTTP(S) device-accessible URL, without credentials or localhost.";
  const fields: [number, number, number][] = [
    [s.maxSpeed, 0.01, 2],
    [s.maxAcceleration, 0.01, 5],
    [s.wheelRadius, 0.01, 0.3],
    [s.robotLength, 0.1, 2],
    [s.robotWidth, 0.1, 2],
    [s.confidence, 0.1, 1],
    [s.commandTimeout, 0.1, 2],
    [s.watchdogTimeout, 0.2, 5],
  ];
  if (fields.some(([v, min, max]) => !Number.isFinite(v) || v < min || v > max))
    return "A numeric setting is outside its supported range.";
  if (s.commandTimeout >= s.watchdogTimeout)
    return "Watchdog timeout must exceed command timeout.";
  return null;
}
