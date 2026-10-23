import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4173", trace: "retain-on-failure" },
  webServer: {
    command: "npx vite build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    // The spec's target phone: iPhone SE (2nd/3rd gen), 375×667. Playwright's
    // "iPhone SE" preset is the 1st gen (320×568); "iPhone 8" has the right
    // screen and the same WebKit engine.
    { name: "iphone-se", use: { ...devices["iPhone 8"] } },
    // Smallest phones still in use: just check the layout doesn't overflow.
    { name: "small-phone", use: { ...devices["iPhone SE"] }, grep: /no horizontal page scroll/ },
    { name: "pixel-7", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
});
