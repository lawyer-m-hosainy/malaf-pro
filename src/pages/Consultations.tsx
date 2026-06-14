import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Phone, FileText, CheckCircle2, Clock, Calendar, MessageSquare, AlertCircle, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

const initialConsultations = [
  { id: 'CON-001', client: 'شركة النور للمقاولات', type: 'مكتوبة', status: 'pending', date: '2024-06-15', subject: 'مراجعة عقد شراكة استراتيجية', assignedTo: 'أ. محمد الحسيني', urgency: 'high' },
  { id: 'CON-002', client: 'د. أحمد محمود', type: 'حضور بالواتساب/هاتف', status: 'completed', date: '2024-06-10', subject: 'استشارة في نزاع عمالي', assignedTo: 'محامي استشاري', urgency: 'medium' },
  { id: 'CON-003', client: 'مؤسسة الأفق', type: 'مقابلة بالمكتب', status: 'upcoming', date: '2024-06-20', subject: 'تأسيس فرع شركة أجنبية', assignedTo: 'أ. محمد الحسيني', urgency: 'normal' },
];

export default function Consultations() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">الاستشارات القانونية</h2>
          <p className="text-sm text-muted-foreground mt-1">سجل الاستشارات اليومية وإدارتها قبل تحولها لقضايا رسمية</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" className="gap-2 shadow-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> طباعة
          </Button>
          {isAdminOrOwner && (
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> حجز استشارة جديدة
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
           <div className="relative max-w-md">
             <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="بحث باسم العميل، أو الموضوع..." 
               className="pr-10"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground">
               <tr className="border-b">
                  <th className="p-4 font-medium">العميل / الموضوع</th>
                  <th className="p-4 font-medium min-w-[140px]">النوع والتاريخ</th>
                  <th className="p-4 font-medium">حالة الاستشارة</th>
                  <th className="p-4 font-medium">المحامي المختص</th>
                  <th className="p-4 font-medium text-center">إجراءات</th>
               </tr>
            </thead>
            <tbody>
               {initialConsultations.map(c => (
                 <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
                   <td className="p-4">
                      <p className="font-bold text-base">{c.client}</p>
                      <p className="text-muted-foreground text-xs mt-1">{c.subject}</p>
                   </td>
                   <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                         {c.type.includes('مكتوبة') ? <FileText className="h-3.5 w-3.5 text-blue-500" /> : <Phone className="h-3.5 w-3.5 text-emerald-500" />}
                         {c.type}
                      </div>
                      <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {c.date}
                      </span>
                   </td>
                   <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1",
                        c.status === 'pending' ? "bg-amber-100 text-amber-700" :
                        c.status === 'upcoming' ? "bg-indigo-100 text-indigo-700" :
                        "bg-emerald-100 text-emerald-700"
                      )}>
                        {c.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                        {c.status === 'upcoming' && <Clock className="h-3 w-3" />}
                        {c.status === 'pending' && <AlertCircle className="h-3 w-3" />}
                        {c.status === 'pending' ? 'مطلوب إنجازها' : c.status === 'upcoming' ? 'موعد قادم' : 'تم الرد ومنتهية'}
                      </span>
                   </td>
                   <td className="p-4 font-semibold text-muted-foreground">{c.assignedTo}</td>
                   <td className="p-4 text-center">
                     <Button size="sm" variant="outline" className="h-8 gap-1">
                       <MessageSquare className="h-3 w-3" /> التفاصيل والرد
                     </Button>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
