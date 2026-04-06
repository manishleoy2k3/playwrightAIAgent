// spec: specs/saucedemo-checkout-test-plan.md
// Category: Order Overview and Price Calculation Tests

import { authenticatedTest as test, expect } from '../fixtures';

const BASE_URL = 'https://www.saucedemo.com';

/**
 * Helper function to navigate to checkout step two (assumes authenticated page)
 */
async function navigateToOverview(page: any, items: { selector: string }[], firstName: string = 'John', lastName: string = 'Doe', zip: string = '12345') {
  // Add items to cart
  for (const item of items) {
    await page.locator(item.selector).click();
  }
  
  // Navigate to checkout
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
  
  // Fill checkout step one
  await page.locator('[data-test="firstName"]').fill(firstName);
  await page.locator('[data-test="lastName"]').fill(lastName);
  await page.locator('[data-test="postalCode"]').fill(zip);
  
  // Navigate to overview
  await page.locator('[data-test="continue"]').click();
  
  await expect(page).toHaveURL(/.*checkout-step-two.html/);
}

test.describe('Order Overview and Price Calculation Tests', () => {
  
  test('Verify correct price calculations with 2 items', async ({ authenticatedPage: page }) => {
    // Step 1: Add Backpack + Bolt T-Shirt
    const items = [
      { selector: '[data-test="add-to-cart-sauce-labs-backpack"]', name: 'Backpack', price: 29.99 },
      { selector: '[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]', name: 'Bolt T-Shirt', price: 15.99 }
    ];
    
    await navigateToOverview(page, items);

    // Step 2: Verify order overview displays items
    await expect(page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();

    // Step 3: Verify correct calculations
    // Item total: $45.98 (29.99 + 15.99)
    await expect(page.locator('text=Item total: $45.98')).toBeVisible();
    
    // Tax: $3.68 (approximately 8% of 45.98)
    await expect(page.locator('text=Tax: $3.68')).toBeVisible();
    
    // Total: $49.66 (45.98 + 3.68)
    await expect(page.locator('text=Total: $49.66')).toBeVisible();
  });

  test('Verify correct price calculations with multiple items (4+)', async ({ authenticatedPage: page }) => {
    // Step 1: Add 4 items
    const items = [
      { selector: '[data-test="add-to-cart-sauce-labs-backpack"]', price: 29.99 },
      { selector: '[data-test="add-to-cart-sauce-labs-bike-light"]', price: 9.99 },
      { selector: '[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]', price: 15.99 },
      { selector: '[data-test="add-to-cart-sauce-labs-onesie"]', price: 7.99 }
    ];
    
    await navigateToOverview(page, items);

    // Step 2: Verify all items are displayed
    await expect(page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bike Light/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Bolt T-Shirt/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sauce Labs Onesie/ })).toBeVisible();

    // Step 3: Verify correct calculations
    // Item total: $63.96 (29.99 + 9.99 + 15.99 + 7.99)
    await expect(page.locator('text=Item total: $63.96')).toBeVisible();
    
    // Tax: $5.12 (approximately 8% of 63.96)
    await expect(page.locator('text=Tax: $5.12')).toBeVisible();
    
    // Total: $69.08 (63.96 + 5.12)
    await expect(page.locator('text=Total: $69.08')).toBeVisible();
  });

  test('Verify order overview displays correct payment and shipping info', async ({ authenticatedPage: page }) => {
    // Step 1: Navigate to overview
    const items = [
      { selector: '[data-test="add-to-cart-sauce-labs-backpack"]' }
    ];
    
    await navigateToOverview(page, items);

    // Step 2: Verify Payment Information section
    await expect(page.locator('text=Payment Information:')).toBeVisible();
    await expect(page.locator('text=SauceCard #31337')).toBeVisible();

    // Step 3: Verify Shipping Information section
    await expect(page.locator('text=Shipping Information:')).toBeVisible();
    await expect(page.locator('text=Free Pony Express Delivery!')).toBeVisible();
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
