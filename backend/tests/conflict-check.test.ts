import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import crypto from 'crypto'
import app from '../src/app'

describe('فحص تعارض المصالح', () => {
  let token: string

  beforeAll(async () => {
    const email = `test-${crypto.randomUUID()}@example.com`
    const reg = await request(app).post('/api/auth/register').send({
      officeName: 'مكتب فحص التعارض',
      name: 'مالك',
      email,
      password: 'Password123',
    })
    token = reg.body.accessToken

    await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'أحمد الشريف للمقاولات', nationalId: Math.floor(1e13 + Math.random() * 9e13).toString() })
  })

  it('يكتشف تعارض لما اسم خصم جديد يطابق موكل حالي', async () => {
    const res = await request(app)
      .get('/api/clients/check-conflict')
      .query({ name: 'الشريف للمقاولات' })
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0].type).toBe('existing_client')
  })

  it('مفيش تعارض لاسم مش موجود خالص', async () => {
    const res = await request(app)
      .get('/api/clients/check-conflict')
      .query({ name: 'اسم غريب تماما زيزفون' })
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(0)
  })

  it('إنشاء قضية بخصم يطابق موكل حالي بيرجع تحذير تعارض مصالح', async () => {
    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${token}`)
      .send({
        internalId: `INT-${crypto.randomUUID()}`,
        caseNumber: '500',
        year: '2026',
        title: 'نزاع مع الشريف للمقاولات',
        jurisdiction: 'القضاء العادي',
        branch: 'القضاء المدني والتجاري',
        degree: 'ابتدائي (كلي)',
        clientRole: 'مدعي',
        opponent: 'أحمد الشريف للمقاولات',
      })
    expect(res.status).toBe(201)
    expect(res.body.conflictWarning?.length).toBeGreaterThan(0)
  })
})
