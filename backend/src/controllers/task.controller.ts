import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/tasks
export async function getTasks(req: AuthRequest, res: Response) {
  try {
    const { caseId } = req.query;
    const where: any = { organizationId: req.user!.organizationId };
    if (caseId) where.caseId = caseId as string;

    const tasks = await prisma.task.findMany({
      where,
      include: { assignee: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ data: tasks });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

// POST /api/tasks
export async function createTask(req: AuthRequest, res: Response) {
  try {
    const { title, description, status, priority, dueDate, assigneeId, caseId } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId,
        caseId: caseId || null,
        organizationId: req.user!.organizationId
      }
    });
    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create task' });
  }
}

// PUT /api/tasks/:id
export async function updateTask(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assigneeId, caseId } = req.body;

    // verify it belongs to org
    const existing = await prisma.task.findFirst({ where: { id, organizationId: req.user!.organizationId }});
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId,
        ...(caseId !== undefined && { caseId: caseId || null }),
      }
    });
    return res.json(task);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update task' });
  }
}

// DELETE /api/tasks/:id
export async function deleteTask(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.task.findFirst({ where: { id, organizationId: req.user!.organizationId }});
    if (!existing) return res.status(404).json({ error: 'Not found' });

    await prisma.task.delete({ where: { id }});
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete task' });
  }
}
