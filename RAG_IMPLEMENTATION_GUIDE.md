# RAG-Based Test Generation & Automation Workflow Guide

## Overview

This guide explains how to integrate LLM with RAG (Retrieval Augmented Generation) to automatically generate, test cases from your Confluence documentation and Excel test repositories, enabling manual testers to generate and automate tests during in-sprint testing.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Knowledge Sources                            │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Confluence  │   Excel      │  Documents   │  Other Sources     │
│  Pages       │  Test Cases  │  Requirements│  (APIs, Wikis)     │
└──────┬───────┴──────┬───────┴──────┬───────┴────────────┬───────┘
       │              │             │                    │
       └──────────────┴─────────────┴────────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Data Loaders & Parsers   │
         │  - ConfluenceLoader        │
         │  - ExcelTestCasesLoader    │
         │  - FileSystemLoader        │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  Text Chunking & Embedding │
         │  - RecursiveTextSplitter   │
         │  - OpenAI Embeddings       │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Vector Database (RAG)    │
         │  - Memory Store or DB      │
         │  - Similarity Search       │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  Test Generation Agent     │
         │  - LLM (GPT-4-Turbo)      │
         │  - Prompt Engineering      │
         │  - Test Case Templates     │
         └────────────┬───────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
    ┌─────────────┐           ┌──────────────┐
    │ Generated   │           │  Save to DB  │
    │ Test Cases  │           │  Export to   │
    │  (JSON)     │           │  Playwright  │
    └─────────────┘           └──────────────┘
         │
         ▼
    ┌──────────────────────┐
    │  Playwright Scripts  │
    │  - Automation        │
    │  - Test Execution    │
    │  - Test Healing      │
    └──────────┬───────────┘
               │
               ▼
         ┌────────────────┐
         │  Git Commit    │
         │  Test Reports  │
         └────────────────┘
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install \
  axios \
  xlsx \
  langchain \
  @langchain/openai \
  @langchain/core \
  dotenv
```

### 2. Environment Configuration

Create a `.env` file:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key

# Confluence Configuration (Optional)
CONFLUENCE_BASE_URL=https://your-confluence.atlassian.net
CONFLUENCE_AUTH_TOKEN=your_confluence_pat_token

# Application URLs
APP_BASE_URL=http://localhost:3000
DATABASE_URL=your_database_url

# RAG Configuration
RAG_VECTOR_STORE_PATH=./data/vector-store.json
KNOWLEDGE_BASE_CACHE_PATH=./data/knowledge-base-cache
```

### 3. Directory Structure

```
playwrightAIAgent/
├── utils/
│   ├── confluenceLoader.ts          # Confluence data ingestion
│   ├── excelTestCasesLoader.ts      # Excel test case ingestion
│   ├── ragVectorStore.ts            # RAG vector database
│   ├── testGenerationAgent.ts       # LLM-based test generator
│   ├── knowledgeBaseOrchestrator.ts # Main orchestrator
│   ├── database.ts                  # Database utilities
│   └── examples/
│       └── workflowExample.ts       # Implementation example
├── data/
│   ├── test-cases.xlsx              # Your test cases
│   ├── confluence-export.md         # Confluence content
│   └── requirements.md              # Requirements document
├── generated-tests/                 # Auto-generated test cases
├── tests/                           # Playwright test scripts
│   ├── generated/                   # Tests generated from RAG
│   └── manual/                      # Manual test templates
└── reports/                         # Test execution reports
```

---

## Complete Workflow

### Phase 1: Knowledge Ingestion

#### Step 1: Ingest from Confluence

```typescript
import { KnowledgeBaseOrchestrator } from './utils/knowledgeBaseOrchestrator';

async function setupConfluenceKnowledge() {
  const orchestrator = new KnowledgeBaseOrchestrator();

  await orchestrator.initialize({
    baseUrl: process.env.CONFLUENCE_BASE_URL,
    authToken: process.env.CONFLUENCE_AUTH_TOKEN,
  });

  // Ingest entire Confluence space
  await orchestrator.ingestFromConfluence('YOUR_SPACE_KEY', {
    module: 'YourProductName',
  });

  // Or ingest specific pages
  const confluenceLoader = new ConfluenceLoader(
    process.env.CONFLUENCE_BASE_URL!,
    process.env.CONFLUENCE_AUTH_TOKEN!
  );

  const pageContent = await confluenceLoader.fetchPageContent('PAGE_ID_123');
  // Process further...

  return orchestrator;
}
```

