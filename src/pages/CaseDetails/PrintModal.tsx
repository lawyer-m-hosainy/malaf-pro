import { Printer, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PrintModal({ state, handlers }: any) {
  if (!state.isPrintModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-background rounded-xl shadow-2xl overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" /> خيارات طباعة الملف المقروء
            </h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => handlers.setIsPrintModalOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
        </div>
        <div className="p-5">
            <p className="text-sm font-semibold text-muted-foreground mb-4 border-r-2 border-primary pr-2">حدد محتويات وأجزاء ملف القضية المراد إدراجها في التقرير المطبوع:</p>
            <div className="space-y-2">
              {[
                { key: 'cover', label: 'البيانات الأساسية وغلاف الملف (ديباجة)' },
                { key: 'degrees', label: 'تسلسل درجات التقاضي' },
                { key: 'timeline', label: 'الخط الزمني (طابور سير الدعوى)' },
                { key: 'sessions', label: 'أجندة رول الجلسات المنعقدة' },
                { key: 'tasks', label: 'المهام الإدارية ومتطلبات القضية' },
                { key: 'docs', label: 'فهرس المرفقات وحوافظ المستندات' },
                { key: 'finance', label: 'كشف الحساب المالي (رسوم وأتعاب)' },
              ].map(opt => (
                <label key={opt.key} className="flex items-center justify-between p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/50 transition-all select-none">
                    <span className={cn("text-sm transition-colors", state.printSections[opt.key as keyof typeof state.printSections] ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>{opt.label}</span>
                    <div 
                      className={cn("h-5 w-5 rounded border flex items-center justify-center transition-all shadow-sm ring-offset-background", state.printSections[opt.key as keyof typeof state.printSections] ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background opacity-60")}
                      onClick={(e) => { e.preventDefault(); handlers.togglePrintSection(opt.key); }}
                    >
                      {state.printSections[opt.key as keyof typeof state.printSections] && <Check className="h-3.5 w-3.5" />}
                    </div>
                </label>
              ))}
            </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-3 bg-muted/20">
            <Button type="button" variant="outline" className="font-semibold" onClick={() => handlers.setIsPrintModalOpen(false)}>إلغاء النافذة</Button>
            <Button type="button" onClick={handlers.handlePrint} className="gap-2 font-bold shadow-md"><Printer className="h-4 w-4" /> تأكيد الطباعة</Button>
        </div>
      </div>
    </div>
  );
}
