import { KnowledgeBaseOrchestrator } from './utils/knowledgeBaseOrchestrator';
import { PlaywrightScriptGenerator } from './utils/playwrightScriptGenerator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CLI Setup Script
 * Initialize and configure the RAG-based test generation system
 */

async function main() {
  const command = process.argv[2] || 'setup';

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  RAG-Based Test Generation & Automation System             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    switch (command) {
      case 'setup':
        await setupKnowledgeBase();
        break;

      case 'generate':
        await generateTests();
        break;

      case 'create-config':
        createConfiguration();
        break;

      case 'create-sample-files':
        createSampleFiles();
        break;

      case 'help':
        printHelp();
        break;

      default:
        console.log(`Unknown command: ${command}`);
        printHelp();
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function setupKnowledgeBase() {
  console.log('📚 Setting up Knowledge Base System\n');

  if (!process.env.CONFLUENCE_BASE_URL || !process.env.CONFLUENCE_AUTH_TOKEN) {
    console.warn(
      '⚠️  Confluence credentials not found in .env. Using demo mode.\n'
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      '⚠️  OpenAI API key not found in .env. Please add OPENAI_API_KEY to .env file.\n'
    );
    process.exit(1);
  }

  console.log('Creating directories...');
  const dirs = [
    './data',
    './generated-tests',
    './tests/generated',
    './screenshots',
    './reports',
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
      console.log(`✓ Created: ${dir}`);
    }
  });

  console.log('\n✓ Setup complete!\n');
  console.log('Next steps:');
  console.log('  1. Add Confluence credentials to .env');
  console.log('  2. Add Excel test cases to ./data/test-cases.xlsx');
  console.log('  3. Run: npm run generate-tests\n');
}

async function generateTests() {
  console.log('🧪 Generating Tests from Knowledge Base\n');

  const orchestrator = new KnowledgeBaseOrchestrator();

  try {
    // Initialize
    await orchestrator.initialize({
      baseUrl: process.env.CONFLUENCE_BASE_URL || '',
      authToken: process.env.CONFLUENCE_AUTH_TOKEN || '',
    });

    // Try to load or ingest knowledge
    if (fs.existsSync('./data/vector-store.json')) {
      console.log('Loading cached knowledge base...');
      await orchestrator.loadKnowledgeBase('./data/vector-store.json');
    } else {
      console.log('Ingesting knowledge sources...');

      if (process.env.CONFLUENCE_BASE_URL && process.env.CONFLUENCE_AUTH_TOKEN) {
        console.log('  - Ingesting from Confluence...');
        // await orchestrator.ingestFromConfluence('YOUR_SPACE_KEY');
      }

      if (fs.existsSync('./data/test-cases.xlsx')) {
        console.log('  - Ingesting from Excel test cases...');
        await orchestrator.ingestFromExcel('./data/test-cases.xlsx');
      }

      console.log('  - Ingesting from documentation...');
      const docFiles = [
        './data/requirements.md',
        './data/api-docs.md',
        './data/user-stories.md',
      ];

      for (const file of docFiles) {
        if (fs.existsSync(file)) {
          await orchestrator.ingestFromFile(file, {
            source: path.basename(file),
            type: 'documentation',
          });
        }
      }

      await orchestrator.saveKnowledgeBase('./data/vector-store.json');
    }

    // Show statistics
    const stats = orchestrator.getStats();
    console.log('\n[OK] Knowledge Base Ready:');
    console.log(`  Total Documents: ${stats.documents.totalDocuments}`);
    console.log(`  Sources: ${stats.documents.sources.join(', ')}`)

    // Generate sample tests
    console.log('Generating sample tests...');
    const testCases = await orchestrator.generateTestCases('Sample Feature', [
      'Happy path: User completes basic workflow',
      'Negative scenario: Invalid input handling',
      'Edge case: Boundary condition testing',
    ]);

    orchestrator.exportTestCasesToFile(testCases, './generated-tests/sample.json');

    console.log(`[OK] Generated ${testCases.length} test cases\n`);

    // Generate Playwright scripts
    console.log('Generating Playwright scripts...');
    PlaywrightScriptGenerator.generateMultipleScripts(testCases, './tests/generated');
    PlaywrightScriptGenerator.generatePlaywrightConfig();
    PlaywrightScriptGenerator.generateReadme();

    console.log('\n[OK] Tests generated successfully!\n');
    console.log('Run tests with: npx playwright test tests/generated\n');
  } catch (error) {
    console.error('Error generating tests:', error);
    process.exit(1);
  }
}

