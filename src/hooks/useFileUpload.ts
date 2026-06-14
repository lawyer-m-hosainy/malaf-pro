import { useState } from 'react';
import { FileText, Image as ImageIcon, FileArchive, FileType } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useFileUpload(caseId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // جلب الملفات المرفوعة من الباكند
  const { data: files = [] } = useQuery({
    queryKey: ['documents', caseId],
    queryFn: async () => {
      const res = await api.get('/documents', { params: { caseId } });
      return res.data.data || [];
    },
    enabled: !!caseId,
  });

  // حذف ملف
  const { mutate: removeFile } = useMutation({
    mutationFn: async (fileId: string) => {
      await api.delete(`/documents/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', caseId] });
    }
  });

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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', caseId);
      formData.append('title', file.name);
      formData.append('type', getDocType(file.type));

      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      queryClient.invalidateQueries({ queryKey: ['documents', caseId] });
    } catch (err) {
      setError('حدث خطأ أثناء رفع الملف');
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

function getDocType(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'WORD';
  if (mimeType.includes('image')) return 'IMAGE';
  return 'OTHER';
}
