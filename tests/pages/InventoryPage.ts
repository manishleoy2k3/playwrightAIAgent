/**
 * InventoryPage - Page object for products/inventory page
 * Contains locators and actions for interacting with product items
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  // Locators
  readonly pageTitle: Locator;
  readonly inventoryContainer: Locator;
  readonly shoppingCartLink: Locator;
  readonly cartBadge: Locator;
  readonly sortDropdown: Locator;

  // Product locator pattern
  private productPattern = (productName: string) => 
    `[data-test="add-to-cart-${productName}"]`;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.inventoryContainer = page.locator('.inventory_container');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  /**
   * Navigate to inventory page
   */
  async goto(): Promise<void> {
    await super.goto('/inventory.html');
  }

  /**
   * Add product to cart by product ID
   */
  async addProductToCart(productId: string): Promise<void> {
    const addButton = this.page.locator(this.productPattern(productId));
    await this.click(addButton);
  }

  /**
   * Remove product from cart by product ID
   */
  async removeProductFromCart(productId: string): Promise<void> {
    const removeButton = this.page.locator(`[data-test="remove-${productId}"]`);
    await this.click(removeButton);
  }

  /**
   * Get cart badge count
   */
  async getCartBadgeCount(): Promise<string> {
    return await this.getText(this.cartBadge);
  }

  /**
   * Check if cart badge is visible
   */
  async isCartBadgeVisible(): Promise<boolean> {
    return await this.isElementVisible(this.cartBadge);
  }

  /**
   * Click shopping cart link to navigate to cart
   */
  async goToCart(): Promise<void> {
    await this.click(this.shoppingCartLink);
  }

  /**
   * Check if inventory page is displayed
   */
  async isInventoryPageDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.inventoryContainer);
  }

  /**
   * Sort products by option
   */
  async sortBy(option: string): Promise<void> {
    await this.click(this.sortDropdown);
    const optionLocator = this.page.locator(`[data-test="product-sort-container"] >> text=${option}`);
    await this.click(optionLocator);
  }

  /**
   * Get product count
   */
  async getProductCount(): Promise<number> {
    const items = this.page.locator('.inventory_item');
    return await items.count();
  }

  /**
   * Check if product is visible
   */
  async isProductVisible(productName: string): Promise<boolean> {
    const product = this.page.locator('.inventory_item_name', { hasText: productName });
    return await this.isElementVisible(product);
  }

  /**
   * Check if on inventory page
   */
  async isOnInventoryPage(): Promise<boolean> {
    return await this.page.url().includes('inventory.html');
  }
}

  /**
   * Get product names as array
   */
  async getProductNames(): Promise<string[]> {
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
