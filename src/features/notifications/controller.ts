import type { Request, Response } from 'express';
import { prisma } from '@/database/db';
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware';
const uid = (req: Request) => (req as AuthenticatedRequest).userId;
export const list = async (req: Request, res: Response) => { res.json(await prisma.notification.findMany({ where: { userId: uid(req) }, orderBy: { createdAt: 'desc' }, take: 50 })); };
export const read = async (req: Request, res: Response) => { res.json(await prisma.notification.updateMany({ where: { id: String(req.params.id), userId: uid(req) }, data: { readAt: new Date() } })); };
export const readAll = async (req: Request, res: Response) => { res.json(await prisma.notification.updateMany({ where: { userId: uid(req), readAt: null }, data: { readAt: new Date() } })); };
