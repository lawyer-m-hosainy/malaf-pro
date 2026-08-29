import { Link } from 'react-router-dom';
import { Wallet, ArrowDownToLine, Receipt, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export function CaseFinance({ invoices }: any) {
  const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.filter((inv: any) => inv.status === 'PAID').reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  const handleDownload = async (id: string, invoiceNumber: string) => {
    try {
      const res = await api.get(`/finance/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('حدث خطأ أثناء تحميل الفاتورة');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" /> فواتير وأتعاب القضية
          </h3>
          <Link to="/dashboard/finance">
            <Button size="sm" variant="outline" className="gap-2"><Receipt className="h-4 w-4" /> إدارة الفواتير</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
              <CardContent className="p-4">
                 <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">إجمالي المحصل</p>
                 <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-2 font-mono">
                   {totalPaid.toLocaleString()} <span className="text-sm">ج.م</span>
                 </p>
              </CardContent>
           </Card>
           <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
              <CardContent className="p-4">
                 <p className="text-xs font-medium text-amber-800 dark:text-amber-400">المستحق / غير المحصل</p>
                 <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-2 font-mono">
                   {totalOutstanding.toLocaleString()} <span className="text-sm">ج.م</span>
                 </p>
              </CardContent>
           </Card>
           <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
              <CardContent className="p-4">
                 <p className="text-xs font-medium text-blue-800 dark:text-blue-400">إجمالي الفواتير</p>
                 <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2 font-mono">
                   {totalInvoiced.toLocaleString()} <span className="text-sm">ج.م</span>
                 </p>
              </CardContent>
           </Card>
        </div>

        <Card>
          {invoices.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              لا توجد فواتير مرتبطة بهذه القضية بعد.
            </div>
          ) : (
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="border-b">
                <th className="p-4 font-medium">رقم الفاتورة</th>
                <th className="p-4 font-medium">المبلغ (ج.م)</th>
                <th className="p-4 font-medium">التاريخ</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium text-center">تحميل</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4 font-medium flex items-center gap-2">
                    <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
                    <span dir="ltr">{inv.invoiceNumber}</span>
                  </td>
                  <td className="p-4 font-mono font-bold">{inv.totalAmount.toLocaleString()}</td>
                  <td className="p-4 font-mono text-xs">{new Date(inv.issueDate).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4">
                    {inv.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full text-[10px] font-bold">{inv.statusLabel}</span>
                    ) : inv.status === 'OVERDUE' ? (
                      <span className="inline-flex items-center gap-1.5 text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full text-[10px] font-bold">{inv.statusLabel}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full text-[10px] font-bold">{inv.statusLabel}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <Button size="icon" variant="outline" className="h-8 w-8" title="تحميل PDF" onClick={() => handleDownload(inv.id, inv.invoiceNumber)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </Card>
    </div>
  );
}
