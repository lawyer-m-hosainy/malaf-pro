import { Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FileList({ files, onRemove, getIcon }: any) {
  if (!files || files.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed rounded-xl bg-muted/10 text-muted-foreground animate-in fade-in">
        <p className="font-semibold text-base">لا توجد مستندات مرفقة بهذه القضية</p>
        <p className="text-sm mt-1">قم بسحب الملفات إلى المنطقة العلوية أو اضغط لاختيار ملف</p>
      </div>
    );
  }

  const handleDownload = (file: any) => {
    if (file.url || file.filePath) {
      const link = document.createElement('a');
      link.href = file.url || file.filePath;
      link.download = file.name || file.title || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-3">
      {files.map((file: any) => {
        const Icon = getIcon(file.type);
        return (
          <div key={file.id} className="flex items-center justify-between p-4 border rounded-xl bg-card hover:shadow-md transition-all group animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="h-10 w-10 shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center border border-primary/20">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate text-foreground" title={file.name || file.title}>{file.name || file.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-medium">
                  {file.size && <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]" dir="ltr">{formatSize(file.size)}</span>}
                  <span>•</span>
                  <span>تم الرفع: {formatDate(file.uploadedAt || file.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 pl-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDownload(file)} 
                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="تحميل المستند"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من حذف هذا المستند نهائياً؟')) {
                    onRemove(file.id);
                  }
                }} 
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="حذف المستند"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
