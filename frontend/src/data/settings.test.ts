import { describe, expect, it } from "vitest";
import { defaultSettings, validateSettings } from "./settings";
describe("safety configuration", () => {
  it("accepts safe defaults", () =>
    expect(validateSettings(defaultSettings)).toBeNull());
  it("rejects disabled loss protection and invalid watchdog ordering", () => {
    expect(validateSettings({ ...defaultSettings, autoStop: false })).toMatch(
      /Auto stop/,
    );
    expect(
      validateSettings({
        ...defaultSettings,
        commandTimeout: 2,
        watchdogTimeout: 1,
      }),
    ).toMatch(/Watchdog/);
  });
  it("rejects speed above safety cap, nonfinite values and geometry errors", () => {
    expect(validateSettings({ ...defaultSettings, safetySpeed: 1.5 })).toMatch(
      /Safety speed/,
    );
    expect(
      validateSettings({ ...defaultSettings, maxSpeed: NaN }),
    ).toBeTruthy();
    expect(
      validateSettings({ ...defaultSettings, wheelRadius: 0 }),
    ).toBeTruthy();
  });
});
