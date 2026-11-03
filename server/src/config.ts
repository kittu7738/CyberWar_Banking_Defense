import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || '',
  defaultBudget: parseInt(process.env.DEFAULT_DEFENSE_BUDGET || '1000000', 10),
  maxRounds: parseInt(process.env.MAX_SIMULATION_ROUNDS || '5', 10)
};
