import type { DocumentType } from '@generated/prisma/client';
import { prisma } from '@/database/db';

export type CreateDocumentTypeInput = {
	name: string;
	code?: string | null;
};

export type UpdateDocumentTypeInput = {
	name: string;
	code?: string | null;
};

export class DocumentTypesRepository {
	async create(data: CreateDocumentTypeInput): Promise<DocumentType> {
		return prisma.documentType.create({
			data: {
				name: data.name,
				code: data.code,
			},
		});
	}

	async findAll(): Promise<DocumentType[]> {
		return prisma.documentType.findMany({
			orderBy: {
				id: 'asc',
			},
		});
	}

	async findById(id: number): Promise<DocumentType | null> {
		return prisma.documentType.findUnique({
			where: { id },
		});
	}

	async findByName(name: string): Promise<DocumentType | null> {
		return prisma.documentType.findFirst({
			where: { name },
		});
	}

	async findByCode(code: string): Promise<DocumentType | null> {
		return prisma.documentType.findFirst({
			where: { code },
		});
	}

	async update(id: number, data: UpdateDocumentTypeInput): Promise<DocumentType> {
		return prisma.documentType.update({
			where: { id },
			data: {
				name: data.name,
				code: data.code,
			},
		});
	}

	async delete(id: number): Promise<DocumentType> {
		return prisma.documentType.delete({
			where: { id },
		});
	}
}
