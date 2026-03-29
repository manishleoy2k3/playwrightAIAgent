# SauceDemo E-commerce Checkout Test Plan

## Application Overview

Comprehensive test plan for the SauceDemo e-commerce checkout workflow. This plan covers all acceptance criteria including cart review, checkout information entry with validation, order overview, completion confirmation, and error handling scenarios. The plan includes happy path, negative scenarios, edge cases, navigation tests, and UI validation tests.

## Test Scenarios

### 1. Checkout Happy Path - Successful Order Completion

**Seed:** `tests/checkout-happy-path.spec.ts`

#### 1.1. Complete successful checkout with standard user

**File:** `tests/checkout-happy-path/successful-checkout.spec.ts`

**Steps:**
  1. Navigate to https://www.saucedemo.com
    - expect: Login page is displayed with username and password fields
    - expect: Login button is visible
  2. Enter username 'standard_user' in the username field
    - expect: Username 'standard_user' is entered in the field
  3. Enter password 'secret_sauce' in the password field
    - expect: Password is masked in the field
  4. Click the Login button
    - expect: User is redirected to the products page (inventory.html)
    - expect: All 6 products are displayed with prices
    - expect: Shopping cart badge shows '0' or no items
  5. Add 'Sauce Labs Backpack' ($29.99) to cart by clicking 'Add to cart' button
    - expect: Cart badge updates to show '1'
    - expect: Button text changes from 'Add to cart' to 'Remove'
  6. Add 'Sauce Labs Bolt T-Shirt' ($15.99) to cart by clicking 'Add to cart' button
    - expect: Cart badge updates to show '2'
    - expect: Both items are now in the cart
  7. Click the shopping cart badge (shows '2')
    - expect: User is redirected to cart page (cart.html)
    - expect: Page displays 'Your Cart' heading
    - expect: Both items are listed with quantities (1 each) and prices
    - expect: Item total displays: $45.98 (29.99 + 15.99)
  8. Click the 'Checkout' button on the cart page
    - expect: User is redirected to checkout step one page (checkout-step-one.html)
    - expect: Page displays 'Checkout: Your Information' heading
    - expect: Three form fields are visible: 'First Name', 'Last Name', 'Zip/Postal Code'
    - expect: 'Continue' and 'Cancel' buttons are displayed
  9. Enter 'John' in the First Name field
    - expect: Text 'John' is entered in the First Name field
  10. Enter 'Doe' in the Last Name field
    - expect: Text 'Doe' is entered in the Last Name field
  11. Enter '12345' in the Zip/Postal Code field
    - expect: Text '12345' is entered in the Zip/Postal Code field
  12. Click the 'Continue' button
    - expect: User is redirected to checkout step two page (checkout-step-two.html)
    - expect: Page displays 'Checkout: Overview' heading
    - expect: Order summary displays both items with quantities and prices
    - expect: Payment Information shows 'SauceCard #31337'
    - expect: Shipping Information shows 'Free Pony Express Delivery!'
    - expect: Price summary displays: Item total: $45.98, Tax: $3.68, Total: $49.66
    - expect: 'Finish' and 'Cancel' buttons are displayed
  13. Verify price calculations are correct
    - expect: Item total ($45.98) equals sum of item prices (29.99 + 15.99)
    - expect: Tax ($3.68) is approximately 8% of item total
    - expect: Total ($49.66) equals Item total + Tax
    - expect: All values are rounded to 2 decimal places
  14. Click the 'Finish' button
    - expect: User is redirected to checkout complete page (checkout-complete.html)
    - expect: Page displays 'Checkout: Complete!' heading
    - expect: Success message 'Thank you for your order!' is displayed
    - expect: Message 'Your order has been dispatched, and will arrive just as fast as the pony can get there!' is shown
    - expect: Pony Express image is displayed
    - expect: 'Back Home' button is visible
  15. Click the 'Back Home' button
    - expect: User is redirected to products page (inventory.html)
    - expect: Shopping cart is empty (badge not visible or shows '0')
    - expect: All 6 products are displayed again
    - expect: Checkout workflow is successfully completed

#### 1.2. Complete checkout with multiple items from different categories

**File:** `tests/checkout-happy-path/multiple-items-checkout.spec.ts`

