import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import crypto from 'crypto'
import app from '../src/app'

describe('المواعيد الحتمية', () => {
  let token: string
  let caseId: string

  beforeAll(async () => {
    const email = `test-${crypto.randomUUID()}@example.com`
    const reg = await request(app).post('/api/auth/register').send({
      officeName: 'مكتب المواعيد',
      name: 'مالك',
      email,
      password: 'Password123',
    })
    token = reg.body.accessToken

    const kase = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${token}`)
      .send({
        internalId: `INT-${crypto.randomUUID()}`,
        caseNumber: '700',
        year: '2026',
        title: 'قضية اختبار المواعيد',
        jurisdiction: 'القضاء العادي',
        branch: 'القضاء الجنائي',
        degree: 'جنح',
        clientRole: 'متهم',
        opponent: 'النيابة العامة',
      })
    caseId = kase.body.case.id
  })

  it('يضيف ميعاد حتمي ويظهر في قائمة القضية', async () => {
    const triggerDate = new Date()
    const deadlineDate = new Date()
    deadlineDate.setDate(deadlineDate.getDate() + 3)

    const created = await request(app)
      .post('/api/deadlines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        caseId,
        title: 'ميعاد الطعن بالاستئناف',
        triggerDate: triggerDate.toISOString(),
        deadlineDate: deadlineDate.toISOString(),
      })
    expect(created.status).toBe(201)

    const list = await request(app)
      .get('/api/deadlines')
      .query({ caseId })
      .set('Authorization', `Bearer ${token}`)
    expect(list.status).toBe(200)
    expect(list.body.data).toHaveLength(1)
    expect(list.body.data[0].status).toBe('PENDING')
  })

  it('الميعاد القريب بيظهر في تنبيهات الداشبورد', async () => {
    const res = await request(app).get('/api/dashboard/alerts').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    const deadlineAlert = res.body.data.find((a: any) => a.type === 'critical_deadline')
    expect(deadlineAlert).toBeTruthy()
    expect(deadlineAlert.severity).toBe('high')
  })

  it('يقدر يعلّم الميعاد كمنجز وده يتسجل في سجل القضية', async () => {
    const list = await request(app)
      .get('/api/deadlines')
      .query({ caseId })
      .set('Authorization', `Bearer ${token}`)
    const deadlineId = list.body.data[0].id

    const updated = await request(app)
      .put(`/api/deadlines/${deadlineId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' })
    expect(updated.status).toBe(200)
    expect(updated.body.deadline.status).toBe('COMPLETED')
    expect(updated.body.deadline.completedAt).toBeTruthy()

    const caseDetail = await request(app).get(`/api/cases/${caseId}`).set('Authorization', `Bearer ${token}`)
    const hasLog = caseDetail.body.caseUpdates.some((u: any) => u.action === 'deadline_status_changed')
    expect(hasLog).toBe(true)
  })

  it('مفيش تنبيه ليه في الداشبورد بعد ما اتعلّم منجز', async () => {
    const res = await request(app).get('/api/dashboard/alerts').set('Authorization', `Bearer ${token}`)
    const deadlineAlert = res.body.data.find((a: any) => a.type === 'critical_deadline')
    expect(deadlineAlert).toBeFalsy()
  })
})
