// lib/db.ts - Azure SQL Database Connection
import sql from 'mssql';

const config: sql.config = {
  server: process.env.AZURE_SQL_SERVER || 'docupro.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'DocumentConverter',
  user: process.env.AZURE_SQL_USER || 'docupro',
  password: process.env.AZURE_SQL_PASSWORD || '',
  port: parseInt(process.env.AZURE_SQL_PORT || '1433'),
  options: {
    encrypt: true, // Required for Azure SQL
    trustServerCertificate: false,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Singleton connection pool
let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    if (pool && pool.connected) {
      return pool;
    }

    pool = await sql.connect(config);
    console.log('Connected to Azure SQL Database');
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export async function query<T>(
  queryString: string,
  params?: { name: string; type: sql.ISqlType | (() => sql.ISqlType); value: any }[]
): Promise<sql.IResult<T>> {
  const connection = await getConnection();
  const request = connection.request();

  if (params) {
    params.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });
  }

  return request.query(queryString);
}

export async function execute(
  procedureName: string,
  params?: { name: string; type: sql.ISqlType | (() => sql.ISqlType); value: any }[]
): Promise<sql.IProcedureResult<any>> {
  const connection = await getConnection();
  const request = connection.request();

  if (params) {
    params.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });
  }

  return request.execute(procedureName);
}

// Close connection pool (for cleanup)
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Database connection closed');
  }
}

// SQL Types export for convenience
export { sql };

// Helper function to generate unique IDs
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}${random}`.toUpperCase();
}

// Helper to format date for SQL
export function formatDateForSQL(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Helper to get current UTC date
export function getCurrentUTCDate(): Date {
  return new Date();
}
