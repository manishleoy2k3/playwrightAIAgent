/**
 * CheckoutStepOnePage - Page object for checkout step 1 (customer information)
 * Contains locators and actions for filling out customer details
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutStepOnePage extends BasePage {
  // Locators
  readonly pageTitle: Locator;
  readonly checkoutContainer: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('text=Checkout: Your Information');
    this.checkoutContainer = page.locator('.checkout_container');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /**
   * Navigate to checkout step 1
   */
  async goto(): Promise<void> {
    await super.goto('/checkout-step-one.html');
  }

  /**
   * Check if checkout step 1 page is displayed
   */
  async isCheckoutStepOneDisplayed(): Promise<boolean> {
    return await this.page.url().includes('checkout-step-one.html');
  }

  /**
   * Fill in customer information
   */
  async fillCustomerInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.fillInput(this.firstNameInput, firstName);
    await this.fillInput(this.lastNameInput, lastName);
    await this.fillInput(this.postalCodeInput, postalCode);
  }

  /**
   * Fill only first name
   */
  async fillFirstName(firstName: string): Promise<void> {
    await this.fillInput(this.firstNameInput, firstName);
  }

  /**
   * Fill only last name
   */
  async fillLastName(lastName: string): Promise<void> {
    await this.fillInput(this.lastNameInput, lastName);
  }

  /**
   * Fill only postal code
   */
  async fillPostalCode(postalCode: string): Promise<void> {
    await this.fillInput(this.postalCodeInput, postalCode);
  }

  /**
   * Click continue button
   */
  async clickContinue(): Promise<void> {
    await this.click(this.continueButton);
  }

  /**
   * Click cancel button
   */
  async clickCancel(): Promise<void> {
    await this.click(this.cancelButton);
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  /**
   * Check if error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  /**
   * Get first name value
   */
  async getFirstNameValue(): Promise<string> {
    return await this.firstNameInput.inputValue();
  }

  /**
   * Get last name value
   */
  async getLastNameValue(): Promise<string> {
    return await this.lastNameInput.inputValue();
  }

  /**
   * Get postal code value
   */
  async getPostalCodeValue(): Promise<string> {
    return await this.postalCodeInput.inputValue();
  }
}
