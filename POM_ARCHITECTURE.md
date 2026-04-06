# Page Object Model Architecture Overview

## Framework Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TEST FILES                            │
│  (*.spec.ts files use pages from fixtures)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   FIXTURES (fixtures.ts)                 │
│  • authenticatedTest - Basic authenticated context      │
│  • pageObjectTest - Provides initialized page objects   │
│  • advancedTest - Full utility suite                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              PAGE OBJECTS (tests/pages/)                 │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   BasePage   │  │ LoginPage    │  │Inventory     │  │
│  │              │  │              │  │Page          │  │
│  │• click()     │  │• login()     │  │• add         │  │
│  │• fillInput() │  │• getError()  │  │  ToCart()   │  │
│  │• getText()   │  │• isLoggedIn()│  │• getCart    │  │
│  │• goto()      │  │              │  │  Badge()    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  CartPage    │  │Checkout      │  │Checkout     │  │
│  │              │  │Step One      │  │Step Two     │  │
│  │• get         │  │              │  │             │  │
│  │  ItemCount() │  │• fill        │  │• get        │  │
│  │• remove      │  │  CustomerInfo│  │  ItemTotal()│  │
│  │  Item()      │  │• clickCont   │  │• get        │  │
│  │• checkout()  │  │  inue()      │  │  OrderTotal │  │
│  │              │  │              │  │• clickFinish│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         CheckoutCompletePage                      │   │
│  │  • isCompleteDisplayed()                         │   │
│  │  • clickBackToProducts()                         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│        PLAYWRIGHT API (Page, Locator, expect)           │
│                    Browser Automation                   │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

```
Test Code
   │
   ├─→ pages.inventory.addProductToCart(id)
   │        │
   │        ├─→ const addButton = this.page.locator(...)
   │        │
   │        └─→ await this.click(addButton)
   │             │
   │             └─→ BasePage.click(locator)
   │                  │
   │                  └─→ await locator.click()
   │                       │
   │                       └─→ Playwright API
   │                            │
   │                            └─→ Browser
   │
   └─→ const count = await pages.inventory.getCartBadgeCount()
        │
        ├─→ const badge = this.page.locator(...)
        │
        └─→ await this.getText(badge)
             │
             └─→ BasePage.getText(locator)
                  │
                  └─→ await locator.textContent()
                       │
                       └─→ Playwright API
                            │
                            └─→ Browser
```

## Separation of Concerns

### Without POM (Problematic)
```
Test Code
  ↓
  Locator 1 → Locator 2 → Locator 3
  Assertions mixed with locators
  Hard to maintain
  Difficult to reuse
```

### With POM (Clean)
```
Test Code
  ↓
Semantic Methods (inventory.addProductToCart())
  ↓
Page Objects (Encapsulation)
  ↓
Locators (Implementation details)
  ↓
Playwright API
```

## Page Object Responsibilities

### Each Page Object Has:

1. **Locators** (Properties)
   - Data attributes: `[data-test="..."]`
   - CSS selectors for dynamic content
   - Text content locators

2. **Actions** (Methods)
   - User interactions (click, fill, select)
   - Navigation
   - Data retrieval

3. **Assertions** (Getter Methods)
   - Visibility checks
   - Content verification
   - State validation

## Test Examples

### Using Page Objects (Recommended)

```typescript
test('checkout flow', async ({ pages }) => {
  // Clear, semantic naming
  await pages.inventory.addProductToCart('backpack');
  await pages.inventory.goToCart();
  await pages.cart.clickCheckout();
  
  // Easy to understand flow
  await pages.checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
  
  // Assertions on page state
  const total = await pages.checkoutStepTwo.getOrderTotal();
  expect(total).toContain('$49.66');
});
```

### Without Page Objects (Not Recommended)

```typescript
test('checkout flow', async ({ page }) => {
  // Hard to follow
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.waitForURL(/.*cart.html/);
  await page.locator('[data-test="checkout"]').click();
  
  // Lots of locator noise
  await page.locator('[data-test="firstName"]').fill('John');
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();
  
  // Hard to maintain when UI changes
  const totalText = await page.locator('text=/Total: \\$[0-9]+\\.[0-9]{2}/').textContent();
});
```

## Benefits Summary

| Aspect | Without POM | With POM |
|--------|------------|---------|
| **Maintainability** | Hard - locators scattered | Easy - centralized |
| **Reusability** | Low - code duplication | High - shared methods |
| **Readability** | Poor - technical details | Great - business logic |
| **Scalability** | Difficult - adds complexity | Simple - follows pattern |
| **UI Changes** | Multiple files to update | Single page object |
| **Debugging** | Hard to pinpoint issues | Clear error location |
| **Onboarding** | Steep learning curve | Intuitive structure |

## Integration with Fixtures

```typescript
// Test gets pre-initialized page objects
test('my test', async ({ pages }) => {
  // pages is a PageObjects interface containing:
  // - pages.login
  // - pages.inventory
  // - pages.cart
  // - pages.checkoutStepOne
  // - pages.checkoutStepTwo
  // - pages.checkoutComplete
  // All initialized with authenticated page context
});
```

## Future Enhancements

1. **Additional Page Objects**
   - FilterPage - for product filtering
   - SearchPage - for product search
   - AccountPage - for user account

2. **Utility Methods**
   - Database interactions
   - API helpers
   - Data generation

3. **Advanced Patterns**
   - Page composition
   - Component objects
   - Service layers

4. **Performance**
   - Test data caching
   - Lazy locator evaluation
   - Parallel test optimization
