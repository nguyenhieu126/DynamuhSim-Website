import { test, expect } from "@playwright/test";

test("all six pages render directly, reload, and use only local demo resources", async ({
  page,
}) => {
  const errors = [];
  const writes = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (r.method() !== "GET") writes.push(r.url());
  });
  for (const [path, title] of [
    ["/", "Robot PBL6-01"],
    ["/manual-control", "Manual Control"],
    ["/mapping-navigation", "Mapping & Navigation"],
    ["/ai-monitoring", "AI Monitoring"],
    ["/sensors-telemetry", "Sensors & Telemetry"],
    ["/settings", "Settings"],
  ]) {
    await page.goto(path);
    await expect(page.locator(".header-title")).toContainText(title);
    await expect(page.locator(".environment-bar")).toContainText("DEMO MODE");
    await expect(
      page.getByRole("button", { name: "STOP", exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(page.locator(".sidebar nav a.active")).toHaveCount(1);
    expect(
      await page
        .locator("img")
        .evaluateAll((nodes) =>
          nodes.every((n) => n.complete && n.naturalWidth > 0),
        ),
    ).toBe(true);
    if (path === "/" || path === "/sensors-telemetry")
      await page.waitForTimeout(1200);
    await page.screenshot({
      path: `test-results/${path === "/" ? "dashboard" : path.slice(1)}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.locator("body")).toHaveCSS("color", "rgb(228, 236, 247)");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(12, 20, 34)");
    await page.screenshot({
      path: `test-results/${path === "/" ? "dashboard" : path.slice(1)}-dark.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Switch to light theme" }).click();
  }
  expect(errors).toEqual([]);
  expect(writes).toEqual([]);
});

test("manual ownership, release, focus loss, route departure and STOP are fail closed", async ({
  page,
}) => {
  const writes = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") writes.push(r.url());
  });
  await page.goto("/manual-control");
  const forward = page.getByRole("button", {
    name: "Forward (W)",
    exact: true,
  });
  await expect(forward).toBeDisabled();
  await page.getByRole("button", { name: "Enable demo control" }).click();
  await expect(forward).toBeEnabled();
  const velocity = page.locator(".velocity-list>div").first().locator("strong");
  await page.locator("h2").first().click();
  await page.keyboard.down("w");
  await expect(velocity).toContainText("0.48");
  await page.keyboard.up("w");
  await expect(velocity).toContainText("0.00");
  await page.keyboard.down("a");
  await expect(
    page.locator(".velocity-list>div").nth(1).locator("strong"),
  ).toContainText("0.48");
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(
    page.locator(".velocity-list>div").nth(1).locator("strong"),
  ).toContainText("0.00");
  await page.keyboard.up("a");
  await page.getByRole("button", { name: "Autonomous", exact: true }).click();
  await expect(forward).toBeDisabled();
  await page.getByRole("button", { name: "Enable demo control" }).click();
  await page.locator("h2").first().click();
  await page.keyboard.down("w");
  await expect(velocity).toContainText("0.48");
  await page.getByRole("link", { name: "Dashboard", exact: true }).click();
  await page.keyboard.up("w");
  await expect(page.locator(".metric").nth(2)).toContainText("0.00 m/s");
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "No physical stop was sent or acknowledged",
  );
  expect(writes).toEqual([]);
});

test("settings persist locally, cancel edits, block navigation and validate", async ({
  page,
}) => {
  await page.goto("/settings");
  const name = page.getByLabel("Robot Name", { exact: true });
  await name.fill("Lab Demo");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "saved in this browser" }),
  ).toBeVisible();
  await page.reload();
  await expect(name).toHaveValue("Lab Demo");
  await name.fill("Discard this");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(name).toHaveValue("Lab Demo");
  await name.fill("Unsaved");
  await page.getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Keep editing" }).click();
  await expect(name).toHaveValue("Unsaved");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByLabel("Speed Limit (Safety)", { exact: true }).fill("1.5");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Safety speed cannot exceed",
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("live backend demo frames never appear as live telemetry and STOP is unacknowledged", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Data source", exact: true })
    .selectOption("live");
  await expect(page.getByRole("alert")).toContainText(
    "Backend is in DEMO mode",
  );
  await expect(page.locator(".metric").nth(1)).toContainText("N/A");
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "STOP NOT ACKNOWLEDGED" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Manual Control", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Enable demo control" }),
  ).toBeDisabled();
});

test("mapping goals preserve command exclusivity and save/load only local map settings", async ({
  page,
}) => {
  await page.goto("/mapping-navigation");
  await page.getByRole("button", { name: "Manual", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Preview Goal", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Manual", exact: true }).click();
  await page.getByRole("button", { name: "Preview Goal", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("no Nav2 goal was sent");
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Cancel Goal" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Save Map", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "No ROS map was saved" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Load Map", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "selection loaded locally" }),
  ).toBeVisible();
});

test("mobile navigation and dark pages remain within viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "/",
    "/manual-control",
    "/mapping-navigation",
    "/ai-monitoring",
    "/sensors-telemetry",
    "/settings",
  ]) {
    await page.goto(path);
    await expect(
      page.getByRole("button", { name: "STOP", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("link", { name: "Dashboard", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect(page.locator(".metric")).toHaveCount(4);
});

test("live freshness expires and depth capability never implies RGB", async ({
  page,
  request,
}) => {
  const fixture = await (await request.get("/api/robot/telemetry")).json();
  fixture.source = "live";
  fixture.status.state = "STOPPED";
  fixture.status.hardwareConnected = true;
  fixture.telemetry.camera.depth = true;
  // Valid capability with an unavailable image stream must not invent RGB content.
  fixture.telemetry.camera.depthUrl = "/healthz";
  await page.route("**/api/robot/telemetry", async (route) => {
    fixture.timestamp = new Date().toISOString();
    await route.fulfill({ json: fixture });
  });
  await page.routeWebSocket("**/ws/telemetry", (ws) => {
    fixture.timestamp = new Date().toISOString();
    ws.send(JSON.stringify(fixture));
  });
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Data source", exact: true })
    .selectOption("live");
  await expect(page.locator(".metric").nth(1)).toContainText("78 %");
  await page
    .locator(".camera-tabs")
    .getByRole("button", { name: "RGB", exact: true })
    .click();
  await expect(page.locator(".camera-viewport")).toContainText(
    /Camera unavailable|Camera stream error/,
  );
  await expect(page.getByRole("alert")).toContainText("Telemetry stale", {
    timeout: 8000,
  });
  await expect(page.locator(".metric").nth(1)).toContainText("N/A");
  await expect(
    page.getByRole("button", { name: "Manual", exact: true }),
  ).toBeDisabled();
});
