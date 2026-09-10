import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@/database/db';
import HttpException from '@/exceptions/HttpException';
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware';

const owner = (req: Request) => (req as AuthenticatedRequest).userId;
const serialize = (card: any) => ({
  id: card.id, userId: card.userId, bank: card.bank.name, brand: card.cardBrand,
  type: 'credit', lastFourDigits: card.lastFourDigits, holderName: card.cardHolderName,
  status: card.status, expirationMonth: card.expirationMonth, expirationYear: card.expirationYear,
  creditLimit: Number(card.creditLimit), usedLimit: Number(card.usedLimit),
  availableLimit: Number(card.creditLimit) - Number(card.usedLimit),
  utilizationPercentage: Number(card.creditLimit) ? Number(card.usedLimit) / Number(card.creditLimit) * 100 : 0,
});
const include = { bank: true } as const;

export const listCards = async (req: Request, res: Response) => {
  const cards = await prisma.card.findMany({ where: { userId: owner(req), deletedAt: null }, include });
  res.json(cards.map(serialize));
};
export const getCard = async (req: Request, res: Response) => {
  const cardId = String(req.params.id);
  const card = await prisma.card.findFirst({ where: { id: cardId, userId: owner(req), deletedAt: null }, include });
  if (!card) throw new HttpException(StatusCodes.NOT_FOUND, 'Tarjeta no encontrada');
  res.json(serialize(card));
};
export const createCard = async (req: Request, res: Response) => {
  const { bankId, cardNumber, holderName, brand, expirationMonth, expirationYear, creditLimit } = req.body;
  if (!/^\d{13,19}$/.test(cardNumber) || !Number.isInteger(expirationMonth) || !Number.isInteger(expirationYear) || Number(expirationMonth) < 1 || Number(expirationMonth) > 12) {
    throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, 'Datos de tarjeta inválidos');
  }
  const existing = await prisma.card.findFirst({ where: { userId: owner(req), lastFourDigits: cardNumber.slice(-4), bankId, deletedAt: null } });
  if (existing) throw new HttpException(StatusCodes.CONFLICT, 'La tarjeta ya está vinculada');
  const card = await prisma.card.create({ data: { userId: owner(req), bankId, lastFourDigits: cardNumber.slice(-4), cardHolderName: holderName, cardBrand: brand, expirationMonth, expirationYear, creditLimit, usedLimit: 0 }, include });
  res.status(StatusCodes.CREATED).json(serialize(card));
};
export const changeCardStatus = async (req: Request, res: Response, status: 'active' | 'locked') => {
  const card = await prisma.card.updateMany({ where: { id: String(req.params.id), userId: owner(req), deletedAt: null }, data: { status } });
  if (!card.count) throw new HttpException(StatusCodes.NOT_FOUND, 'Tarjeta no encontrada');
  if (status === 'locked') await prisma.notification.create({ data: { userId: owner(req), title: 'Tarjeta bloqueada', message: 'Tu tarjeta fue bloqueada correctamente.' } });
  res.json({ status });
};
export const removeCard = async (req: Request, res: Response) => {
  const cardId = String(req.params.id);
  const pending = await prisma.withdrawal.findFirst({ where: { userId: owner(req), status: { in: ['pending', 'reviewing', 'approved'] }, simulation: { cardId } } });
  if (pending) throw new HttpException(StatusCodes.CONFLICT, 'La tarjeta tiene una operación pendiente');
  const result = await prisma.card.updateMany({ where: { id: cardId, userId: owner(req), deletedAt: null }, data: { status: 'removed', deletedAt: new Date() } });
  if (!result.count) throw new HttpException(StatusCodes.NOT_FOUND, 'Tarjeta no encontrada');
  res.status(StatusCodes.NO_CONTENT).send();
};
export const listCardTransactions = async (req: Request, res: Response) => {
  const items = await prisma.transaction.findMany({ where: { userId: owner(req), sourceCardId: String(req.params.id) }, orderBy: { createdAt: 'desc' }, take: 20 });
  res.json(items);
};
