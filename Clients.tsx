import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, User, Edit, Printer, Building2, Globe2, X, Save } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const initialClients = [
  { id: '1', name: 'شركة النيل للتجارة', type: 'شخص اعتباري', nationality: 'مصري', identityLabel: 'سجل تجاري', identityNumber: '12345-67', phone: '01012345678', email: 'info@niletrade.com', cases: 3 },
  { id: '2', name: 'أحمد محمود سليمان', type: 'شخص طبيعي', nationality: 'مصري', identityLabel: 'رقم قومي', identityNumber: '29001011234567', phone: '01123456789', email: 'ahmed.m@email.com', cases: 1 },
  { id: '3', name: 'مؤسسة الأهرام للمقاولات', type: 'شخص اعتباري', nationality: 'كيان أجنبي', identityLabel: 'سجل تجاري أجنبي', identityNumber: 'UAE-998877', phone: '+971501234567', email: 'legal@ahram.com', cases: 5 },
  { id: '4', name: 'ياسر فاروق عبد الرحمن', type: 'شخص طبيعي', nationality: 'مصري', identityLabel: 'رقم قومي', identityNumber: '28505051234567', phone: '01111223344', email: 'yasser.f@email.com', cases: 0 },
  { id: '5', name: 'جون دو (John Doe)', type: 'شخص طبيعي', nationality: 'أجنبي', identityLabel: 'جواز سفر', identityNumber: 'US-987654321', phone: '+1234567890', email: 'john.doe@email.com', cases: 2 },
];