**Steps:**
  1. Log in with standard_user / secret_sauce credentials
    - expect: User is on the products page
    - expect: All products are available
  2. Add three different products to cart: Backpack ($29.99), Bike Light ($9.99), and Onesie ($7.99)
    - expect: Cart badge shows '3'
    - expect: All three items are successfully added
  3. Navigate to cart and verify all three items are present with correct details
    - expect: Cart page displays all 3 items
    - expect: Each item shows quantity of 1
    - expect: All prices are correctly displayed
  4. Proceed through checkout with valid information: First Name: 'Jane', Last Name: 'Smith', Zip: '98765'
    - expect: All form fields are accepted without error
    - expect: User proceeds to order overview
  5. Verify order overview totals are correct
    - expect: Item total: $47.97 (29.99 + 9.99 + 7.99)
    - expect: Tax: $3.84 (approximately 8% of $47.97)
    - expect: Total: $51.81
  6. Complete the order by clicking 'Finish'
    - expect: Order completion page is displayed
    - expect: Success message is shown

### 2. Checkout Form Validation - Missing Fields

**Seed:** `tests/checkout-validation.spec.ts`

#### 2.1. Validation error when all fields are empty

**File:** `tests/checkout-validation/all-fields-empty.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed with three empty fields
  2. Click 'Continue' button without filling any form fields
    - expect: Page does not navigate to the next step
    - expect: Error notification is displayed with heading 'Error: First Name is required'
    - expect: Close button appears next to the error message
    - expect: All three form fields show red error indicators
  3. Close the error notification by clicking the close button
    - expect: Error notification disappears
    - expect: Form fields remain empty and ready for input

#### 2.2. Validation error when first name is empty

**File:** `tests/checkout-validation/first-name-empty.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Leave First Name empty, enter Last Name: 'Smith', Zip: '12345'
    - expect: Last Name field contains 'Smith'
    - expect: Zip/Postal Code field contains '12345'
  3. Click 'Continue' button
    - expect: Page does not navigate to the next step
    - expect: Error notification is displayed with message 'Error: First Name is required'
    - expect: First Name field is highlighted with red error indicator

#### 2.3. Validation error when last name is empty

**File:** `tests/checkout-validation/last-name-empty.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Enter First Name: 'John', leave Last Name empty, enter Zip: '12345'
    - expect: First Name field contains 'John'
    - expect: Zip/Postal Code field contains '12345'
  3. Click 'Continue' button
    - expect: Page does not navigate to the next step
    - expect: Error notification is displayed with message 'Error: Last Name is required'
    - expect: Last Name field is highlighted with red error indicator

#### 2.4. Validation error when postal code is empty

**File:** `tests/checkout-validation/zip-code-empty.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Enter First Name: 'John', Last Name: 'Doe', leave Zip/Postal Code empty
    - expect: First Name field contains 'John'
    - expect: Last Name field contains 'Doe'
  3. Click 'Continue' button
    - expect: Page does not navigate to the next step
    - expect: Error notification is displayed with message 'Error: Postal Code is required'
    - expect: Postal Code field is highlighted with red error indicator

#### 2.5. Validation error when only first name is filled

**File:** `tests/checkout-validation/only-first-name.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Enter only First Name: 'John', leave other fields empty
    - expect: Last Name and Zip fields are empty
  3. Click 'Continue' button
    - expect: Error notification is displayed with message 'Error: Last Name is required'
  4. Close error, enter Last Name: 'Doe', leave Zip empty
    - expect: Error notification is closed
    - expect: Last Name field now contains 'Doe'
  5. Click 'Continue' button again
    - expect: Error notification is displayed with message 'Error: Postal Code is required'

### 3. Checkout Form Validation - Invalid Input Data

**Seed:** `tests/checkout-invalid-inputs.spec.ts`

#### 3.1. Special characters in name fields

**File:** `tests/checkout-invalid-inputs/special-chars-in-names.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Enter First Name: '@!#$%', Last Name: '&*()', Zip: '12345'
    - expect: All fields accept the special characters
    - expect: No validation error is triggered
  3. Click 'Continue' button
    - expect: Form accepts the input and proceeds to order overview page
    - expect: The application does not reject special characters in name fields

#### 3.2. Numbers in name fields

