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
  verification?: {
    documentFrontUrl?: string;
    documentBackUrl?: string;
    selfieWithDocumentUrl?: string;
  };
  bankAccounts?: Array<{
    bankId: number;
    accountHolderName: string;
    accountNumber: string;
    cci?: string | null;
    accountType?: 'savings' | 'checking';
    isDefault?: boolean;
  }>;
  cards?: Array<{
    bankId: number;
    lastFourDigits: string;
    cardHolderName?: string | null;
    cardBrand?: string | null;
    cardFrontImageUrl?: string | null;
    cardBackImageUrl?: string | null;
    bankAccountId?: string | null;
    isDefault?: boolean;
  }>;
};

export class UserRepository {
  async create(data: CreateUserInput): Promise<User> {
    return prisma.$transaction(async (transaction) => {
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

      const user = await transaction.user.create({ data: createData });

      if (data.verification) {
        await transaction.userVerification.create({
          data: {
            userId: user.id,
            documentFrontUrl: data.verification.documentFrontUrl,
            documentBackUrl: data.verification.documentBackUrl,
            selfieWithDocumentUrl: data.verification.selfieWithDocumentUrl,
          },
        });
      }

      for (const [index, bankAccount] of (data.bankAccounts ?? []).entries()) {
        await transaction.bankAccount.create({
          data: {
            userId: user.id,
            bankId: bankAccount.bankId,
            accountHolderName: bankAccount.accountHolderName,
            accountNumber: bankAccount.accountNumber,
            cci: bankAccount.cci ?? null,
            accountType: bankAccount.accountType ?? 'checking',
            isDefault: bankAccount.isDefault ?? index === 0,
          },
        });
      }

      for (const [index, card] of (data.cards ?? []).entries()) {
        const createdCard = await transaction.card.create({
          data: {
            userId: user.id,
            bankId: card.bankId,
            bankAccountId: card.bankAccountId ?? null,
            cardHolderName: card.cardHolderName ?? `${data.firstName} ${data.lastName}`,
            cardBrand: card.cardBrand ?? null,
            lastFourDigits: card.lastFourDigits,
            cardFrontImageUrl: card.cardFrontImageUrl ?? null,
            isDefault: card.isDefault ?? index === 0,
          },
        });

        if (card.cardBackImageUrl) {
          await transaction.$executeRawUnsafe(
            'UPDATE cards SET card_back_image_url = ? WHERE id = ?',
            card.cardBackImageUrl,
            createdCard.id,
          );
        }
      }

      return user;
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

  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      include: {
        role: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        verifications: true,
        bankAccounts: true,
        cards: true,
      },
    });
  }

  async findByName(name: string): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: name } },
          { lastName: { contains: name } },
        ],
      },
      include: {
        role: true,
      },
    });
  }

  async deleteAll(): Promise<void> {
    // Delete depending records first because of foreign key constraints
    await prisma.userVerification.deleteMany({});
    await prisma.card.deleteMany({});
    await prisma.bankAccount.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.simulation.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.user.deleteMany({});
  }
}
