import { Response } from 'express'
import { z } from 'zod'
import path from 'path'
import fs from 'fs'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

// ── Validation ──
const updateSchema = z.object({
  title: z.string().min(1, 'عنوان المستند مطلوب').optional(),
  tags: z.array(z.string()).optional(),
  caseId: z.string().optional().nullable(),
})

// ── GET /api/documents ──
export async function getAll(req: AuthRequest, res: Response) {
  try {
    const {
      search,
      caseId,
      type,
      page = '1',
      limit = '20',
    } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)

    const where: any = {
      organizationId: req.user!.organizationId,
    }

    if (search) {
      const q = search as string
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ]
    }

    if (caseId) where.caseId = caseId
    if (type) where.type = type

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          type: true,
          fileUrl: true,
          fileSize: true,
          mimeType: true,
          tags: true,
          createdAt: true,
          case: {
            select: { id: true, title: true, caseNumber: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.document.count({ where }),
    ])

    return res.json({
      data: documents,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / take),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في جلب المستندات' })
  }
}

// ── GET /api/documents/:id ──
export async function getOne(req: AuthRequest, res: Response) {
  try {
    const doc = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        case: {
          select: { id: true, title: true, caseNumber: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    })

    if (!doc) {
      return res.status(404).json({ error: 'المستند غير موجود' })
    }

    return res.json(doc)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ' })
  }
}

// ── POST /api/documents/upload ──
export async function uploadFile(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم رفع أي ملف' })
    }

    const { caseId, title, tags } = req.body

    // تحقق إن القضية تابعة للمكتب (لو تم تحديد قضية)
    if (caseId) {
      const caseExists = await prisma.case.findFirst({
        where: {
          id: caseId,
          organizationId: req.user!.organizationId,
        },
      })
      if (!caseExists) {
        // امسح الملف المرفوع
        fs.unlinkSync(req.file.path)
        return res.status(404).json({ error: 'القضية غير موجودة' })
      }
    }

    // حدد نوع المستند من الامتداد
    const ext = path.extname(req.file.originalname).toLowerCase()
    const typeMap: Record<string, string> = {
      '.pdf': 'pdf',
      '.doc': 'word',
      '.docx': 'word',
      '.xls': 'excel',
      '.xlsx': 'excel',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.png': 'image',
      '.webp': 'image',
      '.txt': 'text',
    }

    const parsedTags: string[] = tags
      ? typeof tags === 'string'
        ? JSON.parse(tags)
        : tags
      : []

    const doc = await prisma.document.create({
      data: {
        title: title || req.file.originalname,
        type: typeMap[ext] || 'other',
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        tags: parsedTags,
        organizationId: req.user!.organizationId,
        caseId: caseId || null,
        createdById: req.user!.id,
      },
    })

    // سجل في سجل القضية لو مرتبط بقضية
    if (caseId) {
      await prisma.caseUpdate.create({
        data: {
          caseId,
          action: 'document_uploaded',
          details: `تم رفع مستند "${doc.title}" بواسطة ${req.user!.name}`,
        },
      })
    }

    return res.status(201).json({
      message: 'تم رفع المستند بنجاح',
      document: doc,
    })
  } catch (err) {
    // لو حصل خطأ امسح الملف
    if (req.file) {
      fs.unlinkSync(req.file.path).toString
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في رفع المستند' })
  }
}

// ── GET /api/documents/:id/download ──
export async function download(req: AuthRequest, res: Response) {
  try {
    const doc = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!doc) {
      return res.status(404).json({ error: 'المستند غير موجود' })
    }

    // لو مستند AI (محتوى نصي بدون ملف)
    if (!doc.fileUrl && doc.content) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(doc.title)}.txt"`
      )
      return res.send(doc.content)
    }

    if (!doc.fileUrl) {
      return res.status(404).json({ error: 'الملف غير موجود' })
    }

    const filePath = path.join(process.cwd(), doc.fileUrl)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'الملف غير موجود على السيرفر' })
    }

    return res.download(filePath, doc.title)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في تحميل المستند' })
  }
}

// ── PUT /api/documents/:id ──
export async function update(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'المستند غير موجود' })
    }

    const data = updateSchema.parse(req.body)

    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.caseId !== undefined && { caseId: data.caseId }),
      },
    })

    return res.json({
      message: 'تم تحديث المستند بنجاح',
      document: updated,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في تحديث المستند' })
  }
}

// ── DELETE /api/documents/:id ──
export async function remove(req: AuthRequest, res: Response) {
  try {
    if (!['OWNER', 'ADMIN'].includes(req.user!.role)) {
      return res.status(403).json({ error: 'غير مصرح بحذف المستندات' })
    }

    const existing = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'المستند غير موجود' })
    }

    // امسح الملف من السيرفر لو موجود
    if (existing.fileUrl) {
      const filePath = path.join(process.cwd(), existing.fileUrl)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    await prisma.document.delete({ where: { id: req.params.id } })

    return res.json({ message: 'تم حذف المستند بنجاح' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ في حذف المستند' })
  }
}
