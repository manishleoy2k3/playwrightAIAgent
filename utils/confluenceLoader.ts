import axios from 'axios';

/**
 * Confluence Loader
 * Fetches documentation from Confluence for RAG knowledge base
 */

/**
 * Confluence Data Loader
 * Fetches documentation and requirements from Confluence pages
 */
export class ConfluenceLoader {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  /**
   * Fetch page content from Confluence
   */
  async fetchPageContent(pageId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/pages/${pageId}?body-format=storage`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return this.extractTextFromStorage(response.data.body.storage.value);
    } catch (error) {
      console.error(`Failed to fetch Confluence page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all pages from a space
   */
  async fetchSpaceContent(spaceKey: string, limit: number = 50): Promise<Array<{id: string; title: string; content: string}>> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/3/spaces/${spaceKey}/pages?limit=${limit}&body-format=storage`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const pages = [];
      for (const page of response.data.results) {
        const content = this.extractTextFromStorage(page.body.storage.value);
        pages.push({
          id: page.id,
          title: page.title,
          content,
        });
      }

      return pages;
    } catch (error) {
      console.error(`Failed to fetch Confluence space ${spaceKey}:`, error);
      throw error;
    }
  }

  /**
   * Extract plain text from Confluence storage format
   */
  private extractTextFromStorage(storageXml: string): string {
    // Remove XML tags and extract text content
    return storageXml
      .replace(/<[^>]*>/g, ' ') // Remove all XML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Batch fetch multiple pages
   */
  async fetchMultiplePages(pageIds: string[]): Promise<Array<{id: string; content: string}>> {
    const results = [];
    for (const pageId of pageIds) {
      try {
        const content = await this.fetchPageContent(pageId);
        results.push({
          id: pageId,
          content,
        });
      } catch (error) {
        console.warn(`Skipping page ${pageId} due to error`);
      }
    }
    return results;
  }
}

export default ConfluenceLoader;