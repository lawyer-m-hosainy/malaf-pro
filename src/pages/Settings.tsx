import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Building, Bell, Shield, Palette, Save, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  const tabs = [
    { id: 'general', label: 'إعدادات المكتب', icon: Building },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'security', label: 'الأمان', icon: Shield },
    { id: 'profile', label: 'الملف الشخصي', icon: UserIcon },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">الإعدادات</h2>
        <p className="text-muted-foreground text-sm">
          إدارة إعدادات المكتب، الإشعارات، والأمان والتفضيلات الشخصية.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink-none ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {tabs.find((t) => t.id === activeTab)?.label}
              </CardTitle>
              <CardDescription>
                {activeTab === 'general' && 'إدارة بيانات وتفاصيل مكتب المحاماة الأساسية.'}
                {activeTab === 'notifications' && 'تحديد طرق تلقي التنبيهات ورسائل النظام.'}
                {activeTab === 'security' && 'إدارة كلمات المرور وصلاحيات الدخول.'}
                {activeTab === 'profile' && 'إدارة بياناتك الشخصية.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">اسم المكتب</label>
                    <Input defaultValue="مكتب العدالة للمحاماة والاستشارات" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">رقم الهاتف</label>
                      <Input defaultValue="+20 10 1234 5678" dir="ltr" className="text-right" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">البريد الإلكتروني الرسمي</label>
                      <Input defaultValue="info@justice-lawfirm.local" dir="ltr" className="text-right" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">العنوان</label>
                    <Input defaultValue="١٢ شارع الجمهورية، مدينة نصر، القاهرة" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الرقم الضريبي (إن وجد)</label>
                    <Input defaultValue="123-456-789" dir="ltr" className="text-right" />
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  {[
                    { title: 'إشعارات الجلسات', desc: 'تلقي تنبيه قبل موعد الجلسة بيوم.' },
                    { title: 'تحديثات المهام', desc: 'إشعار عند تعيين مهمة جديدة أو تغيير حالتها.' },
                    { title: 'رسائل الموكلين', desc: 'تنبيه عند إرسال الموكل مستند جديد عبر البوابة.' },
                    { title: 'تقارير أسبوعية', desc: 'إرسال ملخص أسبوعي لأعمال المكتب على البريد.' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-[-100%] rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                      م
                    </div>
                    <Button variant="outline" size="sm">تغيير الصورة</Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الاسم الكامل</label>
                    <Input defaultValue="أ. محمد الحسيني" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">البريد الإلكتروني الشخصي</label>
                    <Input defaultValue="m.hosainy.law@gmail.com" dir="ltr" className="text-right" />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-sm mb-4">تغيير كلمة المرور</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">كلمة المرور الحالية</label>
                    <Input type="password" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">كلمة المرور الجديدة</label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">تأكيد كلمة المرور</label>
                      <Input type="password" />
                    </div>
                  </div>
                  <div className="pt-4 border-t mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm text-red-600">المصادقة الثنائية (2FA)</h4>
                        <p className="text-sm text-muted-foreground">أضف طبقة أمان إضافية لحسابك.</p>
                      </div>
                      <Button variant="outline" disabled>قريباً</Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ التغييرات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
