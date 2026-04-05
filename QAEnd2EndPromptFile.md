# QA End-to-End Testing Automation Prompt

## Purpose
This prompt guides the complete QA automation workflow for end-to-end testing using Playwright, from requirements analysis through test execution, healing, reporting and commiting the code to git repository.


## Step 1: Read and Analyze User Story

### Objective:
I need to start a new testing workflow. Please read the user story from the file:
user-stories/SauceDemo-ecommerce-checkout.md
Summarize the key requirements, acceptance criteria, and testing scope.

### Instructions
- **Tasks**:
  1. Read and parse the user story document completely
  2. Identify and summarize all functional requirements
  3. Extract and list all acceptance criteria
  4. Define the testing scope (what to test, what not to test)
  5. Identify key user workflows and interactions
  6. Note any non-functional requirements (performance, security, accessibility)
  7. List business rules and edge cases mentioned

Expected Output:
  
  - Summary of the User story
  - List of acceptance criteria
  - Application URL and test credentials
  - Key features to test


## Step 2: Create Comprehensive Test Plan

### Objective:
Based on the user story SCRUM-101 that we just reviewed, use the playwright-test-planner agent to: 
  1. Read the application URL and test credentials from the user story 
  2. Explore the application and understadn all workflows mentioned in the acceptance criteria
  3. Create a comprehensive test plan that covers all acceptance criteria including:
     - Happy path scenarios
     - Negative scenarios (emptry fields, invalid data, null values, Min/max values)
     - Edge cases and boundary conditions
     - Navigation flow tests
     - UI element validation (Button states, field visibility, label accuracy, responsive behavior)
  4. Save the test plan as : specs/saucedemo-checkout-test-plan.md

Ensure each test scenario includes**:
- Clear test case title
- Detailed step-by-step instructions
- Expected results for each step
- Test data requirements
  
Expected Output:
  - Complete test plan markdown file saved to specs/
  - Organized test scenarios with clear structure
  - Browser exploration screenshots (if needed) 


## Step 3: Perform Exploratory Testing

### Objective:
Now I need to perform manual exploratory testing using Playwright MCP browser tools.
Please read the test plan from: specs/saucedemo-checkout-test-plan.md

Then execute the test scenarios defined in that plan:
1. Use Playwright browser tools to manually execute each test scenario from the plan
2. Follow the step-by-step instructions in each test case 
3. Verify expected results match the actual result
4. Take screenshots at key steps and error states
5. Document your findings:
  - Test execution results for each scenarios
  - Any UI inconsistencies or unexpected behaviors 
  - Missing validations or bugs discovered
  - Screenshots as evidence

Expected Output:
  1. Manual execution results
  2. Screenshots of application at various stages
  3. List of observations and findings
  4. Any issues discovered during exploration


## Step 4: Generate Playwright Automation Scripts

### Objective:
Now I need to create automated, robust, maintainable Playwright automation scripts.

- **Use Agent**: `playwright-test-generator`

### Instructions
- **Input**:
  - Output directory (e.g., `tests/`)

Please review:
1. Test plan from: specs/saucedemo-checkout-test-plan.md (for test scenarios and steps)
2. Exploratory testing results from Step 3 (for actual element selectors and UI insights)

Using insights from the manual exploratory testing:
- Leverage the element selectors and locators that were successfully used in Step 3
- Use stable element properties (IDs, data attributes, roles) discovered during exploration
- Apply wait strategies and UI behaviors observed during manual testing
- Incorporate any workarounds for UI quirks discovered

Generate Playwright TypeScript automation scripts:
1. Create scripts for each test scenario from the test plan
2. Organize scripts into appropriate test suite files in: tests/saucedemo-checkout/
3. Use the test case names and steps from the test plan
4. Use reliable selectors and strategies from exploratory testing

