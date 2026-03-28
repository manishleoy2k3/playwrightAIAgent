/**
 * Playwright Script Generator
 * Converts generated test cases to executable Playwright TypeScript scripts
 */

import { GeneratedTestCase } from './testGenerationAgent';
import * as fs from 'fs';

export class PlaywrightScriptGenerator {
  /**
   * Generate a single Playwright test script from a test case
   */
  static generateScript(
    testCase: GeneratedTestCase,
    testSuiteName: string,
    config?: {
      baseUrl?: string;
      browsers?: string[];
      setupHook?: string;
      teardownHook?: string;
    }
  ): string {
    const baseUrl = config?.baseUrl || process.env.APP_BASE_URL || 'http://localhost:3000';
    const browsers = config?.browsers || ['chromium', 'firefox', 'webkit'];

    // Convert test case steps to Playwright actions
    const stepsCode = testCase.steps
      .map(
        (step, index) => `
    // Step ${index + 1}: ${step}
    // TODO: Update selectors based on actual application
    // await page.click('[data-testid="element-id"]');
    // await page.fill('[data-testid="input-id"]', 'value');
    // await page.waitForNavigation();
      `.trim()
      )
      .join('\n\n');

    // Convert assertions
    const assertionsCode = testCase.assertions
      .map((assertion) => `    await expect(${assertion}).toBeTruthy();`)
      .join('\n');

    // Setup code
    const setupCode =
      config?.setupHook ||
      `
    // Navigate to application
    await page.goto('${baseUrl}');
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    `.trim();

    // Teardown code
    const teardownCode = config?.teardownHook || '    // Cleanup if needed';

    return `
import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';

test.describe('${testSuiteName}', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // Setup: ${testCase.preconditions || 'Navigate to application'}
    const context: BrowserContext = await browser.newContext();
    page = await context.newPage();

${setupCode}
  });

  test.afterEach(async () => {
    // Cleanup
${teardownCode}
    await page.close();
  });

  test('${testCase.name}', async () => {
    /**
     * Description: ${testCase.description}
     * Sources: ${testCase.sourceDocuments?.join(', ') || 'Generated from knowledge base'}
     */

    // Test Steps
${stepsCode}

    // Assertions
${assertionsCode}
  });
});
    `.trim();
  }

  /**
   * Generate multiple test scripts from test cases
   */
  static generateMultipleScripts(
    testCases: GeneratedTestCase[],
    outputDir: string,
    config?: {
      baseUrl?: string;
      browsers?: string[];
    }
  ): void {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true});
    }

    testCases.forEach((testCase, index) => {
      try {
        const suiteName = `Test Suite ${index + 1}`;

        // Generate script
        const script = this.generateScript(testCase, suiteName, config);

        // Create safe filename
        const fileName = testCase.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .substring(0, 50);

        const filePath = `${outputDir}/generated-${fileName}.spec.ts`;

        // Write to file
        fs.writeFileSync(filePath, script);
        console.log(`✓ Generated: ${filePath}`);
      } catch (error) {
        console.error(`✗ Failed to generate script for test case: ${index + 1}`, error);
      }
    });
  }

  /**
   * Generate configuration file for running multiple browsers
   */
  static generatePlaywrightConfig(outputPath: string = './playwright.config.ts'): void {
    const config = `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
  ],

  use: {
    baseURL: process.env.APP_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
    `.trim();

    fs.writeFileSync(outputPath, config);
    console.log(`✓ Playwright configuration generated: ${outputPath}`);
  }

  /**
   * Generate a Page Object Model helper
   */
  static generatePageObjectModel(outputPath: string = './pages/basePage.ts'): void {
    const pageObjectCode = `
import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object Model
 * Provides common methods for all pages
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async click(selector: string) {
    await this.page.click(selector);
  }

  async fill(selector: string, text: string) {
    await this.page.fill(selector, text);
  }

  async getText(selector: string): Promise<string> {
    return this.page.textContent(selector) || '';
  }

  async isVisible(selector: string): Promise<boolean> {
    try {
      return await this.page.isVisible(selector);
    } catch {
      return false;
    }
  }

  async waitForElement(selector: string, timeout?: number) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async getLocator(selector: string): Promise<Locator> {
    return this.page.locator(selector);
  }

  async screenshot(name: string) {
    await this.page.screenshot({ path: \`./screenshots/\${name}.png\` });
  }
}
    `.trim();

    fs.writeFileSync(outputPath, pageObjectCode);
    console.log(`✓ Page Object Model generated: ${outputPath}`);
  }

  /**
   * Generate test data file
   */
  static generateTestData(testSuiteName: string, outputPath: string): void {
    const testData = {
      suite: testSuiteName,
      validCredentials: {
        email: 'test@example.com',
        password: 'TestPassword123!',
      },
      invalidCredentials: {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      },
      edgeCases: {
        emailWithSpecialChars: 'test+tag@example.co.uk',
        longPassword: 'P@ssw0rd'.repeat(10),
        sqlInjectionAttempt: "' OR '1'='1",
      },
      timeout: 30000,
      retries: 3,
    };

    fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));
    console.log(`✓ Test data generated: ${outputPath}`);
  }

  /**
   * Generate README for generated tests
   */
  static generateReadme(outputPath: string = './tests/generated/README.md'): void {
    const readme = `
# Auto-Generated Test Cases

This directory contains test cases automatically generated from your knowledge base using RAG.

## Overview

These tests were generated from:
- Confluence documentation
- Excel test case repository  
- Additional requirements documents

## Running Tests

\`\`\`bash
# Run all generated tests
npx playwright test tests/generated

# Run specific test file
npx playwright test tests/generated/test-name.spec.ts

# Run with specific browser
npx playwright test tests/generated --project=chromium

# Run in debug mode
npx playwright test tests/generated --debug

# Run with UI
npx playwright test tests/generated --ui
\`\`\`

## Updating Tests

### Manual Updates
1. Edit test file in \`tests/generated/\`
2. Update selectors if UI changes
3. Run tests to verify
4. Commit changes

### Auto-Healing Failed Tests
\`\`\`bash
npm run test:heal
\`\`\`

This automatically fixes failing tests using:
- Selector analysis & repair
- Timing adjustments
- Assertion validation

## Viewing Reports

\`\`\`bash
# Generate HTML report
npx playwright show-report
\`\`\`

## Test Configuration

See \`playwright.config.ts\` for:
- Browser configuration
- Viewport sizes
- Timeouts
- Screenshot settings
- Video recording

## Best Practices

1. **Selectors**: Use data-testid attributes when possible
2. **Waits**: Use proper wait strategies (waitForNavigation, waitForSelector)
3. **Assertions**: Be specific with expectation messages
4. **Comments**: Add comments for complex test logic
5. **Data**: Use test data files for consistency

## Regenerating Tests

When test cases in your knowledge base change:

\`\`\`bash
npm run regenerate-tests
\`\`\`

This will:
1. Load knowledge base
2. Generate new test cases
3. Create Playwright scripts
4. Update existing tests

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Selector not found | Use browser DevTools to find correct selector |
| Test timing out | Increase timeout or add proper wait strategies |
| Test fails randomly | Check for race conditions or timing issues |
| Cannot generate report | Ensure all tests completed |

## Links

- [Playwright Documentation](https://playwright.dev)
- [Test Generation Guide](../../RAG_IMPLEMENTATION_GUIDE.md)
- [Knowledge Base](../../data/)
    `.trim();

    fs.writeFileSync(outputPath, readme);
    console.log(`[OK] README generated: ${outputPath}`);
  }
}
