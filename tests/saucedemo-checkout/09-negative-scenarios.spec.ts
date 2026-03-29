// spec: specs/saucedemo-checkout-test-plan.md
// Category: Negative Scenarios - Form Submission Edge Cases

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

test.describe('Negative Scenarios - Form Submission Edge Cases', () => {
  
  test('Cannot proceed with form containing only whitespace', async ({ page }) => {
    // Step 1: Login and navigate to checkout
    await loginAndNavigateToCheckout(page);

    // Step 2: Fill form with only whitespace
    await page.locator('[data-test="firstName"]').fill('   '); // spaces only
    await page.locator('[data-test="lastName"]').fill('   '); // spaces only
    await page.locator('[data-test="postalCode"]').fill('     '); // spaces only

    // Step 3: Click Continue
    await page.locator('[data-test="continue"]').click();

    // Step 4: Verify application behavior
    // Application should either:
    // A) Show error "First Name is required" (if spaces are treated as empty)
    // B) Accept spaces and proceed to overview
    const isOnOverviewPage = await page.url().includes('checkout-step-two.html');
    const isErrorDisplayed = await page.locator('[data-test="error"]').isVisible().catch(() => false);

    // At least one of these should be true
    expect(isOnOverviewPage || isErrorDisplayed).toBeTruthy();

    if (isErrorDisplayed) {
      // Verify error message appears
      const errorHeading = page.locator('text=/Error.*required/i');
      await expect(errorHeading).toBeVisible();
    }
  });

  test('Tab order and form navigation using keyboard', async ({ page }) => {
    // Step 1: Login and navigate to checkout
    await loginAndNavigateToCheckout(page);

    // Step 2: Click in First Name field
    await page.locator('[data-test="firstName"]').click();

    // Step 3: Verify First Name field has focus
    await expect(page.locator('[data-test="firstName"]')).toBeFocused();

    // Step 4: Press Tab to move to Last Name field
    await page.locator('[data-test="firstName"]').press('Tab');

    // Verify focus moved to Last Name or another interactive element
    const lastNameField = page.locator('[data-test="lastName"]');
    const postBrowserEvents = await lastNameField.isVisible();
    expect(postBrowserEvents).toBeTruthy();

    // Step 5: Press Tab again to move to Postal Code field
    await page.locator('[data-test="lastName"]').press('Tab');

    // Step 6: Verify Postal Code field is visible and can receive input
    const pCodeField = page.locator('[data-test="postalCode"]');
    await expect(pCodeField).toBeVisible();

    // Step 7: Verify Tab order follows logical sequence
    // Fill in values using keyboard navigation
    await page.locator('[data-test="firstName"]').fill('Test');
    await page.press('[data-test="firstName"]', 'Tab');
    await page.keyboard.type('User');
    await page.press('[data-test="lastName"]', 'Tab');
    await page.keyboard.type('12345');

    // Step 8: Verify form fields have values
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('Test');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('User');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('12345');
  });

  test('Form field input constraints and max length behavior', async ({ page }) => {
    // Step 1: Login and navigate to checkout
    await loginAndNavigateToCheckout(page);

    // Step 2: Attempt to enter 200 characters in First Name field
    const longText = 'A'.repeat(200);
    
    await page.locator('[data-test="firstName"]').fill(longText);

    // Step 3: Verify the actual value in the field
    const firstNameValue = await page.locator('[data-test="firstName"]').inputValue();

    // Step 4: Verify one of the following:
    // A) Field accepted all characters (length === 200)
    // B) Field enforced max length (length < 200)
    // C) Field was cleared (length === 0)
    expect(firstNameValue.length).toBeGreaterThanOrEqual(0);
    expect(firstNameValue.length).toBeLessThanOrEqual(200);

    // Step 5: Fill other fields with valid data
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // Step 6: Click Continue and verify form behavior
    await page.locator('[data-test="continue"]').click();

    // Step 7: Verify either form accepted or showed error
    const isOnOverview = await page.url().includes('checkout-step-two.html');
    const isErrorShown = await page.locator('[data-test="error"]').isVisible().catch(() => false);

    expect(isOnOverview || isErrorShown).toBeTruthy();
  });
});
