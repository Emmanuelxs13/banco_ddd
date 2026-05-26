import { Pool, PoolClient } from 'pg';
import { config } from '../../shared/config';
import { logger } from '../../shared/logger';

class Database {
  private pool: Pool;
  private static instance: Database;

  private constructor() {
    this.pool = new Pool({
      host: config.DB_HOST,
      port: config.DB_PORT,
      database: config.DB_NAME,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.pool.on('error', (err) => {
      logger.error('Error inesperado en el pool de BD', err);
    });
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async getPool(): Promise<Pool> {
    return this.pool;
  }

  async getClient(): Promise<PoolClient> {
    const client = await this.pool.connect();
    return client;
  }

  async query(text: string, params?: any[]) {
    const start = Date.now();
    const result = await this.pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Query ejecutada [${duration}ms]: ${text.substring(0, 80)}...`);
    return result;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      logger.info('Conexión a PostgreSQL establecida');
      return true;
    } catch (error) {
      logger.error('Error conectando a PostgreSQL', error);
      return false;
    }
  }

  async close() {
    await this.pool.end();
  }
}

export const db = Database.getInstance();
