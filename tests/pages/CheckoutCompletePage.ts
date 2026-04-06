/**
 * CheckoutCompletePage - Page object for checkout complete page
 * Contains locators and actions for order completion confirmation
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  // Locators
  readonly pageTitle: Locator;
  readonly completeContainer: Locator;
  readonly thankYouMessage: Locator;
  readonly orderDispatchedMessage: Locator;
  readonly backToProductsButton: Locator;
  readonly checkmarkIcon: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('text=Checkout: Complete!');
    this.completeContainer = page.locator('.checkout_complete_container');
    this.thankYouMessage = page.locator('text=Thank you for your order!');
    this.orderDispatchedMessage = page.locator('text=/Your order has been dispatched/');
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
    this.checkmarkIcon = page.locator('.pony_express');
  }

  /**
   * Navigate to checkout complete page
   */
  async goto(): Promise<void> {
    await super.goto('/checkout-complete.html');
  }

  /**
   * Check if checkout complete page is displayed
   */
  async isCheckoutCompleteDisplayed(): Promise<boolean> {
    return await this.page.url().includes('checkout-complete.html');
  }

  /**
   * Check if thank you message is visible
   */
  async isThankYouMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.thankYouMessage);
  }

  /**
   * Check if order dispatched message is visible
   */
  async isOrderDispatchedMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.orderDispatchedMessage);
  }

  /**
   * Check if checkmark icon is visible
   */
  async isCheckmarkIconVisible(): Promise<boolean> {
    return await this.isElementVisible(this.checkmarkIcon);
  }

  /**
   * Click back to products button
   */
  async clickBackToProducts(): Promise<void> {
    await this.click(this.backToProductsButton);
  }

  /**
   * Get thank you message text
   */
  async getThankYouMessage(): Promise<string> {
    return await this.getText(this.thankYouMessage);
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitle);
  }

  /**
   * Check if back to products button is visible
   */
  async isBackToProductsButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.backToProductsButton);
  }

  /**
   * Check if back to products button is enabled
   */
  async isBackToProductsButtonEnabled(): Promise<boolean> {
    return await this.backToProductsButton.isEnabled();
  }

  /**
   * Check if on complete page
   */
  async isOnCompletePage(): Promise<boolean> {
    return await this.isCheckoutCompleteDisplayed();
  }

  /**
   * Get current URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if page heading is visible
   */
  async isPageHeadingVisible(): Promise<boolean> {
    return await this.isElementVisible(this.pageTitle);
  }

  /**
   * Check if pony express image is visible (checkmark icon)
   */
  async isPonyExpressImageVisible(): Promise<boolean> {
    return await this.isCheckmarkIconVisible();
  }

  /**
   * Check if order dispatched message contains "pony"
   */
  async isPonyExpressMessageVisible(): Promise<boolean> {
    const message = await this.getOrderDispatchedMessage();
    return message.toLowerCase().includes('pony');
  }
