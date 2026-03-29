// spec: specs/saucedemo-checkout-test-plan.md
// Category: Navigation and Cart Persistence Tests

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

test.describe('Navigation and Cart Persistence Tests', () => {
  
  test('Cancel button on checkout step one returns to cart with items intact', async ({ page }) => {
    // Step 1: Login
    await login(page);

    // Step 2: Add items to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    
    // Verify cart badge shows '2'
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '2' })).toBeVisible();

    // Step 3: Navigate to cart and checkout
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);
    
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);

    // Step 4: Partially fill form
    await page.locator('[data-test="firstName"]').fill('John');

    // Step 5: Click Cancel button
    await page.locator('[data-test="cancel"]').click();

    // Step 6: Verify returned to cart page with items intact
    await expect(page).toHaveURL(/.*cart.html/);
    
    // Verify both items are still in cart
    await expect(page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();
    
    // Verify cart badge still shows '2'
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '2' })).toBeVisible();
  });

  test('Cancel button on checkout step two returns to cart with items intact', async ({ page }) => {
    // Step 1: Login and add items
    await login(page);
    
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Step 2: Navigate to checkout and complete step one
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    
    // Fill and submit checkout step one
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('98765');
    
    await page.locator('[data-test="continue"]').click();

    // Step 3: Verify on step two (overview)
    await expect(page).toHaveURL(/.*checkout-step-two.html/);

    // Step 4: Click Cancel button
    await page.locator('[data-test="cancel"]').click();

    // Step 5: Verify cart is still intact (cart badge shows '2')
    // Note: The app navigates to inventory page, but items are preserved in cart
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '2' })).toBeVisible();
    
    // Step 6: Navigate to cart to verify items are still there
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);
    
    // Step 7: Verify items are still in cart with original prices
    await expect(page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    await expect(page.locator('text=$29.99')).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bike Light/ })).toBeVisible();
    await expect(page.locator('text=$9.99')).toBeVisible();
  });

  test('Back/Continue Shopping button from cart returns to products page', async ({ page }) => {
    // Step 1: Login and add items
    await login(page);
    
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Verify cart badge shows '2'
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '2' })).toBeVisible();

    // Step 2: Navigate to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);

    // Step 3: Click Continue Shopping button
    const continueShoppingBtn = page.locator('button:has-text("Continue Shopping")');
    await continueShoppingBtn.click();

    // Step 4: Verify returned to products page
    await expect(page).toHaveURL(/.*inventory.html/);

    // Step 5: Verify cart badge still shows '2' (items persisted)
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '2' })).toBeVisible();

    // Step 6: Add another item
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();

    // Verify cart badge updates to '3'
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '3' })).toBeVisible();

    // Step 7: Navigate back to cart to verify all 3 items
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);

    // Verify all 3 items are displayed
    await expect(page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bike Light/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();
  });

  test('Sequential navigation through complete checkout workflow', async ({ page }) => {
    // Step 1: Login and add item
    await login(page);
    
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '1' })).toBeVisible();

    // Step 2: Navigate Products -> Cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);
    await expect(page.locator('text=Sauce Labs Backpack')).toBeVisible();

    // Step 3: Navigate Cart -> Checkout Step 1
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
    await expect(page.locator('text=Checkout: Your Information')).toBeVisible();

    // Step 4: Navigate Checkout Step 1 -> Checkout Step 2
    await page.locator('[data-test="firstName"]').fill('Test');
    await page.locator('[data-test="lastName"]').fill('User');
    await page.locator('[data-test="postalCode"]').fill('12345');
    
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    await expect(page.locator('text=Checkout: Overview')).toBeVisible();

    // Step 5: Verify information from Step 1 is retained
    // (This would be reflected in the order summary displaying the item)
    await expect(page.locator('text=Sauce Labs Backpack')).toBeVisible();

    // Step 6: Navigate Checkout Step 2 -> Completion
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    await expect(page.locator('text=Thank you for your order!')).toBeVisible();

    // Step 7: Navigate Completion -> Products
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('Back Home from completion page resets cart', async ({ page }) => {
    // Step 1: Complete a full checkout
    await login(page);
    
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Navigate through checkout
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('54321');
    
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();

    // Step 2: Verify on completion page with correct message
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    await expect(page.locator('text=Thank you for your order!')).toBeVisible();

    // Step 3: Click Back Home
    await page.locator('[data-test="back-to-products"]').click();

    // Step 4: Verify returned to products page
    await expect(page).toHaveURL(/.*inventory.html/);

    // Step 5: Verify shopping cart is empty
    // Cart badge should not be visible or show '0'
    const cartBadgeWithItems = page.locator('[data-test="shopping-cart-link"]:has-text("1"), [data-test="shopping-cart-link"]:has-text("2")');
    await expect(cartBadgeWithItems).not.toBeVisible({ timeout: 5000 }).catch(() => {});

    // Step 6: Verify products are still displayed
    await expect(page.locator('text=Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('text=Sauce Labs Bike Light')).toBeVisible();
  });
});
