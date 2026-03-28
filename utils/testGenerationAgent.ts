import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { RAGVectorStore } from './ragVectorStore';

/**
 * Test Generation Agent using RAG
 * Generates test cases using knowledge from Confluence and Excel
 */
export interface GeneratedTestCase {
  name: string;
  description: string;
  preconditions: string;
  steps: string[];
  expectedResults: string[];
  assertions: string[];
  sourceDocuments: string[];
}

export class TestGenerationAgent {
  private llm: ChatOpenAI;
  private ragStore: RAGVectorStore;
  private promptTemplate: string = '';

  constructor(ragStore: RAGVectorStore) {
    this.ragStore = ragStore;
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo',
      temperature: 0.3, // Lower temperature for more consistent test generation
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Initialize the generation agent
   */
  async initialize(): Promise<void> {
    this.promptTemplate = `
      You are an expert QA automation engineer. Based on the provided knowledge base, generate a comprehensive test case.
      
      Knowledge Base Context:
      {context}
      
      User Request: {request}
      
      Generate a test case in the following JSON format:
      {
        "name": "Test case name",
        "description": "What is being tested",
        "preconditions": "What needs to be set up before the test",
        "steps": ["Step 1", "Step 2", "Step 3"],
        "expectedResults": ["Expected result 1", "Expected result 2"],
        "assertions": ["Assert X", "Assert Y"],
        "sourceDocuments": ["List of source documents used"]
      }
      
      Ensure the test case:
      1. Covers both happy path and edge cases
      2. Includes proper assertions
      3. References the knowledge base
      4. Is automatable with Playwright
      5. Follows best practices
    `;
  }

  /**
   * Generate a test case based on a requirement or description
   */
  async generateTestCase(request: string, k: number = 5): Promise<GeneratedTestCase> {
    if (!this.promptTemplate) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    // Retrieve relevant documents from RAG
    const relevantDocs = await this.ragStore.search(request, k);
    const context = relevantDocs
      .map((doc) => `Source: ${doc.metadata.source}\n${doc.content}`)
      .join('\n---\n');

    // Format the prompt
    const formattedPrompt = this.promptTemplate
      .replace('{context}', context)
      .replace('{request}', request);

    // Generate test case using LLM
    const response = await this.llm.invoke(formattedPrompt);
    const responseText = typeof response === 'string' ? response : (response.content as string);

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]) as GeneratedTestCase;
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      throw new Error(`Failed to generate test case: ${error}`);
    }
  }

  /**
   * Generate multiple test cases for a feature
   */
  async generateMultipleTestCases(
    featureName: string,
    scenarios: string[],
    k: number = 5
  ): Promise<GeneratedTestCase[]> {
    const testCases: GeneratedTestCase[] = [];

    for (const scenario of scenarios) {
      try {
        const request = `Generate a test case for feature "${featureName}" with scenario: ${scenario}`;
        const testCase = await this.generateTestCase(request, k);
        testCases.push(testCase);
      } catch (error) {
        console.error(`Failed to generate test case for scenario: ${scenario}`, error);
      }
    }

    return testCases;
  }

  /**
   * Generate test cases based on requirements
   */
  async generateTestCasesFromRequirements(
    requirements: Array<{id: string; description: string}>
  ): Promise<Map<string, GeneratedTestCase[]>> {
    const testCasesByRequirement = new Map<string, GeneratedTestCase[]>();

    for (const req of requirements) {
      try {
        const testCases = await this.generateMultipleTestCases(
          req.id,
          [
            `Happy path: ${req.description}`,
            `Negative scenario for: ${req.description}`,
            `Edge case for: ${req.description}`,
          ]
        );
        testCasesByRequirement.set(req.id, testCases);
      } catch (error) {
        console.error(`Failed to generate test cases for requirement ${req.id}:`, error);
      }
    }

    return testCasesByRequirement;
  }

  /**
   * Enhance existing test case with RAG knowledge
   */
  async enhanceTestCase(testCase: GeneratedTestCase): Promise<GeneratedTestCase> {
    const request = `Enhance this test case with more detailed steps and assertions based on best practices: ${JSON.stringify(testCase)}`;

    try {
      return await this.generateTestCase(request);
    } catch (error) {
      console.error('Failed to enhance test case:', error);
      return testCase;
    }
  }

  /**
   * Suggest test cases for untested scenarios
   */
  async suggestMissingTestCases(
    existingTestCases: GeneratedTestCase[],
    featureName: string
  ): Promise<GeneratedTestCase[]> {
    const existingDescriptions = existingTestCases.map((tc) => tc.name).join(', ');

    const request = `Given these existing test cases: ${existingDescriptions}, what other important test cases should be added for the feature: ${featureName}? Generate 2-3 missing test cases that improve coverage.`;

    try {
      return await this.generateMultipleTestCases(
        featureName,
        [request]
      );
    } catch (error) {
      console.error('Failed to suggest test cases:', error);
      return [];
    }
  }
}

export default TestGenerationAgent;