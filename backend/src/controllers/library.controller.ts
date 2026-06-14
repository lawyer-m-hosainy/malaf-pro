import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function getLibraryItems(req: AuthRequest, res: Response) {
  try {
    const items = await prisma.libraryItem.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ data: items });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch library items' });
  }
}

export async function createLibraryItem(req: AuthRequest, res: Response) {
  try {
    const { title, category, type, url, content } = req.body;
    const item = await prisma.libraryItem.create({
      data: {
        title,
        category,
        type,
        url,
        content,
        organizationId: req.user!.organizationId
      }
    });
    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create library item' });
  }
}

export async function deleteLibraryItem(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.libraryItem.findFirst({ where: { id, organizationId: req.user!.organizationId }});
    if (!existing) return res.status(404).json({ error: 'Not found' });

    await prisma.libraryItem.delete({ where: { id }});
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete library item' });
  }
}