function createConfiguration() {
  console.log('⚙️  Creating Configuration Files\n');

  // Create .env.example
  const envExample = `
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here

# Confluence Configuration
CONFLUENCE_BASE_URL=https://your-confluence.atlassian.net
CONFLUENCE_AUTH_TOKEN=your-personal-access-token

# Application Configuration
APP_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/testdb

# RAG Configuration
RAG_VECTOR_STORE_PATH=./data/vector-store.json
KNOWLEDGE_BASE_CACHE_PATH=./data/knowledge-base-cache

# Testing Configuration
TEST_TIMEOUT=30000
TEST_RETRIES=3
HEADLESS=true
  `.trim();

  fs.writeFileSync('.env.example', envExample);
  console.log('✓ Created: .env.example');

  // Create .env
  if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', envExample);
    console.log('✓ Created: .env (please update with your credentials)');
  }

  console.log('\n');
}

function createSampleFiles() {
  console.log('📄 Creating Sample Files\n');

  // Create sample requirements.md
  const requirementsSample = `
# Product Requirements

## User Authentication Module

### REQ-AUTH-001: User Login
- User must be able to log in with email and password
- Password must be at least 8 characters
- Failed login attempts must be logged

### REQ-AUTH-002: Password Reset
- User can request password reset via email
- Reset link must expire after 24 hours
- Email validation required

## Product Management Module

### REQ-PROD-001: Create Product
- User must fill product details form
- Product name is required field
- System validates product code uniqueness
  `.trim();

  fs.writeFileSync('./data/requirements.md', requirementsSample);
  console.log('✓ Created: data/requirements.md');

  // Create sample API docs
  const apiDocsSample = `
# API Documentation

## Authentication Endpoints

### POST /api/auth/login
Authenticate user with email and password.

**Parameters:**
- email (string, required): User email
- password (string, required): User password

**Response:**
- 200 OK: Returns JWT token
- 401 Unauthorized: Invalid credentials
- 429 Too Many Requests: Rate limit exceeded

## User Endpoints

### GET /api/users/{id}
Get user details.

**Parameters:**
- id (string, required): User ID

**Response:**
- 200 OK: User object
- 404 Not Found: User not found
  `.trim();

  fs.writeFileSync('./data/api-docs.md', apiDocsSample);
  console.log('✓ Created: data/api-docs.md');

  // Create sample user stories
  const userStoriesSample = `
# User Stories

## Sprint Week 1

### US-001: User Registration
As a new user, I want to register an account so that I can access the platform.

**Acceptance Criteria:**
- [ ] User can enter email and password
- [ ] System validates email format
- [ ] Password must be at least 8 characters
- [ ] Error messages are clear and helpful
- [ ] User receives confirmation email

### US-002: User Login
As a registered user, I want to log in so that I can access my account.

**Acceptance Criteria:**
- [ ] User can enter email and password
- [ ] System validates credentials
- [ ] User is redirected to dashboard on success
- [ ] Failed attempt shows error message
- [ ] Failed attempts are logged for security
  `.trim();

  fs.writeFileSync('./data/user-stories.md', userStoriesSample);
  console.log('✓ Created: data/user-stories.md');

  console.log('\n✓ Sample files created!\n');
}

function printHelp() {
  console.log(`
Usage: npm run <command>

Commands:
  setup               Initialize the knowledge base system
  generate            Generate test cases and Playwright scripts
  create-config       Create configuration files
  create-sample-files Create sample documentation files
  help                Show this help message

Environment Variables:
  OPENAI_API_KEY              OpenAI API key (required)
  CONFLUENCE_BASE_URL         Confluence base URL (optional)
  CONFLUENCE_AUTH_TOKEN       Confluence authentication token (optional)
  APP_BASE_URL                Application base URL (default: http://localhost:3000)

Example:
  npm run setup
  npm run create-sample-files
  npm run generate
  npx playwright test tests/generated

Documentation:
  See RAG_IMPLEMENTATION_GUIDE.md for complete guide
  `);
}

main().catch(console.error);
