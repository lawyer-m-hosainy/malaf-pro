import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, User, Edit, Printer, Building2, Globe2, X, Save } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocalStore } from '@/store/useLocalStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, ClientFormData } from '@/lib/validationSchemas';

export default function Clients() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  const clients = useLocalStore(state => state.clients);
  const addClient = useLocalStore(state => state.addClient);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: 'شخص طبيعي',
      nationality: 'مصري',
      identityLabel: 'رقم قومي',
      email: '',
      phone: ''
    }
  });

  const selectedType = watch('type');

  const onTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setValue('type', type);
    setValue('identityLabel', type === 'شخص طبيعي' ? 'رقم قومي' : 'سجل تجاري');
  };

  const handleOpenAddModal = () => {
    reset({
      type: 'شخص طبيعي',
      nationality: 'مصري',
      identityLabel: 'رقم قومي',
      email: '',
      phone: ''
    });
    setIsAddModalOpen(true);
  };

  const onSubmit = (data: ClientFormData) => {
    const newId = (clients.length + 1).toString();
    addClient({
      id: newId,
      name: data.name,
      type: data.type,
      nationality: data.nationality,
      identityLabel: data.identityLabel,
      identityNumber: data.identityNumber,
      phone: data.phone || '',
      email: data.email || '',
      cases: 0
    });
    setIsAddModalOpen(false);
    reset();
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
          <Button className="gap-2" onClick={handleOpenAddModal}>
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
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم الكامل / اسم الشركة <span className="text-destructive">*</span></label>
                  <Input 
                    {...register('name')} 
                    placeholder="اكتب اسم الموكل..." 
                    className={errors.name ? 'border-destructive' : ''} 
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">الصفة <span className="text-destructive">*</span></label>
                  <select 
                    {...register('type')}
                    onChange={onTypeChange}
                    className={`flex h-10 w-full items-center justify-between rounded-md border ${errors.type ? 'border-destructive' : 'border-input'} bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`}
                  >
                    <option value="شخص طبيعي">شخص طبيعي</option>
                    <option value="شخص اعتباري">شخص اعتباري</option>
                  </select>
                  {errors.type && <p className="text-destructive text-xs mt-1">{errors.type.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">الجنسية <span className="text-destructive">*</span></label>
                  <select 
                    {...register('nationality')}
                    className={`flex h-10 w-full items-center justify-between rounded-md border ${errors.nationality ? 'border-destructive' : 'border-input'} bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`}
                  >
                    <option value="مصري">مصري</option>
                    <option value="أجنبي">أجنبي</option>
                  </select>
                  {errors.nationality && <p className="text-destructive text-xs mt-1">{errors.nationality.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع الإثبات <span className="text-destructive">*</span></label>
                  <select 
                    {...register('identityLabel')}
                    className={`flex h-10 w-full items-center justify-between rounded-md border ${errors.identityLabel ? 'border-destructive' : 'border-input'} bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`}
                  >
                    {selectedType === 'شخص طبيعي' ? (
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
                  {errors.identityLabel && <p className="text-destructive text-xs mt-1">{errors.identityLabel.message}</p>}
                </div>
                
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">رقم الإثبات <span className="text-destructive">*</span></label>
                  <Input 
                    {...register('identityNumber')} 
                    placeholder="مثال: 29001011234567" 
                    dir="ltr" 
                    className={`text-right ${errors.identityNumber ? 'border-destructive' : ''}`} 
                  />
                  {errors.identityNumber && <p className="text-destructive text-xs mt-1">{errors.identityNumber.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف <span className="text-destructive">*</span></label>
                  <Input 
                    {...register('phone')} 
                    placeholder="مثال: 010xxxxxxxx" 
                    dir="ltr" 
                    className={`text-right ${errors.phone ? 'border-destructive' : ''}`} 
                  />
                  {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input 
                    {...register('email')} 
                    type="email" 
                    placeholder="example@email.com" 
                    dir="ltr" 
                    className={`text-right ${errors.email ? 'border-destructive' : ''}`} 
                  />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
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
