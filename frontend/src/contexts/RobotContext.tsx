import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { demoProvider, liveProvider } from "../services/providers";
import type {
  ChartSample,
  DataMode,
  Ownership,
  RobotState,
  RobotVelocity,
  Snapshot,
} from "../types/robot";

const zero: RobotVelocity = { vx: 0, vy: 0, wz: 0 };
function useRobotStore() {
  const [mode, setModeState] = useState<DataMode>(() =>
    import.meta.env.VITE_DATA_MODE === "live" ? "live" : "demo",
  );
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [connection, setConnection] = useState<RobotState>("CONNECTING");
  const [error, setError] = useState("");
  const [owner, setOwner] = useState<Ownership>(null);
  const [command, setCommand] = useState(zero);
  const commandRef = useRef(zero);
  const [stopMessage, setStopMessage] = useState("");
  const [stopPending, setStopPending] = useState(false);
  const [history, setHistory] = useState<ChartSample[]>([]);
  const lastReceipt = useRef(0);
  const lastHeartbeat = useRef(0);
  const halt = useCallback(() => {
    commandRef.current = zero;
    setCommand(zero);
  }, []);
  const setMode = useCallback(
    (m: DataMode) => {
      halt();
      setOwner(null);
      setSnapshot(null);
      setHistory([]);
      setConnection("CONNECTING");
      setError("");
      setStopMessage("");
      setModeState(m);
    },
    [halt],
  );
  useEffect(() => {
    setConnection("CONNECTING");
    const provider = mode === "demo" ? demoProvider : liveProvider;
    const dispose = provider.subscribe(
      (data) => {
        lastReceipt.current = Date.now();
        let next = data;
        if (mode === "demo" && next.telemetry) {
          const v = commandRef.current;
          // Mecanum inverse kinematics: r=0.048 m, half-length + half-width=0.31 m.
          const { vx, vy, wz } = v;
          const speeds = [
            vx - vy - 0.31 * wz,
            vx + vy + 0.31 * wz,
            vx + vy - 0.31 * wz,
            vx - vy + 0.31 * wz,
          ];
          next = {
            ...next,
            status: { ...next.status, moving: !!(vx || vy || wz) },
            telemetry: {
              ...next.telemetry,
              velocity: v,
              commanded: v,
              wheels: next.telemetry.wheels.map((w, i) => ({
                ...w,
                velocity: speeds[i],
                rpm: ((speeds[i] / 0.048) * 60) / (2 * Math.PI),
              })),
            },
          };
        }
        setSnapshot(next);
        setError("");
        setConnection(mode === "demo" ? "DEMO" : next.status.state);
        const t = next.telemetry;
        if (t)
          setHistory((old) =>
            [
              ...old,
              {
                time: new Date(next.timestamp).toLocaleTimeString("en-GB"),
                ax: t.imu.acceleration[0],
                ay: t.imu.acceleration[1],
                az: t.imu.acceleration[2],
                wx: t.imu.angular[0],
                wy: t.imu.angular[1],
                wz: t.imu.angular[2],
                FL: t.wheels[0].rpm,
                FR: t.wheels[1].rpm,
                RL: t.wheels[2].rpm,
                RR: t.wheels[3].rpm,
                cmdVx: t.commanded.vx,
                fbVx: t.velocity.vx,
                cmdVy: t.commanded.vy,
                fbVy: t.velocity.vy,
                cmdWz: t.commanded.wz,
                fbWz: t.velocity.wz,
              },
            ].slice(-7200),
          );
      },
      (message) => {
        halt();
        setOwner(null);
        setError(message);
        setSnapshot(null);
        setHistory([]);
        setConnection("OFFLINE");
      },
    );
    const freshness = window.setInterval(() => {
      if (
        mode === "live" &&
        lastReceipt.current &&
        Date.now() - lastReceipt.current > 5000
      ) {
        halt();
        setOwner(null);
        setSnapshot(null);
        setHistory([]);
        setConnection("OFFLINE");
        setError("Telemetry stale (>5 s). Live values unavailable.");
      }
    }, 1000);
    return () => {
      dispose();
      window.clearInterval(freshness);
    };
  }, [mode, halt]);
  useEffect(() => {
    const stopOnHidden = () => {
      if (document.hidden) halt();
    };
    window.addEventListener("blur", halt);
    document.addEventListener("visibilitychange", stopOnHidden);
    const watchdog = window.setInterval(() => {
      if (Date.now() - lastHeartbeat.current > 500) halt();
    }, 100);
    return () => {
      window.removeEventListener("blur", halt);
      document.removeEventListener("visibilitychange", stopOnHidden);
      window.clearInterval(watchdog);
    };
  }, [halt]);
  const move = (velocity: RobotVelocity) => {
    if (mode !== "demo" || owner !== "manual" || document.hidden) return;
    lastHeartbeat.current = Date.now();
    commandRef.current = velocity;
    setCommand(velocity);
  };
  const claim = (next: Ownership) => {
    halt();
    setOwner(mode === "demo" ? next : null);
  };
  const requestStop = async () => {
    halt();
    setOwner(null);
    setStopPending(true);
    setStopMessage("STOP requested. Awaiting acknowledgment…");
    try {
      const result = await (
        mode === "demo" ? demoProvider : liveProvider
      ).requestStop();
      setStopMessage(result.message);
      if (!result.simulated && !result.acknowledged) setConnection("FAULT");
    } catch (e) {
      setStopMessage(e instanceof Error ? e.message : "STOP NOT ACKNOWLEDGED");
      setConnection("FAULT");
    } finally {
      setStopPending(false);
    }
  };
  return {
    mode,
    setMode,
    snapshot,
    telemetry: snapshot?.telemetry ?? null,
    connection,
    error,
    owner,
    claim,
    command,
    move,
    halt,
    requestStop,
    stopMessage,
    stopPending,
    history,
  };
}
type RobotContextValue = ReturnType<typeof useRobotStore>;
const RobotContext = createContext<RobotContextValue | null>(null);
export function RobotProvider({ children }: { children: ReactNode }) {
  const value = useRobotStore();
  return (
    <RobotContext.Provider value={value}>{children}</RobotContext.Provider>
  );
}
export function useRobot() {
  const value = useContext(RobotContext);
  if (!value) throw new Error("RobotProvider missing");
  return value;
}
