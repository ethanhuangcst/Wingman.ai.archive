import mysql from 'mysql2/promise';
import { db } from './database';

// Provider-related database methods
export interface AIProvider {
  id: string;
  name: string;
  base_urls: string[];
  default_model: string;
  requires_auth: boolean;
  auth_header: string | null;
  created_at: Date;
  updated_at: Date;
}

// Get all providers
export async function getAllProviders(): Promise<AIProvider[]> {
  const rows = await db.execute(`
    SELECT * FROM ai_providers ORDER BY created_at ASC
  `);
  
  // Parse JSON fields if needed
  return (rows as any[]).map(row => {
    let baseUrls: string[] = [];
    try {
      // First try to parse as JSON
      if (typeof row.base_urls === 'string') {
        baseUrls = JSON.parse(row.base_urls);
      } else if (Array.isArray(row.base_urls)) {
        baseUrls = row.base_urls;
      } else if (row.base_urls) {
        // If it's an object (Buffer or other type), convert to string and split by commas
        const baseUrlsString = String(row.base_urls);
        baseUrls = baseUrlsString.split(',').map(url => url.trim());
      }
    } catch (error) {
      // If parsing fails, try to split as comma-separated string
      if (row.base_urls) {
        const baseUrlsString = String(row.base_urls);
        baseUrls = baseUrlsString.split(',').map(url => url.trim());
      }
    }
    return {
      ...row,
      base_urls: baseUrls
    };
  });
}

// Helper function to parse base_urls
function parseBaseUrls(baseUrls: any): string[] {
  let result: string[] = [];
  try {
    // First try to parse as JSON
    if (typeof baseUrls === 'string') {
      result = JSON.parse(baseUrls);
    } else if (Array.isArray(baseUrls)) {
      result = baseUrls;
    } else if (baseUrls) {
      // If it's an object (Buffer or other type), convert to string and split by commas
      const baseUrlsString = String(baseUrls);
      result = baseUrlsString.split(',').map(url => url.trim());
    }
  } catch (error) {
    // If parsing fails, try to split as comma-separated string
    if (baseUrls) {
      const baseUrlsString = String(baseUrls);
      result = baseUrlsString.split(',').map(url => url.trim());
    }
  }
  return result;
}

// Get provider by ID
export async function getProviderById(id: string): Promise<AIProvider | null> {
  const rows = await db.execute(`
    SELECT * FROM ai_providers WHERE id = ?
  `, [id]);
  
  if ((rows as any[]).length === 0) {
    return null;
  }
  
  const row = (rows as any)[0];
  return {
    ...row,
    base_urls: parseBaseUrls(row.base_urls)
  };
}

// Get default provider
export async function getDefaultProvider(): Promise<AIProvider | null> {
  const rows = await db.execute(`
    SELECT * FROM ai_providers ORDER BY created_at ASC LIMIT 1
  `);
  
  if ((rows as any[]).length === 0) {
    return null;
  }
  
  const row = (rows as any)[0];
  return {
    ...row,
    base_urls: parseBaseUrls(row.base_urls)
  };
}

// Export the database management service for use in other files
export default db;