import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { LogOut, User, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeaderUserMenu() {
  const { user, logout } = useAuthStore();
  const { settings } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleName = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'OWNER': return 'مالك المكتب';
      case 'ADMIN': return 'مدير المكتب';
      case 'LAWYER': return 'محامي';
      case 'SECRETARY': return 'سكرتارية';
      default: return 'مستخدم';
    }
  };

  const currentTitle = user?.name || 'مستخدم';
  const officeName = settings.officeName || 'مكتب المحامي';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <div 
        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-sm hidden sm:block text-right">
          <span className="block font-semibold">{currentTitle}</span>
          <span className="block text-[10px] text-muted-foreground">{officeName} - {getRoleName(user?.role)}</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
          {currentTitle.charAt(0)}
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-background border shadow-lg rounded-lg z-50 text-right overflow-hidden">
          {/* User Info */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
                {currentTitle.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{currentTitle}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary font-medium">{getRoleName(user?.role)}</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              className="w-full px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-muted/50 transition-colors"
              onClick={() => { navigate('/dashboard/settings'); setIsOpen(false); }}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              إعدادات المكتب
            </button>
            
            <div className="border-t my-1" />
            
            <button
              className="w-full px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-destructive/10 text-destructive transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
