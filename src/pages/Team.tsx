import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search, Shield, User, Briefcase, Mail, Lock, CheckCircle2, AlertCircle, MoreVertical, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

function ActionMenu({ member, onDelete }: { member: any, onDelete: (id: string) => void }) {
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
            <button 
               onClick={() => { onDelete(member.id); setIsOpen(false); }}
               className="w-full text-right px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 rounded-sm transition-colors text-destructive"
            >
              <Trash2 className="h-4 w-4" /> إيقاف حساب
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Team() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: '',
    role: 'LAWYER'
  });

  const { data, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const res = await api.get('/auth/team');
      return res.data.data;
    }
  });

  const { mutate: addMember, isPending: isAdding } = useMutation({
    mutationFn: async () => {
      await api.post('/auth/team', newMember);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setShowAddForm(false);
      setNewMember({ name: '', email: '', password: '', role: 'LAWYER' });
    }
  });

  const { mutate: removeMember } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/auth/team/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من إيقاف هذا الحساب؟')) {
      removeMember(id);
    }
  };

  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';

  const team = data || [];
  const filteredTeam = team.filter((member: any) => 
    member.name.includes(searchQuery) || (member.role && member.role.includes(searchQuery))
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
        <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> إضافة عضو للفريق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الاسم الرباعي</label>
                <Input 
                  placeholder="مثال: علي محمد محمود" 
                  value={newMember.name} 
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <Input 
                  type="email" 
                  placeholder="ali@example.com" 
                  value={newMember.email} 
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور الافتراضية</label>
                <Input 
                  type="text" 
                  placeholder="كلمة المرور الأولية" 
                  value={newMember.password} 
                  onChange={e => setNewMember({ ...newMember, password: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">مستوى الصلاحية والمشاهدة</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newMember.role}
                  onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                >
                  <option value="LAWYER">محدود (محامي)</option>
                  <option value="SECRETARY">سكرتارية</option>
                  <option value="ADMIN">إداري (مدير فرعي)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>إلغاء</Button>
              <Button onClick={() => addMember()} disabled={isAdding}>
                {isAdding ? 'جاري الإضافة...' : 'إضافة للمكتب'}
              </Button>
            </div>
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
              {isLoading ? (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-muted-foreground">جاري تحميل الفريق...</td>
                 </tr>
              ) : filteredTeam.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-muted-foreground">لا يوجد أعضاء في الفريق مطابقين للبحث.</td>
                 </tr>
              ) : filteredTeam.map((member: any) => (
                <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 uppercase">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-base">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {member.role === 'OWNER' && <Shield className="h-4 w-4 text-indigo-500" />}
                      {member.role === 'LAWYER' && <Briefcase className="h-4 w-4 text-blue-500" />}
                      {(member.role === 'ADMIN' || member.role === 'SECRETARY') && <User className="h-4 w-4 text-emerald-500" />}
                      <span className="font-medium text-sm">
                        {member.role === 'OWNER' ? 'إدارة كاملة' : member.role === 'ADMIN' ? 'إدارة وسكرتارية' : member.role === 'SECRETARY' ? 'سكرتارية' : 'وصول محدود'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                       <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {member.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {member.isActive ? (
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
                    {isAdminOrOwner && member.role !== 'OWNER' && member.isActive ? (
                      <ActionMenu member={member} onDelete={handleDelete} />
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
