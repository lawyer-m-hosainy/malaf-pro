import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FolderArchive, FileText, Download, UploadCloud, FolderOpen, Printer, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

const initialDocs = [
  { id: 'DOC-1', caseId: 'C-2024-001', internalId: '125/2024', name: 'صحيفة الدعوى الأصلية.pdf', type: 'مستند قضائي', date: '2024-06-01', size: '2.4 MB' },
  { id: 'DOC-2', caseId: 'C-2024-001', internalId: '125/2024', name: 'توكيل العميل (خاص).pdf', type: 'توكيلات', date: '2024-06-02', size: '1.1 MB' },
  { id: 'DOC-3', caseId: 'C-2024-003', internalId: '127/2024', name: 'تقرير مصلحة الخبراء المبدئي.pdf', type: 'تقارير', date: '2024-06-10', size: '4.5 MB' },
  { id: 'DOC-4', caseId: 'C-2024-002', internalId: '126/2024', name: 'مسودة مذكرة الدفاع (تحت المراجعة).docx', type: 'مذكرات دفاع', date: '2024-06-14', size: '0.8 MB' },
];

export default function Archive() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">الأرشيف والمستندات (Cloud Storage)</h2>
          <p className="text-sm text-muted-foreground mt-1">السجل المركزي والمكتبة لجميع ملفات ومستندات وصيغ المكتب</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" className="gap-2 shadow-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> طباعة
          </Button>
          {isAdminOrOwner && (
            <div className="relative">
              <Input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    // For now, just logging or we could add a toast here
                    console.log('File selected:', e.target.files[0].name);
                    // Reset input so the same file could be selected again if needed
                    e.target.value = '';
                    alert('تم اختيار الملف. (هذه محاكاة لعملية الرفع)');
                  }
                }}
              />
              <Button className="gap-2 shadow-sm pointer-events-none">
                <UploadCloud className="h-4 w-4" /> رفع ملف / حفظ مستند
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         {['التوكيلات الرسمية', 'مذكرات الدفاع', 'صحف الدعاوى والصيغ', 'أحكام سابقة وقضايا'].map((folder) => (
           <Card key={folder} className="cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
             <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
               <FolderOpen className="h-8 w-8 text-primary/70 mb-2" />
               <span className="font-bold text-sm">{folder}</span>
             </CardContent>
           </Card>
         ))}
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
           <div className="relative max-w-md w-full">
             <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input placeholder="بحث باسم المستند، نوعه، أو رقم أرشيف القضية..." className="pr-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground">
               <tr className="border-b">
                  <th className="p-4 font-medium w-12"></th>
                  <th className="p-4 font-medium">اسم المستند والملف</th>
                  <th className="p-4 font-medium">مرتبط بقضية</th>
                  <th className="p-4 font-medium">التصنيف</th>
                  <th className="p-4 font-medium text-center">التاريخ / الحجم</th>
                  <th className="p-4 font-medium text-center">الإجراء</th>
               </tr>
            </thead>
            <tbody>
               {initialDocs.map(doc => (
                 <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/50">
                   <td className="p-4 text-center">
                     <FileText className="h-6 w-6 text-indigo-400 mx-auto" />
                   </td>
                   <td className="p-4">
                      <p className="font-bold text-sm break-words max-w-[200px]" dir="ltr">{doc.name}</p>
                   </td>
                   <td className="p-4">
                     <span className="bg-muted px-2 py-0.5 rounded font-mono text-xs font-bold border border-border/50">{doc.internalId}</span>
                   </td>
                   <td className="p-4 font-semibold text-muted-foreground text-xs">
                      {doc.type}
                   </td>
                   <td className="p-4 text-center">
                      <p className="font-mono text-xs text-foreground mb-1">{doc.date}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.size}</p>
                   </td>
                   <td className="p-4 text-center space-x-1 space-x-reverse flex justify-center items-center">
                     <Button size="icon" variant="outline" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                       <Download className="h-4 w-4" />
                     </Button>
                     {isAdminOrOwner && (
                       <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                         <Trash className="h-4 w-4" />
                       </Button>
                     )}
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
