import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FolderArchive, FileText, Download, UploadCloud, FolderOpen, Printer, Trash, FileImage, FileCode, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function Archive() {
  const { user } = useAuthStore();
  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['documents', searchQuery],
    queryFn: async () => {
      const res = await api.get('/documents', { params: { search: searchQuery } });
      return res.data.data; // array of documents
    }
  });

  const { mutate: uploadFile, isPending: isUploading } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      alert('تم رفع المستند بنجاح');
    },
    onError: () => {
      alert('حدث خطأ أثناء رفع المستند');
    }
  });

  const { mutate: deleteFile, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const handleDownload = async (id: string, filename: string) => {
    try {
      const res = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert('حدث خطأ أثناء تحميل المستند');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستند نهائياً؟')) {
      deleteFile(id);
    }
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'image': return <FileImage className="h-6 w-6 text-pink-500 mx-auto" />;
      case 'pdf': return <FileText className="h-6 w-6 text-red-500 mx-auto" />;
      case 'word': return <FileText className="h-6 w-6 text-blue-500 mx-auto" />;
      case 'excel': return <FileSpreadsheet className="h-6 w-6 text-emerald-500 mx-auto" />;
      default: return <FileCode className="h-6 w-6 text-slate-500 mx-auto" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
                disabled={isUploading}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    uploadFile(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
              />
              <Button className="gap-2 shadow-sm pointer-events-none" disabled={isUploading}>
                <UploadCloud className="h-4 w-4" /> {isUploading ? 'جاري الرفع...' : 'رفع ملف / حفظ مستند'}
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
             <Input placeholder="بحث باسم المستند، نوعه..." className="pr-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground">
               <tr className="border-b">
                  <th className="p-4 font-medium w-12"></th>
                  <th className="p-4 font-medium">اسم المستند والملف</th>
                  <th className="p-4 font-medium">مرتبط بقضية</th>
                  <th className="p-4 font-medium text-center">التاريخ / الحجم</th>
                  <th className="p-4 font-medium text-center">الإجراء</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">جاري تحميل المستندات...</td>
                  </tr>
               ) : !data || data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد مستندات مسجلة أو مطابقة للبحث.</td>
                  </tr>
               ) : data.map((doc: any) => (
                 <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/50">
                   <td className="p-4 text-center">
                     {getFileIcon(doc.type)}
                   </td>
                   <td className="p-4">
                      <p className="font-bold text-sm break-words max-w-[200px]" dir="ltr">{doc.title}</p>
                   </td>
                   <td className="p-4">
                     {doc.case ? (
                        <span className="bg-muted px-2 py-0.5 rounded font-mono text-xs font-bold border border-border/50">{doc.case.caseNumber}</span>
                     ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                     )}
                   </td>
                   <td className="p-4 text-center">
                      <p className="font-mono text-xs text-foreground mb-1">{new Date(doc.createdAt).toLocaleDateString('ar-EG')}</p>
                      <p className="text-[10px] text-muted-foreground">{formatSize(doc.fileSize || 0)}</p>
                   </td>
                   <td className="p-4 text-center space-x-1 space-x-reverse flex justify-center items-center">
                     <Button size="icon" variant="outline" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleDownload(doc.id, doc.title)}>
                       <Download className="h-4 w-4" />
                     </Button>
                     {isAdminOrOwner && (
                       <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(doc.id)}>
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
