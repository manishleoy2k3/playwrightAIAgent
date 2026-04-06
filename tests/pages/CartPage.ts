/**
 * CartPage - Page object for shopping cart page
 * Contains locators and actions for cart management
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  // Locators
  readonly pageTitle: Locator;
  readonly cartContainer: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly cartItemsContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('text=Your Cart');
    this.cartContainer = page.locator('.cart_list');
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.cartItemsContainer = page.locator('.cart_contents_container');
  }

  /**
   * Navigate to cart page
   */
  async goto(): Promise<void> {
    await super.goto('/cart.html');
  }

  /**
   * Check if cart page is displayed
   */
  async isCartPageDisplayed(): Promise<boolean> {
    return await this.page.url().includes('cart.html');
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Remove item from cart by item name
   */
  async removeItemFromCart(itemName: string): Promise<void> {
    const removeButton = this.page.locator('button', { hasText: 'Remove' }).first();
    await this.click(removeButton);
  }

  /**
   * Get item names in cart
   */
  async getCartItemNames(): Promise<string[]> {
    const items = this.page.locator('.inventory_item_name');
    const count = await items.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await items.nth(i).textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  /**
   * Get item quantities in cart
   */
  async getCartItemQuantities(): Promise<string[]> {
    const quantities = this.page.locator('.cart_quantity');
    const count = await quantities.count();
    const qtys: string[] = [];
    for (let i = 0; i < count; i++) {
      const qty = await quantities.nth(i).textContent();
      if (qty) qtys.push(qty.trim());
    }
    return qtys;
  }

  /**
   * Click checkout button
   */
  async clickCheckout(): Promise<void> {
    await this.click(this.checkoutButton);
  }

  /**
   * Click continue shopping button
   */
  async clickContinueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
  }

  /**
   * Check if cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    const itemCount = await this.getCartItemCount();
    return itemCount === 0;
  }

  /**
   * Verify item exists in cart
   */
  async isItemInCart(itemName: string): Promise<boolean> {
    const item = this.page.getByRole('link', { name: new RegExp(itemName) });
    return await this.isElementVisible(item);
  }

  /**
   * Check if item link is visible
   */
  async isItemLinkVisible(itemName: string): Promise<boolean> {
    const itemLink = this.page.locator('a', { hasText: itemName });
    return await this.isElementVisible(itemLink);
  }

  /**
   * Get item price by product ID
   */
  async getItemPrice(productId: string): Promise<string> {
    const priceLocator = this.page.locator(`[data-test="inventory-item-price"][data-test*="${productId}"]`);
    return await this.getText(priceLocator);
  }

  /**
   * Get remove button count
   */
  async getRemoveButtonCount(): Promise<number> {
    const removeButtons = this.page.locator('[data-test*="remove"]');
    return await removeButtons.count();
  }

  /**
   * Check if quantity header is visible
   */
  async isQuantityHeaderVisible(): Promise<boolean> {
    const qtyHeader = this.page.locator('text=QTY');
    return await this.isElementVisible(qtyHeader);
  }

  /**
   * Check if continue shopping button is visible
   */
  async isContinueShoppingButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.continueShoppingButton);
  }

  /**
   * Check if checkout button is visible
   */
  async isCheckoutButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.checkoutButton);
  }

  /**
   * Get checkout button text
   */
  async getCheckoutButtonText(): Promise<string | null> {
    return await this.checkoutButton.textContent();
  }

  /**
   * Get cart content (for checking descriptions)
   */
  async getCartContent(): Promise<string> {
    return await this.page.content();
  }
}
