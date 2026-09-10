import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/database/db';
import HttpException from '@/exceptions/HttpException';
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware';

const adminId = (req: Request) => (req as AuthenticatedRequest).userId;
const pageArgs = (req: Request) => ({ page: Math.max(1, Number(req.query.page || 1)), limit: Math.min(100, Math.max(1, Number(req.query.limit || 20))) });
const log = (req: Request, action: string, entityType: string, entityId: string) => prisma.auditLog.create({ data: { userId: adminId(req), action, entityType, entityId, ipAddress: req.ip, userAgent: req.get('user-agent') } });

export const dashboard = async (_req: Request, res: Response) => {
  const [users, pendingUsers, operations, pendingOperations, completed, rejected, cards, volume] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { accountStatus: 'pending_verification' } }),
    prisma.withdrawal.count(),
    prisma.withdrawal.count({ where: { status: { in: ['pending', 'reviewing', 'approved'] } } }),
    prisma.withdrawal.count({ where: { status: 'completed' } }),
    prisma.withdrawal.count({ where: { status: 'rejected' } }),
    prisma.card.count({ where: { deletedAt: null } }),
    prisma.simulation.aggregate({ _sum: { grossAmount: true, netAmount: true } }),
  ]);
  res.json({ metrics: { users, pendingUsers, operations, pendingOperations, completedOperations: completed, rejectedOperations: rejected, activeCards: cards, grossVolume: Number(volume._sum.grossAmount || 0), netVolume: Number(volume._sum.netAmount || 0) } });
};

export const users = async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req); const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const where = { deletedAt: null, ...(req.query.status ? { accountStatus: String(req.query.status) as never } : {}), ...(search ? { OR: [{ email: { contains: search } }, { firstName: { contains: search } }, { lastName: { contains: search } }] } : {}) };
  const [items, total] = await Promise.all([prisma.user.findMany({ where, include: { role: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, omit: { passwordHash: true } }), prisma.user.count({ where })]);
  res.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};
export const userDetail = async (req: Request, res: Response) => { const item = await prisma.user.findUnique({ where: { id: String(req.params.id) }, include: { role: true, verifications: true, cards: true }, omit: { passwordHash: true } }); if (!item) throw new HttpException(StatusCodes.NOT_FOUND, 'Usuario no encontrado'); res.json(item); };
export const updateUserStatus = async (req: Request, res: Response) => { const status = String(req.body.status); if (!['pending_verification', 'active', 'blocked'].includes(status)) throw new HttpException(422, 'Estado de usuario inválido'); const item = await prisma.user.update({ where: { id: String(req.params.id) }, data: { accountStatus: status as never }, omit: { passwordHash: true } }); await prisma.notification.create({ data: { userId: item.id, title: 'Estado de cuenta actualizado', message: `Tu cuenta ahora está en estado ${status}.` } }); await log(req, 'USER_STATUS_UPDATED', 'User', item.id); res.json(item); };

const operationInclude = { simulation: { include: { bank: true, card: true, user: true } }, statusHistory: { include: { changedByUser: true }, orderBy: { createdAt: 'asc' as const } } } as const;
export const operations = async (req: Request, res: Response) => { const { page, limit } = pageArgs(req); const where: any = { ...(req.query.status ? { status: String(req.query.status) } : {}), ...(req.query.search ? { OR: [{ simulation: { operationCode: { contains: String(req.query.search) } } }, { user: { email: { contains: String(req.query.search) } } }] } : {}) }; const [items, total] = await Promise.all([prisma.withdrawal.findMany({ where, include: operationInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.withdrawal.count({ where })]); res.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }); };
export const operationDetail = async (req: Request, res: Response) => { const item = await prisma.withdrawal.findFirst({ where: { simulation: { operationCode: String(req.params.id) } }, include: operationInclude }); if (!item) throw new HttpException(404, 'Operación no encontrada'); res.json(item); };
export const updateOperationStatus = async (req: Request, res: Response) => {
  const nextStatus = String(req.body.status); const reason = req.body.reason ? String(req.body.reason) : null;
  if (!['pending', 'reviewing', 'approved', 'rejected', 'completed', 'cancelled'].includes(nextStatus)) throw new HttpException(422, 'Estado de operación inválido');
  const item = await prisma.$transaction(async tx => { const current = await tx.withdrawal.findFirst({ where: { simulation: { operationCode: String(req.params.id) } }, include: { simulation: { include: { card: true } } } }); if (!current) throw new HttpException(404, 'Operación no encontrada'); const terminal = ['completed', 'rejected', 'cancelled']; if (terminal.includes(current.status)) throw new HttpException(409, 'La operación ya está cerrada'); const updated = await tx.withdrawal.update({ where: { id: current.id }, data: { status: nextStatus as never, reason, statusHistory: { create: { status: nextStatus as never, reason, changedBy: adminId(req) } } }, include: { simulation: true } }); if (['rejected', 'cancelled'].includes(nextStatus)) await tx.card.update({ where: { id: current.simulation.cardId }, data: { usedLimit: { decrement: current.simulation.grossAmount } } }); await tx.notification.create({ data: { userId: current.userId, title: 'Estado de operación actualizado', message: `La operación ${current.simulation.operationCode} ahora está ${nextStatus}.` } }); return updated; });
  await log(req, 'OPERATION_STATUS_UPDATED', 'Withdrawal', item.id); res.json(item);
};
export const cards = async (req: Request, res: Response) => { const { page, limit } = pageArgs(req); const [items, total] = await Promise.all([prisma.card.findMany({ where: { deletedAt: null, ...(req.query.status ? { status: String(req.query.status) as never } : {}) }, include: { bank: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.card.count({ where: { deletedAt: null } })]); res.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }); };
export const validations = async (req: Request, res: Response) => { const { page, limit } = pageArgs(req); const [items, total] = await Promise.all([prisma.userVerification.findMany({ where: { verificationStatus: String(req.query.status || 'pending') as never }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.userVerification.count({ where: { verificationStatus: String(req.query.status || 'pending') as never } })]); res.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }); };
export const updateValidation = async (req: Request, res: Response) => { const status = String(req.body.status); if (!['approved', 'rejected'].includes(status)) throw new HttpException(422, 'Estado de validación inválido'); const item = await prisma.$transaction(async tx => { const validation = await tx.userVerification.update({ where: { id: String(req.params.id) }, data: { verificationStatus: status as never, reviewedBy: adminId(req), reviewedAt: new Date(), rejectionReason: status === 'rejected' ? String(req.body.reason || 'Validación rechazada') : null } }); await tx.user.update({ where: { id: validation.userId }, data: { kycStatus: status as never, accountStatus: status === 'approved' ? 'active' : 'blocked' } }); await tx.notification.create({ data: { userId: validation.userId, title: 'Validación actualizada', message: status === 'approved' ? 'Tu identidad fue aprobada.' : 'Tu identidad fue rechazada.' } }); return validation; }); await log(req, 'KYC_STATUS_UPDATED', 'UserVerification', item.id); res.json(item); };