#### Step 2: Ingest from Excel Test Cases

```typescript
async function setupExcelKnowledge(orchestrator: KnowledgeBaseOrchestrator) {
  // Load test cases from Excel
  const excelData = await orchestrator.ingestFromExcel(
    './data/test-cases.xlsx'
  );

  console.log('Loaded test cases:', {
    testCases: excelData.testCases.length,
    requirements: excelData.requirements.length,
    acceptanceCriteria: excelData.acceptanceCriteria.length,
  });

  // Save knowledge base for later use
  await orchestrator.saveKnowledgeBase('./data/vector-store.json');
}
```

#### Step 3: Ingest Additional Documentation

```typescript
async function ingestAdditionalDocs(orchestrator: KnowledgeBaseOrchestrator) {
  // Add requirements document
  await orchestrator.ingestFromFile('./data/requirements.md', {
    source: 'Requirements Document',
    type: 'requirements',
  });

  // Add API documentation
  await orchestrator.ingestFromFile('./data/api-docs.md', {
    source: 'API Documentation',
    type: 'api_docs',
  });

  // Add user stories
  await orchestrator.ingestFromFile('./data/user-stories.md', {
    source: 'User Stories',
    type: 'user_stories',
  });

  // Print statistics
  const stats = orchestrator.getStats();
  console.log('Knowledge Base Statistics:', stats);
}
```

---

### Phase 2: Test Case Generation

#### Step 1: Generate from Feature Scenarios

```typescript
async function generateTestCasesForFeature(
  orchestrator: KnowledgeBaseOrchestrator
) {
  const featureName = 'User Authentication';
  const scenarios = [
    'Happy path: User logs in with valid credentials',
    'Negative scenario: User logs in with invalid password',
    'Edge case: User logs in with email containing special characters',
    'Boundary condition: Password with maximum length',
    'Security test: SQL injection attempt in username field',
  ];

  const testCases = await orchestrator.generateTestCases(
    featureName,
    scenarios
  );

  // Save generated test cases
  orchestrator.exportTestCasesToFile(
    testCases,
    './generated-tests/authentication-tests.json'
  );

  return testCases;
}
```

#### Step 2: Generate from Requirements

```typescript
async function generateFromRequirements(
  orchestrator: KnowledgeBaseOrchestrator
) {
  const requirements = [
    {
      id: 'REQ-001',
      description: 'User must be able to reset password via email link',
    },
    {
      id: 'REQ-002',
      description: 'Password reset link must expire after 24 hours',
    },
    {
      id: 'REQ-003',
      description: 'System must validate email format before sending reset link',
    },
  ];

  const testCasesByReq = await orchestrator.generateTestCasesFromRequirements(
    requirements
  );

  // Save for each requirement
  testCasesByReq.forEach((testCases, reqId) => {
    orchestrator.exportTestCasesToFile(
      testCases,
      `./generated-tests/${reqId}-tests.json`
    );
  });

  return testCasesByReq;
}
```

#### Step 3: Search & Enhance Test Cases

```typescript
async function enhanceTestCoverage(
  orchestrator: KnowledgeBaseOrchestrator
) {
  // Search knowledge base
  const results = await orchestrator.searchKnowledge(
    'password reset validation rules'
  );

  console.log('Found relevant documents:', results.length);
  results.forEach((result) => {
    console.log(`- ${result.metadata.source} (score: ${result.score})`);
    console.log(`  ${result.content.substring(0, 100)}...`);
  });
}
```

---

### Phase 3: Convert to Playwright Scripts

#### Step 1: Create Test Script Generator

```typescript
// utils/playwrightScriptGenerator.ts
import { GeneratedTestCase } from './testGenerationAgent';
import * as fs from 'fs';

export class PlaywrightScriptGenerator {
  static generateScript(testCase: GeneratedTestCase, testName: string): string {
    const stepsCode = testCase.steps
      .map(
        (step, index) => `
    // Step ${index + 1}: ${step}
    await page.click('[data-testid="step-${index + 1}"]');
    await page.waitForNavigation();
      `.trim()
      )
      .join('\n\n');

    const assertionsCode = testCase.assertions
      .map((assertion) => `await expect(${assertion}).toBeTruthy();`)
      .join('\n    ');

    return `
import { test, expect } from '@playwright/test';

