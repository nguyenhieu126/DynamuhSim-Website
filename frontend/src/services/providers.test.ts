import { describe, expect, it } from "vitest";
import { demoSnapshot } from "../data/demo";
import { liveProvider, parseSnapshot } from "./providers";
describe("telemetry trust boundary", () => {
  it("keeps demo hardware and camera capabilities unavailable", () => {
    const s = parseSnapshot(demoSnapshot());
    expect(s.source).toBe("demo");
    expect(s.status.hardwareConnected).toBe(false);
    expect(s.telemetry?.camera.rgb).toBe(false);
    expect(s.telemetry?.navigation.nav2).toBe(false);
  });
  it("rejects malformed nested sensor frames", () => {
    const s = demoSnapshot();
    s.telemetry!.imu.acceleration = [NaN, 0, 0];
    expect(() => parseSnapshot(s)).toThrow();
    expect(() => parseSnapshot({})).toThrow();
  });
  it("rejects invalid wheel and detection payloads", () => {
    const s = demoSnapshot();
    s.telemetry!.wheels[0].wheel = "FR";
    expect(() => parseSnapshot(s)).toThrow();
    const t = demoSnapshot();
    t.telemetry!.tracks[0].box = [-1, 0, 0, 0];
    expect(() => parseSnapshot(t)).toThrow();
    const invalidPosition = demoSnapshot();
    invalidPosition.telemetry!.tracks[0].position = [NaN, 1];
    expect(() => parseSnapshot(invalidPosition)).toThrow();
    expect(() => parseSnapshot({ ...demoSnapshot(), source: "live" })).toThrow(
      /Demo status/,
    );
  });
  it("never acknowledges a physical stop without a verified endpoint", async () => {
    await expect(liveProvider.requestStop()).rejects.toThrow(
      "STOP NOT ACKNOWLEDGED",
    );
  });
});
