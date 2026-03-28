import { ConfluenceLoader } from './confluenceLoader';
import { ExcelTestCasesLoader, ExcelTestData } from './excelTestCasesLoader';
import { RAGVectorStore } from './ragVectorStore';
import { TestGenerationAgent, GeneratedTestCase } from './testGenerationAgent';
import * as fs from 'fs';

/**
 * Knowledge Base Orchestrator
 * Manages the complete workflow of ingesting knowledge and generating tests using RAG
 */
export class KnowledgeBaseOrchestrator {
  private confluenceLoader: ConfluenceLoader | null = null;
  private ragStore: RAGVectorStore;
  private testAgent: TestGenerationAgent | null = null;
  private excelData: ExcelTestData | null = null;

  constructor() {
    this.ragStore = new RAGVectorStore();
  }

  /**
   * Initialize all components
   */
  async initialize(confluenceConfig?: {baseUrl: string; authToken: string}): Promise<void> {
    console.log('Initializing Knowledge Base Orchestrator...');

    // Initialize RAG store
    await this.ragStore.initialize();

    // Initialize Confluence loader if config provided
    if (confluenceConfig) {
      this.confluenceLoader = new ConfluenceLoader(
        confluenceConfig.baseUrl,
        confluenceConfig.authToken
      );
    }

    // Initialize test generation agent
    this.testAgent = new TestGenerationAgent(this.ragStore);
    await this.testAgent.initialize();

    console.log('Knowledge Base Orchestrator initialized successfully');
  }

  /**
   * Ingest knowledge from Confluence
   */
  async ingestFromConfluence(spaceKey: string, metadata?: {module: string}): Promise<void> {
    if (!this.confluenceLoader) {
      throw new Error(
        'Confluence loader not initialized. Provide confluenceConfig during initialization.'
      );
    }

    console.log(`Ingesting knowledge from Confluence space: ${spaceKey}`);

    try {
      const pages = await this.confluenceLoader.fetchSpaceContent(spaceKey);

      for (const page of pages) {
        await this.ragStore.addDocuments(page.content, {
          source: `Confluence: ${page.title}`,
          type: 'confluence',
          ...metadata,
        });
      }

      console.log(`Successfully ingested ${pages.length} pages from Confluence space`);
    } catch (error) {
      console.error('Failed to ingest from Confluence:', error);
      throw error;
    }
  }

  /**
   * Ingest knowledge from Excel test cases
   */
  async ingestFromExcel(excelFilePath: string): Promise<ExcelTestData> {
    console.log(`Ingesting knowledge from Excel file: ${excelFilePath}`);

    try {
      this.excelData = ExcelTestCasesLoader.loadTestCases(excelFilePath);

      // Convert test cases to formatted document
      const document = ExcelTestCasesLoader.exportForRAG(this.excelData);

      // Add to RAG store
      await this.ragStore.addDocuments(document, {
        source: 'Excel: Test Cases',
        type: 'excel_testcases',
      });

      console.log(
        `Successfully ingested ${this.excelData.testCases.length} test cases from Excel`
      );
      return this.excelData;
    } catch (error) {
      console.error('Failed to ingest from Excel:', error);
      throw error;
    }
  }

  /**
   * Ingest knowledge from markdown/text files
   */
  async ingestFromFile(filePath: string, metadata: {source: string; type: string}): Promise<void> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    await this.ragStore.addDocuments(content, metadata);

    console.log(`Successfully ingested knowledge from file: ${filePath}`);
  }

  /**
   * Generate test cases for a feature
   */
  async generateTestCases(featureName: string, scenarios: string[]): Promise<GeneratedTestCase[]> {
    if (!this.testAgent) {
      throw new Error('Test agent not initialized');
    }

    console.log(`Generating test cases for feature: ${featureName}`);

    try {
      return await this.testAgent.generateMultipleTestCases(featureName, scenarios);
    } catch (error) {
      console.error('Failed to generate test cases:', error);
      throw error;
    }
  }

  /**
   * Generate test cases from requirements
   */
  async generateTestCasesFromRequirements(
    requirements: Array<{id: string; description: string}>
  ): Promise<Map<string, GeneratedTestCase[]>> {
    if (!this.testAgent) {
      throw new Error('Test agent not initialized');
    }

    console.log(`Generating test cases from ${requirements.length} requirements`);

    try {
      return await this.testAgent.generateTestCasesFromRequirements(requirements);
    } catch (error) {
      console.error('Failed to generate test cases from requirements:', error);
      throw error;
    }
  }

  /**
   * Search knowledge base
   */
  async searchKnowledge(query: string, k?: number): Promise<any[]> {
    return await this.ragStore.search(query, k);
  }

  /**
   * Export generated test cases to file
   */
  exportTestCasesToFile(testCases: GeneratedTestCase[], filePath: string): void {
    const content = JSON.stringify(testCases, null, 2);
    fs.writeFileSync(filePath, content);
    console.log(`Test cases exported to: ${filePath}`);
  }

  /**
   * Get orchestrator statistics
   */
  getStats(): {
    documents: {totalDocuments: number; sources: string[]};
    excelData?: {testCases: number; requirements: number; acceptanceCriteria: number};
  } {
    const stats: any = {
      documents: this.ragStore.getStats(),
    };

    if (this.excelData) {
      stats.excelData = {
        testCases: this.excelData.testCases.length,
        requirements: this.excelData.requirements.length,
        acceptanceCriteria: this.excelData.acceptanceCriteria.length,
      };
    }

    return stats;
  }

  /**
   * Save vector store for later use
   */
  async saveKnowledgeBase(filePath: string): Promise<void> {
    await this.ragStore.saveState(filePath);
  }

  /**
   * Load previously saved knowledge base
   */
  async loadKnowledgeBase(filePath: string): Promise<void> {
    await this.ragStore.loadState(filePath);
  }
}

export default KnowledgeBaseOrchestrator;