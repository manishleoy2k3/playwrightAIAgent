/**
 * Complete Implementation Example
 * Demonstrates the entire RAG-based workflow for test generation
 */

import { KnowledgeBaseOrchestrator } from './knowledgeBaseOrchestrator';
import { PlaywrightScriptGenerator } from './playwrightScriptGenerator';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// STEP 1: Initialize Knowledge Base Orchestrator
// ============================================================================

export async function initializeKnowledgeBase() {
  console.log('🔧 Initializing Knowledge Base Orchestrator...\n');

  const orchestrator = new KnowledgeBaseOrchestrator();

  // Initialize with Confluence configuration
  await orchestrator.initialize({
    baseUrl: process.env.CONFLUENCE_BASE_URL || 'https://your-confluence.atlassian.net',
    authToken: process.env.CONFLUENCE_AUTH_TOKEN || 'your-token',
  });

  console.log('✓ Knowledge Base initialized\n');
  return orchestrator;
}

// ============================================================================
// STEP 2: Ingest Knowledge from Multiple Sources
// ============================================================================

export async function ingestAllKnowledge(orchestrator: KnowledgeBaseOrchestrator) {
  console.log('📚 Ingesting Knowledge from Multiple Sources\n');

  try {
    // 1. Ingest from Confluence
    console.log('📥 Ingesting from Confluence...');
    await orchestrator.ingestFromConfluence('YOUR_PRODUCT_SPACE', {
      module: 'YourProductName',
    });
    console.log('✓ Confluence content ingested\n');

    // 2. Ingest from Excel test cases
    console.log('📥 Ingesting from Excel test cases...');
    const excelData = await orchestrator.ingestFromExcel('./data/test-cases.xlsx');
    console.log(
      `✓ Excel data ingested: ${excelData.testCases.length} test cases, ${excelData.requirements.length} requirements\n`
    );

    // 3. Ingest from additional documents
    console.log('📥 Ingesting from documentation files...');

    const docFiles = [
      {path: './data/requirements.md', type: 'requirements', source: 'Requirements Document'},
      {path: './data/api-docs.md', type: 'api_docs', source: 'API Documentation'},
      {path: './data/user-stories.md', type: 'user_stories', source: 'User Stories'},
      {path: './data/business-rules.md', type: 'business_rules', source: 'Business Rules'},
    ];

    for (const doc of docFiles) {
      if (fs.existsSync(doc.path)) {
        await orchestrator.ingestFromFile(doc.path, {
          source: doc.source,
          type: doc.type,
        });
      }
    }

    console.log('✓ Documentation files ingested\n');

    // 4. Save knowledge base for reuse
    console.log('💾 Saving knowledge base...');
    await orchestrator.saveKnowledgeBase('./data/vector-store.json');
    console.log('✓ Knowledge base saved\n');

    // Print statistics
    const stats = orchestrator.getStats();
    console.log('📊 Knowledge Base Statistics:');
    console.log(`   Total Documents: ${stats.documents.totalDocuments}`);
    console.log(`   Sources: ${stats.documents.sources.join(', ')}`);
    if (stats.excelData) {
      console.log(`   Test Cases: ${stats.excelData.testCases}`);
      console.log(`   Requirements: ${stats.excelData.requirements}`);
      console.log(`   Acceptance Criteria: ${stats.excelData.acceptanceCriteria}\n`);
    }

    return orchestrator;
  } catch (error) {
    console.error('Error ingesting knowledge:', error);
    throw error;
  }
}

// ============================================================================
// STEP 3: Generate Test Cases
// ============================================================================

export async function generateTestCases(
  orchestrator: KnowledgeBaseOrchestrator,
  featureName: string,
  scenarios: string[]
) {
  console.log(`🧪 Generating Test Cases for: ${featureName}\n`);

  try {
    const testCases = await orchestrator.generateTestCases(featureName, scenarios);

    console.log(`✓ Generated ${testCases.length} test cases\n`);

    // Save test cases
    const outputDir = './generated-tests';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true});
    }

    const fileName = featureName.toLowerCase().replace(/\s+/g, '-');
    const filePath = path.join(outputDir, `${fileName}.json`);

    orchestrator.exportTestCasesToFile(testCases, filePath);
    console.log(`📁 Test cases saved to: ${filePath}\n`);

    return testCases;
  } catch (error) {
    console.error('Error generating test cases:', error);
    throw error;
  }
}

