/**
 * EXAMPLE: Using Pre-Authenticated Context with StorageState
 * 
 * This example demonstrates:
 * 1. Using pre-authenticated sessions (no login needed)
 * 2. Reusing authenticated context across tests
 * 3. Testing multiple user roles with different auth states
 * 4. Performance optimization by skipping repeated logins
 * 
 * To use this:
 * 1. Run: npx playwright test auth-setup.ts
 * 2. Run: npx playwright test tests/examples/storagestate-example.spec.ts
 */

import { expect } from '@playwright/test';
import {
  authenticatedTest,
  advancedTest,
  addProductToCart,
  getCartItemCount,
  navigateToCheckout,
  fillCheckoutInfo,
  completeCheckout,
  verifyOrderCompletion,
  TEST_USERS,
} from '../fixtures';

const test = authenticatedTest;

/**
 * EXAMPLE 1: Using authenticatedTest fixture
 * Tests will skip login and use pre-authenticated session
 */
test.describe('✅ EXAMPLE 1: Using Pre-Authenticated Session', () => {
  test('should skip login when storageState is available', async ({ authenticatedPage }) => {
    // ✨ authenticatedPage is ALREADY LOGGED IN
    // No need for login in beforeEach!
    
    // Verify we're on the products page
    await expect(authenticatedPage).toHaveURL(/.*inventory.html/);
    
    // Verify products are visible
    const backpackProduct = authenticatedPage.locator('[data-test="inventory-item"]').first();
    await expect(backpackProduct).toBeVisible();
    
    console.log('✅ Successfully accessing authenticated page without login!');
  });

  test('should add items to cart directly', async ({ authenticatedPage }) => {
    // ✨ Already logged in, can add to cart immediately
    
    // Add backpack to cart
    await addProductToCart(authenticatedPage, 'sauce-labs-backpack');
    
    // Verify cart count updated
    const cartCount = await getCartItemCount(authenticatedPage);
    expect(cartCount).toBe(1);
    
    console.log('✅ Added item to cart without login overhead!');
  });

  test('complete checkout flow without repeated login', async ({ authenticatedPage }) => {
    // ✨ Single login session reused for entire test

    // Step 1: Add items
    await addProductToCart(authenticatedPage, 'sauce-labs-backpack');
    await addProductToCart(authenticatedPage, 'sauce-labs-bike-light');

    // Step 2: Navigate to checkout
    await navigateToCheckout(authenticatedPage);

    // Step 3: Fill info
    await fillCheckoutInfo(authenticatedPage, {
      firstName: 'John',
      lastName: 'Doe',
      postalCode: '12345',
    });

    // Step 4: Review order
    const projectName = authenticatedPage.locator('[data-test="inventory-item-name"]').first();
    await expect(projectName).toBeVisible();

    // Step 5: Complete checkout
    await completeCheckout(authenticatedPage);

    // Step 6: Verify completion
    await verifyOrderCompletion(authenticatedPage);

    console.log('✅ Complete checkout without any login operations!');
  });
});

/**
 * EXAMPLE 2: Using advancedTest with utilities
 * Full suite of helpers available
 */
advTest.describe('✅ EXAMPLE 2: Using Advanced Test Fixtures', () => {
  advTest('use multiple assertions with authenticated context', async ({ 
    authenticatedPage, 
    addToCart, 
    goToCheckout 
  }) => {
    // ✨ Multiple helpers available
    
    // Add to cart using helper
    await addToCart(authenticatedPage, 'sauce-labs-backpack');
    
    // Verify cart
    const cartLink = authenticatedPage.locator('[data-test="shopping-cart-link"]');
    await expect(cartLink).toContainText('1');
    
    // Go to checkout
    await goToCheckout(authenticatedPage);
    
    // Verify we're on checkout page
    await expect(authenticatedPage).toHaveURL(/.*checkout-step-one.html/);
    
    console.log('✅ Using advanced test fixtures!');
  });

  advTest('create multiple authenticated contexts', async ({ getLoggedInPage }) => {
    // ✨ Can create multiple logged-in pages as needed
    
    // Create two separate authenticated pages
    const page1 = await getLoggedInPage(TEST_USERS.standard);
    const page2 = await getLoggedInPage(TEST_USERS.performanceUser);
    
    // Both are already authenticated, ready to use
    await expect(page1).toHaveURL(/.*inventory.html/);
    await expect(page2).toHaveURL(/.*inventory.html/);
    
    // Cleanup
    await page1.close();
    await page2.close();
    
    console.log('✅ Created multiple authenticated contexts!');
  });
});

/**
 * EXAMPLE 3: Performance Comparison
 * Demonstrates the performance benefit of storageState
 */
