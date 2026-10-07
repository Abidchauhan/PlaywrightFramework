// @ts-check
import os from 'os';
import { defineConfig, devices } from '@playwright/test';
import playwrightPackage from '@playwright/test/package.json';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Logs in as admin once per run and saves playwright/.auth/admin.json */
  globalSetup: './global-setup.js',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
 // reporter: 'html',  its have created by system, and now update for both reportnpx 
  reporter: [
  ['html'],
  ['allure-playwright', {
    /* Environment widget: only non-secret runtime info, never process.env values */
    environmentInfo: {
      OS: `${os.type()} ${os.release()} (${os.arch()})`,
      Node: process.version,
      Playwright: playwrightPackage.version,
      Frontend: 'http://localhost:5173',
      Backend: 'http://localhost:5000',
    },
    /* Categories widget: first match wins, so the specific causes come first.
       allure-playwright reports a Playwright timeout as "broken" and every other error as "failed". */
    categories: [
      {
        name: 'App unreachable (backend/frontend not running)',
        messageRegex: '(?s).*(ECONNREFUSED|ERR_CONNECTION_REFUSED).*',
        matchedStatuses: ['failed', 'broken'],
      },
      {
        name: 'Test timeouts',
        matchedStatuses: ['broken'],
      },
      {
        name: 'Assertion failures',
        messageRegex: '(?s).*expect\\(.*',
        matchedStatuses: ['failed'],
      },
      {
        name: 'Other failures',
        matchedStatuses: ['failed'],
      },
    ],
  }],
],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Failed tests get a screenshot, which allure-playwright attaches to the result */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      testIgnore: 'ui/admin/**',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      /* Admin specs share one product table (add-product counts rows), so run them one at a time */
      name: 'admin',
      testMatch: 'ui/admin/**/*.spec.js',
      workers: 1,
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

