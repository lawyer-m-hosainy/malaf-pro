import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useNotificationEngine } from '@/hooks/useNotificationEngine';
import { NotificationPanel } from '@/components/NotificationPanel';

export function HeaderNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // تشغيل محرك الإشعارات في الخلفية لإنشاء التنبيهات تلقائياً
  useNotificationEngine();
  
  const unreadCount = useNotificationStore(state => state.unreadCount);

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
  };

  return (
    <div className="relative" ref={ref}>
      <Button 
        variant="ghost" 
        size="icon" 
        className={`relative mr-2 transition-colors hover:bg-primary/10 ${isOpen ? 'bg-primary/10' : ''}`} 
        onClick={toggle}
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-primary animate-[wiggle_1s_ease-in-out_infinite]' : 'text-muted-foreground'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center border-2 border-background shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      
      {isOpen && <NotificationPanel onClose={() => setIsOpen(false)} />}
    </div>
  );
}
