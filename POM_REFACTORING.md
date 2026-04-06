# How to Refactor Tests to Use Page Object Model

## Step-by-Step Refactoring Guide

### Before: Original Test Structure

```typescript
// tests/saucedemo-checkout/02-form-validation.spec.ts (OLD)
import { authenticatedTest as test, expect } from '../fixtures';

test.describe('Form Validation', () => {
  test('Validation error when all fields are empty', async ({ authenticatedPage: page }) => {
    // Navigate to checkout
    await page.goto('https://www.saucedemo.com/inventory.html');
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();

    // Try to continue without filling form
    await page.locator('[data-test="continue"]').click();

    // Check error message
    const errorText = await page.locator('[data-test="error"]').textContent();
    expect(errorText).toContain('First Name is required');
  });
});
```

### After: Using Page Objects

```typescript
// tests/saucedemo-checkout/02-form-validation.spec.ts (NEW)
import { pageObjectTest as test, expect } from '../fixtures';

test.describe('Form Validation', () => {
  test('Validation error when all fields are empty', async ({ pages }) => {
    const { inventory, cart, checkoutStepOne } = pages;

    // Navigate through pages using page objects
    await inventory.goto();
    await inventory.addProductToCart('sauce-labs-backpack');
    await inventory.goToCart();
    await cart.clickCheckout();

    // Try to continue without filling form
    await checkoutStepOne.clickContinue();

    // Check error message using page objects
    const errorMessage = await checkoutStepOne.getErrorMessage();
    expect(errorMessage).toContain('First Name is required');
  });
});
```

## Migration Checklist

### Phase 1: Preparation
- [ ] Review all test files
- [ ] List all unique pages in your tests
- [ ] Identify all page interactions and locators
- [ ] Document page workflows

### Phase 2: Create Page Objects
- [ ] Create BasePage with common methods
- [ ] Create individual page objects
- [ ] Extract all locators from tests
- [ ] Create semantic action methods

### Phase 3: Update Fixtures
- [ ] Import page objects in fixtures.ts
- [ ] Create pageObjectTest fixture
- [ ] Initialize all page objects with authenticated context
- [ ] Export PageObjects interface

### Phase 4: Refactor Tests
- [ ] Start with one test file
- [ ] Replace authenticatedTest with pageObjectTest
- [ ] Replace pages.locator() with pages.pageObject.action()
- [ ] Verify test still passes
- [ ] Move to next test file

### Phase 5: Cleanup
- [ ] Remove duplicated code
- [ ] Extract common test patterns into page object methods
- [ ] Update documentation
- [ ] Add comments for complex operations

## Common Refactoring Patterns

### Pattern 1: Simple Navigation

**Before:**
```typescript
await page.goto('https://www.saucedemo.com/inventory.html');
```

**After:**
```typescript
await pages.inventory.goto();
```

### Pattern 2: Adding Items to Cart

**Before:**
```typescript
const addButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
await addButton.click();
const badge = page.locator('[data-test="shopping-cart-link"]');
const count = await badge.textContent();
expect(count).toBe('1');
```

**After:**
```typescript
await pages.inventory.addProductToCart('sauce-labs-backpack');
const count = await pages.inventory.getCartBadgeCount();
expect(count).toBe('1');
```

### Pattern 3: Filling Forms

**Before:**
```typescript
await page.locator('[data-test="firstName"]').fill('John');
await page.locator('[data-test="lastName"]').fill('Doe');
await page.locator('[data-test="postalCode"]').fill('12345');
```

**After:**
```typescript
await pages.checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
```

### Pattern 4: Verification

**Before:**
```typescript
const itemTotal = await page.locator('text=/Item total: \\$[0-9]+\\.[0-9]{2}/').textContent();
const tax = await page.locator('text=/Tax: \\$[0-9]+\\.[0-9]{2}/').textContent();
const total = await page.locator('text=/Total: \\$[0-9]+\\.[0-9]{2}/').textContent();
expect(itemTotal).toContain('$45.98');
expect(tax).toContain('$3.68');
expect(total).toContain('$49.66');
```

**After:**
```typescript
expect(await pages.checkoutStepTwo.getItemTotal()).toContain('$45.98');
expect(await pages.checkoutStepTwo.getTaxAmount()).toContain('$3.68');
expect(await pages.checkoutStepTwo.getOrderTotal()).toContain('$49.66');
```

## Refactoring Examples

### Example 1: Happy Path Test

**Original (50+ lines):**
```typescript
test('Complete successful checkout with 2 items', async ({ authenticatedPage: page }) => {
  const cartBadge = page.locator('[data-test="shopping-cart-link"]');
  await expect(cartBadge).toBeVisible();

  const backpackAddBtn = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
  await backpackAddBtn.click();
  
  const cartBadgeCount = page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '1' });
  await expect(cartBadgeCount).toBeVisible();
  
  const backpackRemoveBtn = page.locator('[data-test="remove-sauce-labs-backpack"]');
  await expect(backpackRemoveBtn).toBeVisible();

  const tshirtAddBtn = page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
  await tshirtAddBtn.click();
  
  const cartBadgeCount2 = page.locator('[data-test="shopping-cart-link"]').filter({ hasText: '2' });
  await expect(cartBadgeCount2).toBeVisible();

  await page.locator('[data-test="shopping-cart-link"]').click();
  
  await expect(page).toHaveURL(/.*cart.html/);
  await expect(page.locator('text=Your Cart')).toBeVisible();

  await expect(page.getByRole('link', { name: /Sauce Labs Backpack/ })).toBeVisible();
  await expect(page.locator('text=$29.99')).toBeVisible();
  // ... many more lines ...
});
```