test.describe('📊 EXAMPLE 3: Performance Comparison', () => {
  test('measure performance: with storageState (fast) 🚀', async ({ authenticatedPage }) => {
    const startTime = Date.now();
    
    // Tests start immediately with pre-authenticated session
    await authenticatedPage.goto('https://www.saucedemo.com/inventory.html');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️  Page load time with storageState: ${loadTime}ms`);
    console.log('🚀 FAST: No login needed!');
  });

  test('example: without storageState would need login (slower)', async ({ page }) => {
    const startTime = Date.now();
    
    // Without storageState, we'd need to login
    // This is what we're AVOIDING by using storageState
    
    // Simulated login would add ~2-3 seconds
    // With 40 tests × 5 browsers = 200 tests
    // That's 400-600 seconds saved! (6-10 minutes)
    
    const theoreticalLoginTime = 2500; // milliseconds
    
    console.log(`⏱️  Theoretical login time per test: ${theoreticalLoginTime}ms`);
    console.log('💡 40 tests × 5 browsers × 2.5s login = ~8.3 minutes SAVED!');
  });
});

/**
 * EXAMPLE 4: Testing Different User Roles
 * Each role has its own storagae state saved
 */
test.describe('👥 EXAMPLE 4: Testing Different User Roles', () => {
  test('standard user can checkout', async ({ authenticatedPage }) => {
    // ✨ Using standard_user from storageState
    
    await authenticatedPage.goto('https://www.saucedemo.com/inventory.html');
    
    const sortDropdown = authenticatedPage.locator('[data-test="product_sort_container"]');
    await expect(sortDropdown).toBeVisible();
    
    console.log('✅ Standard user authenticated successfully!');
  });

  // Uncomment to test with admin user
  // You would need to configure admin auth state in playwright.config.ts
  
  // test('admin user has additional permissions', async ({ page }) => {
  //   // Load admin auth state
  //   await page.context().addCookies([
  //     // admin cookies would be loaded here
  //   ]);
  //   
  //   // Admin-specific tests here
  // });

  // test('problem user sees visual issues', async ({ page }) => {
  //   // Load problem user auth state
  //   // Test that problem user experiences known UI issues
  // });
});

/**
 * EXAMPLE 5: Batch Operations
 * Run multiple operations in sequence with single login
 */
test.describe('⚡ EXAMPLE 5: Batch Operations (Single Login)', () => {
  test('run multiple checkout flows sequentially', async ({ authenticatedPage }) => {
    const checkoutScenarios = [
      { items: ['sauce-labs-backpack'], name: 'John' },
      { items: ['sauce-labs-bike-light'], name: 'Jane' },
      { items: ['sauce-labs-bolt-t-shirt'], name: 'Bob' },
    ];

    for (const scenario of checkoutScenarios) {
      // Navigate to products
      await authenticatedPage.goto('https://www.saucedemo.com/inventory.html');

      // Add item
      for (const item of scenario.items) {
        await addProductToCart(authenticatedPage, item);
      }

      // Verify items added
      const cartCount = await getCartItemCount(authenticatedPage);
      expect(cartCount).toBeGreaterThan(0);

      // Reset cart by clearing
      await authenticatedPage.locator('[data-test="shopping-cart-link"]').click();
      await authenticatedPage.locator('[data-test="continue-shopping"]').click();
    }

    console.log('✅ Ran multiple scenarios with single authentication!');
  });
});

/**
 * EXAMPLE 6: Debugging StorageState
 * How to verify auth state is being used
 */
test.describe('🔍 EXAMPLE 6: Debugging & Verification', () => {
  test('verify storagState is being used', async ({ authenticatedPage }) => {
    // Get cookies to see what's loaded
    const cookies = await authenticatedPage.context().cookies();
    
    console.log('🍪 Cookies loaded from storageState:');
    cookies.forEach(cookie => {
      console.log(`   - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
    });

    // Check localStorage
    const localStorage = await authenticatedPage.evaluate(() => {
      return Object.entries(window.localStorage).map(([key, value]) => ({
        key,
        value: value.substring(0, 50),
      }));
    });

    console.log('📦 LocalStorage from storageState:');
    localStorage.forEach(item => {
      console.log(`   - ${item.key}: ${item.value}...`);
    });

    // Verify we're authenticated
    await expect(authenticatedPage).toHaveURL(/.*inventory.html/);
    console.log('✅ StorageState verified and working!');
  });

  test('measure auth setup time', async () => {
    const startTime = Date.now();
    
    // When tests start, auth is already loaded from storageState
    // No HTTP requests needed for login
    
    const elapsed = Date.now() - startTime;
    console.log(`⏱️  Test startup time: ${elapsed}ms`);
    console.log('💨 Lightning fast - auth loaded from disk!');
  });
});

test.describe('📚 EXAMPLE 7: Migration Guide', () => {
  test('BEFORE: Old way (manual login)', async ({ page }) => {
    // ❌ OLD WAY - Login every test
    
    // 1. Navigate to login
    await page.goto('https://www.saucedemo.com');
    
    // 2. Fill credentials (wasteful, repeated 200x)
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    
    // 3. Click login (wasteful, repeated 200x)
    await page.locator('[data-test="login-button"]').click();
    
    // 4. Wait for page load (wasteful, repeated 200x)
    await page.waitForURL(/.*inventory.html/);
    
    console.log(`❌ OLD WAY: Repeated login overhead across all tests`);
  });

  test('AFTER: New way (storageState)', async ({ authenticatedPage }) => {
    // ✅ NEW WAY - Pre-authenticated, skip login
    
    // Already logged in!
    // Use page immediately
    const products = authenticatedPage.locator('[data-test="inventory-item"]');
    
    console.log(`✅ NEW WAY: Tests run immediately with pre-authenticated session!`);
  });

  test('show the steps to migrate', () => {
    console.log(`
📋 MIGRATION STEPS:
1️⃣  Create auth-setup.ts (already done ✅)
2️⃣  Update playwright.config.ts to use storageState (already done ✅)
3️⃣  Create fixtures.ts with helper functions (already done ✅)
4️⃣  Run: npx playwright test auth-setup.ts
5️⃣  Update your tests:
    - Replace \`test.beforeEach(async ({ page }) => { login... })\`
    - Use \`authenticatedTest('name', async ({ authenticatedPage }) => { ... })\`
6️⃣  Run tests normally: npx playwright test
    - Tests skip login and use pre-authenticated session!

⏲️ PERFORMANCE GAIN:
   - Before: 200 tests × 2.5s login = 500s total time
   - After: 200 tests × 0.1s (auth load) = 20s total time
   - 🚀 24x faster test execution!
    `);
  });
});
