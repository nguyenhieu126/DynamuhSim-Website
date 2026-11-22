import {
  Activity,
  Bell,
  Camera,
  Gamepad2,
  LayoutDashboard,
  Map,
  Menu,
  Moon,
  Settings,
  Shield,
  Square,
  Sun,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useRobot } from "../contexts/RobotContext";
import { useTheme } from "../contexts/ThemeContext";
import { Badge, Button, Notice } from "../components/common/UI";
const routes = [
  ["/", "Dashboard", LayoutDashboard],
  ["/manual-control", "Manual Control", Gamepad2],
  ["/mapping-navigation", "Mapping & Navigation", Map],
  ["/ai-monitoring", "AI Monitoring", Camera],
  ["/sensors-telemetry", "Sensors & Telemetry", Activity],
  ["/settings", "Settings", Settings],
] as const;
export function AppLayout() {
  const {
    mode,
    setMode,
    connection,
    snapshot,
    owner,
    claim,
    requestStop,
    stopMessage,
    stopPending,
    error,
  } = useRobot();
  const { theme, setTheme } = useTheme();
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const { pathname } = useLocation();
  const title = routes.find((r) => r[0] === pathname)?.[1] || "PBL6";
  return (
    <div className="app-shell">
      {menu && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="brand">
          <img
            className="brand-icon object-contain"
            src="/assets/pbl6-logo-256.png"
            width={48}
            height={48}
            alt="PBL6 robot logo"
          />
          <div>
            <strong>PBL6</strong>
            <span>
              Robot Control &<br />
              Monitoring System
            </span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMenu(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <nav aria-label="Main navigation">
          {routes.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setMenu(false)}
              title={label}
            >
              <Icon size={21} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <img src="/assets/robot-wireframe1.png" alt="PBL6 Mecanum robot illustration" />
          <div className="system-box">
            <strong>
              <Shield size={16} />{" "}
              {mode === "demo" ? "Demo environment" : "System connections"}
            </strong>
            {["Jetson Orin Nano", "ESP32-S3", "ROS 2 Jazzy"].map((name, i) => (
              <div key={name}>
                <span>{name}</span>
                <span>
                  {i === 2
                    ? snapshot?.status.rosConnected
                      ? "Confirmed"
                      : "Unavailable"
                    : snapshot?.status.hardwareConnected
                      ? "Confirmed"
                      : "Unavailable"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="header-title">
            <Button
              className="mobile-menu icon-button"
              onClick={() => setMenu(!menu)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </Button>
            <img
              className="robot-avatar object-contain"
              src="/assets/pbl6-logo-256.png"
              width={39}
              height={39}
              alt="PBL6 robot logo"
            />
            <div>
              <strong>{pathname === "/" ? "Robot PBL6-01" : title}</strong>
              <span>
                {pathname === "/"
                  ? "Autonomous Mobile Robot (Mecanum)"
                  : "Robot Control & Monitoring System"}
              </span>
            </div>
            <Badge
              tone={
                mode === "demo"
                  ? "purple"
                  : connection === "OFFLINE" || connection === "FAULT"
                    ? "red"
                    : "blue"
              }
            >
              {mode === "demo" ? "DEMO" : connection}
            </Badge>
          </div>
          <div className="header-controls">
            <div className="segmented ownership" aria-label="Command ownership">
              <button
                disabled={mode === "live"}
                className={owner === "manual" ? "active" : ""}
                onClick={() => claim(owner === "manual" ? null : "manual")}
              >
                Manual
              </button>
              <button
                disabled={mode === "live"}
                className={owner === "autonomous" ? "active" : ""}
                onClick={() =>
                  claim(owner === "autonomous" ? null : "autonomous")
                }
              >
                Autonomous
              </button>
            </div>
            <Button
              variant="danger"
              onClick={() => void requestStop()}
              disabled={stopPending}
            >
              <Square size={15} fill="currentColor" />
              {stopPending ? "STOP…" : "STOP"}
            </Button>
            <Button
              className="icon-button"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </Button>
            <div className="notification-wrap">
              <Button
                className="icon-button"
                aria-label="Notifications"
                aria-expanded={notifications}
                onClick={() => setNotifications(!notifications)}
              >
                <Bell size={19} />
                <span className="notification-count">
                  {snapshot?.events.length || 0}
                </span>
              </Button>
              {notifications && (
                <div className="notification-popover">
                  <strong>System notifications</strong>
                  <p>
                    {mode === "demo"
                      ? "Demo environment active. All events are examples."
                      : "Live control is locked pending verified integration."}
                  </p>
                  <NavLink
                    to="/ai-monitoring"
                    onClick={() => setNotifications(false)}
                  >
                    View event timeline
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </header>
        <main>
          <div className={`environment-bar ${mode}`}>
            <span>
              <b>{mode === "demo" ? "DEMO MODE" : "LIVE MODE · READ ONLY"}</b>{" "}
              {mode === "demo"
                ? "Simulated telemetry and reference imagery. Hardware & ROS 2 unavailable."
                : "Only backend-confirmed data is displayed. Movement is disabled."}
            </span>
            <label>
              Data source{" "}
              <select
                aria-label="Data source"
                value={mode}
                onChange={(e) => setMode(e.target.value as "demo" | "live")}
              >
                <option value="demo">Demo</option>
                <option value="live">Live API</option>
              </select>
            </label>
          </div>
          {stopMessage && (
            <Notice critical={mode === "live"}>{stopMessage}</Notice>
          )}
          {error && <Notice critical>{error}</Notice>}
          <Outlet />
          <footer>
            <span>PBL6 · Mecanum Robotics Console</span>
            <span>
              {snapshot
                ? `${mode === "demo" ? "Simulation" : "Backend"} updated ${new Date(snapshot.timestamp).toLocaleTimeString()}`
                : "No telemetry received"}{" "}
              · Physical E-stop required
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