Requirements for all scripts:
- Follow Playwright best practices
- Include proper assertions using expect()
- Use descriptive test names matching the format in the test plan
- Use robust element selectors discovered during manual testing - Add comments for complex steps
- Use proper wait strategies based on actual application behavior - Add proper test hooks (beforeEach, afterEach) Configure for multiple browsers (Chrome, Firefox, Safari)

- **Best Practices to Follow**:
  1. **Descriptive Test Names**: Use clear, action-oriented test names (e.g., `should_display_error_when_email_invalid`)
  2. **Robust Selectors**: Use discovered selectors from exploratory testing (prefer `data-testid`, id, aria-labels)
  3. **Proper Assertions**: Use `expect()` for all assertions, be specific with assertion messages
  4. **Wait Strategies**: Implement proper waits based on actual application behavior
     - Use `waitForSelector()`, `waitForNavigation()`, `waitForFunction()`
     - Avoid arbitrary `sleep()` calls
  5. **Comments**: Add comments for complex steps or non-obvious logic
  6. **Test Hooks**: Implement `beforeEach()` and `afterEach()` for setup and cleanup
  7. **Multiple Browser Configuration**: Configure for Chrome, Firefox, and Safari
  8. **Data Management**: Use test data fixtures or separate data files
  9. **Error Handling**: Include proper error messages in assertions
  10. **Page Object Model (Optional)**: Consider using POM for complex applications

- **Script Structure**:
  ```typescript
  // tests/[feature]/[test-name].spec.ts
  import { test, expect } from '@playwright/test';
  
  test.describe('Feature: [Feature Name]', () => {
    test.beforeEach(async ({ page }) => {
      // Setup: Navigate to page, login, etc.
    });
  
    test.afterEach(async ({ page }) => {
      // Cleanup: Logout, clear data, etc.
    });
  
    test('should [action] when [condition]', async ({ page }) => {
      // Step 1: Initial action
      await page.click('[data-testid="button-id"]');
      
      // Step 2: Verify state
      await expect(page.locator('[data-testid="result"]')).toBeVisible();
      
      // Step 3: Assert specific values
      const text = await page.locator('[data-testid="result"]').textContent();
      expect(text).toBe('Expected value');
    });
  });
  ```

- **Configuration**: Create or update `playwright.config.ts` with:
  - Multiple browser projects (chromium, firefox, webkit)
  - Proper timeouts
  - Screenshot/video capture on failure
  - Report generation

- **Tasks**:
  1. Generate all test scripts based on test plan
  2. Implement all best practices listed above
  3. Run the generated tests: `npx playwright test`
  4. Verify all tests pass
  5. Generate test report

After generating the scripts, run the tests to verify they pass.

Expected Output:
- Test suite files created in tests/saucedemo-checkout/ based on test plan scenarios
- Scripts using robust selectors discovered during exploratory testing
- All scripts follow Playwright best practices
- Initial test generation complete


## Step 5: Execute and Heal Failing Automation Tests

### Objective:
Run all automation tests, identify failures, analyze root causes, and auto-heal them.

- **Execution Steps**:
  1. **Run All Tests**: Execute `npx playwright test` to run all tests in the tests/ folder
  2. **Identify Failures**: Document all failed tests with error messages
  3. **Analyze Each Failure** using `playwright-test-healer` agent:
     - **Selector Issues**: Element not found, selector changed
     - **Timing Issues**: Element not ready, navigation not complete
     - **Assertion Failures**: Unexpected values, missing elements
     - **Wait Strategy Issues**: Insufficient wait time for dynamic content
  4. **Auto-Heal Process**:
     - Update selectors with more robust ones
     - Add proper wait strategies
     - Fix assertion logic
     - Update test logic if application behavior differs
  5. **Re-run Tests**: Execute healed tests to verify they pass
  6. **Repeat**: Continue healing until all tests pass

- **Failure Analysis Template**:
  ```
  ## Failed Test: [Test Name]
  - Error: [Error message]
  - Root Cause: [Analysis of why it failed]
  - Fix Applied: [What was changed]
  - Status After Fix: ✓ PASSED / ✗ STILL FAILING
  ```

