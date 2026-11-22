import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  outputDir: "test-results",
  use: {
    baseURL: process.env.PBL6_TEST_URL || "http://127.0.0.1:8080",
    viewport: { width: 1487, height: 1058 },
    headless: true,
    launchOptions: process.env.PBL6_BROWSER_PATH
      ? {
          executablePath: process.env.PBL6_BROWSER_PATH,
          args: ["--no-sandbox"],
        }
      : {},
  },
});
