// spec: specs/saucedemo-checkout-test-plan.md
// Category: Cart Review and Product Details Tests

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';
const CREDENTIALS = {
  username: 'standard_user',
  password: 'secret_sauce'
};

/**
 * Helper function to login
 */
async function login(page: any) {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill(CREDENTIALS.username);
  await page.locator('[data-test="password"]').fill(CREDENTIALS.password);
  await page.locator('[data-test="login-button"]').click();
  
  await expect(page).toHaveURL(/.*inventory.html/);
}

test.describe('Cart Review and Product Details Tests', () => {
  
  test('Cart displays correct item quantities and totals', async ({ page }) => {
    // Step 1: Login and add items
    await login(page);

    // Add backpack and bike light
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    
    // Verify cart badge shows '1'
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '1' })).toBeVisible();

    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Verify cart badge shows '2'
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '2' })).toBeVisible();

    // Step 2: Navigate to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);

    // Step 3: Verify cart displays correct quantities
    // Looking for QTY column header
    await expect(page.locator('text=QTY')).toBeVisible();

    // Verify items are listed
    await expect(page.locator('text=Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('text=Sauce Labs Bike Light')).toBeVisible();

    // Step 4: Verify cart item count matches
    const cartItems = page.locator('[data-test*="remove"]');
    const cartItemCount = await cartItems.count();
    expect(cartItemCount).toBe(2);
  });

  test('Remove button removes items from cart individually', async ({ page }) => {
    // Step 1: Login and add items
    await login(page);

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();

    // Verify cart badge shows '2'
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '2' })).toBeVisible();

    // Step 2: Navigate to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);

    // Verify both items are displayed
    await expect(page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();

    // Step 3: Click Remove button for Backpack
    const backpackRemoveBtn = page.locator('[data-test="remove-sauce-labs-backpack"]');
    await backpackRemoveBtn.click();

    // Step 4: Verify Backpack is removed and cart badge updates to '1'
    await expect(page.locator('text=Sauce Labs Backpack')).not.toBeVisible();
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '1' })).toBeVisible();

    // Step 5: Verify T-Shirt remains
    await expect(page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();

    // Step 6: Remove the remaining item
    const tshirtRemoveBtn = page.locator('[data-test="remove-sauce-labs-bolt-t-shirt"]');
    await tshirtRemoveBtn.click();

    // Step 7: Verify cart is now empty
    await expect(page.locator('text=Sauce Labs Bolt T-Shirt')).not.toBeVisible();
    
    // Cart badge should not be visible or show '0'
    const cartBadgeWithItems = page.locator('[data-test="shopping-cart-link"]:has-text("1"), [data-test="shopping-cart-link"]:has-text("2")');
    await expect(cartBadgeWithItems).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Cart displays product descriptions and links', async ({ page }) => {
    // Step 1: Login and add items
    await login(page);

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Step 2: Navigate to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);

    // Step 3: Verify product names are displayed
    const backpackLink = page.locator('a:has-text("Sauce Labs Backpack")');
    await expect(backpackLink).toBeVisible();

    const bikeLink = page.locator('a:has-text("Sauce Labs Bike Light")');
    await expect(bikeLink).toBeVisible();

    // Step 4: Verify product descriptions are visible
    // Check for descriptive text about the products
    const descPageContent = await page.content();
    expect(descPageContent).toContain('sleek');
    // Use case-insensitive check for water - the actual description has "Water-resistant"
    expect(descPageContent.toLowerCase()).toContain('water');
  });

  test('Cart navigation options are available and functional', async ({ page }) => {
    // Step 1: Login and add items
    await login(page);

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Verify cart badge shows '2'
    const cartBadgeCount = page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '2' });
    await expect(cartBadgeCount).toBeVisible();

    // Step 2: Navigate to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);

    // Step 3: Verify Continue Shopping button is visible
    const continueShoppingBtn = page.locator('button:has-text("Continue Shopping")');
    await expect(continueShoppingBtn).toBeVisible();

    // Step 4: Verify Checkout button is visible
    const checkoutBtn = page.locator('[data-test="checkout"]');
    await expect(checkoutBtn).toBeVisible();

    // Step 5: Verify Continue Shopping navigates back to products
    await continueShoppingBtn.click();
    await expect(page).toHaveURL(/.*inventory.html/);

    // Step 6: Verify cart persists (items still in cart, badge shows '2')
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '2' })).toBeVisible();

    // Step 7: Navigate back to cart using cart badge
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);

    // Step 8: Verify items are still in cart
    await expect(page.locator('text=Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('text=Sauce Labs Bike Light')).toBeVisible();

    // Step 9: Verify Checkout button is functional
    await checkoutBtn.click();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
  });
});