- **Healing Tips**:
  - Use browser DevTools to inspect elements
  - Add logging to understand application state
  - Check for race conditions or timing issues
  - Verify selectors match current UI
  - Consider application-specific wait triggers

- Expected Output:
  - All automation tests executed and passing
  - Failing tests identified and healed using test-healer agent
  - Healed test scripts updated in tests/saucedemo-checkout/
  - Final stable test execution results
  - Summary of healing activities performed

---

## Step 6: Create Test Report

### Objective:
Compile comprehensive test results and metrics from all previous stages.

### Instructions
- **Input**: 
  - Exploratory testing results (Step 3)
  - Automation script results (Step 4)
  - Healing process results (Step 5)
  - Test execution logs

- **Report Structure**:
  ```markdown
  # QA End-to-End Test Report
  
  ## Executive Summary
  - Total Test Cases: [number]
  - Passed: [number] ([percentage]%)
  - Failed: [number] ([percentage]%)
  - Blocked: [number] ([percentage]%)
  - Overall Status: ✓ PASSED / ✗ FAILED
  
  ## Test Coverage
  - Happy Path: [count] tests
  - Negative Scenarios: [count] tests
  - Edge Cases: [count] tests
  - Navigation Flows: [count] tests
  - UI Validation: [count] tests
  
  ## Exploratory Testing Results
  - [Summary of findings]
  - [Issues discovered]
  - [Browser compatibility notes]
  
  ## Automation Test Results
  - [Test execution summary]
  - [Failed tests analysis]
  - [Performance metrics]
  
  ## Healing Process
  - Initial Failures: [count]
  - Fixed Issues: [count]
  - Final Status: All tests passing
  
  ## Browser & Environment Coverage
  - Browsers Tested: Chrome, Firefox, Safari
  - Platforms: Windows, macOS, Linux
  - Viewports: Desktop, Tablet, Mobile
  
  ## Issues & Recommendations
  - [Critical issues found]
  - [Recommendations for future testing]
  - [Known limitations]
  
  ## Test Artifacts
  - Screenshots: [count] captured
  - Videos: [count] recorded (if applicable)
  - Logs: [location of test logs]
  - Test Results: [location of detailed results]
  
  ## Sign-off
  - QA Lead: [Name] - [Date]
  - Status: ✓ READY FOR DEPLOYMENT
  ```

- **Metrics to Include**:
  - Test pass rate
  - Test coverage percentage
  - Defects found
  - Test execution time
  - Browser compatibility results

- **Deliverable**: Test report saved to specified location (e.g., `reports/test-report.md`)


## Workflow Summary

```
Step 1: Read User Story
    ↓
Step 2: Create Test Plan
    ↓
Step 3: Exploratory Testing (Manual)
    ↓
Step 4: Generate Automation Scripts
    ↓
Step 5: Execute & Heal Tests
    ↓
Step 6: Create Test Report
    ↓
Step 7: Commit to Git
```

---

## Key Success Criteria

- ✓ All 7 step completed successfully
- ✓ 100% test pass rate after healing
- ✓ Comprehensive test coverage (happy path, negative, edge cases)
- ✓ Tests pass across multiple browsers
- ✓ Clear, maintainable test code
- ✓ Complete test report generated
- ✓ All artifacts committed to Git

---

## Tools & Technologies

- **Test Framework**: Playwright
- **Language**: TypeScript
- **Test Agents**:
  - `playwright-test-planner`: For creating test plan from user stories
  - `playwright-test-generator`: For creating automation scripts
  - `playwright-test-healer`: For debugging and fixing failing tests
- **Browser Tools**: Playwright MCP browser interaction tools
- **Repository**: Git
- **Reporting**: Playwright built-in reporters

---

## References

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Types & Coverage](https://playwright.dev/docs/intro)
