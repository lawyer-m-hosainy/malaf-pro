import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Link as LinkIcon, Power, Copy, Check, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface PortalAccess {
  id: string;
  clientName: string;
  caseTitle: string;
  url: string;
  status: 'active' | 'inactive';
  lastAccess: string;
}

const initialAccesses: PortalAccess[] = [
  { id: '1', clientName: 'أحمد محمود', caseTitle: 'دعوى عمالية رقم 450', url: 'portal.lawfirm.com/c/4f82a9', status: 'active', lastAccess: 'منذ يومين' },
  { id: '2', clientName: 'شركة الأفق المحدودة', caseTitle: 'صياغة عقود تأسيس', url: 'portal.lawfirm.com/c/8e2f1b', status: 'active', lastAccess: 'منذ 5 ساعات' },
  { id: '3', clientName: 'سارة عبد الله', caseTitle: 'دعوى أحوال شخصية', url: 'portal.lawfirm.com/c/1a4d9c', status: 'inactive', lastAccess: 'منذ شهر' },
];

export default function ClientPortal() {
  const [accesses, setAccesses] = useState<PortalAccess[]>(initialAccesses);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleStatus = (id: string) => {
    setAccesses(accesses.map(a => {
      if (a.id === id) {
        const newStatus = a.status === 'active' ? 'inactive' : 'active';
        toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إيقاف'} وصول الموكل بنجاح`);
        return { ...a, status: newStatus };
      }
      return a;
    }));
  };

  const copyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(`https://${url}`);
    setCopiedId(id);
    toast.success('تم نسخ الرابط بنجاح');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateLink = () => {
    toast.info('وظيفة إنشاء رابط جديد قيد التطوير');
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
        <Button onClick={handleGenerateLink}>
          <LinkIcon className="ml-2 h-4 w-4" />
          إنشاء رابط وصول جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>الروابط النشطة</CardDescription>
              <CardTitle className="text-3xl font-bold">{accesses.filter(a => a.status === 'active').length}</CardTitle>
            </CardHeader>
         </Card>
         <Card>
            <CardHeader className="pb-2">
              <CardDescription>إجمالي الموكلين في البوابة</CardDescription>
              <CardTitle className="text-3xl font-bold">{accesses.length}</CardTitle>
            </CardHeader>
         </Card>
         <Card>
            <CardHeader className="pb-2">
              <CardDescription>آخر تحديث للبوابة</CardDescription>
              <CardTitle className="text-xl font-bold mt-2">اليوم، 10:30 صباحاً</CardTitle>
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
            {accesses.map((access) => (
              <div key={access.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className={`p-3 rounded-full ${access.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{access.clientName}</h4>
                    <p className="text-sm text-muted-foreground">{access.caseTitle}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${access.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {access.status === 'active' ? 'نشط' : 'متوقف'}
                      </span>
                      <span className="text-muted-foreground">آخر دخول: {access.lastAccess}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center bg-muted px-3 py-2 rounded-md flex-1 sm:flex-none">
                    <span className="text-xs text-muted-foreground font-mono mr-2">{access.url}</span>
                    <button onClick={() => copyLink(access.id, access.url)} className="text-muted-foreground hover:text-foreground mr-auto sm:mr-4">
                      {copiedId === access.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  <Button variant="outline" size="icon" title={access.status === 'active' ? 'إيقاف الوصول' : 'تفعيل الوصول'} onClick={() => toggleStatus(access.id)}>
                    <Power className={`h-4 w-4 ${access.status === 'active' ? 'text-red-500' : 'text-emerald-500'}`} />
                  </Button>
                  <Button variant="outline" size="icon" title="معاينة كـ موكل" onClick={() => toast.info('وظيفة المعاينة قيد التطوير')}>
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