test.describe('Generated Test Suite: ${testName}', () => {
  test('${testCase.name}', async ({ page }) => {
    // Setup: ${testCase.preconditions}
    await page.goto('${process.env.APP_BASE_URL}');

    // Test Steps
${stepsCode}

    // Assertions
    ${assertionsCode}
  });
});
    `.trim();
  }

  static generateMultipleScripts(
    testCases: GeneratedTestCase[],
    outputDir: string
  ): void {
    testCases.forEach((testCase, index) => {
      const script = this.generateScript(testCase, `Test${index + 1}`);
      const fileName = testCase.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const filePath = `${outputDir}/generated-${fileName}.spec.ts`;
      fs.writeFileSync(filePath, script);
      console.log(`Generated: ${filePath}`);
    });
  }
}
```

#### Step 2: Generate Playwright Scripts

```typescript
async function generatePlaywrightScripts(
  testCases: GeneratedTestCase[]
) {
  const generator = new PlaywrightScriptGenerator();
  generator.generateMultipleScripts(testCases, './tests/generated');

  console.log(`✓ Generated ${testCases.length} Playwright test scripts`);
}
```

---

### Phase 4: Test Execution & Healing

#### Step 1: Run Generated Tests

```bash
# Run all generated tests
npx playwright test tests/generated --reporter=html

# Run with specific browser
npx playwright test tests/generated --project=chromium

# Run with detailed logging
npx playwright test tests/generated --debug
```

#### Step 2: Analyze Failures & Heal

```typescript
// Use playwright-test-healer agent
// See QAEnd2EndPromptFile.md Role 5 for detailed healing process

async function healFailingTests() {
  // Run tests and capture failures
  const failures = await runPlaywrightTests();

  // For each failure, use playwright-test-healer agent to:
  // 1. Analyze the failure (selector, timing, assertion)
  // 2. Fix the test script
  // 3. Re-run and verify
  // 4. Update the generated test file

  console.log(`✓ Healed ${failures.length} failing tests`);
}
```

---

### Phase 5: Complete End-to-End Example

```typescript
// example-workflow.ts
import { KnowledgeBaseOrchestrator } from './utils/knowledgeBaseOrchestrator';
import { PlaywrightScriptGenerator } from './utils/playwrightScriptGenerator';
import * as dotenv from 'dotenv';

dotenv.config();

async function completeWorkflow() {
  console.log('🚀 Starting RAG-based Test Generation Workflow\n');

  // ===== PHASE 1: SETUP =====
  console.log('📚 PHASE 1: Setting up Knowledge Base\n');

  const orchestrator = new KnowledgeBaseOrchestrator();

  // Initialize with Confluence
  await orchestrator.initialize({
    baseUrl: process.env.CONFLUENCE_BASE_URL!,
    authToken: process.env.CONFLUENCE_AUTH_TOKEN!,
  });

  // Ingest knowledge
  console.log('📥 Ingesting from Confluence...');
  await orchestrator.ingestFromConfluence('PRODUCT_SPACE');

  console.log('📥 Ingesting from Excel test cases...');
  const excelData = await orchestrator.ingestFromExcel('./data/test-cases.xlsx');

  console.log('📥 Ingesting additional documentation...');
  await orchestrator.ingestFromFile('./data/requirements.md', {
    source: 'Requirements',
    type: 'requirements',
  });

  // Save knowledge base
  await orchestrator.saveKnowledgeBase('./data/vector-store.json');

  const stats = orchestrator.getStats();
  console.log('✓ Knowledge Base Ready:', stats);

  // ===== PHASE 2: TEST GENERATION =====
  console.log('\n🧪 PHASE 2: Generating Test Cases\n');

  const requirements = excelData.requirements.slice(0, 3); // First 3 requirements
  const testCasesByReq =
    await orchestrator.generateTestCasesFromRequirements(requirements);

  // Collect all generated test cases
  let allTestCases: any[] = [];
  testCasesByReq.forEach((testCases) => {
    allTestCases = allTestCases.concat(testCases);
  });

  console.log(`✓ Generated ${allTestCases.length} test cases`);

  // ===== PHASE 3: PLAYWRIGHT SCRIPT GENERATION =====
  console.log('\n🎭 PHASE 3: Creating Playwright Scripts\n');

  const generator = new PlaywrightScriptGenerator();
  generator.generateMultipleScripts(allTestCases, './tests/generated');

  // ===== PHASE 4: EXECUTION & REPORTING =====
  console.log('\n▶️ PHASE 4: Running Tests & Generating Reports\n');

  console.log('Execute: npx playwright test tests/generated --reporter=html');
  console.log('Report will be available in: playwright-report/index.html');

  // ===== PHASE 5: GIT COMMIT =====
  console.log('\n📝 PHASE 5: Ready for Git Commit\n');

  console.log('Files ready to commit:');
  console.log('  - tests/generated/*.spec.ts');
  console.log('  - generated-tests/*.json');
  console.log('  - data/vector-store.json');
  console.log('  - reports/test-report.md');

  console.log('\n✨ Workflow Complete!');
}

// Run the workflow
completeWorkflow().catch((error) => {
  console.error('Workflow failed:', error);
  process.exit(1);
});
```

