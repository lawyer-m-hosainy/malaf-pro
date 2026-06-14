import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types";

export function HeaderUserMenu() {
  const { user, login } = useAuthStore();
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

  const handleSwitchUser = (role: UserRole, name: string) => {
    login({
      id: role,
      name: name,
      email: `${role}@lawfirm.com`,
      role: role,
      organizationId: 'org-1'
    });
    setIsOpen(false);
  };

  const currentRoleName = user?.role === 'admin' ? 'مدير المكتب' : user?.role === 'lawyer' ? 'محامي/مندوب' : 'مستخدم';
  const currentTitle = user?.name || 'زائر (اضغط للتسجيل)';

  return (
    <div className="relative" ref={ref}>
      <div 
        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-sm hidden sm:block text-right">
          مرحباً، <span className="font-semibold">{currentTitle}</span>
          <span className="block text-[10px] text-muted-foreground">{currentRoleName}</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
          {currentTitle.charAt(0)}
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-background border shadow-md rounded-md z-50 text-right overflow-hidden">
          <div className="p-3 border-b font-semibold text-sm">الحساب الحالي</div>
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">
            تبديل الصلاحيات (Role Testing)
          </div>
          <div 
             className="px-3 py-2 border-b cursor-pointer hover:bg-muted/50 transition-colors"
             onClick={() => handleSwitchUser('admin', 'أ. محمد الحسيني')}
          >
            <div className="flex flex-col">
              <span className="font-medium text-sm">أ. محمد الحسيني</span>
              <span className="text-[10px] text-muted-foreground">مدير المكتب (يرى جميع الملفات والمهام)</span>
            </div>
          </div>
          <div 
             className="px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
             onClick={() => handleSwitchUser('lawyer', 'أحمد (المندوب)')}
          >
            <div className="flex flex-col">
              <span className="font-medium text-sm">أحمد</span>
               <span className="text-[10px] text-muted-foreground">محامي / مندوب (يرى مهامه وجلساته فقط)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
