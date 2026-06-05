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
  DATABASE_URL: String(getEnvValue('DATABASE_URL')),
  DB_HOST: String(getEnvValue('DB_HOST', 'localhost')),
  DB_USER: String(getEnvValue('DB_USER', 'user')),
  DB_PASSWORD: String(getEnvValue('DB_PASSWORD', 'password')),
  DB_NAME: String(getEnvValue('DB_NAME', 'db_name')),
};
