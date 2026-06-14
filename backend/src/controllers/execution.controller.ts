import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function getExecutions(req: AuthRequest, res: Response) {
  try {
    const executions = await prisma.execution.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { case: { select: { caseNumber: true, title: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ data: executions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch executions' });
  }
}

export async function createExecution(req: AuthRequest, res: Response) {
  try {
    const { executionNumber, type, court, status, date, notes, caseId } = req.body;
    const execution = await prisma.execution.create({
      data: {
        executionNumber,
        type,
        court,
        status,
        date: new Date(date),
        notes,
        caseId,
        organizationId: req.user!.organizationId
      }
    });
    return res.status(201).json(execution);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create execution' });
  }
}

export async function updateExecution(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { executionNumber, type, court, status, date, notes, caseId } = req.body;
    
    const existing = await prisma.execution.findFirst({ where: { id, organizationId: req.user!.organizationId }});
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const execution = await prisma.execution.update({
      where: { id },
      data: { executionNumber, type, court, status, date: new Date(date), notes, caseId }
    });
    return res.json(execution);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update execution' });
  }
}

export async function deleteExecution(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.execution.findFirst({ where: { id, organizationId: req.user!.organizationId }});
    if (!existing) return res.status(404).json({ error: 'Not found' });

    await prisma.execution.delete({ where: { id }});
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete execution' });
  }
}