export default function Clients() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  const [clients, setClients] = useState(initialClients);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '', type: 'شخص طبيعي', nationality: 'مصري', identityLabel: 'رقم قومي', identityNumber: '', phone: '', email: ''
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = (clients.length + 1).toString();
    setClients([...clients, { ...newClient, id: newId, cases: 0 }]);
    setIsAddModalOpen(false);
    setNewClient({ name: '', type: 'شخص طبيعي', nationality: 'مصري', identityLabel: 'رقم قومي', identityNumber: '', phone: '', email: '' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">إدارة الموكلين</h2>
          <p className="text-sm text-muted-foreground mt-1">تتبع وإدارة جميع بيانات الموكلين (أشخاص طبيعيين أو اعتباريين، مصريين أو أجانب)</p>
        </div>
        {isAdminOrOwner && (
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" /> إضافة موكل جديد
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b">
           <div className="relative w-full sm:w-80 md:w-96">
             <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input placeholder="بحث عن موكل بالاسم أو الرقم القومي/السجل..." className="pr-10 w-full" />
           </div>
           
           <div className="flex items-center gap-2 w-full sm:w-auto">
              <select className="flex h-9 w-full sm:w-[130px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                 <option value="">جميع الصفات</option>
                 <option value="شخص طبيعي">شخص طبيعي</option>
                 <option value="شخص اعتباري">شخص اعتباري</option>
              </select>
              <select className="flex h-9 w-full sm:w-[130px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                 <option value="">جميع الجنسيات</option>
                 <option value="مصري">مصري</option>
                 <option value="أجنبي">أجنبي</option>
              </select>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <div className="relative w-full overflow-auto">
             <table className="w-full text-sm text-right">
               <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="border-b">
                     <th className="p-4 font-medium">اسم الموكل</th>
                     <th className="p-4 font-medium">الصفة والجنسية</th>
                     <th className="p-4 font-medium">إثبات الشخصية</th>
                     <th className="p-4 font-medium">بيانات الاتصال</th>
                     <th className="p-4 font-medium">القضايا</th>
                     <th className="p-4 font-medium text-center">إجراءات</th>
                  </tr>
               </thead>
               <tbody>
                  {clients.map(client => (
                    <tr key={client.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors group">
                       <td className="p-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-full shrink-0">
                               {client.type === 'شخص اعتباري' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div className="flex flex-col">
                              <span>{client.name}</span>
                              <span className="text-[11px] text-muted-foreground font-mono mt-0.5">ID: CL-{client.id.padStart(4, '0')}</span>
                            </div>
                          </div>
                       </td>
                       <td className="p-4">
                         <div className="flex flex-col gap-1.5 items-start">
                           <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                             client.type === 'شخص اعتباري' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                           }`}>
                             {client.type}
                           </span>
                           <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                             <Globe2 className="h-3 w-3" />
                             {client.nationality}
                           </span>
                         </div>
                       </td>
                       <td className="p-4">
                          <div className="flex flex-col">
                             <span className="text-xs font-medium text-muted-foreground">{client.identityLabel}</span>
                             <span className="font-mono text-xs mt-0.5">{client.identityNumber}</span>
                          </div>
                       </td>
                       <td className="p-4">
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="font-mono" dir="ltr">{client.phone}</span>
                            <span className="text-muted-foreground line-clamp-1">{client.email}</span>
                          </div>
                       </td>
                       <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{client.cases}</span>
                            <span className="text-[10px] text-muted-foreground">ملفات</span>
                          </div>
                       </td>
                       <td className="p-4 text-center">
                         <div className="flex items-center justify-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" title="طباعة بيانات الموكل" onClick={handlePrint}>
                             <Printer className="h-4 w-4" />
                           </Button>
                           {isAdminOrOwner && (
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="تعديل بيانات الموكل">
                               <Edit className="h-4 w-4" />
                             </Button>
                           )}
                           <Button variant="default" size="sm" className="mr-2 h-8 text-xs">عرض الملف</Button>
                         </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </CardContent>
      </Card>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-background rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">إضافة موكل جديد</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم الكامل / اسم الشركة <span className="text-red-500">*</span></label>
                  <Input required placeholder="اكتب اسم الموكل..." value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">الصفة <span className="text-red-500">*</span></label>
                  <select required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" 
                    value={newClient.type} 
                    onChange={e => {
                      const type = e.target.value;
                      setNewClient({
                        ...newClient, 
                        type, 
                        identityLabel: type === 'شخص طبيعي' ? 'رقم قومي' : 'سجل تجاري'
                      })
                    }}>
                    <option value="شخص طبيعي">شخص طبيعي</option>
                    <option value="شخص اعتباري">شخص اعتباري</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">الجنسية <span className="text-red-500">*</span></label>
                  <select required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={newClient.nationality}
                    onChange={e => setNewClient({...newClient, nationality: e.target.value})}>
                    <option value="مصري">مصري</option>
                    <option value="أجنبي">أجنبي</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع الإثبات <span className="text-red-500">*</span></label>
                  <select required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={newClient.identityLabel}
                    onChange={e => setNewClient({...newClient, identityLabel: e.target.value})}>
                    {newClient.type === 'شخص طبيعي' ? (
                      <>
                        <option value="رقم قومي">رقم قومي</option>
                        <option value="جواز سفر">جواز سفر</option>
                      </>
                    ) : (
                      <>
                        <option value="سجل تجاري">سجل تجاري</option>
                        <option value="بطاقة ضريبية">بطاقة ضريبية</option>
                        <option value="رقم إشهار (الجمعيات الأهلية)">رقم إشهار (الجمعيات الأهلية)</option>
                        <option value="قرار تأسيس">قرار تأسيس</option>
                        <option value="سجل تجاري أجنبي">سجل تجاري أجنبي</option>
                        <option value="كيان دولي">كيان دولي</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">رقم الإثبات <span className="text-red-500">*</span></label>
                  <Input required placeholder="مثال: 29001011234567" value={newClient.identityNumber} onChange={e => setNewClient({...newClient, identityNumber: e.target.value})} dir="ltr" className="text-right" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف <span className="text-red-500">*</span></label>
                  <Input required placeholder="مثال: 010xxxxxxxx" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} dir="ltr" className="text-right" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input type="email" placeholder="example@email.com" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} dir="ltr" className="text-right" />
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
                <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> حفظ البيانات</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
