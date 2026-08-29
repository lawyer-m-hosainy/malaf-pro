import { Link } from 'react-router-dom';
import { CheckSquare, FolderOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TASK_PRIORITY_BADGE_CLASS } from '@/lib/labels';

export function CaseTasks({ tasks }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" /> الشغل الإداري والمهام المطلوبة من الفريق
        </h3>
        <Link to="/dashboard/administrative">
          <Button size="sm" className="gap-2 font-bold shadow-sm"><FolderOpen className="h-4 w-4" /> إدارة كافة المهام</Button>
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/10 text-muted-foreground">
          لا توجد مهام مرتبطة بهذه القضية بعد. أضف مهمة من صفحة "الشغل الإداري" واختر هذه القضية.
        </div>
      ) : (
        <Card>
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="border-b">
                  <th className="p-4 font-medium">حالة المهمة</th>
                  <th className="p-4 font-medium">وصف التكليف / الشغل الإداري</th>
                  <th className="p-4 font-medium">تاريخ الاستحقاق</th>
                  <th className="p-4 font-medium">المكلف بها</th>
                  <th className="p-4 font-medium">الأولوية</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task: any) => (
                <tr key={task.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4">
                    {task.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> {task.statusLabel}</span>
                    ) : task.status === 'IN_PROGRESS' ? (
                      <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full text-xs font-medium"><Clock className="h-3.5 w-3.5" /> {task.statusLabel}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full text-xs font-medium"><AlertCircle className="h-3.5 w-3.5" /> {task.statusLabel}</span>
                    )}
                  </td>
                  <td className="p-4 font-medium">{task.title}</td>
                  <td className="p-4 font-mono text-xs">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-EG') : '-'}</td>
                  <td className="p-4 text-xs font-medium">{task.assigneeName}</td>
                  <td className="p-4">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", TASK_PRIORITY_BADGE_CLASS[task.priority])}>
                      {task.priorityLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
