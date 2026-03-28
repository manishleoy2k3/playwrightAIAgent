# RAG-Based Test Automation System - Quick Start Guide

## 🎯 What This System Does

This system enables manual testers to:
1. **Automatically generate test cases** from Confluence documentation and Excel repositories
2. **Convert test cases to Playwright automation scripts** using LLM and RAG
3. **Auto-heal failing tests** during in-sprint testing
4. **Commit to Git** with complete test reports

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
npm run build
```

### Step 2: Configure Environment

```bash
# Copy example configuration
cp .env.example .env

# Edit .env and add your credentials:
# - OPENAI_API_KEY (required for LLM)
# - CONFLUENCE_BASE_URL (optional)
# - CONFLUENCE_AUTH_TOKEN (optional)
```

### Step 3: Create Sample Files

```bash
npm run setup
npm run create-sample-files
```

### Step 4: Generate Tests

```bash
npm run generate-tests
npm run generate-scripts
```

### Step 5: Run Tests

```bash
npx playwright test tests/generated
```

## 📋 File Structure

```
playwrightAIAgent/
├── utils/
│   ├── confluenceLoader.ts          # Load from Confluence
│   ├── excelTestCasesLoader.ts      # Load from Excel
│   ├── ragVectorStore.ts            # Vector database for RAG
│   ├── testGenerationAgent.ts       # LLM-based test generator
│   ├── knowledgeBaseOrchestrator.ts # Main orchestrator
│   ├── playwrightScriptGenerator.ts # Convert to Playwright
│   ├── database.ts                  # Database utilities
│   ├── workflowExample.ts           # Complete workflow example
│   └── examples/                    # Usage examples
├── data/                            # Knowledge sources
│   ├── test-cases.xlsx              # Your Excel test cases
│   ├── requirements.md              # Requirements
│   ├── api-docs.md                  # API documentation
│   └── vector-store.json            # RAG cache
├── generated-tests/                 # Generated test case JSON
├── tests/
│   ├── generated/                   # Auto-generated Playwright scripts
│   └── manual/                      # Manual test templates
├── reports/                         # Test results
├── setup.ts                         # Setup script
├── RAG_IMPLEMENTATION_GUIDE.md       # Complete guide
└── package.json                     # Dependencies
```

## 🔄 Daily Workflow for Manual Testers

### Morning: Generate Tests for Today's Work

```bash
# 1. Load existing knowledge base
npm run load-kb

# 2. Generate tests for new stories
npm run generate-tests

# 3. Create Playwright scripts
npm run generate-scripts

# 4. Run tests
npm run test
```

### During Day: Update & Heal Tests

```bash
# After discovering issues:
# 1. Update Excel/Confluence with findings
npm run regenerate-tests

# 2. Fix failing tests automatically
npm run test:heal

# 3. Review changes
git status
```

### End of Day: Commit to Git

```bash
# Check what changed
git status

# Add all test artifacts
git add tests/ generated-tests/ data/vector-store.json reports/

# Commit with description
git commit -m "feat: Add E2E tests for authentication feature

- Generated 12 test cases from requirements
- 100% pass rate after healing
- Covers happy path, negative scenarios, edge cases
- Tested on Chrome, Firefox, Safari
- Updated knowledge base with new findings"

# Push to repository
git push origin feature/sprint-tests
```

## 🧠 Training Your LLM (Knowledge Ingestion)

### From Confluence

1. **Create Confluence Space** with:
   - Product requirements
   - Technical documentation
   - Feature specifications
   - Known issues & workarounds

2. **Add to System**:
   ```bash
   npm run setup
   ```

3. **System learns** from all Confluence pages automatically

### From Excel Test Cases

1. **Create Excel File**: `data/test-cases.xlsx`

2. **Sheets Required**:
   - `TestCases`: ID, Name, Description, Steps, Expected Results, Priority
   - `Requirements`: ID, Description, Module
   - `AcceptanceCriteria`: Test Case ID, Criteria

3. **System ingests** automatically during generation

### From Documentation

1. **Add Markdown Files**:
   - `data/requirements.md`
   - `data/api-docs.md`
   - `data/user-stories.md`
   - `data/business-rules.md`

2. **System processes** on each generation cycle

## 🤖 Generated Test Cases

### Example: Auto-Generated Test Case

**Input (from knowledge base):**
```
Requirement: User must be able to reset password via email link
```

**Generated Test Case:**
```json
{
  "name": "should_reset_password_via_email_link",
  "description": "Verify user can reset password using email link",
  "preconditions": "User logged out, valid email registered",
  "steps": [
    "Navigate to login page",
    "Click 'Forgot Password' link",
    "Enter email address",
    "Click 'Send Reset Link'",
    "Check email for reset link",
    "Click reset link in email",
    "Enter new password",
    "Confirm new password",
    "Click 'Reset Password' button"
  ],
  "expectedResults": [
    "Reset confirmation message shown",
    "Can login with new password",
    "Old password no longer works"
  ],
  "assertions": [
    "page.locator('text=Password reset successful').isVisible()",
    "user.canLoginWith(newPassword)",
    "user.cannotLoginWith(oldPassword)"
  ]
}
```

**Generated Playwright Script:**
```typescript
test('should_reset_password_via_email_link', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/login');
  
  // Click 'Forgot Password' link
  await page.click('[data-testid="forgot-password-link"]');
  
  // Enter email address
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  
  // Click 'Send Reset Link'
  await page.click('[data-testid="send-reset-link"]');
  
  // Assertions
  await expect(page.locator('text=Password reset successful')).toBeVisible();
});
```

## 🔧 Customization

### Use Your Own LLM

```typescript
// utils/testGenerationAgent.ts
const llm = new ChatOpenAI({
  modelName: 'your-model-name', // Change model
  temperature: 0.3,
  openAIApiKey: process.env.OPENAI_API_KEY,
});
```

### Add Custom Loaders

```typescript
// Create new loader
export class CustomLoader {
  async loadDocuments(): Promise<string[]> {
    // Your custom loading logic
  }
}

