import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import crypto from 'crypto'
import app from '../src/app'

async function registerOffice(officeName: string) {
  const email = `test-${crypto.randomUUID()}@example.com`
  const res = await request(app).post('/api/auth/register').send({
    officeName,
    name: 'مالك',
    email,
    password: 'Password123',
  })
  return { token: res.body.accessToken as string, orgId: res.body.organization.id as string }
}

describe('عزل البيانات بين المكاتب (Multi-tenancy)', () => {
  let officeA: { token: string; orgId: string }
  let officeB: { token: string; orgId: string }
  let clientAId: string
  let caseAId: string

  beforeAll(async () => {
    officeA = await registerOffice('مكتب أ')
    officeB = await registerOffice('مكتب ب')

    const client = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${officeA.token}`)
      .send({ name: 'موكل مكتب أ', nationalId: Math.floor(1e13 + Math.random() * 9e13).toString() })
    clientAId = client.body.client.id

    const kase = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${officeA.token}`)
      .send({
        internalId: `INT-${crypto.randomUUID()}`,
        caseNumber: '1',
        year: '2026',
        title: 'قضية مكتب أ',
        jurisdiction: 'القضاء العادي',
        branch: 'مدني',
        degree: 'ابتدائي',
        clientRole: 'مدعي',
        opponent: 'خصم',
        clientId: clientAId,
      })
    caseAId = kase.body.case.id
  })

  it('مكتب ب مايشوفش موكلين مكتب أ في القائمة', async () => {
    const res = await request(app).get('/api/clients').set('Authorization', `Bearer ${officeB.token}`)
    expect(res.status).toBe(200)
    const ids = (res.body.data || []).map((c: any) => c.id)
    expect(ids).not.toContain(clientAId)
  })

  it('مكتب ب مايقدرش يوصل لتفاصيل موكل تابع لمكتب أ', async () => {
    const res = await request(app).get(`/api/clients/${clientAId}`).set('Authorization', `Bearer ${officeB.token}`)
    expect(res.status).toBe(404)
  })

  it('مكتب ب مايقدرش يوصل لتفاصيل قضية تابعة لمكتب أ', async () => {
    const res = await request(app).get(`/api/cases/${caseAId}`).set('Authorization', `Bearer ${officeB.token}`)
    expect(res.status).toBe(404)
  })

  it('مكتب أ لسه يقدر يوصل لبياناته هو بشكل طبيعي', async () => {
    const res = await request(app).get(`/api/cases/${caseAId}`).set('Authorization', `Bearer ${officeA.token}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(caseAId)
  })
})
