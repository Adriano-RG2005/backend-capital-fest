import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/database/db';
import HttpException from '@/exceptions/HttpException';
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware';

const userId = (req: Request) => (req as AuthenticatedRequest).userId;
const money = (value: unknown) => Number(value);
const output = (item: any) => ({ id: item.operationCode, status: item.status, grossAmount: money(item.grossAmount), feePercentage: money(item.feePercentage), feeAmount: money(item.feeAmount), netAmount: money(item.netAmount), currency: item.currency, bank: item.bank.name, cardId: item.cardId, createdAt: item.createdAt });

export const createSimulation = async (req: Request, res: Response) => {
  const amount = money(req.body.amount);
  const cardId = String(req.body.cardId || '');
  const bankId = Number(req.body.bankId);
  if (!Number.isFinite(amount) || amount < 1400) throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, 'El monto mínimo es S/ 1,400');
  const result = await prisma.$transaction(async (tx) => {
    const card = await tx.card.findFirst({ where: { id: cardId, userId: userId(req), bankId, deletedAt: null } });
    if (!card) throw new HttpException(StatusCodes.NOT_FOUND, 'Tarjeta no encontrada');
    if (card.status !== 'active') throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, 'La tarjeta está bloqueada y no puede utilizarse');
    const available = money(card.creditLimit) - money(card.usedLimit);
    if (amount > available) throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, 'El monto supera el límite disponible');
    const feePercentage = amount < 1500 ? 1 : 2;
    const feeAmount = Math.round(amount * feePercentage) / 100;
    const count = await tx.simulation.count();
    const operationCode = `CF-${String(count + 1).padStart(5, '0')}`;
    const simulation = await tx.simulation.create({ data: { operationCode, userId: userId(req), cardId, bankId, grossAmount: amount, feePercentage, feeAmount, netAmount: amount - feeAmount }, include: { bank: true } });
    await tx.card.update({ where: { id: cardId }, data: { usedLimit: { increment: amount } } });
    await tx.notification.create({ data: { userId: userId(req), title: 'Simulación registrada', message: `La operación ${operationCode} está pendiente.` } });
    return simulation;
  });
  res.status(StatusCodes.CREATED).json(output(result));
};
export const listSimulations = async (req: Request, res: Response) => {
  const items = await prisma.simulation.findMany({ where: { userId: userId(req) }, include: { bank: true }, orderBy: { createdAt: 'desc' } });
  res.json(items.map(output));
};
export const getSimulation = async (req: Request, res: Response) => {
  const item = await prisma.simulation.findFirst({ where: { operationCode: String(req.params.id), userId: userId(req) }, include: { bank: true } });
  if (!item) throw new HttpException(StatusCodes.NOT_FOUND, 'Simulación no encontrada');
  res.json(output(item));
};
export const createWithdrawal = async (req: Request, res: Response) => {
  const operationCode = String(req.body.simulationId || req.body.operationId || '');
  const withdrawal = await prisma.$transaction(async (tx) => {
    const simulation = await tx.simulation.findFirst({ where: { operationCode, userId: userId(req), status: 'pending' } });
    if (!simulation) throw new HttpException(StatusCodes.NOT_FOUND, 'Simulación pendiente no encontrada');
    const created = await tx.withdrawal.create({ data: { simulationId: simulation.id, userId: userId(req), statusHistory: { create: { status: 'pending', changedBy: userId(req) } } }, include: { simulation: { include: { bank: true } } } });
    await tx.simulation.update({ where: { id: simulation.id }, data: { status: 'converted' } });
    await tx.notification.create({ data: { userId: userId(req), title: 'Retiro creado', message: `El retiro ${simulation.operationCode} fue creado y está pendiente.` } });
    return created;
  });
  res.status(StatusCodes.CREATED).json({ id: withdrawal.simulation.operationCode, status: withdrawal.status, createdAt: withdrawal.createdAt });
};
