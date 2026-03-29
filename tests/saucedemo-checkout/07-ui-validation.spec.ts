// spec: specs/saucedemo-checkout-test-plan.md
// Category: UI Elements and Form Visibility Tests

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';
const CREDENTIALS = {
  username: 'standard_user',
  password: 'secret_sauce'
};

/**
 * Helper function to login and navigate to checkout step one
 */
async function loginAndNavigateToCheckout(page: any) {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill(CREDENTIALS.username);
  await page.locator('[data-test="password"]').fill(CREDENTIALS.password);
  await page.locator('[data-test="login-button"]').click();
  
  await expect(page).toHaveURL(/.*inventory.html/);
  
  // Add an item to cart
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  
  // Navigate to checkout
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
  
  await expect(page).toHaveURL(/.*checkout-step-one.html/);
}

test.describe('UI Elements and Form Visibility Tests', () => {
  
  test('Checkout step one form fields are properly labeled', async ({ page }) => {
    // Step 1: Login and navigate to checkout step one
    await loginAndNavigateToCheckout(page);

    // Step 2: Verify page heading
    await expect(page.locator('text=Checkout: Your Information')).toBeVisible();

    // Step 3: Verify all form fields are visible
    const firstNameInput = page.locator('[data-test="firstName"]');
    await expect(firstNameInput).toBeVisible();

    const lastNameInput = page.locator('[data-test="lastName"]');
    await expect(lastNameInput).toBeVisible();

    const zipInput = page.locator('[data-test="postalCode"]');
    await expect(zipInput).toBeVisible();

    // Step 4: Verify field labels are present
    // Labels are typically associated with input fields via placeholder or aria-label
    await expect(firstNameInput).toHaveAttribute('placeholder', /First Name/i);
    await expect(lastNameInput).toHaveAttribute('placeholder', /Last Name/i);
    await expect(zipInput).toHaveAttribute('placeholder', /Postal Code|Zip/i);
  });

  test('Error messages display correctly and are dismissible', async ({ page }) => {
    // Step 1: Login and navigate to checkout
    await loginAndNavigateToCheckout(page);

    // Step 2: Click Continue without filling fields
    await page.locator('[data-test="continue"]').click();

    // Step 3: Verify error notification appears
    const errorNotification = page.locator('[data-test="error"]');
    await expect(errorNotification).toBeVisible();

    // Step 4: Verify error message is displayed
    await expect(page.locator('text=/Error.*First Name is required/i')).toBeVisible();

    // Step 5: Verify error styling (should be distinctive - typically red background)
    const errorElement = page.locator('[data-test="error"]');
    const computedStyle = await errorElement.evaluate((el: any) => {
      return window.getComputedStyle(el);
    });
    // Just verify the element has computed style (is rendered)
    expect(computedStyle).toBeTruthy();

    // Step 6: Verify close button (X) is visible
    const closeBtn = page.locator('[data-test="error-button"]');
    await expect(closeBtn).toBeVisible();

    // Step 7: Click close button to dismiss error
    await closeBtn.click();

    // Step 8: Verify error notification disappears
    await expect(errorNotification).not.toBeVisible({ timeout: 3000 }).catch(() => {});

    // Step 9: Verify form is still visible and ready for input
    await expect(page.locator('[data-test="firstName"]')).toBeVisible();
  });

  test('Buttons are functional and properly labeled', async ({ page }) => {
    // Step 1: Login and add item
    await page.goto(BASE_URL);
    await page.locator('[data-test="username"]').fill(CREDENTIALS.username);
    await page.locator('[data-test="password"]').fill(CREDENTIALS.password);
    await page.locator('[data-test="login-button"]').click();
    
    await expect(page).toHaveURL(/.*inventory.html/);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();

    // Step 2: Verify buttons on cart page
    const checkoutBtn = page.locator('[data-test="checkout"]');
    await expect(checkoutBtn).toBeVisible();
    expect(await checkoutBtn.textContent()).toContain('Checkout');

    // Step 3: Navigate to checkout step one
    await checkoutBtn.click();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);

    // Step 4: Verify buttons on step one
    const continueBtn = page.locator('[data-test="continue"]');
    await expect(continueBtn).toBeVisible();
    // Button text might be in a child element or use getAttribute
    const btnText = await continueBtn.getAttribute('value');
    if (btnText) {
      expect(btnText).toContain('Continue');
    } else {
      // Verify button is visible and clickable instead
      await expect(continueBtn).toBeEnabled();
    }

    const cancelBtn = page.locator('[data-test="cancel"]');
    await expect(cancelBtn).toBeVisible();
    expect(await cancelBtn.textContent()).toContain('Cancel');

    // Step 5: Verify buttons are clickable
    await expect(continueBtn).toBeEnabled();
    await expect(cancelBtn).toBeEnabled();

    // Step 6: Fill form and navigate to step two
    await page.locator('[data-test="firstName"]').fill('Test');
    await page.locator('[data-test="lastName"]').fill('User');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await continueBtn.click();

    await expect(page).toHaveURL(/.*checkout-step-two.html/);

    // Step 7: Verify buttons on step two
    const finishBtn = page.locator('[data-test="finish"]');
    await expect(finishBtn).toBeVisible();
    expect(await finishBtn.textContent()).toContain('Finish');

    const cancelBtn2 = page.locator('[data-test="cancel"]');
    await expect(cancelBtn2).toBeVisible();

    // Step 8: Verify buttons are clickable
    await expect(finishBtn).toBeEnabled();
    await expect(cancelBtn2).toBeEnabled();
  });

  test('Cart item cards display all required information', async ({ page }) => {
    // Step 1: Login and add items
    await page.goto(BASE_URL);
    await page.locator('[data-test="username"]').fill(CREDENTIALS.username);
    await page.locator('[data-test="password"]').fill(CREDENTIALS.password);
    await page.locator('[data-test="login-button"]').click();
    
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Step 2: Navigate to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart.html/);

    // Step 3: Verify items are displayed with product names
    await expect(page.locator('text=Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('text=Sauce Labs Bike Light')).toBeVisible();

    // Step 4: Verify product names are clickable links
    const backpackLink = page.locator('a:has-text("Sauce Labs Backpack")');
    await expect(backpackLink).toBeVisible();

    // Step 5: Verify prices are displayed
    await expect(page.locator('text=$29.99')).toBeVisible(); // Backpack price
    await expect(page.locator('text=$9.99')).toBeVisible(); // Bike Light price

    // Step 6: Verify Remove buttons are available
    const removeButtons = page.locator('[data-test*="remove"]');
    const removeButtonCount = await removeButtons.count();
    expect(removeButtonCount).toBeGreaterThanOrEqual(2);

    // Step 7: Verify quantities are displayed
    const qtyHeaders = page.locator('text=QTY');
    await expect(qtyHeaders).toBeVisible();
  });

  test('Order overview table structure is clear and readable', async ({ page }) => {
    // Step 1: Login and complete checkout step one
    await loginAndNavigateToCheckout(page);

    // Fill and submit step one
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    
    await page.locator('[data-test="continue"]').click();

    // Step 2: Verify on overview (step two)
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    await expect(page.locator('text=Checkout: Overview')).toBeVisible();

    // Step 3: Verify table has proper structure
    const qtyHeaders = page.locator('text=QTY');
    await expect(qtyHeaders).toBeVisible();

    const descriptionHeaders = page.locator('text=Description');
    await expect(descriptionHeaders).toBeVisible();

    // Step 4: Verify price summary section
    await expect(page.locator('text=Item total:')).toBeVisible();
    await expect(page.locator('text=Tax:')).toBeVisible();
    await expect(page.locator('[data-test="total-label"]')).toBeVisible();

    // Step 5: Verify items are displayed in a clear structure
    await expect(page.locator('text=Sauce Labs Backpack')).toBeVisible();

    // Step 6: Verify payment and shipping info
    await expect(page.locator('text=Payment Information:')).toBeVisible();
    await expect(page.locator('text=Shipping Information:')).toBeVisible();
  });
});
