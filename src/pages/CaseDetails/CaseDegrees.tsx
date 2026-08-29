import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Plus, Gavel, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { COURT_STRUCTURE, Jurisdiction } from '@/lib/courtStructure';

// اقتراح الدرجة التالية المنطقية بناءً على الدرجة الحالية
function suggestNextDegree(currentDegree: string): string {
  if (currentDegree.includes('نقض')) return currentDegree;
  if (currentDegree.includes('استئناف') || currentDegree.includes('مستأنفة')) {
    if (currentDegree.includes('جنائي') || currentDegree.includes('جنح') || currentDegree.includes('جناي')) return 'نقض جنائي';
    if (currentDegree.includes('أسرة')) return 'نقض أسرة';
    return 'نقض مدني';
  }
  return 'استئناف';
}

export function CaseDegrees({ caseData, litigationDegrees }: any) {
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => ({
    internalId: caseData.internalId,
    caseNumber: '',
    year: new Date().getFullYear().toString(),
    jurisdiction: caseData.jurisdiction as Jurisdiction,
    branch: caseData.circuit,
    degree: suggestNextDegree(caseData.degree),
  }));

  const openEscalate = () => {
    setForm({
      internalId: caseData.internalId,
      caseNumber: '',
      year: new Date().getFullYear().toString(),
      jurisdiction: (caseData.jurisdiction as Jurisdiction) in COURT_STRUCTURE ? caseData.jurisdiction : 'القضاء العادي',
      branch: caseData.circuit,
      degree: suggestNextDegree(caseData.degree),
    });
    setIsEscalateOpen(true);
  };

  const { mutate: escalate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.post('/cases', {
        internalId: form.internalId,
        caseNumber: form.caseNumber,
        year: form.year,
        title: caseData.title,
        jurisdiction: form.jurisdiction,
        branch: form.branch,
        degree: form.degree,
        clientRole: caseData.clientRole,
        opponent: caseData.opponent,
        clientId: caseData.clientId || undefined,
        parentCaseId: caseData.id,
      });
      return res.data.case;
    },
    onSuccess: (newCase) => {
      queryClient.invalidateQueries({ queryKey: ['case'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('تم فتح الدرجة التالية بنجاح');
      setIsEscalateOpen(false);
      navigate(`/dashboard/cases/${newCase.id}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'حدث خطأ أثناء فتح الدرجة التالية'),
  });

  const branches = form.jurisdiction in COURT_STRUCTURE ? Object.keys((COURT_STRUCTURE as any)[form.jurisdiction]) : [];
  const degrees = branches.includes(form.branch) ? (COURT_STRUCTURE as any)[form.jurisdiction][form.branch] : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between print:hidden">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" /> تسلسل درجات التقاضي
        </h3>
        <Button size="sm" variant="outline" className="gap-2" onClick={openEscalate}>
          <Plus className="h-4 w-4" /> فتح درجة تالية (استئناف/نقض)
        </Button>
      </div>

      <div className="bg-muted/20 p-4 rounded-lg border">
        <h4 className="font-bold">رقم الأرشيف المرجعي: <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xl">{caseData.internalId}</span></h4>
        <p className="text-sm text-muted-foreground mt-1">
          يُشير هذا الرقم لملف القضية الموحد، والذي يحتوي على كافة درجات التقاضي المرتبطة بنفس النزاع.
        </p>
      </div>

      <div className="grid gap-4">
        {litigationDegrees.map((deg: any) => (
          <Link key={deg.id} to={deg.isCurrent ? '#' : `/dashboard/cases/${deg.id}`}>
            <Card className={cn(
              "overflow-hidden transition-all",
              deg.isCurrent ? "border-primary/50 shadow-md ring-1 ring-primary/20" : "hover:shadow-md cursor-pointer"
            )}>
              <div className={cn("h-1.5 w-full", deg.isCurrent ? "bg-primary" : "bg-muted")} />
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className={cn(
                    "p-4 flex flex-col justify-center items-center text-center min-w-[140px] border-l",
                    deg.isCurrent ? "bg-primary/5 text-primary" : "bg-muted/30"
                  )}>
                    <Gavel className={cn("h-6 w-6 mb-2", deg.isCurrent ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("font-bold", deg.isCurrent ? "text-lg" : "")}>{deg.degree}</span>
                    {deg.isCurrent && <span className="mt-1 px-2 py-0.5 rounded text-[10px] bg-primary text-primary-foreground font-bold">الدرجة الحالية</span>}
                  </div>

                  <div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">رقم الدعوى والسنة</p>
                      <p className="font-bold text-lg font-mono" dir="ltr">{deg.caseNumber} / {deg.year}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">المحكمة والدائرة</p>
                      <p className="font-semibold text-base">{deg.jurisdiction} — {deg.branch}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">الحالة</p>
                      <p className="font-bold text-base">{deg.statusLabel}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Escalate Modal */}
      {isEscalateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-background rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> فتح درجة تقاضي تالية
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEscalateOpen(false)} disabled={isPending}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                هيتم إنشاء قضية جديدة مرتبطة بنفس الموكل والخصم، وهتتربط بملف هذه القضية عشان تفضل تشوف تاريخ النزاع كامل في مكان واحد.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">رقم الأرشيف الداخلي (يفضل موحّد لنفس الملف)</label>
                <Input value={form.internalId} onChange={(e) => setForm({ ...form, internalId: e.target.value })} dir="ltr" className="font-mono" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الدعوى الجديد <span className="text-destructive">*</span></label>
                  <Input value={form.caseNumber} onChange={(e) => setForm({ ...form, caseNumber: e.target.value })} placeholder="مثال: 4521" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">لسنة <span className="text-destructive">*</span></label>
                  <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} dir="ltr" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الجهة القضائية</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.jurisdiction}
                  onChange={(e) => {
                    const j = e.target.value as Jurisdiction;
                    const firstBranch = Object.keys(COURT_STRUCTURE[j])[0];
                    setForm({ ...form, jurisdiction: j, branch: firstBranch, degree: (COURT_STRUCTURE[j] as any)[firstBranch][0] });
                  }}
                >
                  {Object.keys(COURT_STRUCTURE).map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">التصنيف / الفرع</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.branch}
                    onChange={(e) => {
                      const b = e.target.value;
                      setForm({ ...form, branch: b, degree: (COURT_STRUCTURE[form.jurisdiction] as any)[b][0] });
                    }}
                  >
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">الدرجة</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-primary/40 bg-background px-3 py-2 text-sm font-semibold"
                    value={form.degree}
                    onChange={(e) => setForm({ ...form, degree: e.target.value })}
                  >
                    {degrees.map((d: string) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEscalateOpen(false)} disabled={isPending}>إلغاء</Button>
              <Button
                type="button"
                className="flex-1"
                disabled={isPending || !form.caseNumber.trim()}
                onClick={() => escalate()}
              >
                {isPending ? 'جاري الفتح...' : 'فتح الدرجة'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
