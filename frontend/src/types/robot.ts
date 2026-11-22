export type DataMode = "demo" | "live";
export type RobotState =
  | "DEMO"
  | "OFFLINE"
  | "CONNECTING"
  | "STOPPED"
  | "MANUAL"
  | "AUTONOMOUS"
  | "FAULT";
export type Ownership = "manual" | "autonomous" | null;
export interface RobotVelocity {
  vx: number;
  vy: number;
  wz: number;
}
export interface RobotPose {
  x: number;
  y: number;
  yaw: number;
}
export interface WheelTelemetry {
  wheel: "FL" | "FR" | "RL" | "RR";
  rpm: number;
  velocity: number;
}
export interface IMUTelemetry {
  acceleration: [number, number, number];
  angular: [number, number, number];
  orientation: [number, number, number];
}
export interface LidarScan {
  ranges: number[];
  rate: number;
  min: number;
  max: number;
  nearest: number;
}
export interface CameraStatus {
  rgb: boolean;
  depth: boolean;
  fps: number | null;
  rgbUrl: string | null;
  depthUrl: string | null;
}
export interface DetectionResult {
  id: number;
  label: string;
  confidence: number;
  distance: number;
  box: [number, number, number, number];
}
export interface TrackedObject extends DetectionResult {
  velocity: number;
  risk: "High" | "Medium" | "Low";
  position?: [number, number] | null;
  predicted: [number, number][];
}
export interface NavigationStatus {
  mapping: boolean;
  localized: boolean;
  nav2: boolean;
  status: string;
  goal: RobotPose | null;
}
export interface RobotEvent {
  id: string;
  time: string;
  level: "info" | "warning" | "critical";
  title: string;
  detail: string;
}
export interface RobotStatus {
  state: RobotState;
  robot: string;
  hardwareConnected: boolean;
  rosConnected: boolean;
  ownership: Ownership;
  battery: number | null;
  voltage: number | null;
  temperature: number | null;
  moving: boolean | null;
  controlVerified: boolean;
}
export interface Telemetry {
  velocity: RobotVelocity;
  commanded: RobotVelocity;
  pose: RobotPose;
  wheels: WheelTelemetry[];
  imu: IMUTelemetry;
  lidar: LidarScan;
  camera: CameraStatus;
  tracks: TrackedObject[];
  navigation: NavigationStatus;
}
export interface Snapshot {
  source: "demo" | "live" | "unavailable";
  timestamp: string;
  status: RobotStatus;
  telemetry: Telemetry | null;
  events: RobotEvent[];
}
export interface StopResult {
  acknowledged: boolean;
  simulated: boolean;
  message: string;
}
export interface RobotDataProvider {
  subscribe(
    onData: (data: Snapshot) => void,
    onError: (message: string) => void,
  ): () => void;
  requestStop(): Promise<StopResult>;
}
export interface ChartSample {
  time: string;
  ax: number;
  ay: number;
  az: number;
  wx: number;
  wy: number;
  wz: number;
  FL: number;
  FR: number;
  RL: number;
  RR: number;
  cmdVx: number;
  fbVx: number;
  cmdVy: number;
  fbVy: number;
  cmdWz: number;
  fbWz: number;
}
