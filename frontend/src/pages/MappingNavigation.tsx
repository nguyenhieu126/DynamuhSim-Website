import {
  Compass,
  Flag,
  Layers,
  LocateFixed,
  Map,
  Play,
  Save,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRobot } from "../contexts/RobotContext";
import { MapViewer } from "../components/mapping/MapViewer";
import { LidarView } from "../components/mapping/LidarView";
import { Badge, Button, Card, Notice, num } from "../components/common/UI";
import type { RobotPose } from "../types/robot";
export default function MappingNavigation() {
  const { mode, telemetry: t, owner, claim } = useRobot();
  const [view, setView] = useState("map");
  const [goal, setGoal] = useState<RobotPose>({ x: 7.5, y: 4.2, yaw: 0 });
  const [staged, setStaged] = useState<RobotPose | null>(null);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    if (mode !== "demo" || owner !== "autonomous") setStaged(null);
  }, [mode, owner]);
  useEffect(
    () => () => {
      claim(null);
    },
    [],
  );
  const start = () => {
    if (mode !== "demo" || owner === "manual") return;
    if (
      ![goal.x, goal.y, goal.yaw].every(Number.isFinite) ||
      Math.abs(goal.x) > 20 ||
      Math.abs(goal.y) > 20 ||
      Math.abs(goal.yaw) > 180
    ) {
      setFeedback("Goal must be within ±20 m and yaw within ±180°.");
      return;
    }
    claim("autonomous");
    setStaged({ ...goal });
    setFeedback(
      "DEMO goal staged locally. The map shows an illustrative path; no Nav2 goal was sent.",
    );
  };
  const cancel = () => {
    setStaged(null);
    claim(null);
    setFeedback("Demo goal canceled. No hardware command sent.");
  };
  const save = () => {
    try {
      localStorage.setItem(
        "pbl6-demo-map",
        JSON.stringify({ version: 1, name: "lab_map.demo", goal }),
      );
      setFeedback(
        "Demo map selection and goal saved in this browser. No ROS map was saved.",
      );
    } catch {
      setFeedback("Unable to save: browser storage unavailable.");
    }
  };
  const load = () => {
    try {
      const raw = localStorage.getItem("pbl6-demo-map");
      if (!raw) throw new Error("No saved demo map in this browser.");
      const v = JSON.parse(raw);
      if (
        v.version !== 1 ||
        ![v.goal?.x, v.goal?.y, v.goal?.yaw].every(Number.isFinite) ||
        Math.abs(v.goal.x) > 20 ||
        Math.abs(v.goal.y) > 20 ||
        Math.abs(v.goal.yaw) > 180
      )
        throw new Error("Invalid demo map settings.");
      setGoal(v.goal);
      setFeedback("Demo map selection loaded locally.");
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Unable to load map.");
    }
  };
  return (
    <div className="page-stack">
      <div className="page-heading">
        <Map />
        <div>
          <h1>Mapping & Navigation</h1>
          <p>
            2D SLAM map, robot localization and autonomous navigation (ROS 2
            Nav2)
          </p>
        </div>
        <Badge tone="neutral">
          Nav2 {t?.navigation.nav2 ? "confirmed" : "unavailable"}
        </Badge>
      </div>
      <div className="grid mapping-grid">
        <div className="page-stack">
          <Card
            title="2D Map (SLAM)"
            icon={Map}
            action={
              <>
                <div className="segmented">
                  <button
                    className={view === "map" ? "active" : ""}
                    onClick={() => setView("map")}
                  >
                    2D Map
                  </button>
                  <button
                    className={view === "lidar" ? "active" : ""}
                    onClick={() => setView("lidar")}
                  >
                    LiDAR View
                  </button>
                </div>
                <Badge>{mode === "demo" ? "lab_map.demo" : "No map"}</Badge>
              </>
            }
          >
            {view === "map" ? <MapViewer /> : <LidarView />}
            <div className="map-legend">
              <span>□ Free space</span>
              <span>■ Occupied wall</span>
              <span>▧ Unknown</span>
              <span className="red-text">• LiDAR points</span>
              <span className="blue-text">▲ Robot pose</span>
              <span className="green-text">━ Trajectory</span>
              <span className="blue-text">┄ Planned path · ◉ Goal</span>
            </div>
          </Card>
          <div className="card map-status">
            <div>
              <Layers />{" "}
              <span>
                Map Info
                <b>
                  {mode === "demo"
                    ? "384 × 384 @ 0.05 m/cell · demo"
                    : "N/A · no occupancy grid received"}
                </b>
              </span>
            </div>
            {[
              ["Mapping (SLAM)", t?.navigation.mapping],
              ["Localization", t?.navigation.localized],
              ["Navigation (Nav2)", t?.navigation.nav2],
            ].map(([name, on]) => (
              <div key={String(name)}>
                <Compass />
                <span>
                  {name}
                  <b>{on ? "Backend confirmed" : "Unavailable"}</b>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="page-stack">
          <Card title="Robot Pose (map frame)" icon={LocateFixed}>
            <div className="grid grid-three pose-tiles">
              {(["x", "y", "yaw"] as const).map((k, i) => (
                <div key={k}>
                  <span>{["X (m)", "Y (m)", "Yaw (°)"][i]}</span>
                  <strong className="mono">
                    {num(t?.pose[k], i === 2 ? 1 : 3)}
                  </strong>
                </div>
              ))}
            </div>
          </Card>
          <Card
            title="Navigation Status"
            icon={Compass}
            action={
              <Badge tone={staged ? "purple" : "neutral"}>
                {staged ? "Demo goal staged" : "Idle / unavailable"}
              </Badge>
            }
          >
            <ol className="nav-steps">
              <li className={staged ? "done" : ""}>
                Goal {staged ? "staged locally" : "not requested"}
              </li>
              <li>Path planner · unavailable</li>
              <li>Nav2 execution · unavailable</li>
              <li>Goal reached · not confirmed</li>
            </ol>
            {staged && (
              <p className="mono small">
                Demo goal: ({staged.x}, {staged.y}, {staged.yaw}°)
              </p>
            )}
          </Card>
          <Card title="Goal (NavigateToPose)" icon={Flag}>
            <div className="grid grid-three">
              {(["x", "y", "yaw"] as const).map((k, i) => (
                <label key={k} className="field">
                  {["X (m)", "Y (m)", "Yaw (°)"][i]}
                  <input
                    type="number"
                    step="0.1"
                    min={i === 2 ? -180 : -20}
                    max={i === 2 ? 180 : 20}
                    value={goal[k]}
                    onChange={(e) =>
                      setGoal({ ...goal, [k]: e.target.valueAsNumber })
                    }
                    disabled={mode !== "demo"}
                  />
                </label>
              ))}
            </div>
            <div className="button-row">
              <Button
                variant="primary"
                disabled={mode !== "demo" || owner === "manual"}
                onClick={start}
              >
                <Play size={16} />
                Preview Goal
              </Button>
              <Button disabled={!staged} onClick={cancel}>
                <X size={16} />
                Cancel Goal
              </Button>
            </div>
            {owner === "manual" && (
              <Notice>
                Release manual ownership before staging an autonomous demo goal.
              </Notice>
            )}
          </Card>
          <Card title="Map Management" icon={Layers}>
            <div className="button-row">
              <Button
                variant="primary"
                disabled={mode !== "demo"}
                onClick={save}
              >
                <Save size={16} />
                Save Map
              </Button>
              <Button disabled={mode !== "demo"} onClick={load}>
                <Upload size={16} />
                Load Map
              </Button>
            </div>
            <p className="muted small">
              Demo map settings are stored in this browser. ROS map export and
              import await a verified adapter.
            </p>
          </Card>
          {feedback && <Notice>{feedback}</Notice>}
        </div>
      </div>
    </div>
  );
}
