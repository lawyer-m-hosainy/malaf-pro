import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Link as LinkIcon, Power, Copy, Check, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function ClientPortal() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const res = await api.get('/cases');
      return res.data.data || [];
    }
  });

  const copyLink = (id: string, internalId: string) => {
    const url = `${window.location.origin}/portal/${internalId || id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('تم نسخ الرابط بنجاح');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateLink = () => {
    toast.info('روابط البوابة يتم إنشاؤها تلقائياً لكل قضية جديدة.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">بوابة الموكلين</h2>
          <p className="text-muted-foreground text-sm">
            إدارة روابط وصول الموكلين لمتابعة قضاياهم والاطلاع على التحديثات.
          </p>
        </div>
        <Button onClick={handleGenerateLink} variant="outline">
          <Globe className="ml-2 h-4 w-4" />
          معلومات البوابة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>الروابط النشطة</CardDescription>
              <CardTitle className="text-3xl font-bold">{cases.filter((c: any) => c.status !== 'مغلقة').length}</CardTitle>
            </CardHeader>
         </Card>
         <Card>
            <CardHeader className="pb-2">
              <CardDescription>إجمالي قضايا البوابة</CardDescription>
              <CardTitle className="text-3xl font-bold">{cases.length}</CardTitle>
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
          <CardTitle>صلاحيات الدخول الحالية</CardTitle>
          <CardDescription>قائمة بالموكلين الذين لديهم أرقام وحسابات للوصول إلى البوابة.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center p-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">جاري تحميل البيانات...</p>
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">لا توجد بيانات للعرض.</div>
            ) : cases.map((caseItem: any) => (
              <div key={caseItem.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className={`p-3 rounded-full ${caseItem.status !== 'مغلقة' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{caseItem.client?.name || 'عميل غير مسجل'}</h4>
                    <p className="text-sm text-muted-foreground">{caseItem.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${caseItem.status !== 'مغلقة' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {caseItem.status !== 'مغلقة' ? 'نشط' : 'مغلق'}
                      </span>
                      <span className="text-muted-foreground font-mono">رقم القضية: {caseItem.internalId}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center bg-muted px-3 py-2 rounded-md flex-1 sm:flex-none">
                    <span className="text-xs text-muted-foreground font-mono mr-2 truncate max-w-[200px]" dir="ltr">
                      {`${window.location.host}/portal/${caseItem.internalId || caseItem.id}`}
                    </span>
                    <button onClick={() => copyLink(caseItem.id, caseItem.internalId)} className="text-muted-foreground hover:text-foreground mr-auto sm:mr-4">
                      {copiedId === caseItem.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  <Button variant="outline" size="icon" title="معاينة كـ موكل" onClick={() => toast.info('بوابة العميل ستتوفر في التحديث القادم')}>
                    <Eye className="h-4 w-4 text-blue-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
