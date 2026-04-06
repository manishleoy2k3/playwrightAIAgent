// spec: specs/saucedemo-checkout-test-plan.md
// Category: Order Completion and Confirmation Tests

import { pageObjectTest as test, expect } from '../fixtures';

const BASE_URL = 'https://www.saucedemo.com';

test.describe('Order Completion and Confirmation Tests', () => {

  test('Order confirmation page displays all required elements', async ({ pages }) => {
    // Step 1: Complete full checkout workflow
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();
    await pages.checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
    await pages.checkoutStepOne.clickContinue();
    await pages.checkoutStepTwo.clickFinish();

    // Step 2: Verify page title and heading
    expect(await pages.checkoutComplete.getPageTitle()).toBe('Checkout: Complete!');

    // Step 3: Verify success message heading
    expect(await pages.checkoutComplete.isThankYouMessageVisible()).toBe(true);

    // Step 4: Verify confirmation message
    expect(await pages.checkoutComplete.isOrderDispatchedMessageVisible()).toBe(true);
    expect(await pages.checkoutComplete.isPonyExpressMessageVisible()).toBe(true);

    // Step 5: Verify Pony Express image is displayed
    expect(await pages.checkoutComplete.isPonyExpressImageVisible()).toBe(true);

    // Step 6: Verify Back Home button is displayed and clickable
    expect(await pages.checkoutComplete.isBackToProductsButtonVisible()).toBe(true);
    expect(await pages.checkoutComplete.isBackToProductsButtonEnabled()).toBe(true);
  });

  test('Back Home button clears cart and returns to products page', async ({ pages }) => {
    // Step 1: Complete full checkout
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();
    await pages.checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
    await pages.checkoutStepOne.clickContinue();
    await pages.checkoutStepTwo.clickFinish();

    // Step 2: Verify we're on completion page
    expect(await pages.checkoutComplete.isOnCompletePage()).toBe(true);

    // Step 3: Verify cart badge shows 0 or is not visible before clicking Back Home
    // (order was already completed, so cart should be empty)
    expect(await pages.inventory.getCartBadgeCount()).toBe(0);

    // Step 4: Click Back Home button
    await pages.checkoutComplete.clickBackToProducts();

    // Step 5: Verify returned to products page
    expect(await pages.inventory.isOnInventoryPage()).toBe(true);

    // Step 6: Verify products are displayed
    expect(await pages.inventory.isProductVisible('Sauce Labs Backpack')).toBe(true);
    expect(await pages.inventory.isProductVisible('Sauce Labs Bike Light')).toBe(true);

    // Step 7: Verify shopping cart is empty (no badge or badge shows 0)
    expect(await pages.inventory.getCartBadgeCount()).toBe(0);

    // Step 8: Verify all 6 products are displayed (showing fresh inventory page)
    expect(await pages.inventory.getProductCount()).toBeGreaterThanOrEqual(6);
  });

  test('Order confirmation URL is correct', async ({ pages }) => {
    // Step 1: Complete full checkout
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();
    await pages.checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
    await pages.checkoutStepOne.clickContinue();
    await pages.checkoutStepTwo.clickFinish();

    // Step 2: Verify page URL is checkout-complete.html
    expect(await pages.checkoutComplete.getCurrentURL()).toContain('checkout-complete.html');
    expect(await pages.checkoutComplete.getCurrentURL()).toContain('https://www.saucedemo.com');

    // Step 3: Verify URL does not contain error codes or malformed paths
    expect(await pages.checkoutComplete.getCurrentURL()).not.toContain('404');
    expect(await pages.checkoutComplete.getCurrentURL()).not.toContain('error');

    // Step 4: Verify page title is correct
    expect(await pages.checkoutComplete.getPageTitle()).toBe('Checkout: Complete!');

    // Step 5: Verify page is loaded successfully (heading is visible)
    expect(await pages.checkoutComplete.isPageHeadingVisible()).toBe(true);

    // Step 6: Verify completion elements are present, confirming successful page load
    expect(await pages.checkoutComplete.isThankYouMessageVisible()).toBe(true);
  });

});
