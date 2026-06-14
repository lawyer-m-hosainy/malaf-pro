import { X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore, AppNotification } from '@/store/useNotificationStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'منذ لحظات';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return 'منذ يوم';
  if (days === 2) return 'منذ يومين';
  if (days <= 10) return `منذ ${days} أيام`;
  
  return `منذ ${days} يوماً`;
}

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();

  const handleNotificationClick = (n: AppNotification) => {
    markAsRead(n.id);
    if (n.caseId) {
      navigate(`/dashboard/cases/${n.caseId}`);
      onClose();
    }
  };

  const getTypeDotColor = (type: string) => {
    switch(type) {
      case 'session_today': return 'bg-destructive';
      case 'session_tomorrow': return 'bg-amber-500';
      case 'session_week': return 'bg-blue-500';
      case 'payment_due': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="absolute top-full mt-2 left-0 sm:left-auto sm:-right-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-background border shadow-2xl rounded-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2">
      <div className="p-3 border-b flex items-center justify-between bg-muted/30">
        <span className="font-bold text-sm">الإشعارات والتنبيهات</span>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 text-xs text-primary hover:bg-primary/10 transition-colors">
            <Check className="h-3 w-3 ml-1" /> قراءة الكل
          </Button>
        )}
      </div>
      
      <div className="max-h-[350px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
            <span className="text-4xl mb-3 opacity-30 grayscale">📭</span>
            <p className="text-sm font-semibold">مفيش إشعارات جديدة</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={cn(
                "p-3 border-b last:border-0 relative transition-colors hover:bg-muted/50 cursor-pointer group flex items-start gap-3",
                n.isRead ? "opacity-70" : "bg-primary/5"
              )}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="mt-1.5 flex-shrink-0">
                <span className={cn(
                  "h-2.5 w-2.5 rounded-full block", 
                  getTypeDotColor(n.type), 
                  !n.isRead && "animate-pulse ring-2 ring-background shadow-sm"
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm truncate", !n.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
                  {n.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono bg-background w-fit px-1.5 py-0.5 rounded border border-border/50">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(n.id);
                }}
                title="مسح الإشعار"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
