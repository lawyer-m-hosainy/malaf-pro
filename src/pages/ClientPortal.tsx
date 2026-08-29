import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Copy, Check, Power, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function ClientPortal() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['portal-access'],
    queryFn: async () => {
      const res = await api.get('/portal');
      return res.data.data || [];
    }
  });

  const { mutate: generateLink, isPending: isGenerating } = useMutation({
    mutationFn: async (clientId: string) => {
      const res = await api.post('/portal/generate', { clientId });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-access'] });
      toast.success('تم توليد رابط البوابة بنجاح');
    },
    onError: () => toast.error('حدث خطأ أثناء توليد الرابط'),
  });

  const { mutate: toggleAccess, isPending: isToggling } = useMutation({
    mutationFn: async (accessId: string) => {
      await api.patch(`/portal/${accessId}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-access'] });
    },
    onError: () => toast.error('حدث خطأ أثناء تحديث حالة الرابط'),
  });

  const buildUrl = (token: string) => `${window.location.origin}/portal/${token}`;

  const copyLink = (clientId: string, token: string) => {
    navigator.clipboard.writeText(buildUrl(token));
    setCopiedId(clientId);
    toast.success('تم نسخ الرابط بنجاح');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCount = clients.filter((c: any) => c.access?.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">بوابة الموكلين</h2>
          <p className="text-muted-foreground text-sm">
            إدارة روابط وصول الموكلين لمتابعة قضاياهم والاطلاع على التحديثات.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>الروابط النشطة</CardDescription>
              <CardTitle className="text-3xl font-bold">{activeCount}</CardTitle>
            </CardHeader>
         </Card>
         <Card>
            <CardHeader className="pb-2">
              <CardDescription>إجمالي الموكلين</CardDescription>
              <CardTitle className="text-3xl font-bold">{clients.length}</CardTitle>
            </CardHeader>
         </Card>
         <Card>
            <CardHeader className="pb-2">
              <CardDescription>آخر تحديث</CardDescription>
              <CardTitle className="text-xl font-bold mt-2">مباشر</CardTitle>
            </CardHeader>
         </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>صلاحيات الدخول</CardTitle>
          <CardDescription>ولّد رابط وصول لكل موكل ليتابع قضاياه بدون تسجيل دخول.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center p-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">جاري تحميل البيانات...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">لا يوجد موكلين مسجلين بعد.</div>
            ) : clients.map((c: any) => (
              <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${c.access?.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{c.name}</h4>
                    <p className="text-sm text-muted-foreground">{c.casesCount} {c.casesCount === 1 ? 'قضية' : 'قضايا'}</p>
                    {c.access && (
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${c.access.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                          {c.access.isActive ? 'نشط' : 'معطل'}
                        </span>
                        {c.access.viewCount > 0 && (
                          <span className="text-muted-foreground">شوهد {c.access.viewCount} مرة</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {c.access ? (
                    <>
                      <div className="flex items-center bg-muted px-3 py-2 rounded-md flex-1 sm:flex-none">
                        <span className="text-xs text-muted-foreground font-mono ml-2 truncate max-w-[200px]" dir="ltr">
                          {buildUrl(c.access.token)}
                        </span>
                        <button onClick={() => copyLink(c.id, c.access.token)} className="text-muted-foreground hover:text-foreground mr-auto sm:mr-2">
                          {copiedId === c.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        title={c.access.isActive ? 'تعطيل الرابط' : 'تفعيل الرابط'}
                        disabled={isToggling}
                        onClick={() => toggleAccess(c.access.id)}
                      >
                        <Power className={`h-4 w-4 ${c.access.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" disabled={isGenerating} onClick={() => generateLink(c.id)} className="gap-2">
                      <Globe className="h-4 w-4" /> توليد رابط البوابة
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