**File:** `tests/checkout-invalid-inputs/numbers-in-names.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Enter First Name: '123', Last Name: '456', Zip: '12345'
    - expect: All fields accept numeric values
    - expect: No validation error is triggered
  3. Click 'Continue' button
    - expect: Form accepts numeric input and proceeds to order overview page

#### 3.3. Special characters in postal code

**File:** `tests/checkout-invalid-inputs/special-chars-in-zip.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Enter First Name: 'John', Last Name: 'Doe', Zip: '1234#@'
    - expect: All fields accept the input with special characters in zip code
    - expect: No validation error is triggered
  3. Click 'Continue' button
    - expect: Form accepts the input and proceeds to order overview page

#### 3.4. Spaces-only input in name fields

**File:** `tests/checkout-invalid-inputs/spaces-only-input.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Enter First Name: '     ' (5 spaces), Last Name: '    ' (4 spaces), Zip: '12345'
    - expect: All fields accept the space input
  3. Click 'Continue' button
    - expect: Either form proceeds (if spaces are accepted as valid input) or displays 'First Name is required' error (if spaces are considered empty)

### 4. Checkout Form Edge Cases - Long and Extreme Inputs

**Seed:** `tests/checkout-edge-cases.spec.ts`

#### 4.1. Very long text input in first and last name fields

**File:** `tests/checkout-edge-cases/very-long-names.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Enter very long text in First Name field (50+ characters: 'JohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohn')
    - expect: Field accepts the long text input
  3. Enter very long text in Last Name field (50+ characters: 'DoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoe')
    - expect: Field accepts the long text input
  4. Enter valid Zip: '12345' and click 'Continue'
    - expect: Form accepts the long text inputs and proceeds to order overview
    - expect: Order overview displays the long names correctly

#### 4.2. Maximum length input testing (255+ characters)

**File:** `tests/checkout-edge-cases/max-length-input.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Enter 255 characters of repeated text in First Name field
    - expect: Field either accepts all characters or limits input to a reasonable length
  3. Enter standard valid values for Last Name ('Smith') and Zip ('12345'), click 'Continue'
    - expect: Form behavior is consistent (either accepts or enforces max length)
    - expect: Page either proceeds or shows appropriate error

#### 4.3. International characters and unicode input

**File:** `tests/checkout-edge-cases/unicode-characters.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Enter unicode/international characters: First Name: 'José', Last Name: 'Müller', Zip: '12345'
    - expect: Fields accept unicode characters
    - expect: No validation error is triggered
  3. Click 'Continue' button
    - expect: Form accepts international characters and proceeds to order overview

#### 4.4. Leading and trailing spaces in form fields

**File:** `tests/checkout-edge-cases/leading-trailing-spaces.spec.ts`

**Steps:**
  1. Log in and add an item to cart, then proceed to checkout step one
    - expect: Checkout form page is displayed
  2. Enter First Name: '  John  ', Last Name: '  Doe  ', Zip: '  12345  ' (with leading/trailing spaces)
    - expect: Fields accept input with leading and trailing spaces
  3. Click 'Continue' button
    - expect: Form either accepts the input as-is or trims the spaces before processing
    - expect: Page proceeds to order overview or shows appropriate error

### 5. Navigation and Cart Persistence Tests

**Seed:** `tests/checkout-navigation.spec.ts`

#### 5.1. Cancel button on checkout step one returns to cart

**File:** `tests/checkout-navigation/cancel-from-step-one.spec.ts`

**Steps:**
  1. Log in and add 'Backpack' ($29.99) and 'Bolt T-Shirt' ($15.99) to cart, navigate to checkout
    - expect: User is on checkout step one page
    - expect: Cart badge shows '2'
  2. Enter some data in form fields: First Name: 'John', but do NOT complete all fields
    - expect: First Name is entered but form is incomplete
  3. Click 'Cancel' button
    - expect: User is redirected back to cart page
    - expect: Cart displays both items still present with quantities and prices intact
    - expect: Cart badge still shows '2'

#### 5.2. Cancel button on checkout step two returns to cart

**File:** `tests/checkout-navigation/cancel-from-step-two.spec.ts`

**Steps:**
  1. Log in and add items to cart, proceed through checkout step one with complete information
    - expect: User is on checkout step two (overview) page
  2. Click 'Cancel' button on step two
    - expect: User is redirected back to cart page
    - expect: Both items are still in the cart with original prices and quantities

#### 5.3. Back button in cart returns to products page

