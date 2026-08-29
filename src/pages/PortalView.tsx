import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Scale, Loader2, AlertTriangle, Phone, Mail, Gavel, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';
import { CASE_STATUS_LABELS, CASE_STATUS_BADGE_CLASS } from '@/lib/labels';

export default function PortalView() {
  const { token } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['portal', token],
    queryFn: async () => {
      const res = await api.get(`/portal/public/${token}`);
      return res.data.data;
    },
    enabled: !!token,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>جاري تحميل بياناتك...</p>
      </div>
    );
  }

  if (error || !data) {
    const message = (error as any)?.response?.data?.error || 'هذا الرابط غير صحيح أو انتهت صلاحيته';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center bg-muted/40 p-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="font-semibold text-lg">{message}</p>
        <p className="text-sm text-muted-foreground">يرجى التواصل مع مكتب المحاماة للحصول على رابط جديد.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      <header className="h-20 border-b flex items-center justify-between px-6 md:px-12 bg-card">
        <div className="flex items-center gap-2 font-bold text-2xl text-primary">
          <Scale className="h-8 w-8" />
          <span>{data.officeName}</span>
        </div>
        <div className="text-sm text-muted-foreground hidden sm:flex items-center gap-4">
          {data.officePhone && (
            <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {data.officePhone}</span>
          )}
          {data.officeEmail && (
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {data.officeEmail}</span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">مرحباً، {data.clientName}</h1>
          <p className="text-muted-foreground text-sm mt-1">متابعة حالة قضاياك وآخر التحديثات</p>
        </div>

        {data.cases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              لا توجد قضايا مسجلة حالياً.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data.cases.map((c: any) => (
              <Card key={c.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                  <div>
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    <CardDescription className="mt-1">
                      رقم القضية: <span className="font-mono">{c.caseNumber}</span> — {c.jurisdiction} / {c.degree}
                    </CardDescription>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${CASE_STATUS_BADGE_CLASS[c.status] || 'bg-muted text-muted-foreground border-border'}`}>
                    {CASE_STATUS_LABELS[c.status] || c.status}
                  </span>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Gavel className="h-4 w-4" /> الخصم: {c.opponent}</span>
                    {c.nextSession && (
                      <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> الجلسة القادمة: {new Date(c.nextSession).toLocaleDateString('ar-EG')}</span>
                    )}
                  </div>

                  {c.caseUpdates?.length > 0 && (
                    <div className="border-t pt-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">آخر التحديثات</p>
                      {c.caseUpdates.map((u: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-xs text-muted-foreground font-mono shrink-0 mt-0.5">
                            {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                          <span>{u.details}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pt-6">
          هذه صفحة متابعة للقراءة فقط — لأي استفسار يرجى التواصل مباشرة مع المكتب.
        </p>
      </main>
    </div>
  );
}
