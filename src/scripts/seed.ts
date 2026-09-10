import { prisma } from '@/database/db';
import { provincesData, districtsData } from './ubigeoData';
import bcrypt from 'bcrypt';

async function main(): Promise<void> {
  // Departments (Peru - 25 regions)
  const departments = [
    { id: 1, name: 'Amazonas' },
    { id: 2, name: 'Áncash' },
    { id: 3, name: 'Apurímac' },
    { id: 4, name: 'Arequipa' },
    { id: 5, name: 'Ayacucho' },
    { id: 6, name: 'Cajamarca' },
    { id: 7, name: 'Callao' },
    { id: 8, name: 'Cusco' },
    { id: 9, name: 'Huancavelica' },
    { id: 10, name: 'Huánuco' },
    { id: 11, name: 'Ica' },
    { id: 12, name: 'Junín' },
    { id: 13, name: 'La Libertad' },
    { id: 14, name: 'Lambayeque' },
    { id: 15, name: 'Lima' },
    { id: 16, name: 'Loreto' },
    { id: 17, name: 'Madre de Dios' },
    { id: 18, name: 'Moquegua' },
    { id: 19, name: 'Pasco' },
    { id: 20, name: 'Piura' },
    { id: 21, name: 'Puno' },
    { id: 22, name: 'San Martín' },
    { id: 23, name: 'Tacna' },
    { id: 24, name: 'Tumbes' },
    { id: 25, name: 'Ucayali' },
  ];

  // Generate Provinces and Districts dynamically from ubigeoData
  const provinces: { id: number; name: string; departmentId: number }[] = [];
  const districts: { id: number; name: string; provinceId: number }[] = [];

  for (const deptIdStr of Object.keys(provincesData)) {
    const departmentId = parseInt(deptIdStr, 10);
    const provs = (provincesData as Record<string, string[]>)[deptIdStr];

    provs.forEach((provName, pIndex) => {
      const provIdStr = deptIdStr + String(pIndex + 1).padStart(2, '0');
      const provinceId = parseInt(provIdStr, 10);
      provinces.push({ id: provinceId, name: provName, departmentId });

      const dists = (districtsData as Record<string, string[]>)[provName];
      if (dists) {
        dists.forEach((distName, dIndex) => {
          const distIdStr = provIdStr + String(dIndex + 1).padStart(2, '0');
          const districtId = parseInt(distIdStr, 10);
          districts.push({ id: districtId, name: distName, provinceId });
        });
      }
    });
  }

  const documentTypes = [
    { name: 'Documento Nacional de Identidad', code: 'DNI' },
    { name: 'Carné de Extranjería', code: 'CE' },
    { name: 'Pasaporte', code: 'PAS' },
    { name: 'Registro Único de Contribuyentes', code: 'RUC' },
  ];

  const roles = [
    { id: 1, name: 'User', description: 'Regular User' },
    { id: 2, name: 'Admin', description: 'Administrator' },
  ];

  const banks = [
    { name: 'Banco de Crédito del Perú', code: 'BCP' },
    { name: 'Interbank', code: 'IBK' },
    { name: 'BBVA Perú', code: 'BBVA' },
    { name: 'Scotiabank Perú', code: 'SCOTIA' },
    { name: 'Banco de la Nación', code: 'BN' },
    { name: 'BanBif', code: 'BANBIF' },
    { name: 'Mibanco', code: 'MIBANCO' },
    { name: 'Banco Pichincha', code: 'PICHINCHA' },
  ];

  try {
    console.log('Seeding departments...');
    await prisma.department.createMany({ data: departments, skipDuplicates: true });

    console.log('Seeding roles...');
    await prisma.role.createMany({ data: roles, skipDuplicates: true });

    console.log('Seeding provinces...');
    await prisma.province.createMany({ data: provinces, skipDuplicates: true });

    console.log('Seeding districts...');
    await prisma.district.createMany({ data: districts, skipDuplicates: true });

    console.log('Seeding document types...');
    await prisma.documentType.createMany({ data: documentTypes, skipDuplicates: true });

    console.log('Seeding banks...');
    await prisma.bank.createMany({ data: banks, skipDuplicates: true });

    const testUser = await prisma.user.upsert({
      where: { email: 'demo@capitalfest.test' },
      update: { accountStatus: 'active', emailVerified: true },
      create: {
        roleId: 1, firstName: 'Demo', lastName: 'Capital Fest', birthDate: new Date('1995-01-01'),
        phone: '999999999', email: 'demo@capitalfest.test', passwordHash: await bcrypt.hash('Demo1234!', 12),
        documentTypeId: 1, documentNumber: '99999999', accountStatus: 'active', emailVerified: true,
      },
    });
    await prisma.user.upsert({
      where: { email: 'admin@capitalfest.test' },
      update: { accountStatus: 'active', emailVerified: true },
      create: {
        roleId: 2, firstName: 'Admin', lastName: 'Capital Fest', birthDate: new Date('1990-01-01'),
        phone: '988888888', email: 'admin@capitalfest.test', passwordHash: await bcrypt.hash('Admin1234!', 12),
        documentTypeId: 1, documentNumber: '88888888', accountStatus: 'active', emailVerified: true,
      },
    });
    const bcp = await prisma.bank.findUniqueOrThrow({ where: { code: 'BCP' } });
    await prisma.card.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: { status: 'active', deletedAt: null },
      create: { id: '00000000-0000-0000-0000-000000000001', userId: testUser.id, bankId: bcp.id, cardHolderName: 'Demo Capital Fest', cardBrand: 'Visa', lastFourDigits: '7890', expirationMonth: 12, expirationYear: 2028, creditLimit: 8000, usedLimit: 0, isVerified: true },
    });

    console.log('Seeding completed.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
