export interface ConsoleSettings {
  robotName: string;
  language: string;
  maxSpeed: number;
  maxAcceleration: number;
  wheelRadius: number;
  robotLength: number;
  robotWidth: number;
  aiModel: string;
  confidence: number;
  tracking: boolean;
  prediction: boolean;
  commandTimeout: number;
  watchdogTimeout: number;
  autoStop: boolean;
  safetySpeed: number;
}
export const defaultSettings: ConsoleSettings = {
  robotName: "PBL6-Robot01",
  language: "English",
  maxSpeed: 0.8,
  maxAcceleration: 1.5,
  wheelRadius: 0.048,
  robotLength: 0.32,
  robotWidth: 0.3,
  aiModel: "YOLOv8 (Human Detection)",
  confidence: 0.5,
  tracking: true,
  prediction: true,
  commandTimeout: 0.5,
  watchdogTimeout: 1,
  autoStop: true,
  safetySpeed: 0.8,
};
export const numericBounds: Partial<
  Record<keyof ConsoleSettings, [number, number]>
> = {
  maxSpeed: [0.01, 2],
  maxAcceleration: [0.01, 5],
  wheelRadius: [0.01, 0.3],
  robotLength: [0.1, 2],
  robotWidth: [0.1, 2],
  confidence: [0.1, 1],
  commandTimeout: [0.1, 2],
  watchdogTimeout: [0.2, 5],
  safetySpeed: [0.01, 2],
};
export function validateSettings(s: ConsoleSettings): string | null {
  if (
    typeof s.robotName !== "string" ||
    !s.robotName.trim() ||
    s.robotName.length > 48
  )
    return "Robot name must contain 1–48 characters.";
  if (
    !["English", "Vietnamese"].includes(s.language) ||
    !["YOLOv8 (Human Detection)", "MobileNet-SSD", "Faster R-CNN"].includes(
      s.aiModel,
    )
  )
    return "Invalid language or AI model.";
  for (const [key, bounds] of Object.entries(numericBounds)) {
    const v = s[key as keyof ConsoleSettings];
    if (
      typeof v !== "number" ||
      !Number.isFinite(v) ||
      v < bounds[0] ||
      v > bounds[1]
    )
      return `${key} must be between ${bounds[0]} and ${bounds[1]}.`;
  }
  if (
    ![s.tracking, s.prediction, s.autoStop].every((v) => typeof v === "boolean")
  )
    return "Invalid toggle value.";
  if (!s.autoStop) return "Auto stop on connection loss must remain enabled.";
  if (s.commandTimeout >= s.watchdogTimeout)
    return "Watchdog timeout must exceed command timeout.";
  if (s.safetySpeed > s.maxSpeed)
    return "Safety speed cannot exceed maximum speed.";
  return null;
}
export function loadSettings(): ConsoleSettings {
  try {
    const raw = localStorage.getItem("pbl6-demo-settings");
    if (raw) {
      const parsed = { ...defaultSettings, ...JSON.parse(raw) };
      if (!validateSettings(parsed)) return parsed;
    }
  } catch {
    /* Fall back to the safe defaults when storage is unavailable. */
  }
  return { ...defaultSettings };
}
