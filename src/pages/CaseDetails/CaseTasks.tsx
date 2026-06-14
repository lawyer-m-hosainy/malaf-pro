import { Link } from 'react-router-dom';
import { CheckSquare, Plus, FolderOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CaseTasks({ tasks }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" /> الشغل الإداري والمهام المطلوبة من الفريق
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> تكليف جديد</Button>
          <Link to="/dashboard/administrative">
            <Button size="sm" className="gap-2 font-bold shadow-sm"><FolderOpen className="h-4 w-4" /> إدارة كافة المهام والمطبخ</Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <table className="w-full text-sm text-right">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr className="border-b">
                <th className="p-4 font-medium">حالة المهمة</th>
                <th className="p-4 font-medium">وصف التكليف / الشغل الإداري</th>
                <th className="p-4 font-medium">تاريخ الاستحقاق</th>
                <th className="p-4 font-medium">المكلف بها</th>
                <th className="p-4 font-medium">التصنيف</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task: any) => (
              <tr key={task.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-4">
                  {task.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> مكتملة</span>
                  ) : task.status === 'in-progress' ? (
                    <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full text-xs font-medium"><Clock className="h-3.5 w-3.5" /> جاري العمل</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full text-xs font-medium"><AlertCircle className="h-3.5 w-3.5" /> معلقة</span>
                  )}
                </td>
                <td className="p-4 font-medium">{task.title}</td>
                <td className="p-4 font-mono text-xs">{task.date}</td>
                <td className="p-4 text-xs font-medium">{task.assignee}</td>
                <td className="p-4 text-xs text-muted-foreground">{task.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
