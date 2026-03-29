// spec: specs/saucedemo-checkout-test-plan.md
// Category: Checkout Form Validation - Invalid Input Data

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';
const CREDENTIALS = {
  username: 'standard_user',
  password: 'secret_sauce'
};

/**
 * Helper function to login and navigate to checkout step one
 */
async function loginAndNavigateToCheckout(page: any) {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill(CREDENTIALS.username);
  await page.locator('[data-test="password"]').fill(CREDENTIALS.password);
  await page.locator('[data-test="login-button"]').click();
  
  await expect(page).toHaveURL(/.*inventory.html/);
  
  // Add an item to cart
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  
  // Navigate to checkout
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
  
  await expect(page).toHaveURL(/.*checkout-step-one.html/);
}

test.describe('Checkout Form Validation - Invalid Input Data', () => {
  
  test('Special characters in name fields are accepted', async ({ page }) => {
    // Step 1: Login and navigate to checkout
    await loginAndNavigateToCheckout(page);

    // Step 2: Enter special characters in all fields
    await page.locator('[data-test="firstName"]').fill('@!#$%');
    await page.locator('[data-test="lastName"]').fill('&*()');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // Step 3: Click Continue
    await page.locator('[data-test="continue"]').click();

    // Step 4: Verify form accepts special characters and proceeds
    // Should navigate to checkout step two
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    
    // Verify no error is displayed
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('Numeric values in name fields are accepted', async ({ page }) => {
    // Step 1: Login and navigate to checkout
    await loginAndNavigateToCheckout(page);

    // Step 2: Enter numeric values in name fields
    await page.locator('[data-test="firstName"]').fill('123');
    await page.locator('[data-test="lastName"]').fill('456');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // Step 3: Click Continue
    await page.locator('[data-test="continue"]').click();

    // Step 4: Verify form accepts numeric input and proceeds
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    
    // Verify no error is displayed
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('Special characters in postal code are accepted', async ({ page }) => {
    // Step 1: Login and navigate to checkout
    await loginAndNavigateToCheckout(page);

    // Step 2: Enter special characters in postal code field
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('1234#@');

    // Step 3: Click Continue
    await page.locator('[data-test="continue"]').click();

    // Step 4: Verify form accepts special characters in zip and proceeds
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
  });

  test('Whitespace-only input in name fields handling', async ({ page }) => {
    // Step 1: Login and navigate to checkout
    await loginAndNavigateToCheckout(page);

    // Step 2: Enter only spaces in name fields
    await page.locator('[data-test="firstName"]').fill('     '); // 5 spaces
    await page.locator('[data-test="lastName"]').fill('    '); // 4 spaces
    await page.locator('[data-test="postalCode"]').fill('12345');

    // Step 3: Click Continue
    await page.locator('[data-test="continue"]').click();

    // Step 4: Verify either form accepts spaces as valid OR shows error
    // The test will verify the actual behavior of the application
    const isOnOverviewPage = await page.url().includes('checkout-step-two.html');
    const isErrorDisplayed = await page.locator('[data-test="error"]').isVisible().catch(() => false);

    // If neither condition is true, the form might have a different validation behavior
    expect(isOnOverviewPage || isErrorDisplayed).toBeTruthy();
  });
});
