import type { Department } from '@generated/prisma/client';
import { prisma } from '@/database/db';

export type CreateDepartmentInput = {
  id: number;
  name: string;
};

export type UpdateDepartmentInput = {
  name: string;
};

export class DepartmentRepository {
  async create(data: CreateDepartmentInput): Promise<Department> {
    return prisma.department.create({
      data: {
        id: data.id,
        name: data.name,
      },
    });
  }

  async findAll(): Promise<Department[]> {
    return prisma.department.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findById(id: number): Promise<Department | null> {
    return prisma.department.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Department | null> {
    return prisma.department.findFirst({
      where: { name },
    });
  }

  async update(id: number, data: UpdateDepartmentInput): Promise<Department> {
    return prisma.department.update({
      where: { id },
      data: {
        name: data.name,
      },
    });
  }

  async delete(id: number): Promise<Department> {
    return prisma.department.delete({
      where: { id },
    });
  }
}
