// spec: specs/saucedemo-checkout-test-plan.md
// Category: Checkout Form Validation - Missing Fields

import { authenticatedTest as test, expect } from '../fixtures';

const BASE_URL = 'https://www.saucedemo.com';

/**
 * Helper function to navigate to checkout step one (assumes authenticated page)
 */
async function navigateToCheckout(page: any) {
  // Add an item to cart
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  
  // Navigate to checkout
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
  
  await expect(page).toHaveURL(/.*checkout-step-one.html/);
  await expect(page.locator('text=Checkout: Your Information')).toBeVisible();
}

test.describe('Checkout Form Validation - Missing Fields', () => {
  
  test('Validation error when all fields are empty', async ({ authenticatedPage: page }) => {
    // Step 1: Navigate to checkout step one
    await navigateToCheckout(page);

    // Step 2: Click Continue without filling any fields
    await page.locator('[data-test="continue"]').click();

    // Step 3: Verify error notification is displayed with correct message
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(page.locator('text=/Error.*First Name is required/i')).toBeVisible();

    // Step 4: Verify page does not navigate to next step
    await expect(page).toHaveURL(/.*checkout-step-one.html/);

    // Step 5: Verify close button appears next to error
    const errorCloseBtn = page.locator('[data-test="error-button"]');
    await expect(errorCloseBtn).toBeVisible();

    // Step 6: Close the error notification
    await errorCloseBtn.click();

    // Verify error notification is dismissed
    await expect(errorMessage).not.toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('Validation error when first name is empty', async ({ authenticatedPage: page }) => {
    // Step 1: Navigate to checkout
    await navigateToCheckout(page);

    // Step 2: Leave First Name empty, fill Last Name and Zip
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // Step 3: Click Continue
    await page.locator('[data-test="continue"]').click();

    // Step 4: Verify error message is displayed
    await expect(page.locator('text=/Error.*First Name is required/i')).toBeVisible();

    // Step 5: Verify page doesn't navigate
    await expect(page).toHaveURL(/.*checkout-step-one.html/);

    // Step 6: Verify fields retain their values
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('Smith');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('12345');
  });

  test('Validation error when last name is empty', async ({ authenticatedPage: page }) => {
    // Step 1: Navigate to checkout
    await navigateToCheckout(page);

    // Step 2: Fill First Name and Zip, leave Last Name empty
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // Step 3: Click Continue
    await page.locator('[data-test="continue"]').click();

    // Step 4: Verify error message is displayed
    await expect(page.locator('text=/Error.*Last Name is required/i')).toBeVisible();

    // Step 5: Verify page doesn't navigate
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
  });

  test('Validation error when postal code is empty', async ({ authenticatedPage: page }) => {
    // Step 1: Navigate to checkout
    await navigateToCheckout(page);

    // Step 2: Fill First Name and Last Name, leave Zip empty
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');

    // Step 3: Click Continue
    await page.locator('[data-test="continue"]').click();

    // Step 4: Verify error message is displayed
    await expect(page.locator('text=/Error.*Postal Code is required/i')).toBeVisible();

    // Step 5: Verify page doesn't navigate
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
  });

  test('Validation error when only first name is filled', async ({ authenticatedPage: page }) => {
    // Step 1: Navigate to checkout
    await navigateToCheckout(page);

    // Step 2: Enter only First Name
    await page.locator('[data-test="firstName"]').fill('John');

    // Step 3: Click Continue
    await page.locator('[data-test="continue"]').click();

    // Step 4: Verify error for Last Name is required
    await expect(page.locator('text=/Error.*Last Name is required/i')).toBeVisible();

    // Step 5: Close error and fill Last Name
    await page.locator('[data-test="error-button"]').click();
    await expect(page.locator('[data-test="error"]')).not.toBeVisible({ timeout: 3000 }).catch(() => {});
    
    await page.locator('[data-test="lastName"]').fill('Doe');

    // Step 6: Click Continue again
    await page.locator('[data-test="continue"]').click();

    // Step 7: Verify error for Postal Code is required
    await expect(page.locator('text=/Error.*Postal Code is required/i')).toBeVisible();

    // Step 8: Verify still on checkout step one
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
  });
});
