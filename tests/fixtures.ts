/**
 * Shared Test Fixtures and Utilities
 * 
 * Provides reusable authenticated contexts and helper functions
 * to avoid repeating login logic across multiple test suites
 */

import { test as base, expect, Page, Browser } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'https://www.saucedemo.com';

/**
 * Test credentials for different user roles
 * Supports: standard_user, admin_user, problem_user, etc.
 */
export const TEST_USERS = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  admin: {
    username: 'admin_user',
    password: 'secret_sauce',
  },
  problemUser: {
    username: 'problem_user',
    password: 'secret_sauce',
  },
  performanceUser: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
  },
  errorUser: {
    username: 'error_user',
    password: 'secret_sauce',
  },
};

/**
 * Custom fixture that provides authenticated page context
 * Usage:
 *   test('my test', async ({ authenticatedPage }) => {
 *     // authenticatedPage is already logged in, ready to use
 *   });
 */
export const authenticatedTest = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // If storageState is configured, page will be pre-authenticated
    // Otherwise, perform manual login
    
    // Check if we're already authenticated (storageState loaded)
    await page.goto(BASE_URL);
    
    const isAuthenticated = await checkIfAuthenticated(page);
    
    if (!isAuthenticated) {
      console.log('⚠️  Not authenticated via storageState, performing manual login...');
      console.log('💡 Tip: Run "npx playwright test auth-setup.ts" to enable storageState');
      
      // Manual login as fallback
      await performLogin(page, TEST_USERS.standard);
    } else {
      console.log('✅ Using pre-authenticated session (storageState)');
    }
    
    await use(page);
  },
});

/**
 * Custom test that provides both authenticated context and utilities
 * Usage:
 *   test('my test', async ({ authenticatedPage, getLoggedInPage, addToCart }) => {
 *     // Full suite of utilities available
 *   });
 */
export const advancedTest = base.extend<{
  authenticatedPage: Page;
  getLoggedInPage: (user?: typeof TEST_USERS.standard) => Promise<Page>;
  addToCart: (page: Page, productId: string) => Promise<void>;
  goToCheckout: (page: Page) => Promise<void>;
}>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto(BASE_URL);
    if (!(await checkIfAuthenticated(page))) {
      await performLogin(page, TEST_USERS.standard);
    }
    await use(page);
  },

  getLoggedInPage: async ({ browser }, use) => {
    // Helper to create additional authenticated pages
    const func = async (user = TEST_USERS.standard) => {
      const newPage = await browser.newPage();
      await newPage.goto(BASE_URL);
      
      if (!(await checkIfAuthenticated(newPage))) {
        await performLogin(newPage, user);
      }
      
      return newPage;
    };
    
    await use(func);
  },

  addToCart: async ({}, use) => {
    const func = async (page: Page, productId: string) => {
      const addButton = page.locator(`[data-test="add-to-cart-${productId}"]`);
      await addButton.click();
    };
    
    await use(func);
  },

  goToCheckout: async ({}, use) => {
    const func = async (page: Page) => {
      // Navigate to cart
      await page.locator('[data-test="shopping-cart-link"]').click();
      await page.waitForURL(/.*cart.html/);
      
      // Click checkout
      await page.locator('[data-test="checkout"]').click();
      await page.waitForURL(/.*checkout-step-one.html/);
    };
    
    await use(func);
  },
});

/**
 * Check if user is currently authenticated
 * @param page - Playwright page object
 * @returns true if authenticated, false otherwise
 */
export async function checkIfAuthenticated(page: Page): Promise<boolean> {
  try {
    // Navigate to a protected route
    await page.goto(`${BASE_URL}/inventory.html`, { waitUntil: 'domcontentloaded' });
    
    // If we're redirected back to login, we're not authenticated
    const url = page.url();
    const isOnLoginPage = url.includes('login') || url === BASE_URL + '/';
    
    return !isOnLoginPage;
  } catch {
    return false;
  }
}

/**
 * Perform login with given credentials
 * @param page - Playwright page object
 * @param credentials - User credentials {username, password}
 */
export async function performLogin(
  page: Page,
  credentials: typeof TEST_USERS.standard
): Promise<void> {
  await page.goto(BASE_URL);
  
  // Fill login form
  await page.locator('[data-test="username"]').fill(credentials.username);
  await page.locator('[data-test="password"]').fill(credentials.password);
  await page.locator('[data-test="login-button"]').click();
  
  // Wait for successful navigation
  await page.waitForURL(/.*inventory.html/, { timeout: 10000 });
}

/**
 * Add product to cart
 * @param page - Playwright page object
 * @param productId - Product identifier (e.g., 'sauce-labs-backpack')
 */
export async function addProductToCart(page: Page, productId: string): Promise<void> {
  const addButton = page.locator(`[data-test="add-to-cart-${productId}"]`);
  await expect(addButton).toBeVisible();
  await addButton.click();
}

/**
 * Get cart item count from badge
 * @param page - Playwright page object
 * @returns Cart item count as number
 */
export async function getCartItemCount(page: Page): Promise<number> {
  const cartLink = page.locator('[data-test="shopping-cart-link"]');
  const badgeText = await cartLink.textContent();
  return badgeText ? parseInt(badgeText) : 0;
}

/**
 * Navigate to checkout
 * @param page - Playwright page object
 */
export async function navigateToCheckout(page: Page): Promise<void> {
  // Go to cart
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.waitForURL(/.*cart.html/);
  
  // Click checkout button
  await page.locator('[data-test="checkout"]').click();
  await page.waitForURL(/.*checkout-step-one.html/);
}

/**
 * Fill checkout information
 * @param page - Playwright page object
 * @param info - Checkout info {firstName, lastName, postalCode}
 */
export async function fillCheckoutInfo(
  page: Page,
  info: { firstName: string; lastName: string; postalCode: string }
): Promise<void> {
  await page.locator('[data-test="firstName"]').fill(info.firstName);
  await page.locator('[data-test="lastName"]').fill(info.lastName);
  await page.locator('[data-test="postalCode"]').fill(info.postalCode);
  
  // Click continue
  await page.locator('[data-test="continue"]').click();
  
  // Wait for navigation to overview
  await page.waitForURL(/.*checkout-step-two.html/);
}

/**
 * Complete checkout
 * @param page - Playwright page object
 */
export async function completeCheckout(page: Page): Promise<void> {
  // Click finish button
  await page.locator('[data-test="finish"]').click();
  
  // Wait for order completion page
  await page.waitForURL(/.*checkout-complete.html/);
}

/**
 * Verify order completion
 * @param page - Playwright page object
 */
export async function verifyOrderCompletion(page: Page): Promise<void> {
  // Verify confirmation message
  await expect(page.locator('text=Thank you for your order')).toBeVisible();
  
  // Verify back home button exists
  await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
}

/**
 * Helper to measure auth setup time
 * Useful for performance benchmarking
 */
export async function measureAuthSetupTime(): Promise<number> {
  const startTime = Date.now();
  
  // Check if auth files exist
  const userAuthExists = fs.existsSync('playwright/.auth/user.json');
  const adminAuthExists = fs.existsSync('playwright/.auth/admin.json');
  
  const setupTime = Date.now() - startTime;
  
  console.log(`⏱️  Auth setup check: ${setupTime}ms`);
  console.log(`   - User auth exists: ${userAuthExists}`);
  console.log(`   - Admin auth exists: ${adminAuthExists}`);
  
  return setupTime;
}

export { expect };
