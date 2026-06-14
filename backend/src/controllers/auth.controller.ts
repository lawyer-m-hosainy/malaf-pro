import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { AuthRequest, generateTokens } from '../middleware/auth'
import { env } from '../config/env'

// ── Validation Schemas ──
const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور قصيرة جداً'),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z
    .string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'),
})

const addMemberSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  role: z.enum(['ADMIN', 'LAWYER', 'SECRETARY'], {
    errorMap: () => ({ message: 'الدور غير صالح' }),
  }),
})

// ── تسجيل الدخول ──
export async function login(req: AuthRequest, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { organization: true },
    })

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res
        .status(401)
        .json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    }

    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    })

    // حفظ الـ refresh token في DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    // تحديث آخر تسجيل دخول
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        plan: user.organization.plan,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'حدث خطأ، حاول مرة أخرى' })
  }
}

// ── تجديد الـ Access Token ──
export async function refreshToken(req: AuthRequest, res: Response) {
  const { refreshToken: token } = req.body
  if (!token) {
    return res.status(400).json({ error: 'Refresh token مطلوب' })
  }

  try {
    const payload = jwt.verify(
      token,
      env.JWT_SECRET + '_refresh'
    ) as { id: string }

    // تحقق إن التوكن موجود في DB ولم يُستخدم
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'انتهت صلاحية الجلسة' })
    }

    // امسح القديم وعمل واحد جديد (Rotation)
    await prisma.refreshToken.delete({ where: { token } })

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
      organizationId: storedToken.user.organizationId,
    })

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return res.json({ accessToken, refreshToken: newRefreshToken })
  } catch {
    return res.status(401).json({ error: 'رمز التجديد غير صالح' })
  }
}

// ── تسجيل الخروج ──
export async function logout(req: AuthRequest, res: Response) {
  const { refreshToken: token } = req.body
  if (token) {
    await prisma.refreshToken
      .delete({ where: { token } })
      .catch(() => {})
  }
  return res.json({ message: 'تم تسجيل الخروج بنجاح' })
}

// ── بيانات المستخدم الحالي ──
export async function getMe(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organizationId: true,
      lastLoginAt: true,
      organization: {
        select: {
          id: true,
          name: true,
          plan: true,
          phone: true,
          email: true,
          address: true,
          licenseNo: true,
        },
      },
    },
  })

  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' })
  return res.json(user)
}

// ── تغيير كلمة المرور ──
export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body
    )

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    })

    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res
        .status(400)
        .json({ error: 'كلمة المرور الحالية غير صحيحة' })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    })

    // إلغاء كل الجلسات الأخرى
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } })

    return res.json({
      message: 'تم تغيير كلمة المرور بنجاح، يرجى تسجيل الدخول مرة أخرى',
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    return res.status(500).json({ error: 'حدث خطأ' })
  }
}

// ── تحديث الملف الشخصي ──
export async function updateProfile(req: AuthRequest, res: Response) {
  const { name } = req.body
  if (!name?.trim()) {
    return res.status(400).json({ error: 'الاسم مطلوب' })
  }

  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true, role: true },
  })

  return res.json({ message: 'تم تحديث الملف الشخصي', user: updated })
}

// ── إضافة عضو للفريق ──
export async function addTeamMember(req: AuthRequest, res: Response) {
  try {
    if (!['OWNER', 'ADMIN'].includes(req.user!.role)) {
      return res.status(403).json({ error: 'غير مصرح' })
    }

    const data = addMemberSchema.parse(req.body)

    const exists = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })
    if (exists) {
      return res.status(409).json({ error: 'البريد الإلكتروني مستخدم بالفعل' })
    }

    const newUser = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash: await bcrypt.hash(data.password, 10),
        role: data.role as any,
        organizationId: req.user!.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return res
      .status(201)
      .json({ message: 'تم إضافة عضو الفريق بنجاح', user: newUser })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    return res.status(500).json({ error: 'حدث خطأ' })
  }
}

// ── عرض الفريق ──
export async function getTeam(req: AuthRequest, res: Response) {
  const team = await prisma.user.findMany({
    where: { organizationId: req.user!.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return res.json({ data: team, total: team.length })
}

// ── حذف عضو ──
export async function removeTeamMember(req: AuthRequest, res: Response) {
  if (!['OWNER', 'ADMIN'].includes(req.user!.role)) {
    return res.status(403).json({ error: 'غير مصرح' })
  }

  const { id } = req.params

  // المالك لا يُحذف
  const target = await prisma.user.findFirst({
    where: { id, organizationId: req.user!.organizationId },
  })

  if (!target) {
    return res.status(404).json({ error: 'المستخدم غير موجود' })
  }
  if (target.role === 'OWNER') {
    return res.status(400).json({ error: 'لا يمكن حذف مالك المكتب' })
  }
  if (target.id === req.user!.id) {
    return res.status(400).json({ error: 'لا يمكنك حذف نفسك' })
  }

  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  })

  return res.json({ message: 'تم إلغاء تفعيل الحساب بنجاح' })
}
