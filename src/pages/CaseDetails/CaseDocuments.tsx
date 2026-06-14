import { FileArchive, AlertCircle } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FileUploadZone } from '@/components/FileUploadZone';
import { FileList } from '@/components/FileList';

export function CaseDocuments({ caseId }: { caseId: string }) {
  const { files, isUploading, error, uploadFile, removeFile, getFileIcon } = useFileUpload(caseId);

  // حساب الحجم لتنبيه المستخدم
  const totalSize = files.reduce((acc: number, f: any) => acc + f.size, 0);
  const isNearLimit = totalSize > 40 * 1024 * 1024; // > 40MB

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileArchive className="h-5 w-5 text-primary" /> إدارة مستندات ومرفقات القضية
        </h3>
      </div>

      {isNearLimit && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 p-3 rounded-lg flex items-start gap-3 text-sm font-medium animate-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>
            <strong className="block mb-1">تنبيه المساحة المتاحة!</strong>
            إجمالي حجم الملفات المرفوعة اقترب من الحد الأقصى المؤقت (50MB). 
            الملفات تُحفظ حالياً محلياً في المتصفح بصيغة Base64 مما يستهلك مساحة تخزين أكبر من الطبيعي.
            سيتم استبدال هذه الآلية لاحقاً لرفع الملفات بشكل مباشر وسريع على الخادم السحابي (Backend).
          </p>
        </div>
      )}

      <FileUploadZone onUpload={uploadFile} isUploading={isUploading} error={error} />
      
      <div className="pt-2">
        <h4 className="text-md font-bold mb-4 flex items-center gap-2">
          قائمة المستندات المرفوعة 
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{files.length}</span>
        </h4>
        <FileList files={files} onRemove={removeFile} getIcon={getFileIcon} />
      </div>
    </div>
  );
}
