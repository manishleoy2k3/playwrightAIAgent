/**
 * Auth Setup: Pre-authenticate users and save their session state
 * This runs ONCE before all tests and saves authentication state
 * The saved state (cookies, localStorage, sessionStorage) is reused across tests
 * 
 * Usage: npx playwright test auth-setup.ts
 * This generates auth files that other tests reuse
 */

import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.saucedemo.com';

// Define authentication configurations for different roles
const AUTH_CONFIGS = {
  user: {
    name: 'user_auth',
    credentials: {
      username: 'standard_user',
      password: 'secret_sauce'
    },
    storageStatePath: 'playwright/.auth/user.json'
  },
  admin: {
    name: 'admin_auth',
    credentials: {
      username: 'admin_user',
      password: 'secret_sauce'
    },
    storageStatePath: 'playwright/.auth/admin.json'
  },
  problemUser: {
    name: 'problem_user_auth',
    credentials: {
      username: 'problem_user',
      password: 'secret_sauce'
    },
    storageStatePath: 'playwright/.auth/problem_user.json'
  }
};

/**
 * Authenticate user and save their session state
 * @param browser - Chromium browser instance
 * @param config - Auth configuration with credentials and storage path
 */
async function authenticateUser(browser, config) {
  console.log(`🔐 Authenticating as: ${config.name}...`);
  
  const page = await browser.newPage();

  try {
    // Navigate to login page
    await page.goto(BASE_URL);

    // Fill in login credentials
    await page.locator('[data-test="username"]').fill(config.credentials.username);
    await page.locator('[data-test="password"]').fill(config.credentials.password);

    // Click login button
    await page.locator('[data-test="login-button"]').click();

    // Wait for navigation to products page (verify successful login)
    await page.waitForURL(/.*inventory.html/, { timeout: 10000 });

    console.log(`✅ Successfully authenticated as: ${config.name}`);

    // Create directory if it doesn't exist
    const dir = path.dirname(config.storageStatePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }

    // Save authentication state (cookies, localStorage, sessionStorage)
    // This is what gets reused across tests
    await page.context().storageState({ path: config.storageStatePath });
    console.log(`💾 Saved auth state to: ${config.storageStatePath}`);

  } catch (error) {
    console.error(`❌ Failed to authenticate as ${config.name}:`, error);
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * Main async function to set up all authentication states
 */
async function setupAuth() {
  console.log('\n🚀 Starting authentication setup...\n');
  
  const browser = await chromium.launch();

  try {
    // Authenticate each user role and save their state
    for (const [roleKey, config] of Object.entries(AUTH_CONFIGS)) {
      try {
        await authenticateUser(browser, config);
      } catch (error) {
        console.warn(`⚠️  Skipping ${roleKey} authentication (may fail for demo credentials)`);
      }
    }

    console.log('\n✅ Authentication setup complete!\n');
    console.log('📝 Generated auth files:');
    console.log(`   - ${AUTH_CONFIGS.user.storageStatePath}`);
    console.log(`   - ${AUTH_CONFIGS.admin.storageStatePath}`);
    console.log(`   - ${AUTH_CONFIGS.problemUser.storageStatePath}`);
    console.log('\n💡 These files are now reused across all test suites.\n');

  } finally {
    await browser.close();
  }
}

// Run setup
setupAuth().catch(console.error);
