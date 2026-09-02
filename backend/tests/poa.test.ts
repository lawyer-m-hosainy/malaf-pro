import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import crypto from 'crypto'
import app from '../src/app'

describe('التوكيلات الرسمية', () => {
  let token: string
  let clientId: string

  beforeAll(async () => {
    const email = `test-${crypto.randomUUID()}@example.com`
    const reg = await request(app).post('/api/auth/register').send({
      officeName: 'مكتب التوكيلات',
      name: 'مالك',
      email,
      password: 'Password123',
    })
    token = reg.body.accessToken

    const client = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'موكل التوكيل', nationalId: Math.floor(1e13 + Math.random() * 9e13).toString() })
    clientId = client.body.client.id
  })

  it('يضيف توكيل ويظهر في القائمة', async () => {
    const created = await request(app)
      .post('/api/poa')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        number: '12345',
        scope: 'توكيل عام في التقاضي',
        issueDate: new Date().toISOString(),
      })
    expect(created.status).toBe(201)
    expect(created.body.poa.isActive).toBe(true)

    const list = await request(app).get('/api/poa').set('Authorization', `Bearer ${token}`)
    expect(list.status).toBe(200)
    expect(list.body.data).toHaveLength(1)
    expect(list.body.data[0].client.id).toBe(clientId)
  })

  it('يرفض توكيل لموكل تابع لمكتب تاني', async () => {
    const otherReg = await request(app).post('/api/auth/register').send({
      officeName: 'مكتب تاني للتوكيلات',
      name: 'مالك تاني',
      email: `test-${crypto.randomUUID()}@example.com`,
      password: 'Password123',
    })
    const res = await request(app)
      .post('/api/poa')
      .set('Authorization', `Bearer ${otherReg.body.accessToken}`)
      .send({
        clientId,
        number: '999',
        scope: 'محاولة تعدي',
        issueDate: new Date().toISOString(),
      })
    expect(res.status).toBe(404)
  })

  it('يقدر يعطّل توكيل', async () => {
    const list = await request(app).get('/api/poa').set('Authorization', `Bearer ${token}`)
    const poaId = list.body.data[0].id

    const updated = await request(app)
      .put(`/api/poa/${poaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false })
    expect(updated.status).toBe(200)
    expect(updated.body.poa.isActive).toBe(false)
  })
})
