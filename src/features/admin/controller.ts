import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/database/db';
import HttpException from '@/exceptions/HttpException';
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware';

const adminId = (req: Request) => (req as AuthenticatedRequest).userId;
const pageArgs = (req: Request, defaultLimit = 20) => ({
  page: Math.max(1, Number(req.query.page || 1)),
  limit: Math.min(100, Math.max(1, Number(req.query.limit || defaultLimit))),
});
const validId = (value: unknown) =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const ensureId = (value: unknown, message: string) => {
  if (!validId(value)) throw new HttpException(StatusCodes.BAD_REQUEST, message);
  return String(value);
};
const toNumber = (value: unknown) => Number(value || 0);
const log = (req: Request, action: string, entityType: string, entityId: string) =>
  prisma.auditLog.create({
    data: { userId: adminId(req), action, entityType, entityId, ipAddress: req.ip, userAgent: req.get('user-agent') },
  });
const recordActivity = (
  tx: any,
  req: Request,
  data: { action: string; targetUserId?: string; targetCardId?: string; description: string; metadata?: object },
) => tx.adminActivity.create({ data: { adminUserId: adminId(req), ...data } });

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
  res.json({
    metrics: {
      users,
      pendingUsers,
      operations,
      pendingOperations,
      completedOperations: completed,
      rejectedOperations: rejected,
      activeCards: cards,
      grossVolume: toNumber(volume._sum.grossAmount),
      netVolume: toNumber(volume._sum.netAmount),
    },
  });
};