// ============================================================================
// STEP 4: Generate Test Cases from Requirements
// ============================================================================

export async function generateTestCasesFromRequirements(
  orchestrator: KnowledgeBaseOrchestrator,
  requirements: Array<{id: string; description: string}>
) {
  console.log(`📋 Generating Test Cases from ${requirements.length} Requirements\n`);

  try {
    const testCasesByReq = await orchestrator.generateTestCasesFromRequirements(requirements);

    const outputDir = './generated-tests';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {recursive: true});
    }

    // Save each requirement's test cases
    testCasesByReq.forEach((testCases, reqId) => {
      const filePath = path.join(outputDir, `${reqId}-tests.json`);
      orchestrator.exportTestCasesToFile(testCases, filePath);
      console.log(`✓ Generated ${testCases.length} tests for ${reqId}`);
    });

    console.log('\n');
    return testCasesByReq;
  } catch (error) {
    console.error('Error generating test cases from requirements:', error);
    throw error;
  }
}

// ============================================================================
// STEP 5: Generate Playwright Scripts
// ============================================================================

export async function generatePlaywrightScripts(
  testCasesFiles: string[] = []
) {
  console.log('🎭 Generating Playwright Scripts\n');

  try {
    const testDir = './tests/generated';
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, {recursive: true});
    }

    // Find all generated test case JSON files
    const generatedTestsDir = './generated-tests';
    const files =
      testCasesFiles.length > 0
        ? testCasesFiles
        : fs
            .readdirSync(generatedTestsDir)
            .filter((f) => f.endsWith('.json'))
            .map((f) => path.join(generatedTestsDir, f));

    let totalScripts = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const testCases = JSON.parse(content);

        // Convert single object to array if needed
        const casesArray = Array.isArray(testCases) ? testCases : [testCases];

        PlaywrightScriptGenerator.generateMultipleScripts(casesArray, testDir);
        totalScripts += casesArray.length;
      } catch (error) {
        console.warn(`⚠️  Skipping ${file}: ${error}`);
      }
    }

    console.log(`✓ Generated ${totalScripts} Playwright test scripts\n`);
    console.log(`📁 Scripts location: ${testDir}\n`);

    return totalScripts;
  } catch (error) {
    console.error('Error generating Playwright scripts:', error);
    throw error;
  }
}

// ============================================================================
// STEP 6: Example Workflow - User Authentication Feature
// ============================================================================

export async function exampleWorkflow_UserAuthentication(
  orchestrator: KnowledgeBaseOrchestrator
) {
  console.log('═'.repeat(70));
  console.log('EXAMPLE: User Authentication Feature Testing');
  console.log('═'.repeat(70) + '\n');

  // Define scenarios
  const scenarios = [
    'Happy path: User logs in with valid email and password',
    'Negative: User logs in with invalid email format',
    'Negative: User logs in with incorrect password',
    'Negative: User account is locked after 5 failed attempts',
    'Edge case: Email with international characters',
    'Edge case: Password with special characters (!@#$%)',
    'Boundary: Password with minimum length (8 characters)',
    'Boundary: Password with maximum length',
    'Security: SQL injection attempt in email field',
    'Security: XSS attempt in password field',
    'Business rule: User session expires after 30 minutes',
    'Business rule: Failed login attempt recorded in audit log',
  ];

  // Generate test cases
  const testCases = await generateTestCases(
    orchestrator,
    'User Authentication',
    scenarios
  );

  return testCases;
}

// ============================================================================
// STEP 7: Example Workflow - Generate from Multiple Requirements
// ============================================================================

