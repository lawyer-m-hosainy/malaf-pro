import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import crypto from 'crypto'
import app from '../src/app'

describe('بوابة الموكلين العامة', () => {
  let token: string
  let clientId: string

  beforeAll(async () => {
    const email = `test-${crypto.randomUUID()}@example.com`
    const reg = await request(app).post('/api/auth/register').send({
      officeName: 'مكتب البوابة',
      name: 'مالك',
      email,
      password: 'Password123',
    })
    token = reg.body.accessToken

    const client = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'موكل البوابة', nationalId: Math.floor(1e13 + Math.random() * 9e13).toString() })
    clientId = client.body.client.id
  })

  it('يرفض رابط بوابة غير موجود', async () => {
    const res = await request(app).get('/api/portal/public/not-a-real-token')
    expect(res.status).toBe(404)
  })

  it('يولّد رابط، يعرض بيانات الموكل بدون توكن، ثم يمنعه بعد التعطيل', async () => {
    const gen = await request(app)
      .post('/api/portal/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientId })
    expect(gen.status).toBe(201)
    const portalToken = gen.body.data.token
    const accessId = gen.body.data.id

    const publicView = await request(app).get(`/api/portal/public/${portalToken}`)
    expect(publicView.status).toBe(200)
    expect(publicView.body.data.clientName).toBe('موكل البوابة')

    const toggle = await request(app)
      .patch(`/api/portal/${accessId}/toggle`)
      .set('Authorization', `Bearer ${token}`)
    expect(toggle.status).toBe(200)
    expect(toggle.body.data.isActive).toBe(false)

    const blocked = await request(app).get(`/api/portal/public/${portalToken}`)
    expect(blocked.status).toBe(403)
  })

  it('توليد رابط مرتين لنفس الموكل يرجّع نفس الرابط النشط (مش يكرره)', async () => {
    const first = await request(app)
      .post('/api/portal/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientId })
    const second = await request(app)
      .post('/api/portal/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientId })
    expect(first.body.data.token).toBe(second.body.data.token)
  })
})
