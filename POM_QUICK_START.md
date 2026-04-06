# Page Object Model Implementation - Quick Start

## 📂 Files Created

### Page Objects
```
tests/pages/
├── BasePage.ts                    (Base class with common utilities)
├── LoginPage.ts                   (Login page interactions)
├── InventoryPage.ts               (Products listing page)
├── CartPage.ts                    (Shopping cart page)
├── CheckoutStepOnePage.ts         (Checkout info form)
├── CheckoutStepTwoPage.ts         (Order overview page)
├── CheckoutCompletePage.ts        (Order completion page)
└── index.ts                       (Centralized exports)
```

### Documentation
```
├── POM_GUIDE.md                   (Comprehensive POM guide)
├── POM_ARCHITECTURE.md            (Architecture overview)
├── POM_REFACTORING.md             (Migration guide)
└── POM_QUICK_START.md             (This file)
```

### Example Tests
```
tests/saucedemo-checkout/
└── example-pom-test.spec.ts       (Example tests using POM)
```

### Modified Files
```
tests/fixtures.ts                  (Added page object fixture)
```

## 🚀 Quick Start

### 1. Run Example Test
```bash
cd c:\Users\manis\workspace\playwrightAIAgent
npx playwright test tests/saucedemo-checkout/example-pom-test.spec.ts
```

### 2. Understanding the Test
Open [example-pom-test.spec.ts](tests/saucedemo-checkout/example-pom-test.spec.ts) to see:
- Clean, semantic test code
- Page object usage
- Best practices

### 3. Using Page Objects in Your Tests

**Change your test header:**
```typescript
// OLD:
import { authenticatedTest as test, expect } from '../fixtures';

// NEW:
import { pageObjectTest as test, expect } from '../fixtures';
```

**Use page objects in test:**
```typescript
test('my test', async ({ pages }) => {
  await pages.inventory.goto();
  await pages.inventory.addProductToCart('sauce-labs-backpack');
  // ... rest of test
});
```

## 📋 Available Page Objects

### pages.inventory
```typescript
await pages.inventory.goto()
await pages.inventory.addProductToCart(productId)
await pages.inventory.removeProductFromCart(productId)
await pages.inventory.getCartBadgeCount()
await pages.inventory.isCartBadgeVisible()
await pages.inventory.goToCart()
await pages.inventory.sortBy(option)
```

### pages.cart
```typescript
await pages.cart.goto()
await pages.cart.getCartItemCount()
await pages.cart.getCartItemNames()
await pages.cart.clickCheckout()
await pages.cart.clickContinueShopping()
await pages.cart.isCartEmpty()
await pages.cart.isItemInCart(itemName)
```

### pages.checkoutStepOne
```typescript
await pages.checkoutStepOne.goto()
await pages.checkoutStepOne.fillCustomerInfo(firstName, lastName, postalCode)
await pages.checkoutStepOne.fillFirstName(firstName)
await pages.checkoutStepOne.fillLastName(lastName)
await pages.checkoutStepOne.fillPostalCode(postalCode)
await pages.checkoutStepOne.clickContinue()
await pages.checkoutStepOne.clickCancel()
await pages.checkoutStepOne.getErrorMessage()
```

### pages.checkoutStepTwo
```typescript
await pages.checkoutStepTwo.goto()
await pages.checkoutStepTwo.getOrderItemCount()
await pages.checkoutStepTwo.getItemTotal()
await pages.checkoutStepTwo.getTaxAmount()
await pages.checkoutStepTwo.getOrderTotal()
await pages.checkoutStepTwo.isPaymentInfoVisible()
await pages.checkoutStepTwo.isShippingInfoVisible()
await pages.checkoutStepTwo.clickFinish()
```

### pages.checkoutComplete
```typescript
await pages.checkoutComplete.goto()
await pages.checkoutComplete.isThankYouMessageVisible()
await pages.checkoutComplete.clickBackToProducts()
```

### pages.login
```typescript
await pages.login.goto()
await pages.login.login(username, password)
await pages.login.loginAsStandardUser()
await pages.login.getErrorMessage()
await pages.login.isLoginPageDisplayed()
```

## 📖 Full Documentation

