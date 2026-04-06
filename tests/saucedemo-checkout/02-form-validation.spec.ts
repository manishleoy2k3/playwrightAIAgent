// spec: specs/saucedemo-checkout-test-plan.md
// Category: Checkout Form Validation - Missing Fields

import { pageObjectTest as test, expect } from '../fixtures';

/**
 * Helper function to navigate to checkout step one
 */
async function navigateToCheckout(pages: any) {
  const { inventory, cart } = pages;

  // Add an item to cart
  await inventory.goto();
  await inventory.addProductToCart('sauce-labs-backpack');

  // Navigate to checkout
  await inventory.goToCart();
  await cart.clickCheckout();
}

test.describe('Checkout Form Validation - Missing Fields', () => {

  test('Validation error when all fields are empty', async ({ pages }) => {
    const { checkoutStepOne } = pages;

    // Step 1: Navigate to checkout step one
    await navigateToCheckout(pages);

    // Step 2: Click Continue without filling any fields
    await checkoutStepOne.clickContinue();

    // Step 3: Verify error notification is displayed with correct message
    await expect(checkoutStepOne.errorMessage).toBeVisible();
    await expect(checkoutStepOne.page.locator('text=/Error.*First Name is required/i')).toBeVisible();

    // Step 4: Verify page does not navigate to next step
    await expect(checkoutStepOne.page).toHaveURL(/.*checkout-step-one.html/);

    // Step 5: Verify close button appears next to error
    const errorCloseBtn = checkoutStepOne.page.locator('[data-test="error-button"]');
    await expect(errorCloseBtn).toBeVisible();

    // Step 6: Close the error notification
    await errorCloseBtn.click();

    // Verify error notification is dismissed
    await expect(checkoutStepOne.errorMessage).not.toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('Validation error when first name is empty', async ({ pages }) => {
    const { checkoutStepOne } = pages;

    // Step 1: Navigate to checkout
    await navigateToCheckout(pages);

    // Step 2: Leave First Name empty, fill Last Name and Zip
    await checkoutStepOne.fillLastName('Smith');
    await checkoutStepOne.fillPostalCode('12345');

    // Step 3: Click Continue
    await checkoutStepOne.clickContinue();

    // Step 4: Verify error message is displayed
    await expect(checkoutStepOne.page.locator('text=/Error.*First Name is required/i')).toBeVisible();

    // Step 5: Verify page doesn't navigate
    await expect(checkoutStepOne.page).toHaveURL(/.*checkout-step-one.html/);

    // Step 6: Verify fields retain their values
    expect(await checkoutStepOne.getLastNameValue()).toBe('Smith');
    expect(await checkoutStepOne.getPostalCodeValue()).toBe('12345');
  });

  test('Validation error when last name is empty', async ({ pages }) => {
    const { checkoutStepOne } = pages;

    // Step 1: Navigate to checkout
    await navigateToCheckout(pages);

    // Step 2: Fill First Name and Zip, leave Last Name empty
    await checkoutStepOne.fillFirstName('John');
    await checkoutStepOne.fillPostalCode('12345');

    // Step 3: Click Continue
    await checkoutStepOne.clickContinue();

    // Step 4: Verify error message is displayed
    await expect(checkoutStepOne.page.locator('text=/Error.*Last Name is required/i')).toBeVisible();

    // Step 5: Verify page doesn't navigate
    await expect(checkoutStepOne.page).toHaveURL(/.*checkout-step-one.html/);
  });

  test('Validation error when postal code is empty', async ({ pages }) => {
    const { checkoutStepOne } = pages;

    // Step 1: Navigate to checkout
    await navigateToCheckout(pages);

    // Step 2: Fill First Name and Last Name, leave Zip empty
    await checkoutStepOne.fillFirstName('John');
    await checkoutStepOne.fillLastName('Doe');

    // Step 3: Click Continue
    await checkoutStepOne.clickContinue();

    // Step 4: Verify error message is displayed
    await expect(checkoutStepOne.page.locator('text=/Error.*Postal Code is required/i')).toBeVisible();

    // Step 5: Verify page doesn't navigate
    await expect(checkoutStepOne.page).toHaveURL(/.*checkout-step-one.html/);
  });

  test('Validation error when only first name is filled', async ({ pages }) => {
    const { checkoutStepOne } = pages;

    // Step 1: Navigate to checkout
    await navigateToCheckout(pages);

    // Step 2: Enter only First Name
    await checkoutStepOne.fillFirstName('John');

    // Step 3: Click Continue
    await checkoutStepOne.clickContinue();

    // Step 4: Verify error for Last Name is required
    await expect(checkoutStepOne.page.locator('text=/Error.*Last Name is required/i')).toBeVisible();

    // Step 5: Close error and fill Last Name
    const errorCloseBtn = checkoutStepOne.page.locator('[data-test="error-button"]');
    await errorCloseBtn.click();
    await expect(checkoutStepOne.errorMessage).not.toBeVisible({ timeout: 3000 }).catch(() => {});

    await checkoutStepOne.fillLastName('Doe');

    // Step 6: Click Continue again
    await checkoutStepOne.clickContinue();

    // Step 7: Verify error for Postal Code is required
    await expect(checkoutStepOne.page.locator('text=/Error.*Postal Code is required/i')).toBeVisible();

    // Step 8: Verify still on checkout step one
    await expect(checkoutStepOne.page).toHaveURL(/.*checkout-step-one.html/);
  });
});
