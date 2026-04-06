// spec: specs/saucedemo-checkout-test-plan.md
// Category: Order Overview and Price Calculation Tests

import { pageObjectTest as test, expect } from '../fixtures';

const BASE_URL = 'https://www.saucedemo.com';

test.describe('Order Overview and Price Calculation Tests', () => {

  test('Verify correct price calculations with 2 items', async ({ pages }) => {
    // Step 1: Add Backpack + Bolt T-Shirt
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.addProductToCart('sauce-labs-bolt-t-shirt');

    // Navigate to checkout overview
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();
    await pages.checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
    await pages.checkoutStepOne.clickContinue();

    // Step 2: Verify order overview displays items
    await expect(pages.checkoutStepTwo.isItemInOrderSummary('Sauce Labs Backpack')).toBe(true);
    await expect(pages.checkoutStepTwo.isItemInOrderSummary('Sauce Labs Bolt T-Shirt')).toBe(true);

    // Step 3: Verify correct calculations
    // Item total: $45.98 (29.99 + 15.99)
    expect(await pages.checkoutStepTwo.getItemTotal()).toBe('$45.98');

    // Tax: $3.68 (approximately 8% of 45.98)
    expect(await pages.checkoutStepTwo.getTaxAmount()).toBe('$3.68');

    // Total: $49.66 (45.98 + 3.68)
    expect(await pages.checkoutStepTwo.getOrderTotal()).toBe('$49.66');
  });

  test('Verify correct price calculations with multiple items (4+)', async ({ pages }) => {
    // Step 1: Add 4 items
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.addProductToCart('sauce-labs-bike-light');
    await pages.inventory.addProductToCart('sauce-labs-bolt-t-shirt');
    await pages.inventory.addProductToCart('sauce-labs-onesie');

    // Navigate to checkout overview
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();
    await pages.checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
    await pages.checkoutStepOne.clickContinue();

    // Step 2: Verify all items are displayed
    await expect(pages.checkoutStepTwo.isItemVisible('Sauce Labs Backpack')).toBe(true);
    await expect(pages.checkoutStepTwo.isItemVisible('Sauce Labs Bike Light')).toBe(true);
    await expect(pages.checkoutStepTwo.isItemVisible('Sauce Labs Bolt T-Shirt')).toBe(true);
    await expect(pages.checkoutStepTwo.isItemVisible('Sauce Labs Onesie')).toBe(true);

    // Step 3: Verify correct calculations
    // Item total: $63.96 (29.99 + 9.99 + 15.99 + 7.99)
    expect(await pages.checkoutStepTwo.getItemTotal()).toBe('$63.96');

    // Tax: $5.12 (approximately 8% of 63.96)
    expect(await pages.checkoutStepTwo.getTaxAmount()).toBe('$5.12');

    // Total: $69.08 (63.96 + 5.12)
    expect(await pages.checkoutStepTwo.getOrderTotal()).toBe('$69.08');
  });

  test('Verify order overview displays correct payment and shipping info', async ({ pages }) => {
    // Step 1: Add item and navigate to overview
    await pages.inventory.addProductToCart('sauce-labs-backpack');

    // Navigate to checkout overview
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();
    await pages.checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
    await pages.checkoutStepOne.clickContinue();

    // Step 2: Verify Payment Information section
    expect(await pages.checkoutStepTwo.isPaymentInfoVisible()).toBe(true);

    // Step 3: Verify Shipping Information section
    expect(await pages.checkoutStepTwo.isShippingInfoVisible()).toBe(true);
  });

});
  });

  test('Order overview displays complete item details', async ({ authenticatedPage: page }) => {
    // Step 1: Add 2 items and navigate to overview
    const items = [
      { selector: '[data-test="add-to-cart-sauce-labs-backpack"]' },
      { selector: '[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]' }
    ];
    
    await navigateToOverview(page, items);

    // Step 2: Verify overview page heading
    await expect(page.locator('text=Checkout: Overview')).toBeVisible();

    // Step 3: Get price texts to verify item details
    const priceElements = await page.locator('text=$29.99').all();
    expect(priceElements.length).toBeGreaterThan(0);

    const priceElements2 = await page.locator('text=$15.99').all();
    expect(priceElements2.length).toBeGreaterThan(0);

    // Step 4: Verify each item displays required information
    // Item 1: Backpack
    await expect(page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    
    // Item 2: Bolt T-Shirt
    await expect(page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();

    // Step 5: Verify price summary section exists
    await expect(page.locator('text=Item total:')).toBeVisible();
    await expect(page.locator('text=Tax:')).toBeVisible();
    await expect(page.locator('[data-test="total-label"]')).toBeVisible();
  });
});
