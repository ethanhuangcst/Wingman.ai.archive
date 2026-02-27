import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: '101.132.156.250',
  port: 33320,
  user: 'wingman_db_usr_8a2Xy',
  password: 'Z8#kP2@vQ7$mE5!tR3&wX9*yB4',
  database: 'wingman_db',
  waitForConnections: true,
  connectionLimit: 5, // Reduced to prevent overload
  queueLimit: 0,
  connectTimeout: 3000, // Shorter timeout
  acquireTimeout: 3000, // Shorter acquire timeout
  timeout: 3000, // Shorter overall timeout
  charset: 'utf8mb4',
  multipleStatements: false,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Database management class
export class DatabaseManager {
  private static instance: DatabaseManager;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  // Singleton pattern
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // Get database connection pool
  public getPool(): mysql.Pool {
    return pool;
  }

  // Get a connection from the pool
  public async getConnection(): Promise<mysql.PoolConnection> {
    return await pool.getConnection();
  }

  // Execute a query with connection management
  public async execute<T = any>(query: string, params?: any[]): Promise<T[]> {
    let connection;
    try {
      connection = await this.getConnection();
      const [results] = await connection.execute(query, params);
      return results as T[];
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  // Execute a query and return the raw result (for UPDATE/INSERT/DELETE queries)
  public async executeRaw(query: string, params?: any[]): Promise<any> {
    let connection;
    try {
      connection = await this.getConnection();
      const result = await connection.execute(query, params);
      return result;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  // Close the pool
  public async close(): Promise<void> {
    await pool.end();
  }

  // Get connection status
  public async getStatus(): Promise<{ activeConnections: number; idleConnections: number }> {
    const poolStatus = pool.pool as any;
    return {
      activeConnections: poolStatus._activeConnections.length,
      idleConnections: poolStatus._idleConnections.length
    };
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();

// Export pool for backward compatibility
export default pool;

// Common database operations
export const db = {
  // Execute query with connection management
  async execute<T = any>(query: string, params?: any[]): Promise<T[]> {
    return await dbManager.execute<T>(query, params);
  },

  // Execute query and return raw result (for UPDATE/INSERT/DELETE queries)
  async executeRaw(query: string, params?: any[]): Promise<any> {
    return await dbManager.executeRaw(query, params);
  },

  // Get connection
  async getConnection(): Promise<mysql.PoolConnection> {
    return await dbManager.getConnection();
  },

  // Get pool
  getPool(): mysql.Pool {
    return dbManager.getPool();
  },

  // Close pool
  async close(): Promise<void> {
    await dbManager.close();
  },

  // Get status
  async getStatus(): Promise<{ activeConnections: number; idleConnections: number }> {
    return await dbManager.getStatus();
  }
};
