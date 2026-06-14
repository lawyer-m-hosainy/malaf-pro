import { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import * as Tabs from '@radix-ui/react-tabs';
import { Building2, Palette, BellRing, Printer, AlertTriangle, Save, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const officeSchema = z.object({
  officeName: z.string().min(2, 'اسم المكتب مطلوب'),
  ownerName: z.string().min(2, 'اسم المالك مطلوب'),
  phone: z.string()
    .regex(/^01[0125]\d{8}$/, 'رقم الموبايل غير صحيح')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('البريد الإلكتروني غير صحيح')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
});

type OfficeFormValues = z.infer<typeof officeSchema>;

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<OfficeFormValues>({
    resolver: zodResolver(officeSchema),
    defaultValues: {
      officeName: settings.officeName,
      ownerName: settings.ownerName,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      licenseNumber: settings.licenseNumber,
    }
  });

  const showSuccess = () => {
    setSuccessMsg('تم حفظ البيانات بنجاح ✓');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const onSubmitGeneral = (data: OfficeFormValues) => {
    updateSettings(data);
    showSuccess();
  };

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setTheme(value);
    updateSettings({ theme: value });
    showSuccess();
  };

  const handleToggle = (key: keyof typeof settings) => {
    const currentValue = settings[key];
    updateSettings({ [key]: !currentValue });
    showSuccess();
  };

  const handleWipeData = () => {
    if (window.confirm('تحذير خطير: هل أنت متأكد من مسح جميع بيانات المنصة؟ سيتم فقدان كل القضايا والموكلين والحسابات للأبد!')) {
      if (window.confirm('تأكيد نهائي: هذه العملية لا يمكن التراجع عنها. هل تريد المسح حقاً؟')) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى الوضع الافتراضي؟')) {
      resetSettings();
      setTheme('system');
      setSuccessMsg('تم إعادة تعيين الإعدادات بنجاح ✓');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const ToggleSwitch = ({ label, description, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="space-y-0.5">
        <h4 className="font-medium text-sm text-foreground">{label}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button 
        type="button" 
        role="switch" 
        aria-checked={checked} 
        onClick={() => onChange()}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? "bg-primary" : "bg-input"
        )}
      >
        <span className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "-translate-x-5" : "translate-x-0"
        )} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">إعدادات المنصة</h2>
          <p className="text-muted-foreground mt-1">إدارة بيانات المكتب، المظهر، الإشعارات، والطباعة</p>
        </div>
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 animate-in fade-in zoom-in-95">
            <Check className="h-4 w-4" /> {successMsg}
          </div>
        )}
      </div>

      <Tabs.Root defaultValue="general" className="flex flex-col md:flex-row gap-6">
        <Tabs.List className="flex md:flex-col gap-2 w-full md:w-64 shrink-0 overflow-x-auto pb-2 md:pb-0 bg-transparent border-b md:border-b-0">
          <Tabs.Trigger 
            value="general" 
            className="flex items-center gap-3 px-4 py-2.5 rounded-md font-medium text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all whitespace-nowrap"
          >
            <Building2 className="h-4 w-4" /> بيانات المكتب
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="appearance" 
            className="flex items-center gap-3 px-4 py-2.5 rounded-md font-medium text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all whitespace-nowrap"
          >
            <Palette className="h-4 w-4" /> المظهر والعرض
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="notifications" 
            className="flex items-center gap-3 px-4 py-2.5 rounded-md font-medium text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all whitespace-nowrap"
          >
            <BellRing className="h-4 w-4" /> الإشعارات
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="printing" 
            className="flex items-center gap-3 px-4 py-2.5 rounded-md font-medium text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold transition-all whitespace-nowrap"
          >
            <Printer className="h-4 w-4" /> الطباعة
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="danger" 
            className="flex items-center gap-3 px-4 py-2.5 rounded-md font-medium text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive data-[state=active]:font-bold transition-all whitespace-nowrap"
          >
            <AlertTriangle className="h-4 w-4" /> منطقة الخطر
          </Tabs.Trigger>
        </Tabs.List>

        <div className="flex-1">
          {/* 1. بيانات المكتب */}
          <Tabs.Content value="general" className="space-y-4 focus:outline-none animate-in fade-in">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>البيانات الأساسية للمكتب</CardTitle>
                <CardDescription>ستظهر هذه البيانات في الفواتير والتقارير المطبوعة</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmitGeneral)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">اسم المكتب <span className="text-destructive">*</span></label>
                      <Input {...register('officeName')} placeholder="مثال: مكتب العدالة للمحاماة" className={errors.officeName ? 'border-destructive' : ''} />
                      {errors.officeName && <p className="text-destructive text-xs mt-1">{errors.officeName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">اسم صاحب المكتب (المدير) <span className="text-destructive">*</span></label>
                      <Input {...register('ownerName')} placeholder="مثال: ذكي الحسيني" className={errors.ownerName ? 'border-destructive' : ''} />
                      {errors.ownerName && <p className="text-destructive text-xs mt-1">{errors.ownerName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">رقم الهاتف</label>
                      <Input {...register('phone')} dir="ltr" className={`text-right ${errors.phone ? 'border-destructive' : ''}`} placeholder="01xxxxxxxxx" />
                      {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">البريد الإلكتروني</label>
                      <Input {...register('email')} dir="ltr" className={`text-right ${errors.email ? 'border-destructive' : ''}`} placeholder="contact@lawfirm.com" />
                      {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">العنوان الموحد للمكتب</label>
                      <textarea 
                        {...register('address')} 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="العنوان التفصيلي للمكتب..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">رقم الترخيص / البطاقة الضريبية</label>
                      <Input {...register('licenseNumber')} placeholder="أرقام التسجيل أو السجل التجاري..." />
                    </div>
                  </div>
                  <div className="pt-4 border-t flex justify-end">
                    <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> حفظ التعديلات</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* 2. المظهر والعرض */}
          <Tabs.Content value="appearance" className="space-y-4 focus:outline-none animate-in fade-in">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>تخصيص المظهر</CardTitle>
                <CardDescription>تحكم في واجهة المنصة بما يريح عينك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">نمط الألوان (Theme)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map((t) => (
                      <button
                        key={t}
                        onClick={() => handleThemeChange(t as 'light'|'dark'|'system')}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 border rounded-lg transition-all",
                          settings.theme === t ? "border-primary bg-primary/5 text-primary font-bold shadow-sm" : "border-border hover:bg-muted text-muted-foreground"
                        )}
                      >
                        {t === 'light' ? 'فواتح (Light)' : t === 'dark' ? 'غوامق (Dark)' : 'نظام (System)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h4 className="text-sm font-medium">تنسيق التاريخ</h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={settings.dateFormat === 'DD/MM/YYYY'} 
                        onChange={() => { updateSettings({ dateFormat: 'DD/MM/YYYY' }); showSuccess(); }}
                        className="accent-primary"
                      />
                      <span className="text-sm">يوم/شهر/سنة (31/12/2026)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={settings.dateFormat === 'YYYY-MM-DD'} 
                        onChange={() => { updateSettings({ dateFormat: 'YYYY-MM-DD' }); showSuccess(); }}
                        className="accent-primary"
                      />
                      <span className="text-sm">سنة-شهر-يوم (2026-12-31)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h4 className="text-sm font-medium">العملة الافتراضية</h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={settings.currency === 'EGP'} 
                        onChange={() => { updateSettings({ currency: 'EGP' }); showSuccess(); }}
                        className="accent-primary"
                      />
                      <span className="text-sm">جنيه مصري (EGP)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={settings.currency === 'USD'} 
                        onChange={() => { updateSettings({ currency: 'USD' }); showSuccess(); }}
                        className="accent-primary"
                      />
                      <span className="text-sm">دولار أمريكي (USD)</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* 3. الإشعارات */}
          <Tabs.Content value="notifications" className="space-y-4 focus:outline-none animate-in fade-in">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>إعدادات التنبيهات الذكية</CardTitle>
                <CardDescription>حدد متى تريد أن تتلقى إشعارات في المنصة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <ToggleSwitch 
                  label="تنبيهات جلسات اليوم" 
                  description="إرسال إشعار فوري عند وجود جلسة مبرمجة لليوم الحالي"
                  checked={settings.notifySessionToday}
                  onChange={() => handleToggle('notifySessionToday')}
                />
                <ToggleSwitch 
                  label="تذكير جلسات الغد" 
                  description="إرسال إشعار تذكيري استباقي بيوم واحد"
                  checked={settings.notifySessionTomorrow}
                  onChange={() => handleToggle('notifySessionTomorrow')}
                />
                <ToggleSwitch 
                  label="تذكير الجلسات القريبة" 
                  description="تنبيه بالجلسات المبرمجة خلال الـ 7 أيام القادمة"
                  checked={settings.notifySessionWeek}
                  onChange={() => handleToggle('notifySessionWeek')}
                />
                <ToggleSwitch 
                  label="المستحقات المالية المتأخرة" 
                  description="إشعار بوجود مبالغ أتعاب معلقة لم يتم سدادها"
                  checked={settings.notifyPaymentDue}
                  onChange={() => handleToggle('notifyPaymentDue')}
                />
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* 4. الطباعة */}
          <Tabs.Content value="printing" className="space-y-4 focus:outline-none animate-in fade-in">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>تخطيط المطبوعات والتقارير</CardTitle>
                <CardDescription>التحكم في الهيدر الافتراضي عند طباعة أي صفحة (مثل الموكلين أو القضايا)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <ToggleSwitch 
                    label="طباعة شعار المكتب" 
                    description="إظهار لوجو المكتب أعلى الصفحة"
                    checked={settings.printLogo}
                    onChange={() => handleToggle('printLogo')}
                  />
                  <ToggleSwitch 
                    label="طباعة اسم المكتب" 
                    description="إظهار اسم المكتب بجوار اللوجو"
                    checked={settings.printOfficeName}
                    onChange={() => handleToggle('printOfficeName')}
                  />
                  <ToggleSwitch 
                    label="طباعة تاريخ الإصدار" 
                    description="إظهار تاريخ طباعة المستند"
                    checked={settings.printDate}
                    onChange={() => handleToggle('printDate')}
                  />
                </div>
                
                {/* Preview مصغر */}
                <div className="bg-muted/30 border-2 border-dashed border-border rounded-lg p-4 flex flex-col h-full min-h-[250px]">
                  <p className="text-xs text-muted-foreground mb-4 text-center font-semibold">المعاينة التقريبية (Preview)</p>
                  <div className="bg-background shadow-sm border rounded p-4 flex-1 flex flex-col text-xs text-foreground">
                    <div className="flex justify-between items-start border-b pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        {settings.printLogo && <div className="h-6 w-6 bg-primary/20 rounded flex items-center justify-center font-bold text-primary">ش</div>}
                        {settings.printOfficeName && <span className="font-bold text-sm">{settings.officeName || 'اسم المكتب'}</span>}
                      </div>
                      {settings.printDate && <span className="text-muted-foreground font-mono">{new Date().toLocaleDateString('ar-EG')}</span>}
                    </div>
                    <div className="flex-1 space-y-2 opacity-50">
                      <div className="h-2 w-1/3 bg-muted-foreground rounded"></div>
                      <div className="h-2 w-full bg-muted-foreground rounded"></div>
                      <div className="h-2 w-full bg-muted-foreground rounded"></div>
                      <div className="h-2 w-2/3 bg-muted-foreground rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* 5. منطقة الخطر */}
          <Tabs.Content value="danger" className="space-y-4 focus:outline-none animate-in fade-in">
            <Card className="border-destructive/30 shadow-sm bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> منطقة الخطر (Danger Zone)
                </CardTitle>
                <CardDescription>العمليات في هذه المنطقة قد تؤدي إلى فقدان دائم للبيانات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background border rounded-lg gap-4">
                  <div>
                    <h4 className="font-semibold text-sm">إعادة تعيين الإعدادات الافتراضية</h4>
                    <p className="text-xs text-muted-foreground mt-1">ستعود جميع الإعدادات للوضع الأساسي (المظهر، الإشعارات، الطباعة)</p>
                  </div>
                  <Button variant="outline" onClick={handleResetSettings}>
                    إعادة التعيين
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-destructive">مسح جميع بيانات المنصة (Factory Reset)</h4>
                    <p className="text-xs text-destructive/80 mt-1">
                      سيتم حذف جميع القضايا، الموكلين، المستندات المرفوعة، والمعاملات المالية للأبد.
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleWipeData}>
                    مسح جميع البيانات نهائياً
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
