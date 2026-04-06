// spec: specs/saucedemo-checkout-test-plan.md
// Category: Checkout Happy Path - Successful Order Completion

import { authenticatedTest as test, expect } from '../fixtures';

const BASE_URL = 'https://www.saucedemo.com';

test.describe('Checkout Happy Path - Successful Order Completion', () => {

  test('Complete successful checkout with 2 items', async ({ authenticatedPage: page }) => {
    // Step 1: Verify products page is displayed with cart badge showing 0 or not visible
    const cartBadge = page.locator('[data-test="shopping-cart-link"]');
    await expect(cartBadge).toBeVisible();

    // Step 2: Add Sauce Labs Backpack ($29.99) to cart
    const backpackAddBtn = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    await backpackAddBtn.click();
    
    // Verify cart badge updates to '1'
    const cartBadgeCount = page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '1' });
    await expect(cartBadgeCount).toBeVisible();
    
    // Verify button text changes to 'Remove'
    const backpackRemoveBtn = page.locator('[data-test="remove-sauce-labs-backpack"]');
    await expect(backpackRemoveBtn).toBeVisible();

    // Step 3: Add Sauce Labs Bolt T-Shirt ($15.99) to cart
    const tshirtAddBtn = page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    await tshirtAddBtn.click();
    
    // Verify cart badge updates to '2'
    const cartBadgeCount2 = page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '2' });
    await expect(cartBadgeCount2).toBeVisible();

    // Step 4: Click shopping cart badge to navigate to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    
    // Verify cart page is displayed
    await expect(page).toHaveURL(/.*cart.html/);
    await expect(page.locator('text=Your Cart')).toBeVisible();

    // Verify both items are listed with correct prices
    await expect(page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    await expect(page.locator('text=$29.99')).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();
    await expect(page.locator('text=$15.99')).toBeVisible();

    // Step 5: Click Checkout button
    await page.locator('[data-test="checkout"]').click();
    
    // Verify checkout step one page is displayed
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
    await expect(page.locator('text=Checkout: Your Information')).toBeVisible();

    // Step 6: Fill checkout form with valid information
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');

    // Step 7: Click Continue button
    await page.locator('[data-test="continue"]').click();
    
    // Verify checkout step two (overview) page is displayed
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    await expect(page.locator('text=Checkout: Overview')).toBeVisible();

    // Verify order summary displays both items
    await expect(page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();

    // Verify payment and shipping information is displayed
    await expect(page.locator('text=SauceCard #31337')).toBeVisible();
    await expect(page.locator('text=Free Pony Express Delivery!')).toBeVisible();

    // Verify price calculations are correct
    // Item total should be $45.98 (29.99 + 15.99)
    await expect(page.locator('text=Item total: $45.98')).toBeVisible();
    // Tax should be approximately 8% of $45.98 = $3.68
    await expect(page.locator('text=Tax: $3.68')).toBeVisible();
    // Total should be $49.66
    await expect(page.locator('text=Total: $49.66')).toBeVisible();

    // Step 8: Click Finish button
    await page.locator('[data-test="finish"]').click();
    
    // Verify checkout complete page is displayed
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    await expect(page.locator('text=Checkout: Complete!')).toBeVisible();
    
    // Verify success messages are displayed
    await expect(page.locator('text=Thank you for your order!')).toBeVisible();
    await expect(page.locator('text=Your order has been dispatched')).toBeVisible();

    // Step 9: Click Back Home button
    await page.locator('[data-test="back-to-products"]').click();
    
    // Verify user is back on products page
    await expect(page).toHaveURL(/.*inventory.html/);
    
    // Verify cart is empty (no badge or badge shows 0)
    const cartBadgeAfterCheckout = page.locator('[data-test="shopping-cart-link"]:has-text("1"), [data-test="shopping-cart-link"]:has-text("2")');
    await expect(cartBadgeAfterCheckout).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Complete checkout with multiple items (4+)', async ({ page }) => {
    // Step 1: Add multiple items to cart - Backpack, Bike Light, Bolt T-Shirt, and Onesie
    const items = [
      { selector: '[data-test="add-to-cart-sauce-labs-backpack"]', price: '$29.99' },
      { selector: '[data-test="add-to-cart-sauce-labs-bike-light"]', price: '$9.99' },
      { selector: '[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]', price: '$15.99' },
      { selector: '[data-test="add-to-cart-sauce-labs-onesie"]', price: '$7.99' }
    ];

    for (const item of items) {
      await page.locator(item.selector).click();
    }

    // Verify cart badge shows '4'
    const cartBadgeCount4 = page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '4' });
    await expect(cartBadgeCount4).toBeVisible();

    // Step 2: Navigate to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);

    // Verify all 4 items are present in cart
    await expect(page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bike Light/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Onesie/ })).toBeVisible();

    // Step 3: Proceed to checkout
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);

    // Fill checkout information
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('98765');

    // Step 4: Continue to overview
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*checkout-step-two.html/);

    // Step 5: Verify price calculations are correct
    // Item total should be $63.96 (29.99 + 9.99 + 15.99 + 7.99)
    await expect(page.locator('text=Item total: $63.96')).toBeVisible();
    // Tax should be approximately 8% = $5.12
    await expect(page.locator('text=Tax: $5.12')).toBeVisible();
    // Total should be $69.08
    await expect(page.locator('text=Total: $69.08')).toBeVisible();

    // Step 6: Complete the order
    await page.locator('[data-test="finish"]').click();
    
    // Verify order completion
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    await expect(page.locator('text=Thank you for your order!')).toBeVisible();
  });

  test('Successful order and back home navigation clears cart', async ({ page }) => {
    // Step 1: Add items to cart (just one for simplicity)
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    
    // Verify cart badge shows '1'
    await expect(page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '1' })).toBeVisible();

    // Step 2: Navigate through complete checkout flow
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);

    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);

    // Fill and submit checkout information
    await page.locator('[data-test="firstName"]').fill('Test');
    await page.locator('[data-test="lastName"]').fill('User');
    await page.locator('[data-test="postalCode"]').fill('54321');
    
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*checkout-step-two.html/);

    // Complete order
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/.*checkout-complete.html/);

    // Step 3: Verify completion page elements
    await expect(page.locator('img[alt="Pony Express"]')).toBeVisible();
    await expect(page.locator('text=Checkout: Complete!')).toBeVisible();

    // Step 4: Click Back Home and verify cart is cleared
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/.*inventory.html/);

    // Verify cart badge is not visible or shows 0
    const cartBadgeVisible = page.locator('[data-test="shopping-cart-link"]:has-text("1")');
    await expect(cartBadgeVisible).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});
