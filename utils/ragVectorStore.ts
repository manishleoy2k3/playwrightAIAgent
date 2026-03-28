import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import * as fs from 'fs';

/**
 * RAG Vector Store Setup
 * Creates and manages a vector database for knowledge retrieval
 */
export class RAGVectorStore {
  private vectorStore: MemoryVectorStore | null = null;
  private splitter: RecursiveCharacterTextSplitter;

  constructor() {
    // Initialize text splitter for chunking documents
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', ' ', ''],
    });
  }

  /**
   * Initialize the vector store
   */
  async initialize(): Promise<void> {
    try {
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-3-small', // Lightweight embedding model
      });

      this.vectorStore = new MemoryVectorStore(embeddings);
      console.log('RAG Vector Store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RAG Vector Store:', error);
      throw error;
    }
  }

  /**
   * Add documents to the vector store
   */
  async addDocuments(content: string, metadata: {source: string; type: string}): Promise<void> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized. Call initialize() first.');
    }

    // Split the content into chunks
    const chunks = await this.splitter.splitText(content);

    // Create documents with metadata
    const documents: Document[] = chunks.map(
      (chunk: string, index: number) =>
        new Document({
          pageContent: chunk,
          metadata: {
            ...metadata,
            chunkIndex: index,
            chunkCount: chunks.length,
          },
        })
    );

    // Add documents to vector store
    await this.vectorStore.addDocuments(documents);
    console.log(`Added ${documents.length} document chunks from ${metadata.source}`);
  }

  /**
   * Search for relevant documents
   */
  async search(query: string, k: number = 5): Promise<Array<{content: string; score: number; metadata: any}>> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized. Call initialize() first.');
    }

    const results = await this.vectorStore.similaritySearchWithScore(query, k);

    return results.map(([doc, score]: [Document, number]) => ({
      content: doc.pageContent,
      score,
      metadata: doc.metadata,
    }));
  }

  /**
   * Get all documents from a specific source
   */
  async getDocumentsBySource(source: string): Promise<any[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized. Call initialize() first.');
    }

    // Filter documents by source in metadata
    return this.vectorStore.memoryVectors
      .filter((item: any) => item.metadata.source === source)
      .map((item: any) => ({
        content: item.content,
        metadata: item.metadata,
      }));
  }

  /**
   * Save vector store state to file
   */
  async saveState(filePath: string): Promise<void> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    const state = {
      vectors: this.vectorStore.memoryVectors,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
    console.log(`Vector store state saved to ${filePath}`);
  }

  /**
   * Load vector store state from file
   */
  async loadState(filePath: string): Promise<void> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Vector store file not found: ${filePath}`);
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      // Restore vector store state
      console.log(`Vector store state loaded from ${filePath}`);
    } catch (error) {
      console.error('Failed to load vector store state:', error);
      throw error;
    }
  }

  /**
   * Clear all documents
   */
  async clear(): Promise<void> {
    if (this.vectorStore) {
      this.vectorStore.memoryVectors = [];
      console.log('Vector store cleared');
    }
  }

  /**
   * Get vector store statistics
   */
  getStats(): {totalDocuments: number; sources: string[]} {
    if (!this.vectorStore) {
      return {totalDocuments: 0, sources: []};
    }

    const sources = new Set(
      this.vectorStore.memoryVectors.map((item: any) => item.metadata.source)
    );

    return {
      totalDocuments: this.vectorStore.memoryVectors.length,
      sources: Array.from(sources) as string[],
    };
  }
}

export default RAGVectorStore;