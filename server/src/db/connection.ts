import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

export interface DBStatus {
  mode: 'IN_MEMORY_SYNTHETIC' | 'POSTGRESQL_PERSISTENT';
  connected: boolean;
  message: string;
}

let pool: pg.Pool | null = null;
let isConnected = false;

if (config.databaseUrl) {
  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 3000
    });

    pool.connect((err, client, release) => {
      if (err) {
        console.warn(`[Database] PostgreSQL connection failed (${err.message}). Using In-Memory Synthetic Store.`);
        isConnected = false;
      } else {
        isConnected = true;
        release();
        console.log('[Database] PostgreSQL connected successfully. Dual persistence active.');
      }
    });
  } catch (error) {
    console.warn(`[Database] Could not initialize PostgreSQL pool: ${(error as Error).message}`);
    pool = null;
  }
} else {
  console.log('[Database] DATABASE_URL not set. Running in In-Memory Synthetic Development Mode.');
}

export function getDatabaseStatus(): DBStatus {
  if (pool && isConnected) {
    return {
      mode: 'POSTGRESQL_PERSISTENT',
      connected: true,
      message: 'PostgreSQL database connected. Records persist across server restarts.'
    };
  }

  return {
    mode: 'IN_MEMORY_SYNTHETIC',
    connected: false,
    message: 'Operating in self-contained In-Memory Development Mode with synthetic banking seed data. No external database required.'
  };
}

export { pool };
