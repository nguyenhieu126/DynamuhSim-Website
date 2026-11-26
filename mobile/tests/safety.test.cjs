const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const path = require("node:path");
function load(file) {
  const filename = path.resolve(__dirname, "../src", file);
  const out = { exports: {} };
  new Function(
    "module",
    "exports",
    "require",
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
  )(out, out.exports, require);
  return out.exports;
}
const {
  controlReducer: r,
  initialControl: s,
  zero,
  validateSettings,
  validBackendUrl,
} = load("services/demoControl.ts");
const { defaultSettings, telemetry, demoStatus } = load("data/demo.ts");
const move = { type: "move", velocity: { vx: 1, vy: 1, wz: 1 } };
test("motion requires explicit local demo authority", () => {
  assert.deepEqual(r(s, move).velocity, zero());
  const enabled = r(s, { type: "enable" });
  assert.ok(r(enabled, move).velocity.vx > 0);
  const live = r(enabled, { type: "source", source: "live" });
  assert.equal(live.enabled, false);
  assert.equal(r(live, { type: "enable" }).enabled, false);
  assert.deepEqual(r(live, move).velocity, zero());
});
test("all stop, cancellation and lifecycle paths zero motion", () => {
  for (const type of ["stop", "release", "blur", "background", "timeout"]) {
    const active = r(r(s, { type: "enable" }), move);
    const stopped = r(active, { type });
    assert.deepEqual(stopped.velocity, zero(), type);
    if (type !== "release") assert.equal(stopped.enabled, false, type);
  }
});
test("returning to demo or manual state never resumes authority", () => {
  const active = r(r(s, { type: "enable" }), move);
  for (const state of [
    "DEMO",
    "OFFLINE",
    "CONNECTING",
    "STOPPED",
    "MANUAL",
    "AUTONOMOUS",
    "FAULT",
  ]) {
    const next = r(active, { type: "state", state });
    assert.equal(next.enabled, false);
    assert.deepEqual(r(next, move).velocity, zero());
  }
  assert.equal(
    r(r(active, { type: "source", source: "live" }), {
      type: "source",
      source: "demo",
    }).enabled,
    false,
  );
});
test("speed is bounded and a speed change clears existing motion", () => {
  let active = r(r(s, { type: "enable" }), move);
  const fast = r(active, { type: "speed", speed: 9 });
  assert.equal(fast.speed, 1);
  assert.deepEqual(fast.velocity, zero());
  assert.equal(r(active, { type: "speed", speed: 0 }).speed, 0.25);
  assert.ok(
    r(r(active, { type: "speed", speed: 0.6 }), move).velocity.vx <= 0.3,
  );
});
test("demo fixtures never claim physical readiness", () => {
  assert.equal(demoStatus.controlVerified, false);
  assert.equal(demoStatus.hardwareConnected, false);
  assert.equal(demoStatus.rosConnected, false);
  assert.equal(telemetry.camera.rgb, false);
  assert.equal(telemetry.navigation.nav2, false);
  assert.equal(telemetry.imu.acceleration.length, 3);
  assert.deepEqual(
    telemetry.wheels.map((w) => w.wheel),
    ["FL", "FR", "RL", "RR"],
  );
});
test("settings validate URL, numeric ranges and watchdog ordering", () => {
  assert.equal(validateSettings(defaultSettings), null);
  assert.ok(validateSettings({ ...defaultSettings, robotName: " " }));
  assert.ok(validateSettings({ ...defaultSettings, maxSpeed: NaN }));
  assert.ok(
    validateSettings({
      ...defaultSettings,
      commandTimeout: 1,
      watchdogTimeout: 0.5,
    }),
  );
  assert.equal(validBackendUrl("http://localhost:8000"), false);
  assert.equal(validBackendUrl("https://operator:secret@robot.example"), false);
  assert.equal(validBackendUrl("https://robot.example"), true);
});
test("UI phase has no network or hardware command implementation", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../src/services/providers.ts"),
    "utf8",
  );
  assert.equal(/\bfetch\s*\(|new WebSocket\s*\(/.test(source), false);
  const context = fs.readFileSync(
    path.resolve(__dirname, "../src/contexts/RobotContext.tsx"),
    "utf8",
  );
  assert.ok(context.includes("No physical STOP was sent"));
  assert.equal(/STOP ACKNOWLEDGED/.test(context), false);
});
test("nonfinite simulated commands cannot create invalid velocity", () => {
  const active = r(s, { type: "enable" });
  for (const bad of [NaN, Infinity, -Infinity]) {
    assert.deepEqual(
      r(active, { type: "move", velocity: { vx: bad, vy: 0, wz: 0 } }).velocity,
      zero(),
    );
    assert.equal(r(active, { type: "speed", speed: bad }).speed, 0.6);
  }
  assert.equal(
    r(r(s, { type: "source", source: "live" }), { type: "stop" }).state,
    "OFFLINE",
  );
});
