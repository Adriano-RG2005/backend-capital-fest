import { prisma } from '@/database/db';

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

  // Provinces: small sample per region (ids chosen for uniqueness)
  const provinces = [
    { id: 1501, name: 'Lima', departmentId: 15 },
    { id: 1502, name: 'Cañete', departmentId: 15 },
    { id: 801, name: 'Cusco', departmentId: 8 },
    { id: 802, name: 'Urubamba', departmentId: 8 },
    { id: 2001, name: 'Piura', departmentId: 20 },
    { id: 2002, name: 'Sullana', departmentId: 20 },
  ];

  // Districts: sample districts for the sample provinces
  const districts = [
    { id: 150101, name: 'Lima', provinceId: 1501 },
    { id: 150201, name: 'San Vicente de Cañete', provinceId: 1502 },
    { id: 80101, name: 'Cusco', provinceId: 801 },
    { id: 80201, name: 'Urubamba', provinceId: 802 },
    { id: 200101, name: 'Piura', provinceId: 2001 },
    { id: 200201, name: 'Sullana', provinceId: 2002 },
  ];

  const documentTypes = [
    { name: 'Documento Nacional de Identidad', code: 'DNI' },
    { name: 'Carné de Extranjería', code: 'CE' },
    { name: 'Pasaporte', code: 'PAS' },
    { name: 'Registro Único de Contribuyentes', code: 'RUC' },
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

    console.log('Seeding provinces...');
    await prisma.province.createMany({ data: provinces, skipDuplicates: true });

    console.log('Seeding districts...');
    await prisma.district.createMany({ data: districts, skipDuplicates: true });

    console.log('Seeding document types...');
    await prisma.documentType.createMany({ data: documentTypes, skipDuplicates: true });

    console.log('Seeding banks...');
    await prisma.bank.createMany({ data: banks, skipDuplicates: true });

    console.log('Seeding completed.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
