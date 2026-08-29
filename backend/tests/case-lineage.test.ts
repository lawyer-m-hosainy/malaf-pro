import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import crypto from 'crypto'
import app from '../src/app'

describe('ربط درجات التقاضي (lineage)', () => {
  let token: string
  let firstInstanceId: string
  let appealId: string

  beforeAll(async () => {
    const email = `test-${crypto.randomUUID()}@example.com`
    const reg = await request(app).post('/api/auth/register').send({
      officeName: 'مكتب الدرجات',
      name: 'مالك',
      email,
      password: 'Password123',
    })
    token = reg.body.accessToken

    const first = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${token}`)
      .send({
        internalId: `INT-${crypto.randomUUID()}`,
        caseNumber: '100',
        year: '2025',
        title: 'قضية اختبار الدرجات',
        jurisdiction: 'القضاء العادي',
        branch: 'القضاء الجنائي',
        degree: 'جنح',
        clientRole: 'متهم',
        opponent: 'النيابة العامة',
      })
    firstInstanceId = first.body.case.id
  })

  it('يربط الدرجة التالية بالقضية الأصلية عن طريق parentCaseId', async () => {
    const appeal = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${token}`)
      .send({
        internalId: `INT-${crypto.randomUUID()}`,
        caseNumber: '200',
        year: '2026',
        title: 'قضية اختبار الدرجات - استئناف',
        jurisdiction: 'القضاء العادي',
        branch: 'القضاء الجنائي',
        degree: 'جنح مستأنفة',
        clientRole: 'متهم',
        opponent: 'النيابة العامة',
        parentCaseId: firstInstanceId,
      })
    expect(appeal.status).toBe(201)
    appealId = appeal.body.case.id
  })

  it('lineage القضية الابتدائية بتشمل نفسها والاستئناف', async () => {
    const res = await request(app).get(`/api/cases/${firstInstanceId}`).set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    const ids = res.body.lineage.map((d: any) => d.id)
    expect(ids).toContain(firstInstanceId)
    expect(ids).toContain(appealId)
    expect(res.body.lineage).toHaveLength(2)
  })

  it('lineage قضية الاستئناف بتشوف نفس السلسلة كمان (من أي طرف)', async () => {
    const res = await request(app).get(`/api/cases/${appealId}`).set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    const ids = res.body.lineage.map((d: any) => d.id)
    expect(ids).toContain(firstInstanceId)
    expect(ids).toContain(appealId)
  })

  it('يرفض ربط قضية بـ parentCaseId تابع لمكتب تاني', async () => {
    const otherEmail = `test-${crypto.randomUUID()}@example.com`
    const otherReg = await request(app).post('/api/auth/register').send({
      officeName: 'مكتب تاني',
      name: 'مالك تاني',
      email: otherEmail,
      password: 'Password123',
    })
    const otherToken = otherReg.body.accessToken

    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        internalId: `INT-${crypto.randomUUID()}`,
        caseNumber: '300',
        year: '2026',
        title: 'محاولة ربط بقضية غريبة',
        jurisdiction: 'القضاء العادي',
        branch: 'القضاء الجنائي',
        degree: 'نقض جنائي',
        clientRole: 'متهم',
        opponent: 'النيابة العامة',
        parentCaseId: firstInstanceId,
      })
    expect(res.status).toBe(404)
  })
})
