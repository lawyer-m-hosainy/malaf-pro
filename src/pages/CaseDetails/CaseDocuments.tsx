import { FileArchive } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FileUploadZone } from '@/components/FileUploadZone';
import { FileList } from '@/components/FileList';

export function CaseDocuments({ caseId }: { caseId: string }) {
  const { files, isUploading, error, uploadFile, removeFile, getFileIcon } = useFileUpload(caseId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileArchive className="h-5 w-5 text-primary" /> إدارة مستندات ومرفقات القضية
        </h3>
      </div>

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
