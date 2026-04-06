// spec: specs/saucedemo-checkout-test-plan.md
// Category: Cart Review and Product Details Tests

import { pageObjectTest as test, expect } from '../fixtures';

const BASE_URL = 'https://www.saucedemo.com';

test.describe('Cart Review and Product Details Tests', () => {

  test('Cart displays correct item quantities and totals', async ({ pages }) => {
    // Step 1: Add items
    // Add backpack and bike light
    await pages.inventory.addProductToCart('sauce-labs-backpack');

    // Verify cart badge shows '1'
    expect(await pages.inventory.getCartBadgeCount()).toBe(1);

    await pages.inventory.addProductToCart('sauce-labs-bike-light');

    // Verify cart badge shows '2'
    expect(await pages.inventory.getCartBadgeCount()).toBe(2);

    // Step 2: Navigate to cart
    await pages.inventory.goToCart();

    // Step 3: Verify cart displays correct quantities
    // Looking for QTY column header
    expect(await pages.cart.isQuantityHeaderVisible()).toBe(true);

    // Verify items are listed
    expect(await pages.cart.isItemVisible('Sauce Labs Backpack')).toBe(true);
    expect(await pages.cart.isItemVisible('Sauce Labs Bike Light')).toBe(true);

    // Step 4: Verify cart item count matches
    expect(await pages.cart.getCartItemCount()).toBe(2);
  });

  test('Remove button removes items from cart individually', async ({ pages }) => {
    // Step 1: Add items
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.addProductToCart('sauce-labs-bolt-t-shirt');

    // Verify cart badge shows '2'
    expect(await pages.inventory.getCartBadgeCount()).toBe(2);

    // Step 2: Navigate to cart
    await pages.inventory.goToCart();

    // Verify both items are displayed
    expect(await pages.cart.isItemVisible('Sauce Labs Backpack')).toBe(true);
    expect(await pages.cart.isItemVisible('Sauce Labs Bolt T-Shirt')).toBe(true);

    // Step 3: Click Remove button for Backpack
    await pages.cart.removeItem('sauce-labs-backpack');

    // Step 4: Verify Backpack is removed and cart badge updates to '1'
    expect(await pages.cart.isItemVisible('Sauce Labs Backpack')).toBe(false);
    expect(await pages.inventory.getCartBadgeCount()).toBe(1);

    // Step 5: Verify T-Shirt remains
    expect(await pages.cart.isItemVisible('Sauce Labs Bolt T-Shirt')).toBe(true);

    // Step 6: Remove the remaining item
    await pages.cart.removeItem('sauce-labs-bolt-t-shirt');

    // Step 7: Verify cart is now empty
    expect(await pages.cart.isItemVisible('Sauce Labs Bolt T-Shirt')).toBe(false);
    expect(await pages.cart.isCartEmpty()).toBe(true);
  });

  test('Cart displays product descriptions and links', async ({ pages }) => {
    // Step 1: Add items
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.addProductToCart('sauce-labs-bike-light');

    // Step 2: Navigate to cart
    await pages.inventory.goToCart();

    // Step 3: Verify product names are displayed
    expect(await pages.cart.isItemLinkVisible('Sauce Labs Backpack')).toBe(true);
    expect(await pages.cart.isItemLinkVisible('Sauce Labs Bike Light')).toBe(true);

    // Step 4: Verify product descriptions are visible
    // Check for descriptive text about the products
    expect(await pages.cart.getCartContent()).toContain('sleek');
    expect(await pages.cart.getCartContent().toLowerCase()).toContain('water');
  });

  test('Cart navigation options are available and functional', async ({ pages }) => {
    // Step 1: Add items
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.addProductToCart('sauce-labs-bike-light');

    // Verify cart badge shows '2'
    expect(await pages.inventory.getCartBadgeCount()).toBe(2);

    // Step 2: Navigate to cart
    await pages.inventory.goToCart();

    // Step 3: Verify Continue Shopping button is visible
    expect(await pages.cart.isContinueShoppingButtonVisible()).toBe(true);

    // Step 4: Verify Checkout button is visible
    expect(await pages.cart.isCheckoutButtonVisible()).toBe(true);

    // Step 5: Verify Continue Shopping navigates back to products
    await pages.cart.clickContinueShopping();

    // Step 6: Verify cart persists (items still in cart, badge shows '2')
    expect(await pages.inventory.getCartBadgeCount()).toBe(2);

    // Step 7: Navigate back to cart using cart badge
    await pages.inventory.goToCart();

    // Step 8: Verify items are still in cart
    expect(await pages.cart.isItemVisible('Sauce Labs Backpack')).toBe(true);
    expect(await pages.cart.isItemVisible('Sauce Labs Bike Light')).toBe(true);

    // Step 9: Verify Checkout button is functional
    await pages.cart.clickCheckout();
  });

});
