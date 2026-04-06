/**
 * Example: Refactored Happy Path Test using Page Object Model
 * 
 * This demonstrates how to use the Page Object Model for clean, reusable test code
 * Compare this with 01-happy-path.spec.ts to see the improvements
 */

import { pageObjectTest as test, expect } from '../fixtures';

test.describe('Checkout Happy Path - Using Page Objects', () => {
  
  test('Complete successful checkout with 2 items (POM)', async ({ pages }) => {
    const { inventory, cart, checkoutStepOne, checkoutStepTwo, checkoutComplete } = pages;

    // Navigate to inventory
    await inventory.goto();
    await expect(inventory.inventoryContainer).toBeVisible();

    // Add first product
    await inventory.addProductToCart('sauce-labs-backpack');
    const count1 = await inventory.getCartBadgeCount();
    expect(count1).toBe('1');

    // Add second product
    await inventory.addProductToCart('sauce-labs-bolt-t-shirt');
    const count2 = await inventory.getCartBadgeCount();
    expect(count2).toBe('2');

    // Navigate to cart
    await inventory.goToCart();
    await expect(cart.cartItemsContainer).toBeVisible();

    // Verify items in cart
    const itemNames = await cart.getCartItemNames();
    expect(itemNames).toContain('Sauce Labs Backpack');
    expect(itemNames).toContain('Sauce Labs Bolt T-Shirt');

    // Proceed to checkout
    await cart.clickCheckout();
    await expect(checkoutStepOne.pageTitle).toBeVisible();

    // Fill customer information
    await checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
    await checkoutStepOne.clickContinue();

    // Verify checkout overview page
    await expect(checkoutStepTwo.pageTitle).toBeVisible();
    const orderItems = await checkoutStepTwo.getOrderItemNames();
    expect(orderItems).toContain('Sauce Labs Backpack');
    expect(orderItems).toContain('Sauce Labs Bolt T-Shirt');

    // Verify pricing
    const itemTotal = await checkoutStepTwo.getItemTotal();
    const taxAmount = await checkoutStepTwo.getTaxAmount();
    const orderTotal = await checkoutStepTwo.getOrderTotal();

    expect(itemTotal).toContain('$45.98');
    expect(taxAmount).toContain('$3.68');
    expect(orderTotal).toContain('$49.66');

    // Complete checkout
    await checkoutStepTwo.clickFinish();

    // Verify order completion
    await expect(checkoutComplete.pageTitle).toBeVisible();
    await expect(checkoutComplete.thankYouMessage).toBeVisible();
    await expect(checkoutComplete.orderDispatchedMessage).toBeVisible();

    // Go back to products
    await checkoutComplete.clickBackToProducts();
    await inventory.goto();
    
    // Verify cart is empty
    const isEmpty = await inventory.page.locator('.shopping_cart_badge').isVisible();
    expect(isEmpty).toBeFalsy();
  });

  test('Multiple products checkout (POM)', async ({ pages }) => {
    const { inventory, cart, checkoutStepOne, checkoutStepTwo, checkoutComplete } = pages;

    await inventory.goto();

    // Add multiple products
    const products = [
      'sauce-labs-backpack',
      'sauce-labs-bolt-t-shirt',
      'sauce-labs-onesie',
      'sauce-labs-bike-light',
    ];

    for (const product of products) {
      await inventory.addProductToCart(product);
    }

    const cartCount = await inventory.getCartBadgeCount();
    expect(cartCount).toBe(String(products.length));

    // Navigate through checkout
    await inventory.goToCart();
    const items = await cart.getCartItemNames();
    expect(items.length).toBe(products.length);

    await cart.clickCheckout();
    await checkoutStepOne.fillCustomerInfo('Jane', 'Smith', '54321');
    await checkoutStepOne.clickContinue();

    const orderItemCount = await checkoutStepTwo.getOrderItemCount();
    expect(orderItemCount).toBe(products.length);

    await checkoutStepTwo.clickFinish();
    const isCompleted = await checkoutComplete.isCheckoutCompleteDisplayed();
    expect(isCompleted).toBeTruthy();
  });
});
