import { PrismaClient, Role, Plan, CaseStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 جاري إنشاء بيانات تجريبية...')

  // 1. إنشاء المنظمة
  const org = await prisma.organization.create({
    data: {
      name: 'مكتب حساني للمحاماة والاستشارات القانونية',
      plan: Plan.PRO,
      phone: '01012345678',
      email: 'info@hosainy-law.com',
      address: 'القاهرة، وسط البلد، شارع طلعت حرب',
      licenseNo: 'CAI-2024-001',
    },
  })

  // 2. إنشاء المستخدمين
  const owner = await prisma.user.create({
    data: {
      name: 'م. محمد حساني',
      email: 'owner@lawfirm.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: Role.OWNER,
      organizationId: org.id,
    },
  })

  const lawyer = await prisma.user.create({
    data: {
      name: 'أ. سارة الأحمدي',
      email: 'lawyer@lawfirm.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: Role.LAWYER,
      organizationId: org.id,
    },
  })

  // 3. إنشاء موكلين
  const client1 = await prisma.client.create({
    data: {
      name: 'شركة النيل للتجارة',
      nationalId: '345678901234',
      phone: '01012345678',
      email: 'nile@trade.com',
      address: 'القاهرة، وسط البلد',
      organizationId: org.id,
    },
  })

  const client2 = await prisma.client.create({
    data: {
      name: 'مؤسسة الأفق للبرمجيات',
      nationalId: '456789012345',
      phone: '01098765432',
      email: 'horizon@tech.com',
      organizationId: org.id,
    },
  })

  // 4. إنشاء قضايا
  const case1 = await prisma.case.create({
    data: {
      internalId: '125/2024',
      caseNumber: '1540',
      year: '2024',
      title: 'جناية تزوير - النيل للتجارة',
      jurisdiction: 'القضاء العادي',
      branch: 'القضاء الجنائي',
      degree: 'جنايات مستأنفة',
      clientRole: 'متهم',
      opponent: 'النيابة العامة',
      status: CaseStatus.ACTIVE,
      nextSession: new Date('2026-07-15'),
      organizationId: org.id,
      clientId: client1.id,
      assignedLawyerId: owner.id,
    },
  })

  // 5. إنشاء جلسات
  await prisma.session.create({
    data: {
      date: new Date('2026-07-15'),
      time: '09:00',
      type: 'HEARING',
      notes: 'جلسة مرافعة',
      organizationId: org.id,
      caseId: case1.id,
      lawyerId: owner.id,
    },
  })

  // 6. إنشاء فاتورة
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      totalAmount: 5500,
      status: 'PAID',
      paidDate: new Date('2024-03-10'),
      organizationId: org.id,
      clientId: client1.id,
      caseId: case1.id,
      items: {
        create: [
          { description: 'أتعاب المرافعة - جلسة مارس', amount: 5000 },
          { description: 'مصاريف إدارية', amount: 500 },
        ],
      },
    },
  })

  console.log('✅ تم إنشاء البيانات التجريبية بنجاح')
  console.log('📧 owner@lawfirm.com / password123')
  console.log('📧 lawyer@lawfirm.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
