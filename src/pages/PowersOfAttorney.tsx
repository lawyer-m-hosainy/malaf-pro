import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileSignature, Plus, X, Trash2, Power, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const emptyForm = {
  clientId: '',
  number: '',
  scope: '',
  issueDate: '',
  expiryDate: '',
  notaryOffice: '',
  lawyerId: '',
  caseId: '',
  notes: '',
};

export default function PowersOfAttorney() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const { data: poas = [], isLoading } = useQuery({
    queryKey: ['poa'],
    queryFn: async () => {
      const res = await api.get('/poa');
      return res.data.data || [];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => { const res = await api.get('/clients', { params: { limit: 200 } }); return res.data.data || []; },
  });

  const { data: team = [] } = useQuery({
    queryKey: ['team-list'],
    queryFn: async () => { const res = await api.get('/auth/team'); return res.data.data || []; },
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['cases-list-poa'],
    queryFn: async () => { const res = await api.get('/cases', { params: { limit: 200 } }); return res.data.data || []; },
  });

  const { mutate: addPoa, isPending: isAdding } = useMutation({
    mutationFn: async () => {
      await api.post('/poa', {
        ...form,
        lawyerId: form.lawyerId || undefined,
        caseId: form.caseId || undefined,
        expiryDate: form.expiryDate || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poa'] });
      toast.success('تم إضافة التوكيل بنجاح');
      setIsAddOpen(false);
      setForm(emptyForm);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'حدث خطأ أثناء إضافة التوكيل'),
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await api.put(`/poa/${id}`, { isActive });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['poa'] }),
  });

  const { mutate: deletePoa } = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/poa/${id}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['poa'] }),
  });

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const diffDays = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
    return diffDays >= 0 && diffDays <= 30;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate).getTime() < Date.now();
  };

  const filtered = poas.filter((p: any) =>
    p.client?.name?.includes(searchQuery) || p.number.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">التوكيلات الرسمية</h2>
          <p className="text-sm text-muted-foreground mt-1">متابعة توكيلات الموكلين ونطاقها وتواريخ انتهائها</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" /> إضافة توكيل
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث باسم الموكل أو رقم التوكيل..." className="pr-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد توكيلات مسجلة.</div>
          ) : (
            <table className="w-full text-sm text-right">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="border-b">
                  <th className="p-4 font-medium">الموكل</th>
                  <th className="p-4 font-medium">رقم التوكيل</th>
                  <th className="p-4 font-medium">النطاق</th>
                  <th className="p-4 font-medium">القضية المرتبطة</th>
                  <th className="p-4 font-medium text-center">تاريخ الانتهاء</th>
                  <th className="p-4 font-medium text-center">الحالة</th>
                  <th className="p-4 font-medium text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 font-semibold">{p.client?.name}</td>
                    <td className="p-4 font-mono text-xs">{p.number}</td>
                    <td className="p-4 text-xs text-muted-foreground max-w-[200px] truncate">{p.scope}</td>
                    <td className="p-4 text-xs">{p.case ? `${p.case.title} (${p.case.internalId})` : '-'}</td>
                    <td className="p-4 text-center font-mono text-xs">
                      {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                    </td>
                    <td className="p-4 text-center">
                      {!p.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">معطل</span>
                      ) : isExpired(p.expiryDate) ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive">منتهي</span>
                      ) : isExpiringSoon(p.expiryDate) ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">قريب الانتهاء</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">ساري</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button size="icon" variant="ghost" className="h-8 w-8" title={p.isActive ? 'تعطيل' : 'تفعيل'} onClick={() => toggleActive({ id: p.id, isActive: !p.isActive })}>
                          <Power className={cn('h-4 w-4', p.isActive ? 'text-emerald-600' : 'text-muted-foreground')} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { if (window.confirm('تأكيد حذف التوكيل؟')) deletePoa(p.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-background rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-primary" /> إضافة توكيل رسمي
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddOpen(false)} disabled={isAdding}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الموكل <span className="text-destructive">*</span></label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                  <option value="">اختر الموكل...</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم التوكيل <span className="text-destructive">*</span></label>
                  <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">مكتب التوثيق</label>
                  <Input value={form.notaryOffice} onChange={(e) => setForm({ ...form, notaryOffice: e.target.value })} placeholder="اختياري" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">نطاق التوكيل <span className="text-destructive">*</span></label>
                <Input value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} placeholder="مثال: توكيل عام في التقاضي" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">تاريخ التوكيل <span className="text-destructive">*</span></label>
                  <Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">تاريخ الانتهاء</label>
                  <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} dir="ltr" placeholder="غير محدد = مفتوح" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">المحامي المفوض</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.lawyerId} onChange={(e) => setForm({ ...form, lawyerId: e.target.value })}>
                    <option value="">غير محدد</option>
                    {team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">القضية المرتبطة</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.caseId} onChange={(e) => setForm({ ...form, caseId: e.target.value })}>
                    <option value="">غير مرتبط بقضية محددة</option>
                    {cases.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.internalId})</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ملاحظات</label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="اختياري" />
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)} disabled={isAdding}>إلغاء</Button>
              <Button
                type="button"
                className="flex-1"
                disabled={isAdding || !form.clientId || !form.number.trim() || !form.scope.trim() || !form.issueDate}
                onClick={() => addPoa()}
              >
                {isAdding ? 'جاري الإضافة...' : 'إضافة التوكيل'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
