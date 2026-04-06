# Page Object Model (POM) Guide

## Overview

The Page Object Model is a test automation framework design pattern that separates the page structure (locators, elements) from test logic. This makes tests more maintainable, reusable, and less brittle.

## Structure

```
tests/
├── pages/
│   ├── BasePage.ts              # Base class with common methods
│   ├── LoginPage.ts             # Login page objects
│   ├── InventoryPage.ts         # Products listing page
│   ├── CartPage.ts              # Shopping cart page
│   ├── CheckoutStepOnePage.ts   # Checkout form (customer info)
│   ├── CheckoutStepTwoPage.ts   # Order overview page
│   ├── CheckoutCompletePage.ts  # Order completion page
│   └── index.ts                 # Centralized exports
├── fixtures.ts                  # Test fixtures with POM support
├── saucedemo-checkout/
│   ├── 01-happy-path.spec.ts         # Original test
│   ├── example-pom-test.spec.ts      # POM example
│   └── ... other tests
```

## Page Classes

### BasePage
Base class that all pages inherit from. Contains common utilities:

- `goto(path)` - Navigate to a specific path
- `click(locator)` - Click an element
- `fillInput(locator, text)` - Fill input field
- `waitForElement(locator)` - Wait for element visibility
- `getText(locator)` - Get element text
- `isElementVisible(locator)` - Check if element is visible

### LoginPage
Page object for login functionality:

```typescript
// Properties
usernameInput: Locator
passwordInput: Locator
loginButton: Locator
errorMessage: Locator

// Methods
async login(username, password)
async loginAsStandardUser()
async getErrorMessage()
async isErrorMessageVisible()
async isLoginPageDisplayed()
```

### InventoryPage
Page object for products listing:

```typescript
// Properties
pageTitle: Locator
shoppingCartLink: Locator
cartBadge: Locator
inventoryContainer: Locator

// Methods
async addProductToCart(productId)
async removeProductFromCart(productId)
async getCartBadgeCount()
async isCartBadgeVisible()
async goToCart()
async getProductCount()
async getProductNames()
```

### CartPage
Page object for shopping cart:

```typescript
// Properties
cartContainer: Locator
cartItems: Locator
checkoutButton: Locator
continueShoppingButton: Locator

// Methods
async getCartItemCount()
async getCartItemNames()
async getCartItemQuantities()
async removeItemFromCart(itemName)
async clickCheckout()
async isCartEmpty()
async isItemInCart(itemName)
```

### CheckoutStepOnePage
Page object for checkout step 1 (customer information):

```typescript
// Properties
firstNameInput: Locator
lastNameInput: Locator
postalCodeInput: Locator
continueButton: Locator
cancelButton: Locator
errorMessage: Locator

// Methods
async fillCustomerInfo(firstName, lastName, postalCode)
async fillFirstName(firstName)
async fillLastName(lastName)
async fillPostalCode(postalCode)
async clickContinue()
async getErrorMessage()
async isErrorMessageVisible()
```

### CheckoutStepTwoPage
Page object for order overview:

```typescript
// Properties
pageTitle: Locator
summaryContainer: Locator
itemTotal: Locator
tax: Locator
total: Locator
finishButton: Locator

// Methods
async getOrderItemCount()
async isItemInOrderSummary(itemName)
async getItemTotal()
async getTaxAmount()
async getOrderTotal()
async isPaymentInfoVisible()
async isShippingInfoVisible()
async clickFinish()
async getOrderItemNames()
```

### CheckoutCompletePage
Page object for order completion:

```typescript
// Properties
pageTitle: Locator
thankYouMessage: Locator
orderDispatchedMessage: Locator
backToProductsButton: Locator

// Methods
async isCheckoutCompleteDisplayed()
async isThankYouMessageVisible()
async isOrderDispatchedMessageVisible()
async clickBackToProducts()
async getThankYouMessage()
```

## Usage Examples

### With Page Objects (POM)

```typescript
import { pageObjectTest as test, expect } from '../fixtures';

test('Complete checkout', async ({ pages }) => {
  const { inventory, cart, checkoutStepOne, checkoutStepTwo } = pages;

  // Navigate to inventory
  await inventory.goto();

  // Add products
  await inventory.addProductToCart('sauce-labs-backpack');
  await inventory.addProductToCart('sauce-labs-bolt-t-shirt');

  // Go to cart
  await inventory.goToCart();
  
  // Verify items
  const items = await cart.getCartItemNames();
  expect(items).toContain('Sauce Labs Backpack');

  // Checkout
  await cart.clickCheckout();
  await checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
  await checkoutStepOne.clickContinue();

  // Verify pricing
  const total = await checkoutStepTwo.getOrderTotal();
  expect(total).toContain('$49.66');
});
```

### Without Page Objects (Old Way)