**File:** `tests/checkout-navigation/back-from-cart.spec.ts`

**Steps:**
  1. Log in and add items to cart, navigate to cart page
    - expect: Cart page is displayed with items
    - expect: Cart badge shows '2'
  2. Click 'Continue Shopping' button (back button)
    - expect: User is redirected to products page
    - expect: Cart badge still shows '2'
    - expect: Items remain in cart
  3. Add another item to cart
    - expect: Cart badge updates to '3'
  4. Navigate back to cart
    - expect: Cart displays all 3 items
    - expect: All items are preserved

#### 5.4. Navigation through checkout workflow sequentially

**File:** `tests/checkout-navigation/sequential-navigation.spec.ts`

**Steps:**
  1. Log in and add single item to cart
    - expect: Cart badge shows '1'
  2. Navigate through: Products -> Cart -> Checkout Step 1 -> Checkout Step 2 -> Completion
    - expect: Each page loads correctly and sequentially
    - expect: Cart contents persist throughout
    - expect: All information from Step 1 is retained on Step 2

#### 5.5. Back Home from completion page resets cart

**File:** `tests/checkout-navigation/back-home-resets-cart.spec.ts`

**Steps:**
  1. Complete a full checkout workflow successfully
    - expect: Completion page is displayed with 'Thank you for your order!' message
  2. Click 'Back Home' button
    - expect: User is redirected to products page
    - expect: Shopping cart is empty (badge not visible or shows '0')
    - expect: Product list is displayed normally

### 6. Order Overview and Price Calculation Tests

**Seed:** `tests/checkout-overview.spec.ts`

#### 6.1. Verify correct price calculations with 2 items

**File:** `tests/checkout-overview/price-calculation-2-items.spec.ts`

**Steps:**
  1. Log in and add Backpack ($29.99) and Bolt T-Shirt ($15.99) to cart
    - expect: Both items are added and cart shows '2'
  2. Navigate through checkout to order overview page
    - expect: Order overview page displays the 2 items with prices
  3. Verify the price calculations are correct
    - expect: Item total: $45.98 (29.99 + 15.99)
    - expect: Tax calculated: $3.68 (approximately 8% of 45.98)
    - expect: Order total: $49.66 (45.98 + 3.68)

#### 6.2. Verify correct price calculations with multiple items (4+ items)

**File:** `tests/checkout-overview/price-calculation-multiple-items.spec.ts`

**Steps:**
  1. Log in and add 4 items to cart: Backpack ($29.99), Bike Light ($9.99), Bolt T-Shirt ($15.99), Onesie ($7.99)
    - expect: All 4 items are added and cart shows '4'
  2. Navigate to checkout and complete step one
    - expect: User is on order overview page
  3. Verify price calculations
    - expect: Item total: $63.96 (29.99 + 9.99 + 15.99 + 7.99)
    - expect: Tax: $5.12 (approximately 8% of 63.96)
    - expect: Total: $69.08 (63.96 + 5.12)

#### 6.3. Verify order overview displays correct payment and shipping info

**File:** `tests/checkout-overview/payment-shipping-info.spec.ts`

**Steps:**
  1. Log in, add items, and complete checkout step one
    - expect: Order overview page is displayed
  2. Verify payment information section
    - expect: Section header displays 'Payment Information:'
    - expect: Payment method displays 'SauceCard #31337'
  3. Verify shipping information section
    - expect: Section header displays 'Shipping Information:'
    - expect: Shipping method displays 'Free Pony Express Delivery!'

#### 6.4. Order overview displays complete item details

**File:** `tests/checkout-overview/item-details-in-overview.spec.ts`

**Steps:**
  1. Log in and add Backpack ($29.99) and Bolt T-Shirt ($15.99) to cart
    - expect: Items are added to cart
  2. Complete checkout step one and view overview
    - expect: Order overview displays both items
  3. Verify each item displays: quantity, product name, description, and price
    - expect: Item 1: Qty=1, Name='Sauce Labs Backpack', Description present, Price=$29.99
    - expect: Item 2: Qty=1, Name='Sauce Labs Bolt T-Shirt', Description present, Price=$15.99

### 7. UI Elements and Form Visibility Tests

**Seed:** `tests/checkout-ui.spec.ts`

#### 7.1. Checkout step one form fields are properly labeled

**File:** `tests/checkout-ui/step-one-labels.spec.ts`

