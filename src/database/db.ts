import { PrismaClient } from '@generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import enviroment from '@/config/enviroment';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = enviroment;

console.log('DB_HOST', DB_HOST);
console.log('DB_USER', DB_USER);
console.log('DB_PASSWORD', DB_PASSWORD);
console.log('DB_NAME', DB_NAME);



const adapter = new PrismaMariaDb({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});
const prisma = new PrismaClient({ adapter });

export { prisma };
