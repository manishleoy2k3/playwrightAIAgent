Playwright TypeScript coding style and POM conventions

- File layout:
  - POM classes under `tests/page-objects/<feature>/<class>.ts`
  - Tests under `tests/e2e/<feature>/<spec>.spec.ts`

- POM class:
  - ClassName: PascalCase + 'Page' (e.g., TransferPage)
  - Constructor: `constructor(private page: Page) {}`
  - Locators: public readonly properties using `page.locator()`
  - Methods: small atomic methods that perform actions (no assertions in POM)
  - Document any TODO selector validation with `// TODO` comments.

- Test file:
  - Use `test.describe` groups and single `test` per manual testcase id when possible
  - Import POM and call its methods in the test body
  - Place assertions in the test using `expect` and the 'assertion' field from enhanced JSON

- Selector guidance:
  - Prefer `data-testid` attributes
  - If unavailable, prefer `role`, `aria-*`, `input[name]`, `button:has-text("Text")`
  - Use `locator.getByRole()` and `locator.getByLabel()` when appropriate

- Waiting and stability:
  - Use `await locator.waitFor({ state: 'visible' })` or `await expect(locator).toBeVisible()` before asserting
  - Avoid fixed sleeps; use Playwright's waiting helpers
