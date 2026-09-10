import dotenv from 'dotenv';

const getEnvValue = (envKey: string, defaultValue?: string): string => {
  const value = process.env[envKey];

  if (value !== undefined && value !== null) {
    return String(value);
  }

  if (defaultValue !== undefined && defaultValue !== null) {
    return String(defaultValue);
  }

  throw new Error(`Please define the Enviroment variable: [${envKey}]`);
};

dotenv.config();

export default {
  ENV: String(getEnvValue('NODE_ENV', 'development')),
  PORT: Number(getEnvValue('PORT', '3000')),
  DATABASE_URL: String(process.env.DATABASE_URL || process.env.MYSQL_URL || getEnvValue('DATABASE_URL')),
  DB_HOST: String(process.env.DB_HOST || process.env.MYSQLHOST || 'localhost'),
  DB_USER: String(process.env.DB_USER || process.env.MYSQLUSER || 'user'),
  DB_PASSWORD: String(process.env.DB_PASSWORD ?? process.env.MYSQLPASSWORD ?? 'password'),
  DB_NAME: String(process.env.DB_NAME || process.env.MYSQLDATABASE || 'db_name'),
  JWT_SECRET: String(getEnvValue('JWT_SECRET', 'change-this-secret-in-production')),
  CORS_ORIGIN: String(getEnvValue('CORS_ORIGIN', 'http://localhost:4321,https://pagina-web-de-empresa.vercel.app')),
};
