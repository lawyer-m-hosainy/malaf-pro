import { useState } from 'react';
import { AlarmClock, Plus, X, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// مواعيد شائعة كنقطة انطلاق فقط - المدد دي معروفة بشكل عام لكن لازم
// تتأكد إنها لسه سارية وتناسب نوع القضية بالظبط قبل الاعتماد عليها
const DEADLINE_PRESETS = [
  { label: 'استئناف حكم مدني/تجاري (٤٠ يوم)', days: 40 },
  { label: 'استئناف حكم جنح (١٠ أيام)', days: 10 },
  { label: 'الطعن بالنقض (٦٠ يوم)', days: 60 },
  { label: 'المعارضة في الحكم الغيابي (١٠ أيام)', days: 10 },
];

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function CaseDeadlines({ caseId }: { caseId: string }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const queryClient = useQueryClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [form, setForm] = useState({
    title: '',
    triggerDate: toDateInputValue(today),
    deadlineDate: '',
    notes: '',
  });

  const { data: deadlines = [], isLoading } = useQuery({
    queryKey: ['deadlines', caseId],
    queryFn: async () => {
      const res = await api.get('/deadlines', { params: { caseId } });
      return res.data.data || [];
    },
  });

  const resetForm = () => setForm({ title: '', triggerDate: toDateInputValue(today), deadlineDate: '', notes: '' });

  const applyPreset = (label: string, days: number) => {
    const trigger = form.triggerDate ? new Date(form.triggerDate) : today;
    setForm({ ...form, title: label, deadlineDate: toDateInputValue(addDays(trigger, days)) });
  };

  const { mutate: addDeadline, isPending: isAdding } = useMutation({
    mutationFn: async () => {
      await api.post('/deadlines', { ...form, caseId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines', caseId] });
      toast.success('تم إضافة الميعاد بنجاح');
      setIsAddOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'حدث خطأ أثناء إضافة الميعاد'),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/deadlines/${id}`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deadlines', caseId] }),
  });

  const { mutate: deleteDeadline } = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/deadlines/${id}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deadlines', caseId] }),
  });

  const getUrgency = (deadlineDate: string) => {
    const diffDays = Math.ceil((new Date(deadlineDate).getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) return { label: `فات الميعاد منذ ${Math.abs(diffDays)} يوم`, className: 'bg-destructive/10 text-destructive border-destructive/30' };
    if (diffDays === 0) return { label: 'آخر يوم اليوم!', className: 'bg-destructive/10 text-destructive border-destructive/30' };
    if (diffDays <= 3) return { label: `متبقي ${diffDays} أيام`, className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' };
    return { label: `متبقي ${diffDays} يوم`, className: 'bg-muted text-muted-foreground border-border' };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlarmClock className="h-5 w-5 text-primary" /> المواعيد الحتمية
        </h3>
        <Button size="sm" className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" /> إضافة ميعاد
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center p-8 text-muted-foreground">جاري التحميل...</div>
      ) : deadlines.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/10 text-muted-foreground">
          لا توجد مواعيد حتمية مسجلة لهذه القضية.
        </div>
      ) : (
        <div className="grid gap-3">
          {deadlines.map((d: any) => {
            const urgency = d.status === 'PENDING' ? getUrgency(d.deadlineDate) : null;
            return (
              <Card key={d.id} className={cn(d.status === 'PENDING' && urgency?.label.includes('فات') ? 'border-destructive/50' : '')}>
                <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold">{d.title}</h4>
                      {d.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> تم اتخاذ الإجراء
                        </span>
                      )}
                      {d.status === 'MISSED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="h-3 w-3" /> فات الميعاد
                        </span>
                      )}
                      {urgency && (
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', urgency.className)}>{urgency.label}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      من {new Date(d.triggerDate).toLocaleDateString('ar-EG')} إلى <span className="font-bold text-foreground">{new Date(d.deadlineDate).toLocaleDateString('ar-EG')}</span>
                    </p>
                    {d.notes && <p className="text-xs text-muted-foreground mt-1">{d.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d.status === 'PENDING' && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50" onClick={() => updateStatus({ id: d.id, status: 'COMPLETED' })}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> تم الإجراء
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { if (window.confirm('تأكيد حذف الميعاد؟')) deleteDeadline(d.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-background rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlarmClock className="h-5 w-5 text-primary" /> إضافة ميعاد حتمي
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddOpen(false)} disabled={isAdding}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">مواعيد شائعة (نقطة انطلاق - تحقّق منها)</label>
                <div className="flex flex-wrap gap-2">
                  {DEADLINE_PRESETS.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      className="text-xs px-2.5 py-1.5 rounded-md border bg-muted/40 hover:bg-muted transition-colors"
                      onClick={() => applyPreset(p.label, p.days)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">عنوان الميعاد <span className="text-destructive">*</span></label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: ميعاد الطعن بالاستئناف" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">تاريخ بداية سريان الميعاد <span className="text-destructive">*</span></label>
                  <Input type="date" value={form.triggerDate} onChange={(e) => setForm({ ...form, triggerDate: e.target.value })} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">آخر يوم للميعاد <span className="text-destructive">*</span></label>
                  <Input type="date" value={form.deadlineDate} onChange={(e) => setForm({ ...form, deadlineDate: e.target.value })} dir="ltr" className="border-primary/40 font-semibold" />
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
                disabled={isAdding || !form.title.trim() || !form.triggerDate || !form.deadlineDate}
                onClick={() => addDeadline()}
              >
                {isAdding ? 'جاري الإضافة...' : 'إضافة الميعاد'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
