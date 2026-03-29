import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST as string,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // for GCP internal IP
    trustServerCertificate: true
  }
};

let pool: sql.ConnectionPool;

export const getDb = async () => {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server');
  }
  return pool;
};
