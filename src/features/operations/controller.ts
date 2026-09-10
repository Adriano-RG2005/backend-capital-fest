import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/database/db';
import HttpException from '@/exceptions/HttpException';
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware';
const uid = (req: Request) => (req as AuthenticatedRequest).userId;
const include = { simulation: { include: { bank: true, card: true } }, statusHistory: { orderBy: { createdAt: 'asc' as const } } } as const;
const serialize = (item: any) => ({ id: item.simulation.operationCode, date: item.createdAt, userId: item.userId, requestedAmount: Number(item.simulation.grossAmount), feeAmount: Number(item.simulation.feeAmount), netAmount: Number(item.simulation.netAmount), bank: item.simulation.bank.name, cardLastFourDigits: item.simulation.card.lastFourDigits, status: item.status, statusHistory: item.statusHistory });
const createPdf = (lines: string[]) => {
  const content = `BT /F1 12 Tf 50 760 Td ${lines.map(line => `(${line.replace(/[()\\]/g, '\\$&')}) Tj 0 -20 Td`).join(' ')} ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
};
export const listOperations = async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const where: any = { userId: uid(req), ...(status ? { status } : {}), ...(search ? { OR: [{ simulation: { operationCode: { contains: search } } }, { simulation: { bank: { name: { contains: search } } } }] } : {}) };
  const [items, total, completed, pending, cancelled] = await Promise.all([
    prisma.withdrawal.findMany({ where, include, orderBy: req.query.sort === 'amount' ? { simulation: { grossAmount: 'desc' } } : { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.withdrawal.count({ where }),
    prisma.withdrawal.count({ where: { userId: uid(req), status: 'completed' } }),
    prisma.withdrawal.count({ where: { userId: uid(req), status: { in: ['pending', 'reviewing', 'approved'] } } }),
    prisma.withdrawal.count({ where: { userId: uid(req), status: { in: ['cancelled', 'rejected'] } } }),
  ]);
  res.json({ items: items.map(serialize), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }, summary: { total, completed, pending, cancelled } });
};
const find = (req: Request) => prisma.withdrawal.findFirst({ where: { userId: uid(req), simulation: { operationCode: String(req.params.id) } }, include });
export const getOperation = async (req: Request, res: Response) => { const item = await find(req); if (!item) throw new HttpException(StatusCodes.NOT_FOUND, 'Operación no encontrada'); res.json(serialize(item)); };
export const voucher = async (req: Request, res: Response) => { const item = await find(req); if (!item) throw new HttpException(StatusCodes.NOT_FOUND, 'Operación no encontrada'); const pdf = createPdf(['Capital Fest', `Operacion: ${item.simulation.operationCode}`, `Monto: S/ ${item.simulation.grossAmount}`, `Estado: ${item.status}`]); res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename="${item.simulation.operationCode}.pdf"`); res.send(pdf); };
