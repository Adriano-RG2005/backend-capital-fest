import type { User } from '@generated/prisma/client';
import { prisma } from '@/database/db';

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  birthDate: Date;
  phone: string;
  documentTypeId: number;
  documentNumber: string;
  roleId: number;
  departmentId: number;
  provinceId: number;
  districtId: number;
  address: string;
};

export class UserRepository {
  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: data.passwordHash,
        birthDate: data.birthDate,
        phone: data.phone,
        documentNumber: data.documentNumber,
        department: {
          connect: { id: data.departmentId },
        },
        province: {
          connect: { id: data.provinceId },
        },
        district: {
          connect: { id: data.districtId },
        },
        address: data.address,
        role: {
          connect: { id: data.roleId },
        },
        documentType: {
          connect: { id: data.documentTypeId },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByDocumentNumber(documentNumber: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { documentNumber },
    });
  }
}