```typescript
test('Complete checkout - old way', async ({ authenticatedPage: page }) => {
  // Navigate to inventory
  await page.goto('https://www.saucedemo.com/inventory.html');

  // Add products
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();

  // Go to cart
  await page.locator('[data-test="shopping-cart-link"]').click();

  // Verify items
  await expect(
    page.getByRole('link', { name: /Sauce Labs Backpack/ })
  ).toBeVisible();

  // ... many more locators and raw page interactions
});
```

## Benefits of POM

1. **Maintainability** - Locators are centralized in one place
2. **Reusability** - Methods are reused across multiple tests
3. **Readability** - Test code reads like business logic, not locator spaghetti
4. **Scalability** - Easy to add new pages or methods
5. **Reduced Duplication** - Common actions are encapsulated
6. **Less Brittle** - When UI changes, only page object needs updating

## Best Practices

### 1. Keep Pages Focused
Each page object should represent one logical page:

```typescript
// ✅ Good - Single responsibility
class CheckoutStepOnePage extends BasePage { }
class CheckoutStepTwoPage extends BasePage { }

// ❌ Bad - Too many concerns
class CheckoutPage extends BasePage {
  async fillFormStepOne() { }
  async fillFormStepTwo() { }
  async completeOrder() { }
}
```

### 2. Use Descriptive Method Names
Method names should describe the action:

```typescript
// ✅ Good
await checkoutStepOne.fillCustomerInfo(firstName, lastName, postCode);
await inventory.addProductToCart(productId);

// ❌ Bad
await checkoutStepOne.fill();
await inventory.add();
```

### 3. Locators as Private When Possible
Use private locators for internal page logic:

```typescript
// ✅ Good - Only expose what's needed
export class CartPage extends BasePage {
  readonly checkoutButton: Locator;
  
  private readonly removeButtons: Locator;
  
  async removeItem(itemName: string) {
    // Uses private locator internally
  }
}
```

### 4. Add Validation Logic
Encapsulate common assertions:

```typescript
// ✅ Good - Page object handles validation
async verifyCheckoutComplete() {
  await expect(this.thankYouMessage).toBeVisible();
  await expect(this.orderDispatchedMessage).toBeVisible();
}

// Then in test
await checkoutComplete.verifyCheckoutComplete();
```

### 5. Chain Methods When Appropriate
For common workflows:

```typescript
// ✅ Good - Fluent API pattern
await checkoutStepOne
  .fillFirstName('John')
  .fillLastName('Doe')
  .fillPostalCode('12345')
  .clickContinue();
```

## Migration Guide

### Migrating Existing Tests to POM

1. Identify pages in your test
2. Create page object class for each page
3. Extract locators from tests to page object properties
4. Extract actions to page object methods
5. Update test to use page objects

**Before:**
```typescript
test('add to cart', async ({ authenticatedPage: page }) => {
  await page.locator('[data-test="add-to-cart-backpack"]').click();
  const badge = await page.locator('.shopping_cart_badge').textContent();
  expect(badge).toBe('1');
});
```

**After:**
```typescript
test('add to cart', async ({ pages }) => {
  await pages.inventory.addProductToCart('sauce-labs-backpack');
  const count = await pages.inventory.getCartBadgeCount();
  expect(count).toBe('1');
});
```

## Extending Page Objects

### Adding New Methods

```typescript
// In InventoryPage.ts
export class InventoryPage extends BasePage {
  // Existing properties...

  // New method for filtering
  async filterByPrice(minPrice: number, maxPrice: number): Promise<void> {
    // Implementation
  }
}
```

### Creating New Page Objects

```typescript
// Create new file: tests/pages/FilterPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class FilterPage extends BasePage {
  readonly filterButton: Locator;
  // ... more properties and methods
}
```

Then add to [index.ts](./index.ts) and update fixtures.

## Testing with Page Objects

Run example test:
```bash
npx playwright test tests/saucedemo-checkout/example-pom-test.spec.ts
```

Run all tests:
```bash
npx playwright test
```

## Debugging Page Objects

### Enable verbose logging
```typescript
await page.context().tracing.start({ screenshots: true, snapshots: true });
// ... test code ...
await page.context().tracing.stop({ path: 'trace.zip' });
```

### Check element visibility
```typescript
const isVisible = await pages.inventory.isCartBadgeVisible();
console.log('Cart badge visible:', isVisible);
```

### View page state
```typescript
const itemCount = await pages.inventory.getProductCount();
console.log('Products:', itemCount);
```

## Common Issues

### Locators not finding elements
- Verify the data-test attribute exists
- Check CSS selectors in browser DevTools
- Use `page.locator().evaluate()` to debug

### Method not catching all elements
- Check count with `getCount()` method
- Use more specific selectors
- Consider parent container locators

### Page object methods are flaky
- Add explicit waits with `waitForElement()`
- Check for race conditions
- Use stable selectors (data-test > CSS classes)