**Steps:**
  1. Log in and navigate to checkout step one
    - expect: Checkout form page is displayed
  2. Verify form field labels are visible and correct
    - expect: Form displays label 'First Name' associated with first input field
    - expect: Form displays label 'Last Name' associated with second input field
    - expect: Form displays label 'Zip/Postal Code' associated with third input field

#### 7.2. Error messages display correctly and are dismissible

**File:** `tests/checkout-ui/error-message-display.spec.ts`

**Steps:**
  1. Log in and navigate to checkout step one
    - expect: Form is displayed
  2. Click 'Continue' without filling any fields
    - expect: Error notification appears as a heading: 'Error: First Name is required'
    - expect: Error message is clearly visible and readable
  3. Verify error styling (color, icon, etc.)
    - expect: Error notification uses distinct styling to indicate error state
    - expect: Close button (X) is visible next to the error message
  4. Click the close button to dismiss the error
    - expect: Error notification disappears
    - expect: Form remains ready for input on the page

#### 7.3. Buttons are functional and properly labeled

**File:** `tests/checkout-ui/button-functionality.spec.ts`

**Steps:**
  1. Navigate through the checkout process and observe buttons on each step
    - expect: Step 1 has 'Continue' and 'Cancel' buttons clearly labeled
    - expect: Step 2 has 'Finish' and 'Cancel' buttons clearly labeled
    - expect: All buttons are clickable and have appropriate styling
  2. Verify Cancel button behavior
    - expect: Cancel button returns user to previous page without saving checkout information
  3. Verify Continue/Finish button behavior
    - expect: Continue button advances to next step when form is valid
    - expect: Finish button completes the order and shows confirmation page

#### 7.4. Cart item cards display all required information

**File:** `tests/checkout-ui/cart-item-display.spec.ts`

**Steps:**
  1. Log in and add items to cart, navigate to cart page
    - expect: Cart page displays items
  2. Verify each item card displays: product image, product name, description, price, and remove button
    - expect: Product images are displayed for each item
    - expect: Product names are clickable links
    - expect: Product descriptions are visible
    - expect: Prices are formatted correctly with $ symbol
    - expect: Remove buttons are available for each item

#### 7.5. Order overview table structure is clear and readable

**File:** `tests/checkout-ui/overview-table-structure.spec.ts`

**Steps:**
  1. Log in, add items, and navigate to checkout overview
    - expect: Order overview page is displayed
  2. Verify table has proper column headers
    - expect: Table displays 'QTY' column header
    - expect: Table displays 'Description' column header
    - expect: Table has clear row structure with one row per item
  3. Verify price summary section is clearly organized
    - expect: Item total is clearly labeled and displayed
    - expect: Tax is clearly labeled and displayed with calculation
    - expect: Total is clearly labeled, highlighted, and easy to identify

### 8. Cart Review and Product Details Tests

**Seed:** `tests/cart-review.spec.ts`

#### 8.1. Cart displays correct item quantities and totals

**File:** `tests/cart-review/item-totals.spec.ts`

**Steps:**
  1. Log in and add 2 Backpacks (same item twice) to cart - if quantity incrementing is supported
    - expect: Cart shows either 2 separate items or 1 item with quantity 2
  2. Navigate to cart page
    - expect: Cart displays the correct quantity for each item
    - expect: Item row shows QTY=2 for backpack (if quantity incrementing) or lists item twice
  3. Verify cart item count badge matches items in cart
    - expect: Cart badge accurately reflects number of items or quantity

#### 8.2. Remove button removes items from cart

**File:** `tests/cart-review/remove-items.spec.ts`

**Steps:**
  1. Log in and add Backpack ($29.99) and Bolt T-Shirt ($15.99) to cart
    - expect: Cart badge shows '2'
  2. Navigate to cart page
    - expect: Both items are displayed in cart
  3. Click 'Remove' button for Backpack
    - expect: Backpack is removed from cart display
    - expect: Cart badge updates to '1'
    - expect: Only Bolt T-Shirt remains in cart
  4. Click 'Remove' button for the remaining item
    - expect: Bolt T-Shirt is removed from cart
    - expect: Cart is now empty
    - expect: Cart badge is no longer visible or shows '0'
    - expect: Page may display 'Your cart is empty' or similar message

#### 8.3. Cart displays product descriptions and links clickable

