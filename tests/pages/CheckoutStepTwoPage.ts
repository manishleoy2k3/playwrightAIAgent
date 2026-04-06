/**
 * CheckoutStepTwoPage - Page object for checkout step 2 (order overview)
 * Contains locators and actions for reviewing order details
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutStepTwoPage extends BasePage {
  // Locators
  readonly pageTitle: Locator;
  readonly checkoutContainer: Locator;
  readonly summaryContainer: Locator;
  readonly itemsContainer: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly itemTotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly summaryItems: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('text=Checkout: Overview');
    this.checkoutContainer = page.locator('.checkout_container');
    this.summaryContainer = page.locator('.summary_container');
    this.itemsContainer = page.locator('.cart_list');
    this.paymentInfo = page.locator('text=SauceCard');
    this.shippingInfo = page.locator('text=Free Pony Express Delivery');
    this.itemTotal = page.locator('text=/Item total: \\$[0-9]+\\.[0-9]{2}/');
    this.tax = page.locator('text=/Tax: \\$[0-9]+\\.[0-9]{2}/');
    this.total = page.locator('text=/Total: \\$[0-9]+\\.[0-9]{2}/');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.summaryItems = page.locator('.cart_item');
  }

  /**
   * Navigate to checkout step 2
   */
  async goto(): Promise<void> {
    await super.goto('/checkout-step-two.html');
  }

  /**
   * Check if checkout step 2 page is displayed
   */
  async isCheckoutStepTwoDisplayed(): Promise<boolean> {
    return await this.page.url().includes('checkout-step-two.html');
  }

  /**
   * Get item count in order summary
   */
  async getOrderItemCount(): Promise<number> {
    return await this.summaryItems.count();
  }

  /**
   * Verify item is in order summary
   */
  async isItemInOrderSummary(itemName: string): Promise<boolean> {
    const item = this.page.getByRole('link', { name: new RegExp(itemName) });
    return await this.isElementVisible(item);
  }

  /**
   * Get item total from summary
   */
  async getItemTotal(): Promise<string> {
    return await this.getText(this.itemTotal);
  }

  /**
   * Get tax from summary
   */
  async getTaxAmount(): Promise<string> {
    return await this.getText(this.tax);
  }

  /**
   * Get total from summary
   */
  async getOrderTotal(): Promise<string> {
    return await this.getText(this.total);
  }

  /**
   * Check if payment info is visible
   */
  async isPaymentInfoVisible(): Promise<boolean> {
    return await this.isElementVisible(this.paymentInfo);
  }

  /**
   * Check if shipping info is visible
   */
  async isShippingInfoVisible(): Promise<boolean> {
    return await this.isElementVisible(this.shippingInfo);
  }

  /**
   * Click finish button
   */
  async clickFinish(): Promise<void> {
    await this.click(this.finishButton);
  }

  /**
   * Click cancel button
   */
  async clickCancel(): Promise<void> {
    await this.click(this.cancelButton);
  }

  /**
   * Get all item names in order summary
   */
  async getOrderItemNames(): Promise<string[]> {
    const items = this.page.locator('.inventory_item_name');
    const count = await items.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await items.nth(i).textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }
}
