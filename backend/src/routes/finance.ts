import { Router } from 'express'
import * as FinanceController from '../controllers/finance.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// فواتير
router.get('/invoices',           FinanceController.getInvoices)
router.post('/invoices',          FinanceController.createInvoice)
router.put('/invoices/:id',       FinanceController.updateInvoice)
router.delete('/invoices/:id',    FinanceController.deleteInvoice)

// مصروفات
router.get('/expenses',           FinanceController.getExpenses)
router.post('/expenses',          FinanceController.createExpense)
router.delete('/expenses/:id',    FinanceController.deleteExpense)

// إحصائيات مالية
router.get('/stats',              FinanceController.getStats)

export default router
