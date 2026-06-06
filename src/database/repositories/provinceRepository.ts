import type { Province } from '@generated/prisma/client';
import { prisma } from '@/database/db';

export type CreateProvinceInput = {
  id: number;
  name: string;
  departmentId: number;
};

export type UpdateProvinceInput = {
  name: string;
  departmentId: number;
};

export class ProvinceRepository {
  async create(data: CreateProvinceInput): Promise<Province> {
    return prisma.province.create({
      data: {
        id: data.id,
        name: data.name,
        department: {
          connect: { id: data.departmentId },
        },
      },
    });
  }

  async findAll(): Promise<Province[]> {
    return prisma.province.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findById(id: number): Promise<Province | null> {
    return prisma.province.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Province | null> {
    return prisma.province.findFirst({
      where: { name },
    });
  }

  async update(id: number, data: UpdateProvinceInput): Promise<Province> {
    return prisma.province.update({
      where: { id },
      data: {
        name: data.name,
        department: {
          connect: { id: data.departmentId },
        },
      },
    });
  }

  async delete(id: number): Promise<Province> {
    return prisma.province.delete({
      where: { id },
    });
  }
}
