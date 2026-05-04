import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  dbDriver: (process.env.DB_DRIVER ?? 'sqlite') as 'sqlite' | 'postgres',
  dbFile: process.env.DB_FILE ?? './data/preplab.db',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  isDev: process.env.NODE_ENV !== 'production',
};
