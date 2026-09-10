import type { Request, Response } from 'express';
import { prisma } from '@/database/db';
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware';
const uid = (req: Request) => (req as AuthenticatedRequest).userId;
export const summary = async (req: Request, res: Response) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: uid(req) } });
  const [simulationsThisMonth, totalOperations, completed, pending, cancelled, recent, unread, cards] = await Promise.all([
    prisma.simulation.count({ where: { userId: uid(req), createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    prisma.withdrawal.count({ where: { userId: uid(req) } }),
    prisma.withdrawal.count({ where: { userId: uid(req), status: 'completed' } }),
    prisma.withdrawal.count({ where: { userId: uid(req), status: { in: ['pending', 'reviewing', 'approved'] } } }),
    prisma.withdrawal.count({ where: { userId: uid(req), status: { in: ['cancelled', 'rejected'] } } }),
    prisma.withdrawal.findMany({ where: { userId: uid(req) }, include: { simulation: { include: { bank: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.notification.count({ where: { userId: uid(req), readAt: null } }),
    prisma.card.findMany({ where: { userId: uid(req), deletedAt: null }, select: { creditLimit: true, usedLimit: true } }),
  ]);
  const available = cards.reduce((total, card) => total + Number(card.creditLimit) - Number(card.usedLimit), 0);
  res.json({ user: { firstName: user.firstName, lastName: user.lastName, status: user.accountStatus === 'active' ? 'verified' : user.accountStatus }, metrics: { availableAmount: available, maximumWithdrawal: available * 0.2, simulationsThisMonth, totalOperations, completedOperations: completed, pendingOperations: pending, cancelledOperations: cancelled }, accountStatus: user.accountStatus === 'active' ? 'verified' : user.accountStatus, recentOperations: recent, recentActivity: [], unreadNotifications: unread });
};
export const chart = async (req: Request, res: Response) => {
  const period = Number(req.query.period || 30);
  if (![30, 60, 365].includes(period)) { res.status(422).json({ error: { code: 'INVALID_PERIOD', message: 'El periodo debe ser 30, 60 o 365' } }); return; }
  const from = new Date(Date.now() - period * 86400000);
  const items = await prisma.simulation.findMany({ where: { userId: uid(req), createdAt: { gte: from } }, select: { createdAt: true, netAmount: true }, orderBy: { createdAt: 'asc' } });
  res.json(items.map(item => ({ date: item.createdAt.toISOString().slice(0, 10), amount: Number(item.netAmount) })));
};
