import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Phone, FileText, CheckCircle2, Clock, Calendar, MessageSquare, AlertCircle, Printer, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Consultations() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newConsult, setNewConsult] = useState({ clientId: '', date: '', type: 'OFFICE', subject: '' });

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: async () => {
      const res = await api.get('/consultations');
      return (res.data.data || []).map((c: any) => {
        let typeStr = 'مقابلة بالمكتب';
        if (c.type === 'PHONE' || c.type === 'ONLINE') typeStr = 'حضور بالواتساب/هاتف';
        if (c.type === 'WRITTEN') typeStr = 'مكتوبة';

        let statusStr = 'pending';
        if (c.status === 'COMPLETED') statusStr = 'completed';
        if (c.status === 'SCHEDULED') {
          statusStr = new Date(c.date) > new Date() ? 'upcoming' : 'pending';
        }

        return {
          id: c.id,
          client: c.client?.name || 'عميل غير مسجل',
          type: typeStr,
          status: statusStr,
          date: format(new Date(c.date), 'yyyy-MM-dd'),
          subject: c.subject,
          assignedTo: c.lawyer?.name || 'غير محدد',
        };
      });
    }
  });

  const filteredConsultations = consultations.filter((c: any) => 
    c.client.includes(searchQuery) || c.subject.includes(searchQuery)
  );
  
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
            <Button className="gap-2 shadow-sm" onClick={() => setIsAddOpen(true)}>
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
               {isLoading ? (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-muted-foreground">
                     <div className="flex flex-col items-center justify-center space-y-3">
                       <Loader2 className="h-8 w-8 animate-spin text-primary" />
                       <p>جاري تحميل الاستشارات...</p>
                     </div>
                   </td>
                 </tr>
               ) : filteredConsultations.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-muted-foreground">
                     لا توجد استشارات
                   </td>
                 </tr>
               ) : (
                 filteredConsultations.map((c: any) => (
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
                 ))
               )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Consultation Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md shadow-lg border relative">
            <button onClick={() => setIsAddOpen(false)} className="absolute top-4 left-4 p-1 rounded-full hover:bg-muted">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> حجز استشارة جديدة
            </h3>
            <AddConsultationForm
              newConsult={newConsult}
              setNewConsult={setNewConsult}
              onClose={() => setIsAddOpen(false)}
              queryClient={queryClient}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AddConsultationForm({ newConsult, setNewConsult, onClose, queryClient }: any) {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => { const res = await api.get('/clients'); return res.data.data || []; }
  });

  const { mutate: addConsult, isPending } = useMutation({
    mutationFn: async () => {
      await api.post('/consultations', {
        clientId: newConsult.clientId,
        date: newConsult.date,
        type: newConsult.type,
        subject: newConsult.subject,
        status: 'SCHEDULED',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      toast.success('تم حجز الاستشارة بنجاح');
      setNewConsult({ clientId: '', date: '', type: 'OFFICE', subject: '' });
      onClose();
    },
    onError: () => toast.error('حدث خطأ'),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (newConsult.clientId && newConsult.date && newConsult.subject) addConsult(); }} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">العميل *</label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newConsult.clientId} onChange={(e) => setNewConsult({...newConsult, clientId: e.target.value})} required>
          <option value="">اختر العميل...</option>
          {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">التاريخ *</label>
        <Input type="date" value={newConsult.date} onChange={(e) => setNewConsult({...newConsult, date: e.target.value})} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">نوع الاستشارة</label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newConsult.type} onChange={(e) => setNewConsult({...newConsult, type: e.target.value})}>
          <option value="OFFICE">مقابلة بالمكتب</option>
          <option value="PHONE">هاتف / واتساب</option>
          <option value="WRITTEN">مكتوبة</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">الموضوع *</label>
        <Input placeholder="موضوع الاستشارة..." value={newConsult.subject} onChange={(e) => setNewConsult({...newConsult, subject: e.target.value})} required />
      </div>
      <div className="pt-4 flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
        <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? 'جاري الحفظ...' : 'حفظ الاستشارة'}</Button>
      </div>
    </form>
  );
}
