import { prisma } from '@/database/db';
import type { Bank } from '@generated/prisma/client';

export class BankRepository {
  async findAll(): Promise<Bank[]> {
    return prisma.bank.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: number): Promise<Bank | null> {
    return prisma.bank.findUnique({
      where: { id },
    });
  }
}
