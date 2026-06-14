import { useState } from 'react';
import { FileText, Image as ImageIcon, FileArchive, FileType } from 'lucide-react';
import { UploadedFile, useLocalStore } from '@/store/useLocalStore';

export function useFileUpload(caseId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFile = useLocalStore(state => state.addFile);
  const removeFile = useLocalStore(state => state.removeFile);
  const files = useLocalStore(state => state.getFilesByCaseId(caseId));

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    // التحقق من النوع: pdf, doc, docx, jpg, png فقط
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'image/jpeg', 
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('نوع الملف غير مدعوم. مسموح فقط بـ PDF, DOC, DOCX, JPG, PNG');
      setIsUploading(false);
      return;
    }

    // التحقق من الحجم: أقصى 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('حجم الملف يجب ألا يتجاوز 10 ميجابايت');
      setIsUploading(false);
      return;
    }

    try {
      // حوّل لـ base64 واحفظه في state مؤقتاً لحد ما يجي الباك اند
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const newFile: UploadedFile = {
        id: `FILE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: base64Url,
        uploadedAt: new Date().toISOString(),
        caseId: caseId
      };

      addFile(newFile);
    } catch (err) {
      setError('حدث خطأ أثناء قراءة الملف أو تحويله');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return ImageIcon;
    if (type.includes('word') || type.includes('document')) return FileType;
    return FileArchive;
  };

  return { files, isUploading, error, uploadFile, removeFile, getFileIcon };
}
