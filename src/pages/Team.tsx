import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search, Shield, User, Briefcase, Mail, Phone, Lock, CheckCircle2, AlertCircle, MoreVertical, Edit, UserX, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const initialTeam = [
  { id: '1', name: 'أ. محمد الحسيني', role: 'owner', roleTitle: 'مدير المكتب (شريك)', email: 'm.hosainy@lawfirm.local', phone: '010XXXXXXXX', status: 'active', type: 'إدارة' },
  { id: '2', name: 'أحمد', role: 'lawyer', roleTitle: 'محامي استئناف', email: 'ahmed@lawfirm.local', phone: '011XXXXXXXX', status: 'active', type: 'قانوني' },
  { id: '3', name: 'سارة محمود', role: 'admin', roleTitle: 'سكرتارية وإداري', email: 'sara@lawfirm.local', phone: '012XXXXXXXX', status: 'active', type: 'إداري' },
  { id: '4', name: 'محمود حسين', role: 'lawyer', roleTitle: 'محامي ابتدائي / مندوب', email: 'mahmoud@lawfirm.local', phone: '015XXXXXXXX', status: 'inactive', type: 'قانوني' },
];

function ActionMenu({ member, onStatusChange, onDelete }: { member: any, onStatusChange: (id: string, status: string) => void, onDelete: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-right" ref={ref}>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="h-8 w-8">
        <MoreVertical className="h-4 w-4" />
      </Button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-background border shadow-md rounded-md z-50 overflow-hidden text-right">
          <div className="p-1">
            <button className="w-full text-right px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2 rounded-sm transition-colors">
              <Edit className="h-4 w-4 text-primary" /> تعديل الصلاحيات
            </button>
            {member.status === 'active' ? (
              <button 
                onClick={() => { onStatusChange(member.id, 'inactive'); setIsOpen(false); }}
                className="w-full text-right px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2 rounded-sm transition-colors text-amber-600"
              >
                <UserX className="h-4 w-4" /> إيقاف الحساب
              </button>
            ) : (
              <button 
                onClick={() => { onStatusChange(member.id, 'active'); setIsOpen(false); }}
                className="w-full text-right px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2 rounded-sm transition-colors text-emerald-600"
              >
                <CheckCircle2 className="h-4 w-4" /> تنشيط الحساب
              </button>
            )}
            <div className="border-t my-1"></div>
            <button 
               onClick={() => { onDelete(member.id); setIsOpen(false); }}
               className="w-full text-right px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 rounded-sm transition-colors text-destructive"
            >
              <Trash2 className="h-4 w-4" /> حذف نهائي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Team() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [team, setTeam] = useState(initialTeam);

  const handleStatusChange = (id: string, status: string) => {
    setTeam(team.map(m => m.id === id ? { ...m, status } : m));
  };

  const handleDelete = (id: string) => {
    // In a real app, you might want to show a confirmation dialog first
    setTeam(team.filter(m => m.id !== id));
  };

  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  const filteredTeam = team.filter(member => 
    member.name.includes(searchQuery) || member.roleTitle.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">إدارة الفريق والصلاحيات</h2>
          <p className="text-sm text-muted-foreground mt-1">أضف المحامين والموظفين، وحدد صلاحيات وصول كل منهم لملفات المكتب بنظام الدعوات.</p>
        </div>
        {isAdminOrOwner && (
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2 shadow-sm">
            <UserPlus className="h-4 w-4" /> {showAddForm ? 'إلغاء' : 'إضافة عضو جديد'}
          </Button>
        )}
      </div>

      {!isAdminOrOwner && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md p-3 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          أنت الآن بوضعية المشاهدة فقط (زائر أو محامي). لتجربة زر الإضافة وإدارة الصلاحيات، اضغط على اسمك بالأعلى واختر حساب "مدير المكتب".
        </div>
      )}

      {showAddForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> إرسال دعوة انضمام للمكتب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الاسم الرباعي</label>
                <Input placeholder="مثال: علي محمد محمود" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <Input type="email" placeholder="ali@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">المسمى الوظيفي</label>
                <Input placeholder="مثال: محامي ابتدائي" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">مستوى الصلاحية والمشاهدة</label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="lawyer">محدود (يرى المهام والجلسات الموكلة له فقط)</option>
                  <option value="admin">إداري (يرى المهام الإدارية ولا يرى المالية)</option>
                  <option value="owner">شريك / مدير (صلاحيات كاملة للمنصة)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>إلغاء</Button>
              <Button onClick={() => setShowAddForm(false)}>إرسال رابط الدعوة</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1 font-medium">
              <Lock className="h-3 w-3" /> سيتم إرسال رابط تسجيل مؤمن لبريده الإلكتروني؛ ليقوم بتعيين كلمة المرور الخاصة به.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="p-4 border-b flex justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ابحث بالاسم أو المسمى الوظيفي..." 
              className="pr-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">الموظف / المحامي</th>
                <th className="p-4 font-medium">نوع الصلاحية</th>
                <th className="p-4 font-medium">بيانات التواصل</th>
                <th className="p-4 font-medium text-center">حالة الحساب</th>
                <th className="p-4 font-medium text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTeam.map(member => (
                <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-base">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.roleTitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {member.role === 'owner' && <Shield className="h-4 w-4 text-indigo-500" />}
                      {member.role === 'lawyer' && <Briefcase className="h-4 w-4 text-blue-500" />}
                      {member.role === 'admin' && <User className="h-4 w-4 text-emerald-500" />}
                      <span className="font-medium text-sm">
                        {member.role === 'owner' ? 'إدارة كاملة' : member.role === 'admin' ? 'إدارة وسكرتارية' : 'وصول محدود'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                       <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {member.email}</span>
                       <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {member.phone}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {member.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold dark:bg-emerald-900/50 dark:text-emerald-400">
                         <CheckCircle2 className="h-3 w-3" /> نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold dark:bg-slate-800 dark:text-slate-400">
                         <AlertCircle className="h-3 w-3" /> موقوف
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {isAdminOrOwner && member.role !== 'owner' ? (
                      <ActionMenu member={member} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
