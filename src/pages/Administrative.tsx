import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FolderOpen, Calendar, Clock, CheckCircle2, User, AlertCircle, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function Administrative() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');
  const [assigneeFilter, setAssigneeFilter] = useState('الجميع');
  const [dateFilter, setDateFilter] = useState('الجميع');

  const { data: rawTasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get('/tasks');
      return res.data.data;
    }
  });

  const tasks = rawTasks.map((t: any) => ({
    ...t,
    assigneeName: t.assignee?.name || 'غير معين',
  }));

  const uniqueAssignees = Array.from(new Set(tasks.map((t: any) => t.assigneeName))) as string[];

  const filteredTasks = tasks.filter((t: any) => {
    if (user?.role === 'LAWYER' && t.assigneeId !== user.id) return false;

    const matchesSearch = t.title.includes(searchQuery) || t.assigneeName.includes(searchQuery);
    const matchesAssignee = assigneeFilter === 'الجميع' || t.assigneeName === assigneeFilter;

    let matchesDate = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = t.dueDate ? new Date(t.dueDate) : null;
    if (dueDate) dueDate.setHours(0, 0, 0, 0);

    if (dateFilter === 'today' && dueDate) {
      matchesDate = dueDate.getTime() === today.getTime();
    } else if (dateFilter === 'thisWeek' && dueDate) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      matchesDate = dueDate >= today && dueDate <= nextWeek;
    } else if (dateFilter === 'overdue' && dueDate) {
      matchesDate = dueDate < today && t.status !== 'COMPLETED';
    } else if (dateFilter !== 'الجميع' && !dueDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesAssignee && matchesDate;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400';
      case 'LOW': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'عاجل جداً';
      case 'HIGH': return 'هام';
      case 'MEDIUM': return 'متوسط';
      case 'LOW': return 'عادي';
      default: return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'مطلوبة';
      case 'IN_PROGRESS': return 'جاري العمل';
      case 'COMPLETED': return 'مكتملة';
      case 'CANCELLED': return 'ملغاة';
      default: return status;
    }
  };

  const pendingTasks = filteredTasks.filter((t: any) => t.status === 'PENDING');
  const inProgressTasks = filteredTasks.filter((t: any) => t.status === 'IN_PROGRESS');
  const completedTasks = filteredTasks.filter((t: any) => t.status === 'COMPLETED');

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/tasks/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatus({ id, status: newStatus });
  };

  const renderTaskCard = (task: any) => (
    <Card key={task.id} className="mb-3 hover:shadow-md transition-all border-r-4 border-r-primary">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", getPriorityColor(task.priority))}>
            {getPriorityLabel(task.priority)}
          </span>
          <h4 className="font-bold text-sm leading-tight text-right flex-1 mr-2">{task.title}</h4>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
        )}

        <div className="flex justify-between items-center mt-3 pt-3 border-t">
          <select
            className="text-xs bg-muted border-none rounded px-2 py-1 outline-none"
            value={task.status}
            onChange={(e) => handleStatusChange(task.id, e.target.value)}
          >
            <option value="PENDING">مطلوبة</option>
            <option value="IN_PROGRESS">جاري العمل</option>
            <option value="COMPLETED">مكتملة</option>
          </select>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" /> {task.assigneeName}
            </span>
            {task.dueDate && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                <Calendar className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString('ar-EG')}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderColumn = (title: string, tasks: any[], icon: React.ReactNode, bgClass: string, borderClass: string) => (
    <div className={cn("rounded-lg p-4 border flex flex-col h-full", bgClass, borderClass)}>
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <span className="bg-background/80 text-foreground text-xs font-bold px-2 py-1 rounded-full">{tasks.length}</span>
        <h3 className="font-bold flex items-center gap-2">{icon} {title}</h3>
      </div>
      <div className="flex-1 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground text-sm">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
            لا توجد مهام
          </div>
        ) : tasks.map(renderTaskCard)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">إدارة المهام والأعمال الإدارية</h2>
          <p className="text-sm text-muted-foreground mt-1">تتبع مهام المحامين والمندوبين، الإعلانات، المحضرين، واستخراج المستندات.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 shadow-sm print:hidden" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> طباعة
          </Button>
          {isAdminOrOwner && (
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> إضافة مهمة جديدة
            </Button>
          )}
        </div>
      </div>

      <Card className="print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full lg:w-auto">
              <Button variant={activeTab === 'board' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('board')} className="w-28">لوحة (Kanban)</Button>
              <Button variant={activeTab === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('list')} className="w-20">قائمة</Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1 justify-end">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="بحث في المهام..." className="pr-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>

              {isAdminOrOwner && (
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full sm:w-40"
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                >
                  <option value="الجميع">كل الموظفين</option>
                  {uniqueAssignees.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              )}

              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full sm:w-40"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="الجميع">كل المواعيد</option>
                <option value="today">مطلوبة اليوم</option>
                <option value="thisWeek">هذا الأسبوع</option>
                <option value="overdue">متأخرة</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center p-10 text-muted-foreground">جاري تحميل المهام...</div>
      ) : activeTab === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderColumn(
            'مطلوبة (To Do)', pendingTasks,
            <Clock className="h-4 w-4 text-slate-500" />,
            'bg-muted/30', 'border-slate-200 dark:border-slate-800'
          )}
          {renderColumn(
            'جاري العمل (In Progress)', inProgressTasks,
            <AlertCircle className="h-4 w-4 text-blue-500" />,
            'bg-blue-50/50 dark:bg-blue-950/10', 'border-blue-100 dark:border-blue-900'
          )}
          {renderColumn(
            'مكتملة (Done)', completedTasks,
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
            'bg-emerald-50/50 dark:bg-emerald-950/10', 'border-emerald-100 dark:border-emerald-900'
          )}
        </div>
      ) : (
        <Card>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="border-b">
                  <th className="p-4 font-medium">المهمة</th>
                  <th className="p-4 font-medium">المسؤول</th>
                  <th className="p-4 font-medium text-center">الموعد النهائي</th>
                  <th className="p-4 font-medium text-center">الأهمية</th>
                  <th className="p-4 font-medium text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTasks.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد مهام</td></tr>
                ) : filteredTasks.map((task: any) => (
                  <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-base">{task.title}</p>
                      {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>}
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <User className="h-4 w-4 text-muted-foreground" /> {task.assigneeName}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn("text-xs px-2 py-1 rounded-full border font-semibold inline-block", getPriorityColor(task.priority))}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <select
                        className="text-sm border rounded px-2 py-1.5 outline-none font-medium bg-background"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="PENDING">مطلوبة</option>
                        <option value="IN_PROGRESS">جاري العمل</option>
                        <option value="COMPLETED">مكتملة</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
