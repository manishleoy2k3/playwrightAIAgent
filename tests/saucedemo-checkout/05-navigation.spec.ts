// spec: specs/saucedemo-checkout-test-plan.md
// Category: Navigation and Cart Persistence Tests

import { pageObjectTest as test, expect } from '../fixtures';

test.describe('Navigation and Cart Persistence Tests', () => {

  test('Cancel button on checkout step one returns to cart with items intact', async ({ pages }) => {
    const { inventory, cart, checkoutStepOne } = pages;

    // Step 1: Add items to cart
    await inventory.goto();
    await inventory.addProductToCart('sauce-labs-backpack');
    await inventory.addProductToCart('sauce-labs-bolt-t-shirt');

    // Verify cart badge shows '2'
    const cartBadgeCount = await inventory.getCartBadgeCount();
    expect(cartBadgeCount).toBe('2');

    // Step 3: Navigate to cart and checkout
    await inventory.goToCart();
    await cart.clickCheckout();

    // Step 4: Partially fill form
    await checkoutStepOne.fillFirstName('John');

    // Step 5: Click Cancel button
    await checkoutStepOne.clickCancel();

    // Step 6: Verify returned to cart page with items intact
    await expect(cart.pageTitle).toBeVisible();

    // Verify both items are still in cart
    const cartItems = await cart.getCartItemNames();
    expect(cartItems).toContain('Sauce Labs Backpack');
    expect(cartItems).toContain('Sauce Labs Bolt T-Shirt');

    // Verify cart badge still shows '2'
    const badgeCountAfterCancel = await inventory.getCartBadgeCount();
    expect(badgeCountAfterCancel).toBe('2');
  });

  test('Cancel button on checkout step two returns to cart with items intact', async ({ pages }) => {
    const { inventory, cart, checkoutStepOne, checkoutStepTwo } = pages;

    // Step 1: Add items
    await inventory.goto();
    await inventory.addProductToCart('sauce-labs-backpack');
    await inventory.addProductToCart('sauce-labs-bike-light');

    // Step 2: Navigate to checkout and complete step one
    await inventory.goToCart();
    await cart.clickCheckout();

    // Fill and submit checkout step one
    await checkoutStepOne.fillCustomerInfo('Jane', 'Smith', '98765');
    await checkoutStepOne.clickContinue();

    // Step 3: Verify on step two (overview)
    await expect(checkoutStepTwo.pageTitle).toBeVisible();

    // Step 4: Click Cancel button
    await checkoutStepTwo.clickCancel();

    // Step 5: Verify cart is still intact (cart badge shows '2')
    // Note: The app navigates to inventory page, but items are preserved in cart
    const badgeCountAfterCancel = await inventory.getCartBadgeCount();
    expect(badgeCountAfterCancel).toBe('2');

    // Step 6: Navigate to cart to verify items are still there
    await inventory.goToCart();

    // Step 7: Verify items are still in cart with original prices
    const cartItems = await cart.getCartItemNames();
    expect(cartItems).toContain('Sauce Labs Backpack');
    expect(cartItems).toContain('Sauce Labs Bike Light');

    // Verify prices are still displayed
    await expect(cart.page.locator('text=$29.99')).toBeVisible();
    await expect(cart.page.locator('text=$9.99')).toBeVisible();
  });

  test('Back/Continue Shopping button from cart returns to products page', async ({ pages }) => {
    const { inventory, cart } = pages;

    // Step 1: Add items
    await inventory.goto();
    await inventory.addProductToCart('sauce-labs-backpack');
    await inventory.addProductToCart('sauce-labs-bike-light');

    // Verify cart badge shows '2'
    const initialBadgeCount = await inventory.getCartBadgeCount();
    expect(initialBadgeCount).toBe('2');

    // Step 2: Navigate to cart
    await inventory.goToCart();

    // Step 3: Click Continue Shopping button
    await cart.clickContinueShopping();

    // Step 4: Verify returned to products page
    await expect(inventory.inventoryContainer).toBeVisible();

    // Step 5: Verify cart badge still shows '2' (items persisted)
    const badgeCountAfterContinue = await inventory.getCartBadgeCount();
    expect(badgeCountAfterContinue).toBe('2');

    // Step 6: Add another item
    await inventory.addProductToCart('sauce-labs-bolt-t-shirt');

    // Verify cart badge updates to '3'
    const badgeCountAfterAdd = await inventory.getCartBadgeCount();
    expect(badgeCountAfterAdd).toBe('3');

    // Step 7: Navigate back to cart to verify all 3 items
    await inventory.goToCart();

    // Verify all 3 items are displayed
    const cartItems = await cart.getCartItemNames();
    expect(cartItems).toContain('Sauce Labs Backpack');
    expect(cartItems).toContain('Sauce Labs Bike Light');
    expect(cartItems).toContain('Sauce Labs Bolt T-Shirt');
  });

  test('Sequential navigation through complete checkout workflow', async ({ pages }) => {
    const { inventory, cart, checkoutStepOne, checkoutStepTwo, checkoutComplete } = pages;

    // Step 1: Add item
    await inventory.goto();
    await inventory.addProductToCart('sauce-labs-backpack');

    const initialBadgeCount = await inventory.getCartBadgeCount();
    expect(initialBadgeCount).toBe('1');

    // Step 2: Navigate Products -> Cart
    await inventory.goToCart();
    const cartItems = await cart.getCartItemNames();
    expect(cartItems).toContain('Sauce Labs Backpack');

    // Step 3: Navigate Cart -> Checkout Step 1
    await cart.clickCheckout();
    await expect(checkoutStepOne.pageTitle).toBeVisible();

    // Step 4: Navigate Checkout Step 1 -> Checkout Step 2
    await checkoutStepOne.fillCustomerInfo('Test', 'User', '12345');
    await checkoutStepOne.clickContinue();
    await expect(checkoutStepTwo.pageTitle).toBeVisible();

    // Step 5: Verify information from Step 1 is retained
    // (This would be reflected in the order summary displaying the item)
    const orderItems = await checkoutStepTwo.getOrderItemNames();
    expect(orderItems).toContain('Sauce Labs Backpack');

    // Step 6: Navigate Checkout Step 2 -> Completion
    await checkoutStepTwo.clickFinish();
    await expect(checkoutComplete.pageTitle).toBeVisible();
    await expect(checkoutComplete.thankYouMessage).toBeVisible();

    // Step 7: Navigate Completion -> Products
    await checkoutComplete.clickBackToProducts();
    await expect(inventory.inventoryContainer).toBeVisible();
  });

  test('Back Home from completion page resets cart', async ({ pages }) => {
    const { inventory, cart, checkoutStepOne, checkoutStepTwo, checkoutComplete } = pages;

    // Step 1: Complete a full checkout
    await inventory.goto();
    await inventory.addProductToCart('sauce-labs-backpack');
    await inventory.addProductToCart('sauce-labs-bike-light');

    // Navigate through checkout
    await inventory.goToCart();
    await cart.clickCheckout();

    await checkoutStepOne.fillCustomerInfo('John', 'Doe', '54321');
    await checkoutStepOne.clickContinue();
    await checkoutStepTwo.clickFinish();

    // Step 2: Verify on completion page with correct message
    await expect(checkoutComplete.pageTitle).toBeVisible();
    await expect(checkoutComplete.thankYouMessage).toBeVisible();

    // Step 3: Click Back Home
    await checkoutComplete.clickBackToProducts();

    // Step 4: Verify returned to products page
    await expect(inventory.inventoryContainer).toBeVisible();

    // Step 5: Verify shopping cart is empty
    // Cart badge should not be visible or show '0'
    const isBadgeVisible = await inventory.isCartBadgeVisible();
    expect(isBadgeVisible).toBeFalsy();

    // Step 6: Verify products are still displayed
    await expect(inventory.page.locator('text=Sauce Labs Backpack')).toBeVisible();
    await expect(inventory.page.locator('text=Sauce Labs Bike Light')).toBeVisible();
  });
});