- **[POM_GUIDE.md](POM_GUIDE.md)** - Comprehensive guide with all methods and properties
- **[POM_ARCHITECTURE.md](POM_ARCHITECTURE.md)** - Architecture diagrams and concepts
- **[POM_REFACTORING.md](POM_REFACTORING.md)** - Step-by-step migration guide
- **[example-pom-test.spec.ts](tests/saucedemo-checkout/example-pom-test.spec.ts)** - Working examples

## 🔄 Migration Steps

1. **Review** - Check [POM_REFACTORING.md](POM_REFACTORING.md) for migration pattern
2. **Choose test** - Pick one test file to refactor
3. **Replace fixture** - Use `pageObjectTest` instead of `authenticatedTest`
4. **Refactor code** - Replace locators with page object methods
5. **Test** - Run test to verify it works
6. **Repeat** - Move to next test file

## ✅ Benefits

| Feature | Benefit |
|---------|---------|
| **Centralized Locators** | Update locations in one place |
| **Reusable Methods** | Reduce code duplication |
| **Semantic Testing** | Tests read like business logic |
| **Easier Maintenance** | UI changes don't break tests |
| **Better Scalability** | Easy to add new pages |
| **Single Responsibility** | Each page handles its own logic |

## 🧪 Running Tests

### Run example test
```bash
npx playwright test tests/saucedemo-checkout/example-pom-test.spec.ts
```

### Run all tests
```bash
npx playwright test
```

### Run specific test with debug
```bash
npx playwright test tests/saucedemo-checkout/example-pom-test.spec.ts --debug
```

### View last report
```bash
npx playwright show-report
```

## 💡 Tips

### Tip 1: Use Semantic Methods
```typescript
// ✅ Good - Clear intent
await pages.inventory.addProductToCart(id);

// ❌ Bad - Too technical
await page.locator('[data-test="add-to-cart-' + id + '"]').click();
```

### Tip 2: Chain Related Operations
```typescript
// ✅ Group related operations
await pages.inventory.addProductToCart('backpack');
await pages.inventory.addProductToCart('tshirt');
const count = await pages.inventory.getCartBadgeCount();

// ❌ Don't mix with navigation
await pages.inventory.goto();
await pages.cart.goto(); // Wrong - should use pages.inventory.goToCart()
```

### Tip 3: Use Existing Methods
Before writing new locators:
1. Check if method already exists
2. Check if it can be added to page object
3. Only use raw locators for one-off actions

```typescript
// ✅ Use existing method
const itemCount = await pages.cart.getCartItemCount();

// ❌ Don't duplicate
const itemCount = (await pages.cart.page.locator('.cart_item').all()).length;
```

## 🆘 Troubleshooting

### Q: Tests can't find elements?
**A:** Check that:
1. Test is authenticated (cartBadge appears)
2. URL is correct (breadcrumb appears)
3. Locator selector matches browser DevTools
4. Element is not in iframe/shadow DOM

### Q: Page objects not initialized?
**A:** Make sure you:
1. Use `pageObjectTest` not `authenticatedTest`
2. Destructure `pages` from fixture
3. Have `playwright/.auth/user.json` or manual login works

### Q: Performance issues?
**A:** 
1. Avoid multiple `.goto()` calls
2. Use `waitForElement` instead of fixed sleep
3. Reuse page object throughout test

## 📝 Next Steps

1. ✅ Review [example-pom-test.spec.ts](tests/saucedemo-checkout/example-pom-test.spec.ts)
2. ✅ Run the example test
3. ⭐ Pick one existing test to refactor
4. ⭐ Apply POM pattern
5. ⭐ Share knowledge with team

## 🎯 Key Takeaways

- Page Object Model separates page structure from test logic
- All page objects inherit from BasePage for consistency
- Fixture provides pre-initialized page objects
- Tests become more readable and maintainable
- Easy to scale and modify existing tests

## 📚 Further Reading

- Playwright Best Practices: https://playwright.dev/docs/best-practices
- Page Object Model Pattern: https://martinfowler.com/bliki/PageObject.html
- Test Automation Design Patterns: https://testautomationu.applitools.com/

---

**Ready to go?** Start with [example-pom-test.spec.ts](tests/saucedemo-checkout/example-pom-test.spec.ts) and run it! 🚀
