import {
  Activity,
  Bot,
  Camera,
  Code,
  Cpu,
  Info,
  Link,
  Save,
  Settings as SettingsIcon,
  Shield,
  SlidersHorizontal,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useBlocker } from "react-router-dom";
import { useRobot } from "../contexts/RobotContext";
import { useTheme } from "../contexts/ThemeContext";
import { API_BASE } from "../services/providers";
import { Badge, Button, Card, Notice } from "../components/common/UI";
import {
  defaultSettings,
  loadSettings,
  numericBounds,
  validateSettings,
  type ConsoleSettings,
} from "../data/settings";
const tabs = [
  ["general", "General", SettingsIcon],
  ["connections", "Connections", Link],
  ["motion", "Motion", SlidersHorizontal],
  ["sensors", "Sensors", Camera],
  ["ai", "AI Configuration", Cpu],
  ["safety", "Safety", Shield],
  ["advanced", "Advanced", Code],
] as const;
export default function Settings() {
  const { mode, snapshot, telemetry } = useRobot();
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(loadSettings);
  const [draft, setDraft] = useState(saved);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [active, setActive] = useState("general");
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const moving =
    !!snapshot?.status.moving ||
    !!(
      telemetry &&
      (telemetry.velocity.vx || telemetry.velocity.vy || telemetry.velocity.wz)
    );
  const locked = mode === "live" || moving;
  const blocker = useBlocker(dirty);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  useEffect(() => {
    if (blocker.state === "blocked") dialog.current?.showModal();
    else dialog.current?.close();
  }, [blocker.state]);
  const update = <K extends keyof ConsoleSettings>(
    key: K,
    value: ConsoleSettings[K],
  ) => setDraft((d) => ({ ...d, [key]: value }));
  const numeric = (key: keyof ConsoleSettings, label: string, unit: string) => {
    const bounds = numericBounds[key]!;
    return (
      <label className="setting-field">
        {label}
        <span>
          <input
            aria-label={label}
            type="number"
            required
            min={bounds[0]}
            max={bounds[1]}
            step="any"
            value={Number.isNaN(draft[key]) ? "" : String(draft[key])}
            disabled={locked}
            onChange={(e) => update(key, e.target.valueAsNumber)}
          />
          <small>{unit}</small>
        </span>
      </label>
    );
  };
  const save = (e: FormEvent) => {
    e.preventDefault();
    setIsError(true);
    if (locked) {
      setMessage(
        "Stop demo motion before saving. Live settings are read-only until a verified adapter exists.",
      );
      return;
    }
    const error = validateSettings(draft);
    if (error) {
      setMessage(error);
      return;
    }
    try {
      localStorage.setItem("pbl6-demo-settings", JSON.stringify(draft));
      setSaved({ ...draft });
      setMessage(
        "Demo configuration saved in this browser. No hardware settings were changed.",
      );
      setIsError(false);
    } catch {
      setMessage(
        "Save failed: browser storage unavailable. Changes are still unsaved.",
      );
    }
  };
  const cancel = () => {
    setDraft({ ...saved });
    setMessage("Unsaved changes canceled.");
    setIsError(false);
  };
  return (
    <form onSubmit={save} className="page-stack">
      <div className="page-heading">
        <SettingsIcon />
        <div>
          <h1>Settings</h1>
          <p>Configure robot, devices, AI and system parameters</p>
        </div>
        {dirty && <Badge tone="amber">Unsaved changes</Badge>}
      </div>
      <div className="settings-tabs" aria-label="Settings sections">
        {tabs.map(([id, name, Icon]) => (
          <Button
            key={id}
            variant={active === id ? "primary" : "secondary"}
            onClick={() => {
              setActive(id);
              document
                .getElementById(id)
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <Icon size={18} />
            {name}
          </Button>
        ))}
      </div>
      {message && <Notice critical={isError}>{message}</Notice>}
      {mode === "live" && (
        <Notice>
          Live settings are read-only. No verified settings or control adapter
          is configured.
        </Notice>
      )}
      <div className="grid settings-grid">
        <div className="page-stack">
          <Card id="general" title="General Settings" icon={Info}>
            <p className="muted small">Basic robot and system configuration</p>
            <label className="setting-field">
              Robot Name
              <input
                required
                maxLength={48}
                value={draft.robotName}
                disabled={mode === "live"}
                onChange={(e) => update("robotName", e.target.value)}
              />
            </label>
            <label className="setting-field">
              Language
              <select
                value={draft.language}
                disabled={mode === "live"}
                onChange={(e) => update("language", e.target.value)}
              >
                <option>English</option>
                <option>Vietnamese</option>
              </select>
            </label>
            <div className="setting-field">
              Theme
              <div className="segmented">
                <button
                  type="button"
                  className={theme === "light" ? "active" : ""}
                  onClick={() => setTheme("light")}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={theme === "dark" ? "active" : ""}
                  onClick={() => setTheme("dark")}
                >
                  Dark
                </button>
              </div>
            </div>
            <p className="small muted">
              Theme applies immediately. Language is saved as a configuration
              preference.
            </p>
          </Card>
          <Card id="connections" title="Connections" icon={Link}>
            <p className="muted small">
              Connection status of system components
            </p>
            <div className="connection-list">
              {[
                ["Jetson Orin Nano", "External robot computer"],
                ["ESP32-S3", "micro-ROS planned"],
                ["Backend (API)", API_BASE || "Same-origin /api"],
                ["ROS 2 (Jazzy)", "External ROS bridge"],
              ].map(([name, detail], i) => (
                <div key={name}>
                  <Cpu size={22} />
                  <div>
                    <strong>{name}</strong>
                    <span>{detail}</span>
                  </div>
                  <Badge>
                    {i === 2
                      ? mode === "demo"
                        ? "Not used"
                        : snapshot
                          ? "Available"
                          : "Unavailable"
                      : "Unavailable"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card id="advanced" title="Advanced" icon={Code}>
            <dl>
              <div>
                <dt>Robot ID</dt>
                <dd className="mono">PBL6-01</dd>
              </div>
              <div>
                <dt>Adapter</dt>
                <dd>Not configured</dd>
              </div>
              <div>
                <dt>Physical commands</dt>
                <dd>Disabled</dd>
              </div>
              <div>
                <dt>Demo storage</dt>
                <dd>This browser</dd>
              </div>
            </dl>
            <p className="muted small">
              Connection URLs are configured through environment variables.
              Secrets are never stored in browser settings.
            </p>
          </Card>
        </div>
        <div className="page-stack">
          <Card id="motion" title="Motion Settings" icon={SlidersHorizontal}>
            <p className="muted small">
              Robot motion parameters and mecanum wheel configuration
            </p>
            <div className="grid grid-two motion-fields">
              <div>
                {numeric("maxSpeed", "Maximum Speed", "m/s")}
                {numeric("maxAcceleration", "Maximum Acceleration", "m/s²")}
              </div>
              <div>
                <h3>Mecanum Wheel Parameters</h3>
                {numeric("wheelRadius", "Wheel Radius (r)", "m")}
                {numeric("robotLength", "Robot Length (L)", "m")}
                {numeric("robotWidth", "Robot Width (W)", "m")}
              </div>
            </div>
          </Card>
          <div className="grid grid-two">
            <Card id="sensors" title="Sensors" icon={Camera}>
              <p className="muted small">Sensor calibration and parameters</p>
              <div className="calibration-list">
                {[
                  "LiDAR",
                  "Depth Camera",
                  "IMU (ICM-20948)",
                  "Wheel Encoder",
                ].map((name) => (
                  <div key={name}>
                    <span>{name}</span>
                    <Badge>Unverified</Badge>
                    <Button
                      disabled
                      title="Requires a connected and verified hardware calibration service"
                    >
                      Calibrate
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
            <Card id="ai" title="AI Configuration" icon={Cpu}>
              <label className="setting-field">
                AI Model
                <select
                  value={draft.aiModel}
                  disabled={mode === "live"}
                  onChange={(e) => update("aiModel", e.target.value)}
                >
                  <option>YOLOv8 (Human Detection)</option>
                  <option>MobileNet-SSD</option>
                  <option>Faster R-CNN</option>
                </select>
              </label>
              <label className="setting-field">
                Confidence
                <input
                  aria-label="Confidence threshold"
                  type="range"
                  min=".1"
                  max="1"
                  step=".01"
                  value={draft.confidence}
                  disabled={mode === "live"}
                  onChange={(e) => update("confidence", +e.target.value)}
                />
                <output className="mono">{draft.confidence.toFixed(2)}</output>
              </label>
              {(["tracking", "prediction"] as const).map((key) => (
                <label className="setting-field" key={key}>
                  {key === "tracking" ? "Tracking" : "Motion Prediction"}
                  <span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={draft[key]}
                      disabled={mode === "live"}
                      onChange={(e) => update(key, e.target.checked)}
                    />
                    {draft[key] ? "On" : "Off"}
                  </span>
                </label>
              ))}
              <p className="small muted">
                Configuration preview. AI service is unavailable.
              </p>
            </Card>
          </div>
          <Card id="safety" title="Safety" icon={Shield}>
            <p className="muted small">Timeout, watchdog and safety limits</p>
            <Notice critical={moving}>
              {moving
                ? "Safety settings locked: simulated robot is moving."
                : "Safety settings lock while moving. Physical watchdog integration is pending."}
            </Notice>
            <div className="grid safety-grid">
              <div>
                {numeric("commandTimeout", "Command Timeout", "s")}
                {numeric("watchdogTimeout", "Watchdog Timeout", "s")}
                <label className="setting-field">
                  Auto Stop on Loss
                  <span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={draft.autoStop}
                      disabled
                      title="Required safety invariant"
                    />
                    On
                  </span>
                </label>
                {numeric("safetySpeed", "Speed Limit (Safety)", "m/s")}
              </div>
              <div className="subcard">
                <h3>Safety Status</h3>
                <dl>
                  <div>
                    <dt>Robot motion</dt>
                    <dd>
                      <Badge>
                        {mode === "demo"
                          ? moving
                            ? "Demo moving"
                            : "Demo stopped"
                          : "Unknown"}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt>Safety lock</dt>
                    <dd>{locked ? "Locked" : "Unlocked"}</dd>
                  </div>
                  <div>
                    <dt>UI watchdog</dt>
                    <dd>0.5 s · demo</dd>
                  </div>
                  <div>
                    <dt>Hardware watchdog</dt>
                    <dd>Unverified</dd>
                  </div>
                </dl>
              </div>
            </div>
          </Card>
          <div className="settings-actions">
            <Button
              onClick={() => {
                setDraft({ ...defaultSettings });
                setMessage("Defaults loaded. Save to keep them.");
                setIsError(false);
              }}
              disabled={locked}
            >
              <Undo2 size={17} />
              Reset
            </Button>
            <Button onClick={cancel} disabled={!dirty}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!dirty || locked}>
              <Save size={17} />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
      <dialog
        ref={dialog}
        onCancel={(e) => {
          e.preventDefault();
          if (blocker.state === "blocked") blocker.reset();
        }}
      >
        <h2>Unsaved settings</h2>
        <p>Leave this page and discard your changes?</p>
        <div className="button-row">
          <Button
            onClick={() => {
              if (blocker.state === "blocked") blocker.reset();
            }}
          >
            Keep editing
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (blocker.state === "blocked") blocker.proceed();
            }}
          >
            Discard & leave
          </Button>
        </div>
      </dialog>
    </form>
  );
}
