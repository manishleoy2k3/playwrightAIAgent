import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Playwright Configuration with StorageState for Pre-authenticated Sessions
 * 
 * This configuration optimizes test performance by:
 * 1. Pre-authenticating users once via auth-setup.ts
 * 2. Saving authentication state (cookies, localStorage, sessionStorage)
 * 3. Reusing that state across multiple test suites
 * 4. Avoiding repeated login operations
 * 
 * Setup Steps:
 * 1. Run: npx playwright test auth-setup.ts
 *    This generates authentication files in playwright/.auth/
 * 2. Run: npx playwright test
 *    Tests will reuse the saved authentication state
 */

// Auth state file paths
const AUTH_STATES = {
  user: 'playwright/.auth/user.json',
  admin: 'playwright/.auth/admin.json',
  problemUser: 'playwright/.auth/problem_user.json'
};

/**
 * Helper function to get config for authenticated projects
 * @param authStatePath - Path to saved auth state file
 * @param devices - Playwright device preset
 * @returns Project configuration with storageState
 */
function getAuthenticatedProjectConfig(authStatePath: string, deviceConfig: any) {
  return {
    use: {
      ...deviceConfig,
      // Use saved authentication state to skip login
      storageState: fs.existsSync(authStatePath) ? authStatePath : undefined,
    },
  };
}

export default defineConfig({
  testDir: './tests/saucedemo-checkout',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'] // Console output
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://www.saucedemo.com',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers with pre-authenticated state */
  projects: [
    /**
     * Pre-authenticated Standard User Projects
     * These tests will use saved authentication state (no login needed)
     */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Load saved user authentication state
        ...(fs.existsSync(AUTH_STATES.user) && { storageState: AUTH_STATES.user }),
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        ...(fs.existsSync(AUTH_STATES.user) && { storageState: AUTH_STATES.user }),
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        ...(fs.existsSync(AUTH_STATES.user) && { storageState: AUTH_STATES.user }),
      },
    },

    /**
     * Mobile Pre-authenticated Projects
     */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        ...(fs.existsSync(AUTH_STATES.user) && { storageState: AUTH_STATES.user }),
      },
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        ...(fs.existsSync(AUTH_STATES.user) && { storageState: AUTH_STATES.user }),
      },
    },

    /**
     * Optional: Admin-specific test suite (separate from user tests)
     * Uncomment to run tests with admin authentication
     */
    // {
    //   name: 'chromium-admin',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     ...(fs.existsSync(AUTH_STATES.admin) && { storageState: AUTH_STATES.admin }),
    //   },
    // },

    /**
     * Optional: Problem User - for testing application behavior with UI issues
     */
    // {
    //   name: 'chromium-problem-user',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     ...(fs.existsSync(AUTH_STATES.problemUser) && { storageState: AUTH_STATES.problemUser }),
    //   },
    // },
  ],

  /* Global timeout settings */
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    /**
     * Maximum time expect() should spend trying to assert the condition.
     */
    timeout: 5000 // 5 seconds for assertions
  },
});
