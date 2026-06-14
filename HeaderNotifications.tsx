import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeaderNotifications() {
  const [hasUnread, setHasUnread] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setHasUnread(false);
  };

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" className="relative mr-2" onClick={toggle}>
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
        )}
      </Button>
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-background border shadow-md rounded-md z-50">
          <div className="p-3 border-b font-semibold">التنبيهات والإشعارات</div>
          <div className="max-h-[300px] overflow-y-auto">
            <div className="p-3 border-b hover:bg-muted/50 transition-colors">
              <p className="text-sm font-medium text-destructive">مهمة إدارية متأخرة</p>
              <p className="text-xs text-muted-foreground mt-1">يجب استخراج صورة رسمية من محضر جلسة أمس (125/2024)</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">منذ ساعتين</p>
            </div>
            <div className="p-3 border-b hover:bg-muted/50 transition-colors">
              <p className="text-sm font-medium text-amber-600">تذكير بجلسة غداً</p>
              <p className="text-xs text-muted-foreground mt-1">لديك جلسة غداً في محكمة القاهرة الجديدة (قضية 142/2024)</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">منذ 5 ساعات</p>
            </div>
            <div className="p-3 hover:bg-muted/50 transition-colors">
              <p className="text-sm font-medium">تم سداد دفعة أتعاب</p>
              <p className="text-xs text-muted-foreground mt-1">تم سداد مبلغ 50,000 ج.م من الموكل شركة النيل للتجارة</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">أمس</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
