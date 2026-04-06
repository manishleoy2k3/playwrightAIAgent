// spec: specs/saucedemo-checkout-test-plan.md
// Category: Checkout Happy Path - Successful Order Completion

import { pageObjectTest as test, expect } from '../fixtures';

test.describe('Checkout Happy Path - Successful Order Completion', () => {

  test('Complete successful checkout with 2 items', async ({ pages }) => {
    const { inventory, cart, checkoutStepOne, checkoutStepTwo, checkoutComplete } = pages;

    // Step 1: Verify products page is displayed with cart badge showing 0 or not visible
    await inventory.goto();
    await expect(inventory.shoppingCartLink).toBeVisible();

    // Step 2: Add Sauce Labs Backpack ($29.99) to cart
    await inventory.addProductToCart('sauce-labs-backpack');

    // Verify cart badge updates to '1'
    const cartBadgeCount = await inventory.getCartBadgeCount();
    expect(cartBadgeCount).toBe('1');

    // Verify button text changes to 'Remove'
    await expect(inventory.page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();

    // Step 3: Add Sauce Labs Bolt T-Shirt ($15.99) to cart
    await inventory.addProductToCart('sauce-labs-bolt-t-shirt');

    // Verify cart badge updates to '2'
    const cartBadgeCount2 = await inventory.getCartBadgeCount();
    expect(cartBadgeCount2).toBe('2');

    // Step 4: Click shopping cart badge to navigate to cart
    await inventory.goToCart();

    // Verify cart page is displayed
    await expect(cart.pageTitle).toBeVisible();

    // Verify both items are listed with correct prices
    await expect(cart.page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    await expect(cart.page.locator('text=$29.99')).toBeVisible();
    await expect(cart.page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();
    await expect(cart.page.locator('text=$15.99')).toBeVisible();

    // Step 5: Click Checkout button
    await cart.clickCheckout();

    // Verify checkout step one page is displayed
    await expect(checkoutStepOne.pageTitle).toBeVisible();

    // Step 6: Fill checkout form with valid information
    await checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');

    // Step 7: Click Continue button
    await checkoutStepOne.clickContinue();

    // Verify checkout step two (overview) page is displayed
    await expect(checkoutStepTwo.pageTitle).toBeVisible();

    // Verify order summary displays both items
    await expect(checkoutStepTwo.page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    await expect(checkoutStepTwo.page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();

    // Verify payment and shipping information is displayed
    await expect(checkoutStepTwo.page.locator('text=SauceCard #31337')).toBeVisible();
    await expect(checkoutStepTwo.page.locator('text=Free Pony Express Delivery!')).toBeVisible();

    // Verify price calculations are correct
    // Item total should be $45.98 (29.99 + 15.99)
    expect(await checkoutStepTwo.getItemTotal()).toContain('$45.98');
    // Tax should be approximately 8% of $45.98 = $3.68
    expect(await checkoutStepTwo.getTaxAmount()).toContain('$3.68');
    // Total should be $49.66
    expect(await checkoutStepTwo.getOrderTotal()).toContain('$49.66');

    // Step 8: Click Finish button
    await checkoutStepTwo.clickFinish();

    // Verify checkout complete page is displayed
    await expect(checkoutComplete.pageTitle).toBeVisible();

    // Verify success messages are displayed
    await expect(checkoutComplete.thankYouMessage).toBeVisible();
    await expect(checkoutComplete.orderDispatchedMessage).toBeVisible();

    // Step 9: Click Back Home button
    await checkoutComplete.clickBackToProducts();

    // Verify user is back on products page
    await expect(inventory.inventoryContainer).toBeVisible();

    // Verify cart is empty (no badge or badge shows 0)
    const isBadgeVisible = await inventory.isCartBadgeVisible();
    expect(isBadgeVisible).toBeFalsy();
  });

  test('Complete checkout with multiple items (4+)', async ({ pages }) => {
    const { inventory, cart, checkoutStepOne, checkoutStepTwo, checkoutComplete } = pages;

    // Step 1: Add multiple items to cart - Backpack, Bike Light, Bolt T-Shirt, and Onesie
    const items = [
      'sauce-labs-backpack',
      'sauce-labs-bike-light',
      'sauce-labs-bolt-t-shirt',
      'sauce-labs-onesie'
    ];

    await inventory.goto();
    for (const item of items) {
      await inventory.addProductToCart(item);
    }

    // Verify cart badge shows '4'
    const cartBadgeCount = await inventory.getCartBadgeCount();
    expect(cartBadgeCount).toBe('4');

    // Step 2: Navigate to cart
    await inventory.goToCart();

    // Verify all 4 items are present in cart
    const cartItems = await cart.getCartItemNames();
    expect(cartItems).toContain('Sauce Labs Backpack');
    expect(cartItems).toContain('Sauce Labs Bike Light');
    expect(cartItems).toContain('Sauce Labs Bolt T-Shirt');
    expect(cartItems).toContain('Sauce Labs Onesie');

    // Step 3: Proceed to checkout
    await cart.clickCheckout();

    // Fill checkout information
    await checkoutStepOne.fillCustomerInfo('Jane', 'Smith', '98765');

    // Step 4: Continue to overview
    await checkoutStepOne.clickContinue();

    // Step 5: Verify price calculations are correct
    // Item total should be $63.96 (29.99 + 9.99 + 15.99 + 7.99)
    expect(await checkoutStepTwo.getItemTotal()).toContain('$63.96');
    // Tax should be approximately 8% = $5.12
    expect(await checkoutStepTwo.getTaxAmount()).toContain('$5.12');
    // Total should be $69.08
    expect(await checkoutStepTwo.getOrderTotal()).toContain('$69.08');

    // Step 6: Complete the order
    await checkoutStepTwo.clickFinish();

    // Verify order completion
    await expect(checkoutComplete.pageTitle).toBeVisible();
    await expect(checkoutComplete.thankYouMessage).toBeVisible();
  });

  test('Successful order and back home navigation clears cart', async ({ pages }) => {
    const { inventory, cart, checkoutStepOne, checkoutStepTwo, checkoutComplete } = pages;

    // Step 1: Add items to cart (just one for simplicity)
    await inventory.goto();
    await inventory.addProductToCart('sauce-labs-backpack');

    // Verify cart badge shows '1'
    const cartBadgeCount = await inventory.getCartBadgeCount();
    expect(cartBadgeCount).toBe('1');

    // Step 2: Navigate through complete checkout flow
    await inventory.goToCart();
    await cart.clickCheckout();

    // Fill and submit checkout information
    await checkoutStepOne.fillCustomerInfo('Test', 'User', '54321');
    await checkoutStepOne.clickContinue();

    // Complete order
    await checkoutStepTwo.clickFinish();

    // Step 3: Verify completion page elements
    await expect(checkoutComplete.pageTitle).toBeVisible();
    await expect(checkoutComplete.checkmarkIcon).toBeVisible();

    // Step 4: Click Back Home and verify cart is cleared
    await checkoutComplete.clickBackToProducts();
    await expect(inventory.inventoryContainer).toBeVisible();

    // Verify cart badge is not visible or shows 0
    const isBadgeVisible = await inventory.isCartBadgeVisible();
    expect(isBadgeVisible).toBeFalsy();
  });
});
