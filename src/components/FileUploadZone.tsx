import React, { useState } from 'react';
import { Paperclip, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function FileUploadZone({ onUpload, isUploading, error }: any) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await onUpload(e.target.files[0]);
      // إعادة تعيين قيمة input عشان يقبل يرفع نفس الملف مرة تانية لو اتحذف
      e.target.value = '';
    }
  };

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden",
          isDragging ? "border-primary bg-primary/10 scale-[1.01]" : "border-muted-foreground/30 hover:border-primary/50 bg-muted/10",
          error ? "border-destructive bg-destructive/5" : ""
        )}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          disabled={isUploading}
          title=""
        />
        
        <div className={cn(
          "bg-primary/10 p-4 rounded-full mb-4 text-primary transition-transform duration-300",
          isDragging ? "scale-110" : ""
        )}>
          {isUploading ? <UploadCloud className="h-8 w-8 animate-bounce" /> : <Paperclip className="h-8 w-8" />}
        </div>
        
        <h4 className="text-lg font-bold mb-2">
          {isUploading ? "جاري رفع الملف وتحويله..." : "اسحب الملفات هنا"}
        </h4>
        
        {!isUploading && (
          <>
            <p className="text-muted-foreground text-sm mb-4 font-semibold">أو</p>
            <Button variant="outline" className="relative pointer-events-none mb-4 gap-2 z-0 font-bold border-primary/20">
              <Paperclip className="h-4 w-4" /> اختر ملف من جهازك
            </Button>
            
            <div className="text-xs text-muted-foreground space-y-1 font-medium bg-background p-2 rounded-lg border">
              <p>مسموح فقط بصيغ: <strong className="text-foreground">PDF, DOC, DOCX, JPG, PNG</strong></p>
              <p>الحد الأقصى لحجم الملف الواحد: <strong className="text-foreground font-mono">10MB</strong></p>
            </div>
          </>
        )}
      </div>
      
      {error && (
        <p className="text-destructive text-sm font-semibold mt-3 text-center bg-destructive/10 py-2 rounded-md animate-in slide-in-from-top-1">{error}</p>
      )}
    </div>
  );
}
