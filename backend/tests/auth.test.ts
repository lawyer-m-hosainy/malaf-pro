import { describe, it, expect } from 'vitest'
import request from 'supertest'
import crypto from 'crypto'
import app from '../src/app'

function uniqueEmail() {
  return `test-${crypto.randomUUID()}@example.com`
}

describe('Auth', () => {
  it('يسجل مكتب جديد وينشئ owner + منظمة', async () => {
    const email = uniqueEmail()
    const res = await request(app).post('/api/auth/register').send({
      officeName: 'مكتب اختبار',
      name: 'مستخدم اختبار',
      email,
      password: 'Password123',
    })

    expect(res.status).toBe(201)
    expect(res.body.accessToken).toBeTruthy()
    expect(res.body.user.email).toBe(email)
    expect(res.body.user.role).toBe('OWNER')
    expect(res.body.organization.name).toBe('مكتب اختبار')
  })

  it('يرفض تسجيل بريد إلكتروني مستخدم بالفعل', async () => {
    const email = uniqueEmail()
    await request(app).post('/api/auth/register').send({
      officeName: 'مكتب 1',
      name: 'أحمد',
      email,
      password: 'Password123',
    })

    const res = await request(app).post('/api/auth/register').send({
      officeName: 'مكتب 2',
      name: 'بديل',
      email,
      password: 'Password123',
    })

    expect(res.status).toBe(409)
  })

  it('يرفض كلمة مرور قصيرة عند التسجيل', async () => {
    const res = await request(app).post('/api/auth/register').send({
      officeName: 'مكتب',
      name: 'أحمد',
      email: uniqueEmail(),
      password: '123',
    })
    expect(res.status).toBe(400)
  })

  it('يسجل الدخول ببيانات صحيحة ويرفض بيانات خاطئة', async () => {
    const email = uniqueEmail()
    const password = 'Password123'
    await request(app).post('/api/auth/register').send({
      officeName: 'مكتب',
      name: 'أحمد',
      email,
      password,
    })

    const ok = await request(app).post('/api/auth/login').send({ email, password })
    expect(ok.status).toBe(200)
    expect(ok.body.accessToken).toBeTruthy()

    const bad = await request(app).post('/api/auth/login').send({ email, password: 'WrongPass123' })
    expect(bad.status).toBe(401)
  })

  it('يرفض الوصول لـ /api/auth/me بدون توكن ويسمح بيه بتوكن صحيح', async () => {
    const email = uniqueEmail()
    const password = 'Password123'
    const reg = await request(app).post('/api/auth/register').send({
      officeName: 'مكتب',
      name: 'أحمد',
      email,
      password,
    })
    const token = reg.body.accessToken

    const noAuth = await request(app).get('/api/auth/me')
    expect(noAuth.status).toBe(401)

    const withAuth = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(withAuth.status).toBe(200)
    expect(withAuth.body.email).toBe(email)
  })
})
