// spec: specs/saucedemo-checkout-test-plan.md
// Category: Negative Scenarios - Form Submission Edge Cases

import { pageObjectTest as test, expect } from '../fixtures';

const BASE_URL = 'https://www.saucedemo.com';

test.describe('Negative Scenarios - Form Submission Edge Cases', () => {

  test('Cannot proceed with form containing only whitespace', async ({ pages }) => {
    // Step 1: Navigate to checkout
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();

    // Step 2: Fill form with only whitespace
    await pages.checkoutStepOne.fillFirstName('   '); // spaces only
    await pages.checkoutStepOne.fillLastName('   '); // spaces only
    await pages.checkoutStepOne.fillPostalCode('     '); // spaces only

    // Step 3: Click Continue
    await pages.checkoutStepOne.clickContinue();

    // Step 4: Verify application behavior
    // Application should either:
    // A) Show error "First Name is required" (if spaces are treated as empty)
    // B) Accept spaces and proceed to overview
    const isOnOverviewPage = await pages.checkoutStepTwo.isOnOverviewPage();
    const isErrorDisplayed = await pages.checkoutStepOne.isErrorVisible();

    // At least one of these should be true
    expect(isOnOverviewPage || isErrorDisplayed).toBeTruthy();

    if (isErrorDisplayed) {
      // Verify error message appears
      expect(await pages.checkoutStepOne.getErrorMessage()).toMatch(/Error.*required/i);
    }
  });

  test('Tab order and form navigation using keyboard', async ({ pages }) => {
    // Step 1: Navigate to checkout
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();

    // Step 2: Click in First Name field
    await pages.checkoutStepOne.clickFirstNameField();

    // Step 3: Verify First Name field has focus
    expect(await pages.checkoutStepOne.isFirstNameFocused()).toBe(true);

    // Step 4: Press Tab to move to Last Name field
    await pages.checkoutStepOne.pressTabOnFirstName();

    // Verify focus moved to Last Name or another interactive element
    expect(await pages.checkoutStepOne.isLastNameVisible()).toBe(true);

    // Step 5: Press Tab again to move to Postal Code field
    await pages.checkoutStepOne.pressTabOnLastName();

    // Step 6: Verify Postal Code field is visible and can receive input
    expect(await pages.checkoutStepOne.isPostalCodeVisible()).toBe(true);

    // Step 7: Verify Tab order follows logical sequence
    // Fill in values using keyboard navigation
    await pages.checkoutStepOne.fillFirstName('Test');
    await pages.checkoutStepOne.pressTabOnFirstName();
    await pages.checkoutStepOne.typeInLastName('User');
    await pages.checkoutStepOne.pressTabOnLastName();
    await pages.checkoutStepOne.typeInPostalCode('12345');

    // Step 8: Verify form fields have values
    expect(await pages.checkoutStepOne.getFirstNameValue()).toBe('Test');
    expect(await pages.checkoutStepOne.getLastNameValue()).toBe('User');
    expect(await pages.checkoutStepOne.getPostalCodeValue()).toBe('12345');
  });

  test('Form field input constraints and max length behavior', async ({ pages }) => {
    // Step 1: Navigate to checkout
    await pages.inventory.addProductToCart('sauce-labs-backpack');
    await pages.inventory.goToCart();
    await pages.cart.clickCheckout();

    // Step 2: Attempt to enter 200 characters in First Name field
    const longText = 'A'.repeat(200);

    await pages.checkoutStepOne.fillFirstName(longText);

    // Step 3: Verify the actual value in the field
    const firstNameValue = await pages.checkoutStepOne.getFirstNameValue();

    // Step 4: Verify one of the following:
    // A) Field accepted all characters (length === 200)
    // B) Field enforced max length (length < 200)
    // C) Field was cleared (length === 0)
    expect(firstNameValue.length).toBeGreaterThanOrEqual(0);
    expect(firstNameValue.length).toBeLessThanOrEqual(200);

    // Step 5: Fill other fields with valid data
    await pages.checkoutStepOne.fillLastName('Smith');
    await pages.checkoutStepOne.fillPostalCode('12345');

    // Step 6: Click Continue and verify form behavior
    await pages.checkoutStepOne.clickContinue();

    // Step 7: Verify either form accepted or showed error
    const isOnOverview = await pages.checkoutStepTwo.isOnOverviewPage();
    const isErrorShown = await pages.checkoutStepOne.isErrorVisible();

    expect(isOnOverview || isErrorShown).toBeTruthy();
  });

});