export const users = async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req, 50);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const where = {
    deletedAt: null,
    ...(req.query.role ? { role: { name: String(req.query.role) } } : {}),
    ...(req.query.status ? { accountStatus: String(req.query.status) as never } : {}),
    ...(search
      ? {
          OR: [
            { email: { contains: search } },
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        roleId: true,
        accountStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);
  res.json({
    items,
    total,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};
export const userDetail = async (req: Request, res: Response) => {
  const id = ensureId(req.params.id, 'ID de usuario inválido');
  const item = await prisma.user.findUnique({
    where: { id },
    include: { role: true, verifications: true },
    omit: { passwordHash: true },
  });
  if (!item) throw new HttpException(StatusCodes.NOT_FOUND, 'Usuario no encontrado');
  if (item.role.name.toLowerCase() === 'admin') {
    res.json(item);
    return;
  }
  const cards = await prisma.card.findMany({ where: { userId: id, deletedAt: null }, select: cardSelect });
  res.json({ ...item, cards: cards.map(cardResponse) });
};
export const updateUserStatus = async (req: Request, res: Response) => {
  const id = ensureId(req.params.userId ?? req.params.id, 'ID de usuario inválido');
  const status = String(req.body.status);
  if (!['active', 'blocked'].includes(status))
    throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, 'Estado de usuario inválido');
  const item = await prisma.$transaction(async (tx) => {
    const current = await tx.user.findUnique({ where: { id }, include: { role: true } });
    if (!current) throw new HttpException(StatusCodes.NOT_FOUND, 'Usuario no encontrado');
    if (current.role.name.toLowerCase() !== 'user')
      throw new HttpException(StatusCodes.FORBIDDEN, 'No se puede modificar una cuenta administradora');
    const updated = await tx.user.update({
      where: { id },
      data: { accountStatus: status as never },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        roleId: true,
        accountStatus: true,
        createdAt: true,
      },
    });
    await tx.notification.create({
      data: { userId: id, title: 'Estado de cuenta actualizado', message: `Tu cuenta ahora está en estado ${status}.` },
    });
    await recordActivity(tx, req, {
      action: status === 'active' ? 'user_activated' : 'user_blocked',
      targetUserId: id,
      description: `${status === 'active' ? 'Activaste' : 'Bloqueaste'} la cuenta de ${current.firstName} ${current.lastName}`,
    });
    return updated;
  });
  await log(req, 'USER_STATUS_UPDATED', 'User', item.id);
  res.json(item);
};

const operationInclude = {
  simulation: { include: { bank: true, card: true, user: true } },
  statusHistory: { include: { changedByUser: true }, orderBy: { createdAt: 'asc' as const } },
} as const;
export const operations = async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req);
  const where: any = {
    ...(req.query.status ? { status: String(req.query.status) } : {}),
    ...(req.query.search
      ? {
          OR: [
            { simulation: { operationCode: { contains: String(req.query.search) } } },
            { user: { email: { contains: String(req.query.search) } } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.withdrawal.findMany({
      where,
      include: operationInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.withdrawal.count({ where }),
  ]);
  res.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};
export const operationDetail = async (req: Request, res: Response) => {
  const item = await prisma.withdrawal.findFirst({
    where: { simulation: { operationCode: String(req.params.id) } },
    include: operationInclude,
  });
  if (!item) throw new HttpException(StatusCodes.NOT_FOUND, 'Operación no encontrada');
  res.json(item);
};
export const updateOperationStatus = async (req: Request, res: Response) => {
  const nextStatus = String(req.body.status);
  const reason = req.body.reason ? String(req.body.reason) : null;
  if (!['pending', 'reviewing', 'approved', 'rejected', 'completed', 'cancelled'].includes(nextStatus))
    throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, 'Estado de operación inválido');
  const item = await prisma.$transaction(async (tx) => {
    const current = await tx.withdrawal.findFirst({
      where: { simulation: { operationCode: String(req.params.id) } },
      include: { simulation: { include: { card: true } } },
    });
    if (!current) throw new HttpException(StatusCodes.NOT_FOUND, 'Operación no encontrada');
    if (['completed', 'rejected', 'cancelled'].includes(current.status))
      throw new HttpException(StatusCodes.CONFLICT, 'La operación ya está cerrada');
    const updated = await tx.withdrawal.update({
      where: { id: current.id },
      data: {
        status: nextStatus as never,
        reason,
        statusHistory: { create: { status: nextStatus as never, reason, changedBy: adminId(req) } },
      },
      include: { simulation: true },
    });
    if (['rejected', 'cancelled'].includes(nextStatus))
      await tx.card.update({
        where: { id: current.simulation.cardId },
        data: { usedLimit: { decrement: current.simulation.grossAmount } },
      });
    await tx.notification.create({
      data: {
        userId: current.userId,
        title: 'Estado de operación actualizado',
        message: `La operación ${current.simulation.operationCode} ahora está ${nextStatus}.`,
      },
    });
    return updated;
  });
  await log(req, 'OPERATION_STATUS_UPDATED', 'Withdrawal', item.id);
  res.json(item);
};

const cardSelect = {
  id: true,
  cardBrand: true,
  lastFourDigits: true,
  cardHolderName: true,
  expirationMonth: true,
  expirationYear: true,
  status: true,
  availableLimit: true,
  creditLimit: true,
  usedLimit: true,
  createdAt: true,
  updatedAt: true,
  bank: { select: { name: true } },
  user: { select: { id: true, firstName: true, lastName: true, email: true, role: { select: { name: true } } } },
} as const;
const cardWhere = (req: Request) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  return {
    deletedAt: null,
    user: { role: { name: 'User' }, deletedAt: null },
    ...(req.query.status ? { status: String(req.query.status) as never } : {}),
    ...(search
      ? {
          OR: [
            { user: { firstName: { contains: search }, role: { name: 'User' } } },
            { user: { lastName: { contains: search }, role: { name: 'User' } } },
            { user: { email: { contains: search }, role: { name: 'User' } } },
            { bank: { name: { contains: search } } },
            { lastFourDigits: { contains: search } },
          ],
        }
      : {}),
  };
};
const cardResponse = (card: any) => ({
  id: card.id,
  user: card.user,
  bank: card.bank.name,
  brand: card.cardBrand,
  lastFourDigits: card.lastFourDigits,
  holderName: card.cardHolderName,
  expirationMonth: card.expirationMonth,
  expirationYear: card.expirationYear,
  status: card.status,
  availableLimit: toNumber(card.availableLimit),
  creditLimit: toNumber(card.creditLimit),
  usedLimit: toNumber(card.usedLimit),
  createdAt: card.createdAt,
  updatedAt: card.updatedAt,
});
export const cards = async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req, 100);
  const where = cardWhere(req);
  const [records, total] = await Promise.all([
    prisma.card.findMany({
      where,
      select: cardSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.card.count({ where }),
  ]);
  res.json({
    items: records.map(cardResponse),
    total,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};
export const cardDetail = async (req: Request, res: Response) => {
  const id = ensureId(req.params.cardId, 'ID de tarjeta inválido');
  const card = await prisma.card.findFirst({ where: { id, ...cardWhere(req) }, select: cardSelect });
  if (!card) throw new HttpException(StatusCodes.NOT_FOUND, 'Tarjeta no encontrada');
  res.json(cardResponse(card));
};

export const validations = async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req, 50);
  const status = String(req.query.status || 'pending');
  if (!['pending', 'approved', 'rejected'].includes(status))
    throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, 'Estado de validación inválido');
  const where = { verificationStatus: status as never };
  const [items, total] = await Promise.all([
    prisma.userVerification.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, accountStatus: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.userVerification.count({ where }),
  ]);
  res.json({
    items: items.map((item) => ({ ...item, status: item.verificationStatus })),
    total,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};
export const updateValidation = async (req: Request, res: Response) => {
  const id = ensureId(req.params.validationId ?? req.params.id, 'ID de validación inválido');
  const status = String(req.body.status);
  if (!['approved', 'rejected'].includes(status))
    throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, 'Estado de validación inválido');
  const item = await prisma.$transaction(async (tx) => {
    const validation = await tx.userVerification.findUnique({
      where: { id },
      include: { user: { include: { role: true } } },
    });
    if (!validation) throw new HttpException(StatusCodes.NOT_FOUND, 'Validación no encontrada');
    if (validation.user.role.name.toLowerCase() !== 'user')
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        'No se puede modificar la validación de una cuenta administradora',
      );
    const updated = await tx.userVerification.update({
      where: { id },
      data: {
        verificationStatus: status as never,
        reviewedBy: adminId(req),
        reviewedAt: new Date(),
        rejectionReason: status === 'rejected' ? String(req.body.reason || 'Validación rechazada') : null,
      },
    });
    await tx.user.update({
      where: { id: validation.userId },
      data: { kycStatus: status as never, accountStatus: status === 'approved' ? 'active' : 'blocked' },
    });
    await tx.notification.create({
      data: {
        userId: validation.userId,
        title: 'Validación actualizada',
        message: status === 'approved' ? 'Tu identidad fue aprobada.' : 'Tu identidad fue rechazada.',
      },
    });
    await recordActivity(tx, req, {
      action: status === 'approved' ? 'kyc_approved' : 'kyc_rejected',
      targetUserId: validation.userId,
      description: `${status === 'approved' ? 'Aprobaste' : 'Rechazaste'} la validación de ${validation.user.firstName} ${validation.user.lastName}`,
    });
    return updated;
  });
  await log(req, 'KYC_STATUS_UPDATED', 'UserVerification', item.id);
  res.json({ ...item, status: item.verificationStatus });
};
export const activity = async (req: Request, res: Response) => {
  const { limit } = pageArgs(req, 8);
  const items = await prisma.adminActivity.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { targetUser: { select: { id: true, firstName: true, lastName: true } } },
  });
  res.json({
    items: items.map((item) => ({
      id: item.id,
      action: item.action,
      title:
        item.action === 'user_activated'
          ? 'Cuenta activada'
          : item.action === 'user_blocked'
            ? 'Cuenta bloqueada'
            : item.action === 'kyc_approved'
              ? 'KYC aprobado'
              : 'KYC rechazado',
      description: item.description,
      targetUser: item.targetUser
        ? { id: item.targetUser.id, name: `${item.targetUser.firstName} ${item.targetUser.lastName}` }
        : null,
      createdAt: item.createdAt,
    })),
  });
};
