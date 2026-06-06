import type { District } from '@generated/prisma/client';
import { prisma } from '@/database/db';

export type CreateDistrictInput = {
  id: number;
  name: string;
  provinceId: number;
};

export type UpdateDistrictInput = {
  name: string;
  provinceId: number;
};

export class DistrictRepository {
  async create(data: CreateDistrictInput): Promise<District> {
    return prisma.district.create({
      data: {
        id: data.id,
        name: data.name,
        province: {
          connect: { id: data.provinceId },
        },
      },
    });
  }

  async findAll(): Promise<District[]> {
    return prisma.district.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findById(id: number): Promise<District | null> {
    return prisma.district.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<District | null> {
    return prisma.district.findFirst({
      where: { name },
    });
  }

  async update(id: number, data: UpdateDistrictInput): Promise<District> {
    return prisma.district.update({
      where: { id },
      data: {
        name: data.name,
        province: {
          connect: { id: data.provinceId },
        },
      },
    });
  }

  async delete(id: number): Promise<District> {
    return prisma.district.delete({
      where: { id },
    });
  }
}
