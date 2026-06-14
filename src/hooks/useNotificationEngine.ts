import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNotificationStore } from '@/store/useNotificationStore';

export function useNotificationEngine() {
  const addNotification = useNotificationStore(state => state.addNotification);
  const notifications = useNotificationStore(state => state.notifications);

  // جلب التنبيهات من الباكند
  const { data: alerts = [] } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async () => {
      const res = await api.get('/dashboard/alerts');
      return res.data.data || [];
    },
    refetchInterval: 5 * 60 * 1000, // تحديث كل 5 دقائق
    staleTime: 3 * 60 * 1000,
  });

  useEffect(() => {
    if (!alerts || alerts.length === 0) return;

    alerts.forEach((alert: any) => {
      // تحويل نوع التنبيه من الباكند لنوع الفرونت
      const type = mapAlertType(alert.type);
      
      // تحقق إن الإشعار مش موجود خلاص
      const alreadyExists = notifications.some(
        n => n.type === type && n.title === alert.title && n.message === alert.message
      );
      if (alreadyExists) return;

      addNotification({
        type,
        title: alert.title,
        message: alert.message,
        caseId: alert.caseId,
      });
    });
  }, [alerts, addNotification, notifications]);
}

function mapAlertType(backendType: string) {
  switch (backendType) {
    case 'session_today': return 'session_today' as const;
    case 'upcoming_session': return 'session_week' as const;
    case 'overdue_invoices': return 'payment_due' as const;
    case 'pending_invoices': return 'payment_due' as const;
    default: return 'session_week' as const;
  }
}