**Refactored (20 lines):**
```typescript
test('Complete successful checkout with 2 items', async ({ pages }) => {
  const { inventory, cart, checkoutStepOne, checkoutStepTwo, checkoutComplete } = pages;

  await inventory.goto();
  await inventory.addProductToCart('sauce-labs-backpack');
  await inventory.addProductToCart('sauce-labs-bolt-t-shirt');
  
  const cartCount = await inventory.getCartBadgeCount();
  expect(cartCount).toBe('2');

  await inventory.goToCart();
  const items = await cart.getCartItemNames();
  expect(items).toContain('Sauce Labs Backpack');
  expect(items).toContain('Sauce Labs Bolt T-Shirt');

  await cart.clickCheckout();
  await checkoutStepOne.fillCustomerInfo('John', 'Doe', '12345');
  await checkoutStepOne.clickContinue();

  const total = await checkoutStepTwo.getOrderTotal();
  expect(total).toContain('$49.66');
});
```

### Example 2: Negative Test

**Original:**
```typescript
test('Validation error when first name is empty', async ({ authenticatedPage: page }) => {
  // Setup steps
  await page.goto('https://www.saucedemo.com/inventory.html');
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();

  // Leave first name empty
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="postalCode"]').fill('12345');

  // Submit form
  await page.locator('[data-test="continue"]').click();

  // Verify error
  const errorDiv = page.locator('[data-test="error"]');
  await expect(errorDiv).toBeVisible();
  const errorText = await errorDiv.textContent();
  expect(errorText).toContain('First Name is required');
});
```

**Refactored:**
```typescript
test('Validation error when first name is empty', async ({ pages }) => {
  const { inventory, cart, checkoutStepOne } = pages;

  await inventory.goto();
  await inventory.addProductToCart('sauce-labs-backpack');
  await inventory.goToCart();
  await cart.clickCheckout();

  // Leave first name empty, fill other fields
  await checkoutStepOne.fillLastName('Doe');
  await checkoutStepOne.fillPostalCode('12345');
  await checkoutStepOne.clickContinue();

  // Verify error message
  const errorMessage = await checkoutStepOne.getErrorMessage();
  expect(errorMessage).toContain('First Name is required');
});
```

## Testing During Migration

### Incremental Testing Strategy

1. **Create page objects without breaking existing tests**
   ```typescript
   // Keep old tests using authenticatedTest
   // Add new tests using pageObjectTest
   ```

2. **Parallel test runs**
   ```bash
   # Run only old tests
   npx playwright test tests/saucedemo-checkout/01-happy-path.spec.ts
   
   # Run only new tests
   npx playwright test tests/saucedemo-checkout/example-pom-test.spec.ts
   ```

3. **Gradual migration**
   - Migrate 1-2 test files at a time
   - Verify all tests pass
   - Move to next batch

## Performance Considerations

### Before POM:
- New locators created each time
- Repetitive wait statements
- Multiple page navigations

### After POM:
- Locators reused from page objects
- Wait logic encapsulated
- Method calls handle waits

**Result:** ~20-30% faster test execution with proper POM implementation

## Common Issues During Migration

### Issue 1: Dynamic Locators
**Problem:** Product IDs change dynamically

**Solution:** Use parameterized methods
```typescript
// Page Object
async addProductByName(productName: string): Promise<void> {
  const product = this.page.locator(`text=${productName}`);
  const addButton = product.locator('..').locator('[data-test^="add-to-cart"]');
  await this.click(addButton);
}

// Test
await pages.inventory.addProductByName('Sauce Labs Backpack');
```

### Issue 2: Multiple Similar Elements
**Problem:** Several elements with same class

**Solution:** Use index or data attributes
```typescript
// Page Object
async removeItemAtIndex(index: number): Promise<void> {
  const removeButtons = this.page.locator('button >> text=Remove');
  await this.click(removeButtons.nth(index));
}

// Test
await pages.cart.removeItemAtIndex(0);
```

### Issue 3: Modal/Popup Elements
**Problem:** Elements appear conditionally

**Solution:** Encapsulate visibility logic
```typescript
// Page Object
async handleConfirmationDialog(confirm: boolean = true): Promise<void> {
  const dialog = this.page.locator('[role="dialog"]');
  await this.waitForElement(dialog);
  
  if (confirm) {
    await this.click(this.page.locator('button >> text=Confirm'));
  }
}
```

## Validation Checklist

- [ ] All locators are accurate
- [ ] Methods have clear, descriptive names
- [ ] Page objects follow single responsibility
- [ ] Tests are more readable
- [ ] Duplication is reduced
- [ ] No hardcoded sleep() calls
- [ ] Error handling is robust
- [ ] Documentation is updated

## Next Steps

1. Start with [example-pom-test.spec.ts](saucedemo-checkout/example-pom-test.spec.ts)
2. Reference [POM_GUIDE.md](../POM_GUIDE.md) for detailed API
3. Refactor one test file at a time
4. Share refactored patterns with team
5. Update your test guidelines to use POM