---

## For In-Sprint Testing

### Daily Test Generation Workflow

**Morning Standup:**

```bash
# 1. Load existing knowledge base
npm run load-knowledge-base

# 2. Generate tests for today's stories
npm run generate-tests -- --sprint-day $(date +%A)

# 3. Automated generation to Playwright scripts
npm run generate-scripts

# 4. Run tests
npm run test
```

**During Testing:**

1. **Discover Issues**: As testers find issues or edge cases
2. **Update Knowledge**: Add to: test-cases.xlsx or Confluence
3. **Regenerate**: `npm run regenerate-tests`
4. **Auto-Heal**: Failing tests are automatically fixed using playwright-test-healer
5. **Commit**: Changes committed to Git with test report

### Manual Tester Guide

1. **Add New Test Case to Excel**:
   - File: `data/test-cases.xlsx`
   - Sheet: `TestCases`
   - Fill columns: ID, Name, Description, Steps, Expected Results, Priority

2. **Generate Automated Script**:
   ```bash
   npm run generate-tests -- --from-excel
   npm run generate-scripts
   ```

3. **Review & Execute**:
   ```bash
   npm run test -- tests/generated/[test-name].spec.ts
   ```

4. **If Test Fails**:
   - Agent automatically analyzes and heals
   - Review fixed script
   - Run again

5. **Commit Results**:
   ```bash
   git add tests/ generated-tests/ reports/
   git commit -m "feat: Add tests for [feature-name] - Sprint Day 3"
   git push origin feature/sprint-tests
   ```

---

## Configuration Files

### package.json Scripts

```json
{
  "scripts": {
    "setup-kb": "ts-node setup-knowledge-base.ts",
    "load-kb": "ts-node load-knowledge-base.ts",
    "generate-tests": "ts-node generate-tests.ts",
    "generate-scripts": "ts-node generate-scripts.ts",
    "test": "playwright test",
    "test:heal": "playwright test && npx playwright-test-healer",
    "regenerate-tests": "npm run generate-tests && npm run generate-scripts",
    "commit-tests": "npm run test && git add tests/ reports/ && git commit -m 'test: Add E2E tests'"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  }
}
```

---

## Benefits

✅ **Faster Test Creation**: LLM generates test cases in seconds
✅ **Knowledge Reuse**: Leverages existing Confluence & Excel repositories
✅ **Consistency**: All tests follow same structure & best practices
✅ **Quality Scenarios**: RAG ensures tests cover documented requirements
✅ **Automatic Healing**: Failing tests auto-fixed with AI assistance
✅ **In-Sprint Integration**: Perfect for iterative testing during sprints
✅ **Knowledge Accumulation**: System learns from new tests & documentation

---

## Next Steps

1. **Set up environment**: Configure .env with OpenAI & Confluence credentials
2. **Install dependencies**: Run npm install with required packages
3. **Ingest knowledge**: Run setup script with your Confluence & Excel data
4. **Generate test cases**: Use queries to generate tests for your features
5. **Review & execute**: Test scripts are ready for execution
6. **Heal & iterate**: Use playwright-test-healer for failing tests
7. **Commit to Git**: Push complete test suite to repository

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| OpenAI API errors | Check OPENAI_API_KEY in .env |
| Confluence connection fails | Verify CONFLUENCE_BASE_URL and AUTH_TOKEN |
| Vector store not initializing | Ensure OpenAI embeddings are available |
| Generated tests are too generic | Add more specific documentation to knowledge base |
| Tests timing out | Increase wait times in generated scripts |
| Selectors not found | Use playwright-test-healer to fix selectors |

