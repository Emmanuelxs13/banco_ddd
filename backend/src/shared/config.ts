import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME || 'banco_core',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  JWT_SECRET: process.env.JWT_SECRET || 'banco_core_ddd_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
};
