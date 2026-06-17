import { prisma } from '@/database/db';

async function main() {
  const d = await prisma.department.count();
  const p = await prisma.province.count();
  const di = await prisma.district.count();
  console.log(`Departments: ${d}, Provinces: ${p}, Districts: ${di}`);
  process.exit(0);
}
main();
