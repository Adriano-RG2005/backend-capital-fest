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
  departmentId?: number;
  provinceId?: number;
  districtId?: number;
  address: string;
};

export class UserRepository {
  async create(data: CreateUserInput): Promise<User> {
    const createData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: data.passwordHash,
      birthDate: data.birthDate,
      phone: data.phone,
      documentNumber: data.documentNumber,
      address: data.address,
      role: { connect: { id: data.roleId } },
      documentType: { connect: { id: data.documentTypeId } },
    };

    if (data.departmentId !== undefined && data.departmentId !== null) {
      createData.department = { connect: { id: data.departmentId } };
    }
    if (data.provinceId !== undefined && data.provinceId !== null) {
      createData.province = { connect: { id: data.provinceId } };
    }
    if (data.districtId !== undefined && data.districtId !== null) {
      createData.district = { connect: { id: data.districtId } };
    }

    return prisma.user.create({ data: createData });
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
