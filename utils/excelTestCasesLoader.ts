import * as XLSX from 'xlsx';

/**
 * Excel Test Cases Loader
 * Parses Excel files containing test cases, requirements, and acceptance criteria
 */
import * as fs from 'fs';

/**
 * Excel Test Cases Loader
 * Reads test cases, requirements, and acceptance criteria from Excel sheets
 */
export interface TestCase {
  id: string;
  name: string;
  description: string;
  preconditions: string;
  steps: string[];
  expectedResults: string[];
  module: string;
  priority: 'High' | 'Medium' | 'Low';
  tags?: string[];
}

export interface ExcelTestData {
  testCases: TestCase[];
  requirements: Array<{id: string; description: string; module: string}>;
  acceptanceCriteria: Array<{testCaseId: string; criteria: string}>;
}

export class ExcelTestCasesLoader {
  /**
   * Load test cases from Excel file
   */
  static loadTestCases(filePath: string): ExcelTestData {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel file not found: ${filePath}`);
    }

    const workbook = XLSX.readFile(filePath);
    const result: ExcelTestData = {
      testCases: [],
      requirements: [],
      acceptanceCriteria: [],
    };

    // Load test cases from 'TestCases' sheet
    if (workbook.SheetNames.includes('TestCases')) {
      const testCasesSheet = workbook.Sheets['TestCases'];
      const testCasesData = XLSX.utils.sheet_to_json(testCasesSheet);
      result.testCases = this.parseTestCases(testCasesData);
    }

    // Load requirements from 'Requirements' sheet
    if (workbook.SheetNames.includes('Requirements')) {
      const reqSheet = workbook.Sheets['Requirements'];
      const reqData = XLSX.utils.sheet_to_json(reqSheet);
      result.requirements = this.parseRequirements(reqData);
    }

    // Load acceptance criteria from 'AcceptanceCriteria' sheet
    if (workbook.SheetNames.includes('AcceptanceCriteria')) {
      const acSheet = workbook.Sheets['AcceptanceCriteria'];
      const acData = XLSX.utils.sheet_to_json(acSheet);
      result.acceptanceCriteria = this.parseAcceptanceCriteria(acData);
    }

    return result;
  }

  /**
   * Parse test cases from Excel data
   */
  private static parseTestCases(data: any[]): TestCase[] {
    return data.map((row, index) => ({
      id: row['Test Case ID'] || `TC_${index + 1}`,
      name: row['Test Case Name'] || '',
      description: row['Description'] || '',
      preconditions: row['Preconditions'] || '',
      steps: this.parseList(row['Steps']),
      expectedResults: this.parseList(row['Expected Results']),
      module: row['Module'] || '',
      priority: row['Priority'] || 'Medium',
      tags: this.parseList(row['Tags']),
    }));
  }

  /**
   * Parse requirements from Excel data
   */
  private static parseRequirements(data: any[]): Array<{id: string; description: string; module: string}> {
    return data.map((row) => ({
      id: row['Requirement ID'] || '',
      description: row['Description'] || '',
      module: row['Module'] || '',
    }));
  }

  /**
   * Parse acceptance criteria from Excel data
   */
  private static parseAcceptanceCriteria(
    data: any[]
  ): Array<{testCaseId: string; criteria: string}> {
    return data.map((row) => ({
      testCaseId: row['Test Case ID'] || '',
      criteria: row['Acceptance Criteria'] || '',
    }));
  }

  /**
   * Helper function to parse comma-separated or newline-separated lists
   */
  private static parseList(value: string | undefined): string[] {
    if (!value) return [];
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  /**
   * Convert test case to formatted string for RAG ingestion
   */
  static testCaseToString(testCase: TestCase): string {
    return `
    Test Case ID: ${testCase.id}
    Name: ${testCase.name}
    Module: ${testCase.module}
    Priority: ${testCase.priority}
    Description: ${testCase.description}
    Preconditions: ${testCase.preconditions}
    Steps: ${testCase.steps.join(' | ')}
    Expected Results: ${testCase.expectedResults.join(' | ')}
    Tags: ${testCase.tags?.join(', ') || 'N/A'}
    `;
  }

  /**
   * Export test cases to formatted documents for RAG
   */
  static exportForRAG(excelData: ExcelTestData): string {
    let document = '# Test Cases Knowledge Base\n\n';

    document += '## Requirements\n';
    excelData.requirements.forEach((req) => {
      document += `\n### ${req.id} - ${req.module}\n${req.description}\n`;
    });

    document += '\n## Test Cases\n';
    excelData.testCases.forEach((tc) => {
      document += this.testCaseToString(tc) + '\n---\n';
    });

    document += '\n## Acceptance Criteria\n';
    excelData.acceptanceCriteria.forEach((ac) => {
      document += `- Test Case ${ac.testCaseId}: ${ac.criteria}\n`;
    });

    return document;
  }
}

export default ExcelTestCasesLoader;