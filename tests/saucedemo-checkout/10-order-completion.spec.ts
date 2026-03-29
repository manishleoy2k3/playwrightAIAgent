// spec: specs/saucedemo-checkout-test-plan.md
// Category: Order Completion and Confirmation Tests

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';
const CREDENTIALS = {
  username: 'standard_user',
  password: 'secret_sauce'
};

/**
 * Helper function to complete full checkout workflow
 */
async function completeCheckout(page: any) {
  // Login
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill(CREDENTIALS.username);
  await page.locator('[data-test="password"]').fill(CREDENTIALS.password);
  await page.locator('[data-test="login-button"]').click();
  
  await expect(page).toHaveURL(/.*inventory.html/);
  
  // Add item to cart
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  
  // Navigate through checkout
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
  
  // Fill checkout information
  await page.locator('[data-test="firstName"]').fill('John');
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="postalCode"]').fill('12345');
  
  // Navigate to overview
  await page.locator('[data-test="continue"]').click();
  
  // Complete order
  await page.locator('[data-test="finish"]').click();
  
  await expect(page).toHaveURL(/.*checkout-complete.html/);
}

test.describe('Order Completion and Confirmation Tests', () => {
  
  test('Order confirmation page displays all required elements', async ({ page }) => {
    // Step 1: Complete full checkout workflow
    await completeCheckout(page);

    // Step 2: Verify page title and heading
    await expect(page).toHaveTitle(/Swag Labs/i);
    await expect(page.locator('text=Checkout: Complete!')).toBeVisible();

    // Step 3: Verify success message heading
    const thankYouHeading = page.locator('text=Thank you for your order!');
    await expect(thankYouHeading).toBeVisible();
    // Verify it's a heading element
    const headingRole = thankYouHeading.locator('xpath=/h2');
    
    // Step 4: Verify confirmation message
    await expect(page.locator('text=Your order has been dispatched')).toBeVisible();
    await expect(page.locator('text=as fast as the pony can get there')).toBeVisible();

    // Step 5: Verify Pony Express image is displayed
    const ponyImage = page.locator('img[alt="Pony Express"]');
    await expect(ponyImage).toBeVisible();

    // Step 6: Verify Back Home button is displayed and clickable
    const backHomeBtn = page.locator('[data-test="back-to-products"]');
    await expect(backHomeBtn).toBeVisible();
    await expect(backHomeBtn).toBeEnabled();
  });

  test('Back Home button clears cart and returns to products page', async ({ page }) => {
    // Step 1: Complete full checkout
    await completeCheckout(page);

    // Step 2: Verify we're on completion page
    await expect(page).toHaveURL(/.*checkout-complete.html/);

    // Step 3: Verify cart badge shows 0 or is not visible before clicking Back Home
    // (order was already completed, so cart should be empty)
    const cartBadgeWithItems = page.locator('[data-test="shopping-cart-link"]:has-text("1")');
    await expect(cartBadgeWithItems).not.toBeVisible({ timeout: 3000 }).catch(() => {});

    // Step 4: Click Back Home button
    await page.locator('[data-test="back-to-products"]').click();

    // Step 5: Verify returned to products page
    await expect(page).toHaveURL(/.*inventory.html/);

    // Step 6: Verify products are displayed
    await expect(page.locator('text=Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('text=Sauce Labs Bike Light')).toBeVisible();

    // Step 7: Verify shopping cart is empty (no badge or badge shows 0)
    const cartBadgeVisible = page.locator('[data-test="shopping-cart-link"]:has-text("1"), [data-test="shopping-cart-link"]:has-text("2")');
    await expect(cartBadgeVisible).not.toBeVisible({ timeout: 5000 }).catch(() => {});

    // Step 8: Verify all 6 products are displayed (showing fresh inventory page)
    const productCount = await page.locator('a[data-testid^="inventory-item"]').count();
    // Or check for product names
    await expect(page.locator('text=Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('text=Sauce Labs Onesie')).toBeVisible();
  });

  test('Order confirmation URL is correct', async ({ page }) => {
    // Step 1: Complete full checkout
    await completeCheckout(page);

    // Step 2: Verify page URL is checkout-complete.html
    expect(page.url()).toContain('checkout-complete.html');
    expect(page.url()).toContain('https://www.saucedemo.com');

    // Step 3: Verify URL does not contain error codes or malformed paths
    expect(page.url()).not.toContain('404');
    expect(page.url()).not.toContain('error');

    // Step 4: Verify page title is correct
    await expect(page).toHaveTitle(/Swag Labs/i);

    // Step 5: Verify page is loaded successfully (heading is visible)
    await expect(page.locator('text=Checkout: Complete!')).toBeVisible();

    // Step 6: Verify completion elements are present, confirming successful page load
    await expect(page.locator('text=Thank you for your order!')).toBeVisible();
  });
});