// Register in orchestrator
await orchestrator.ingestFromFile(content, {
  source: 'CustomSource',
  type: 'custom',
});
```

### Custom Test Script Generation

```typescript
// Modify PlaywrightScriptGenerator
static generateScript(testCase, suiteName, config) {
  // Your custom generation logic
}
```

## 📊 For In-Sprint Testing

### Typical Sprint Day

**9:00 AM - Start of Day**
- Load knowledge base: `npm run load-kb`
- Check today's user stories
- Generate tests: `npm run generate-tests`

**9:30 AM - Test Execution**
- Run all tests: `npm run test`
- Review results and failures

**10:00 AM - During Testing**
- Manual testers find issues
- Update `data/test-cases.xlsx` with new findings
- Regenerate: `npm run regenerate-tests`

**4:00 PM - End of Day**
- Heal all failing tests: `npm run test:heal`
- Review fixed tests
- Commit to Git

### Example Sprint Commit Message

```
feat: Add E2E tests for user authentication system

- Generated 45 test cases from Confluence requirements
- Covers: login, logout, password reset, 2FA
- Includes: happy path, negative scenarios, edge cases
- Pass rate: 100% after auto-healing
- Platforms: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- Test duration: ~2 minutes for full suite

This enables:
- Faster feedback on authentication changes
- Regression testing in CI/CD pipeline
- Documentation via executable tests
- Easy maintenance using RAG-based regeneration

Changelog:
- REQ-AUTH-001: User login flow covered by 8 tests
- REQ-AUTH-002: Password reset flow covered by 7 tests
- REQ-AUTH-003: 2FA implementation covered by 6 tests
```

## 🐛 Troubleshooting

### OpenAI API Errors
```bash
# Check API key
echo $OPENAI_API_KEY

# Update .env
# OPENAI_API_KEY=sk-your-actual-key
npm run generate-tests
```

### Confluence Connection Issues
```bash
# Verify credentials
curl -u your-email:token https://your-confluence.atlassian.net/rest/api/3/pages

# Update .env credentials
npm run generate-tests
```

### Tests Not Running
```bash
# Ensure Playwright is installed
npx playwright install

# Run tests with debug output
npx playwright test --debug

# Check for selector issues
npx playwright test --headed
```

### Generated Tests Don't Match Application
```bash
# 1. Inspect application UI
npx playwright test --ui

# 2. Update selectors in generated scripts
# 3. Or regenerate with better knowledge base content
npm run regenerate-tests
```

## 📚 Complete Documentation

For detailed information, see:
- **RAG_IMPLEMENTATION_GUIDE.md** - Complete technical guide
- **QAEnd2EndPromptFile.md** - 7-role QA automation framework
- **utils/workflowExample.ts** - Full working example

## 💡 Pro Tips

1. **Knowledge Quality**: Better documentation → Better tests
2. **Regular Updates**: Update knowledge base as you learn
3. **Parameterized Tests**: Use test data for multiple scenarios
4. **Page Objects**: Consider POM for complex applications
5. **CI/CD Integration**: Run tests in pipeline automatically
6. **Metrics**: Track test generation time, pass rates, coverage
7. **Feedback Loop**: Use test failures to improve knowledge base

## 🎓 Learning Path

1. **Day 1**: Set up system, generate first tests
2. **Day 2**: Update knowledge base, regenerate tests
3. **Day 3**: Auto-heal failing tests
4. **Day 4-5**: Full sprint integration
5. **Week 2+**: Continuous improvement and maintenance

## 📞 Support

- Check `.env.example` for required variables
- Review example files in `data/`
- Run `npm run help` for command help
- See RAG_IMPLEMENTATION_GUIDE.md for FAQs

---

**Status**: ✅ Ready to Use

Start with: `npm run setup && npm run create-sample-files && npm run generate-tests`
