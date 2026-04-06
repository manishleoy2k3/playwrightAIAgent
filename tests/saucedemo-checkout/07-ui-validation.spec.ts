// spec: specs/saucedemo-checkout-test-plan.md
// Category: UI Elements and Form Visibility Tests

import { pageObjectTest as test, expect } from '../fixtures';

const BASE_URL = 'https://www.saucedemo.com';

test.describe('UI Elements and Form Visibility Tests', () => {

  test('Checkout step one form fields are properly labeled', async ({ pages }) => {
    // Step 1: Navigate to checkout step one
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();

    // Step 2: Verify page heading
    expect(await pages.checkoutStepOne.getPageTitle()).toBe('Checkout: Your Information');

    // Step 3: Verify all form fields are visible
    expect(await pages.checkoutStepOne.isFirstNameVisible()).toBe(true);
    expect(await pages.checkoutStepOne.isLastNameVisible()).toBe(true);
    expect(await pages.checkoutStepOne.isPostalCodeVisible()).toBe(true);

    // Step 4: Verify field labels are present
    expect(await pages.checkoutStepOne.getFirstNamePlaceholder()).toMatch(/First Name/i);
    expect(await pages.checkoutStepOne.getLastNamePlaceholder()).toMatch(/Last Name/i);
    expect(await pages.checkoutStepOne.getPostalCodePlaceholder()).toMatch(/Postal Code|Zip/i);
  });

  test('Error messages display correctly and are dismissible', async ({ pages }) => {
    // Step 1: Navigate to checkout
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();

    // Step 2: Click Continue without filling fields
    await pages.checkoutStepOne.clickContinue();

    // Step 3: Verify error notification appears
    expect(await pages.checkoutStepOne.isErrorVisible()).toBe(true);

    // Step 4: Verify error message is displayed
    expect(await pages.checkoutStepOne.getErrorMessage()).toMatch(/Error.*First Name is required/i);

    // Step 5: Verify error styling (should be distinctive - typically red background)
    expect(await pages.checkoutStepOne.isErrorVisible()).toBe(true);

    // Step 6: Verify close button (X) is visible
    expect(await pages.checkoutStepOne.isErrorCloseButtonVisible()).toBe(true);

    // Step 7: Click close button to dismiss error
    await pages.checkoutStepOne.clickErrorCloseButton();

    // Step 8: Verify error notification disappears
    expect(await pages.checkoutStepOne.isErrorVisible()).toBe(false);

    // Step 9: Verify form is still visible and ready for input
    expect(await pages.checkoutStepOne.isFirstNameVisible()).toBe(true);
  });

  test('Buttons are functional and properly labeled', async ({ pages }) => {
    // Step 1: Add item and go to cart
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.goToCart();

    // Step 2: Verify buttons on cart page
    expect(await pages.cart.isCheckoutButtonVisible()).toBe(true);
    expect(await pages.cart.getCheckoutButtonText()).toContain('Checkout');

    // Step 3: Navigate to checkout step one
    await pages.cart.clickCheckout();

    // Step 4: Verify buttons on step one
    expect(await pages.checkoutStepOne.isContinueButtonVisible()).toBe(true);
    expect(await pages.checkoutStepOne.isCancelButtonVisible()).toBe(true);

    // Step 5: Verify buttons are clickable
    expect(await pages.checkoutStepOne.isContinueButtonEnabled()).toBe(true);
    expect(await pages.checkoutStepOne.isCancelButtonEnabled()).toBe(true);

    // Step 6: Fill form and navigate to step two
    await pages.checkoutStepOne.fillCustomerInfo('Test', 'User', '12345');
    await pages.checkoutStepOne.clickContinue();

    // Step 7: Verify buttons on step two
    expect(await pages.checkoutStepTwo.isFinishButtonVisible()).toBe(true);
    expect(await pages.checkoutStepTwo.getFinishButtonText()).toContain('Finish');
    expect(await pages.checkoutStepTwo.isCancelButtonVisible()).toBe(true);

    // Step 8: Verify buttons are clickable
    expect(await pages.checkoutStepTwo.isFinishButtonEnabled()).toBe(true);
    expect(await pages.checkoutStepTwo.isCancelButtonEnabled()).toBe(true);
  });

  test('Cart item cards display all required information', async ({ pages }) => {
    // Step 1: Add items
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.addProductToCart('sauce-labs-bike-light');

    // Step 2: Navigate to cart
    await pages.inventory.goToCart();

    // Step 3: Verify items are displayed with product names
    expect(await pages.cart.isItemVisible('Sauce Labs Backpack')).toBe(true);
    expect(await pages.cart.isItemVisible('Sauce Labs Bike Light')).toBe(true);

    // Step 4: Verify product names are clickable links
    expect(await pages.cart.isItemLinkVisible('Sauce Labs Backpack')).toBe(true);

    // Step 5: Verify prices are displayed
    expect(await pages.cart.getItemPrice('sauce-labs-backpack')).toBe('$29.99');
    expect(await pages.cart.getItemPrice('sauce-labs-bike-light')).toBe('$9.99');

    // Step 6: Verify Remove buttons are available
    expect(await pages.cart.getRemoveButtonCount()).toBeGreaterThanOrEqual(2);

    // Step 7: Verify quantities are displayed
    expect(await pages.cart.isQuantityHeaderVisible()).toBe(true);
  });

  test('Order overview table structure is clear and readable', async ({ pages }) => {
    // Step 1: Complete checkout step one
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();
    await pages.checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
    await pages.checkoutStepOne.clickContinue();

    // Step 2: Verify on overview (step two)
    expect(await pages.checkoutStepTwo.getPageTitle()).toBe('Checkout: Overview');

    // Step 3: Verify table has proper structure
    expect(await pages.checkoutStepTwo.isQuantityHeaderVisible()).toBe(true);
    expect(await pages.checkoutStepTwo.isDescriptionHeaderVisible()).toBe(true);

    // Step 4: Verify price summary section
    expect(await pages.checkoutStepTwo.isItemTotalVisible()).toBe(true);
    expect(await pages.checkoutStepTwo.isTaxVisible()).toBe(true);
    expect(await pages.checkoutStepTwo.isTotalLabelVisible()).toBe(true);

    // Step 5: Verify items are displayed in a clear structure
    expect(await pages.checkoutStepTwo.isItemInOrderSummary('Sauce Labs Backpack')).toBe(true);

    // Step 6: Verify payment and shipping info
    expect(await pages.checkoutStepTwo.isPaymentInfoVisible()).toBe(true);
    expect(await pages.checkoutStepTwo.isShippingInfoVisible()).toBe(true);
  });

});
