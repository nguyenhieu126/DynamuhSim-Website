import type { Snapshot, StopResult } from "../types/robot";
/** Contract for a later adapter. No fetch, sockets or robot commands in the UI phase. */
export interface RobotDataProvider {
  subscribe(
    onData: (snapshot: Snapshot) => void,
    onError: (message: string) => void,
  ): () => void;
  requestStop(): Promise<StopResult>;
}
export const futureEndpoints = {
  health: "/api/health",
  status: "/api/robot/status",
  telemetry: "/api/robot/telemetry",
  settings: "/api/settings",
  websocket: "/ws/telemetry",
} as const;
export interface ConnectionConfiguration {
  baseUrl: string;
  source: "demo" | "live";
}