export async function exampleWorkflow_MultipleRequirements(
  orchestrator: KnowledgeBaseOrchestrator
) {
  console.log('═'.repeat(70));
  console.log('EXAMPLE: Multiple Requirements Generation');
  console.log('═'.repeat(70) + '\n');

  const requirements = [
    {
      id: 'REQ-AUTH-001',
      description: 'User must be able to log in with email and password',
    },
    {
      id: 'REQ-AUTH-002',
      description: 'System must enforce password complexity rules',
    },
    {
      id: 'REQ-AUTH-003',
      description: 'Failed login attempts must be logged for security',
    },
    {
      id: 'REQ-AUTH-004',
      description: 'User session must expire after 30 minutes of inactivity',
    },
    {
      id: 'REQ-AUTH-005',
      description: 'User must be able to reset password via email link',
    },
  ];

  const testCasesByReq = await generateTestCasesFromRequirements(
    orchestrator,
    requirements
  );

  // Print summary
  console.log('📊 Test Generation Summary:');
  testCasesByReq.forEach((testCases, reqId) => {
    console.log(`   ${reqId}: ${testCases.length} test cases`);
  });
  console.log('\n');

  return testCasesByReq;
}

// ============================================================================
// STEP 8: Search Knowledge Base
// ============================================================================

export async function searchKnowledgeBase(
  orchestrator: KnowledgeBaseOrchestrator,
  query: string
) {
  console.log(`🔍 Searching Knowledge Base: "${query}"\n`);

  try {
    const results = await orchestrator.searchKnowledge(query, 5);

    console.log(`✓ Found ${results.length} relevant documents:\n`);
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.metadata.source} (Relevance: ${result.score.toFixed(4)})`);
      console.log(`   ${result.content.substring(0, 100)}...\n`);
    });

    return results;
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    throw error;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

export async function main() {
  try {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║   RAG-Based Test Generation & Automation Workflow                ║');
    console.log('║   Complete End-to-End Implementation Example                     ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    // ===== PHASE 1: SETUP =====
    console.log('\n📚 PHASE 1: Knowledge Base Setup\n');
    const orchestrator = await initializeKnowledgeBase();
    await ingestAllKnowledge(orchestrator);

    // ===== PHASE 2: SEARCH EXAMPLE =====
    console.log('\n🔍 PHASE 2: Knowledge Base Search\n');
    await searchKnowledgeBase(orchestrator, 'password reset validation'
    );

    // ===== PHASE 3: TEST GENERATION EXAMPLES =====
    console.log('\n🧪 PHASE 3: Test Generation Examples\n');

    // Example 1: User Authentication
    await exampleWorkflow_UserAuthentication(orchestrator);

    // Example 2: Multiple Requirements
    await exampleWorkflow_MultipleRequirements(orchestrator);

    // ===== PHASE 4: PLAYWRIGHT SCRIPT GENERATION =====
    console.log('\n🎭 PHASE 4: Playwright Script Generation\n');
    const scriptCount = await generatePlaywrightScripts();

    // ===== COMPLETION =====
    console.log('═'.repeat(70));
    console.log('✨ WORKFLOW COMPLETE!');
    console.log('═'.repeat(70) + '\n');

    console.log('📝 Next Steps:');
    console.log('   1. Review generated test cases in: ./generated-tests/');
    console.log('   2. Review Playwright scripts in: ./tests/generated/');
    console.log('   3. Run tests: npx playwright test tests/generated');
    console.log('   4. Heal failing tests: npm run test:heal');
    console.log('   5. Commit to Git: git add . && git commit -m "test: Add E2E tests"\n');
  } catch (error) {
    console.error('❌ Workflow failed:', error);
    process.exit(1);
  }
}

// Uncomment to run:
// main();

export default {
  initializeKnowledgeBase,
  ingestAllKnowledge,
  generateTestCases,
  generateTestCasesFromRequirements,
  generatePlaywrightScripts,
  searchKnowledgeBase,
  exampleWorkflow_UserAuthentication,
  exampleWorkflow_MultipleRequirements,
};
