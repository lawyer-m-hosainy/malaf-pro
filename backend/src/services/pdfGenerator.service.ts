import PDFDocument from 'pdfkit'
import { Response } from 'express'
import { FONTS } from '../lib/arabicFont'

// ملاحظة: PDFKit (عن طريق fontkit) بيعمل Arabic shaping و bidi reordering
// صحيح تلقائياً طالما الخط بيدعم عربي (Cairo) - مفيش داعي لأي معالجة يدوية
// للنص العربي، فقط مرر النص الأصلي زي ما هو مع { align: 'right' }.

const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  SENT: 'مرسلة',
  PAID: 'مدفوعة',
  OVERDUE: 'متأخرة',
  CANCELED: 'ملغاة',
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB') // DD/MM/YYYY
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function newDoc(): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  doc.registerFont('Cairo', FONTS.regular)
  doc.registerFont('Cairo-Bold', FONTS.bold)
  doc.font('Cairo')
  return doc
}

function hr(doc: PDFKit.PDFDocument) {
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke()
}

function line(doc: PDFKit.PDFDocument, label: string, value: string, options: { bold?: boolean } = {}) {
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right
  doc.font(options.bold ? 'Cairo-Bold' : 'Cairo').fontSize(11)
  doc.text(`${label}: ${value}`, doc.page.margins.left, doc.y, { width, align: 'right' })
}

interface InvoicePdfData {
  invoiceNumber: string
  issueDate: Date | string
  dueDate: Date | string | null
  status: string
  organization: { name: string; phone?: string | null; email?: string | null; address?: string | null; licenseNo?: string | null }
  client: { name: string; phone?: string | null; email?: string | null } | null
  case: { title: string; caseNumber: string } | null
  items: Array<{ description: string; amount: number; quantity: number }>
  totalAmount: number
  notes?: string | null
}

export function generateInvoicePDF(data: InvoicePdfData, res: Response) {
  const doc = newDoc()

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${data.invoiceNumber}.pdf"`)
  doc.pipe(res)

  // رأس الفاتورة
  doc.font('Cairo-Bold').fontSize(18).text(data.organization.name, { align: 'right' })
  doc.moveDown(0.3)
  doc.font('Cairo-Bold').fontSize(14).text('فاتورة', { align: 'right' })
  doc.font('Helvetica').fontSize(11).text(data.invoiceNumber, { align: 'right' })
  doc.moveDown(1)

  hr(doc)
  doc.moveDown(0.8)

  line(doc, 'تاريخ الإصدار', formatDate(data.issueDate))
  doc.moveDown(0.4)
  line(doc, 'تاريخ الاستحقاق', formatDate(data.dueDate))
  doc.moveDown(0.4)
  line(doc, 'الحالة', INVOICE_STATUS_LABELS[data.status] || data.status)
  doc.moveDown(0.4)

  if (data.client) {
    line(doc, 'الموكل', data.client.name)
    doc.moveDown(0.4)
  }
  if (data.case) {
    line(doc, 'القضية', `${data.case.title} (${data.case.caseNumber})`)
    doc.moveDown(0.4)
  }

  doc.moveDown(0.8)
  hr(doc)
  doc.moveDown(0.8)

  // جدول البنود
  const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
  const colAmount = 100
  const colQty = 60
  const colDesc = tableWidth - colAmount - colQty

  doc.font('Cairo-Bold').fontSize(11)
  const headerY = doc.y
  doc.text('البند', doc.page.margins.left, headerY, { width: colDesc, align: 'right' })
  doc.text('الكمية', doc.page.margins.left + colDesc, headerY, { width: colQty, align: 'center' })
  doc.text('المبلغ', doc.page.margins.left + colDesc + colQty, headerY, { width: colAmount, align: 'left' })
  doc.moveDown(0.5)
  hr(doc)
  doc.moveDown(0.5)

  for (const item of data.items) {
    const rowY = doc.y
    doc.font('Cairo').fontSize(10)
    doc.text(item.description, doc.page.margins.left, rowY, { width: colDesc, align: 'right' })
    const descHeight = doc.y - rowY
    doc.font('Helvetica').fontSize(10)
    doc.text(String(item.quantity), doc.page.margins.left + colDesc, rowY, { width: colQty, align: 'center' })
    doc.text(formatAmount(item.amount * item.quantity), doc.page.margins.left + colDesc + colQty, rowY, { width: colAmount, align: 'left' })
    doc.y = rowY + descHeight
    doc.moveDown(0.3)
  }

  doc.moveDown(0.5)
  hr(doc)
  doc.moveDown(0.6)

  const totalY = doc.y
  doc.font('Cairo-Bold').fontSize(13)
  doc.text('الإجمالي', doc.page.margins.left, totalY, { width: colDesc + colQty, align: 'right' })
  doc.font('Helvetica-Bold').fontSize(13)
  doc.text(`${formatAmount(data.totalAmount)} EGP`, doc.page.margins.left + colDesc + colQty, totalY, { width: colAmount, align: 'left' })

  if (data.notes) {
    doc.moveDown(1.5)
    line(doc, 'ملاحظات', data.notes)
  }

  doc.end()
}

interface ReportPdfData {
  organization: { name: string }
  period: string
  totalIncome: number
  totalExpenses: number
  netProfit: number
  casesCount: number
  clientsCount: number
  topClients: Array<{ name: string; cases: number }>
}

export function generateReportPDF(data: ReportPdfData, res: Response) {
  const doc = newDoc()

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename="financial-report.pdf"')
  doc.pipe(res)

  doc.font('Cairo-Bold').fontSize(18).text(data.organization.name, { align: 'right' })
  doc.moveDown(0.3)
  doc.font('Cairo-Bold').fontSize(14).text('تقرير مالي', { align: 'right' })
  doc.font('Cairo').fontSize(11).text(data.period, { align: 'right' })
  doc.moveDown(1)
  hr(doc)
  doc.moveDown(0.8)

  line(doc, 'إجمالي الإيرادات', `${formatAmount(data.totalIncome)} EGP`)
  doc.moveDown(0.4)
  line(doc, 'إجمالي المصروفات', `${formatAmount(data.totalExpenses)} EGP`)
  doc.moveDown(0.4)
  line(doc, 'صافي الربح', `${formatAmount(data.netProfit)} EGP`, { bold: true })
  doc.moveDown(0.4)
  line(doc, 'عدد القضايا', String(data.casesCount))
  doc.moveDown(0.4)
  line(doc, 'عدد الموكلين النشطين', String(data.clientsCount))
  doc.moveDown(1)

  if (data.topClients.length > 0) {
    hr(doc)
    doc.moveDown(0.8)
    doc.font('Cairo-Bold').fontSize(13).text('أكثر الموكلين نشاطاً', { align: 'right' })
    doc.moveDown(0.5)
    for (const c of data.topClients) {
      line(doc, c.name, `${c.cases} قضية`)
      doc.moveDown(0.3)
    }
  }

  doc.end()
}