**File:** `tests/cart-review/product-descriptions.spec.ts`

**Steps:**
  1. Log in and add multiple different items to cart
    - expect: Items are added to cart
  2. Navigate to cart page
    - expect: Each item displays product name and description
    - expect: Product names are displayed as clickable links
  3. Click on a product name link in the cart
    - expect: Link may navigate to product details page or back to products page (depending on implementation)
    - expect: No errors are displayed

#### 8.4. Cart navigation options are available

**File:** `tests/cart-review/cart-navigation.spec.ts`

**Steps:**
  1. Log in, add items to cart, navigate to cart page
    - expect: Cart page is displayed with items
  2. Verify navigation options are available
    - expect: 'Continue Shopping' button is visible and clickable
    - expect: 'Checkout' button is visible and clickable
    - expect: Both buttons have appropriate labels
  3. Verify cart persistence
    - expect: Shopping cart remains accessible from any product page via cart badge
    - expect: Cart contents persist when navigating between pages

### 9. Negative Scenarios - Form Submission Edge Cases

**Seed:** `tests/checkout-negative.spec.ts`

#### 9.1. Cannot proceed with form containing only whitespace

**File:** `tests/checkout-negative/whitespace-only.spec.ts`

**Steps:**
  1. Log in and navigate to checkout step one
    - expect: Form is displayed and ready for input
  2. Fill form with only whitespace: First Name: '   ', Last Name: '   ', Zip: '     '
    - expect: Fields contain only spaces
  3. Click 'Continue' button
    - expect: Application either: treats whitespace as empty and shows 'First Name is required' error, OR accepts whitespace as valid input and proceeds

#### 9.2. Tab order and form navigation using keyboard

**File:** `tests/checkout-negative/keyboard-navigation.spec.ts`

**Steps:**
  1. Log in and navigate to checkout step one
    - expect: Form is displayed
  2. Click in First Name field and press Tab to move to next field
    - expect: Focus moves to Last Name field
  3. Press Tab again to move to next field
    - expect: Focus moves to Zip/Postal Code field
  4. Press Tab again
    - expect: Focus moves to Continue or next interactive button
    - expect: Tab order follows logical sequence through form elements

#### 9.3. Form field max length constraints (if implemented)

**File:** `tests/checkout-negative/max-length-validation.spec.ts`

**Steps:**
  1. Log in and navigate to checkout step one
    - expect: Form is displayed
  2. Attempt to enter 200 characters in First Name field
    - expect: Field either accepts all characters or stops at max length
    - expect: User experience is clear about any length limitations
  3. Complete other fields and submit
    - expect: Form handles long input consistently

### 10. Order Completion and Confirmation Tests

**Seed:** `tests/checkout-completion.spec.ts`

#### 10.1. Order confirmation page displays all required elements

**File:** `tests/checkout-completion/confirmation-page-elements.spec.ts`

**Steps:**
  1. Complete a full checkout workflow successfully
    - expect: User is on checkout complete page (checkout-complete.html)
  2. Verify page title and heading
    - expect: Page title is 'Swag Labs'
    - expect: Main heading displays 'Checkout: Complete!'
  3. Verify success message is clearly displayed
    - expect: Success heading: 'Thank you for your order!'
    - expect: Confirmation message: 'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
    - expect: Pony Express image is displayed
  4. Verify navigation option
    - expect: 'Back Home' button is displayed and clickable

#### 10.2. Back Home button clears cart and returns to products

**File:** `tests/checkout-completion/back-home-functionality.spec.ts`

**Steps:**
  1. Complete a full checkout order
    - expect: Confirmation page is displayed
  2. Verify cart badge before clicking Back Home
    - expect: Cart badge shows '0' or is not visible (order was completed and cleared)
  3. Click 'Back Home' button
    - expect: User is redirected to products page (inventory.html)
    - expect: Shopping cart is empty
    - expect: All 6 products are displayed with 'Add to cart' buttons

#### 10.3. Order confirmation URL is correct

**File:** `tests/checkout-completion/confirmation-url.spec.ts`

**Steps:**
  1. Complete a full checkout order
    - expect: Page URL displays 'checkout-complete.html'
  2. Verify URL is correct and not showing any error pages
    - expect: URL is: https://www.saucedemo.com/checkout-complete.html
    - expect: No 404 or error indicators in URL
