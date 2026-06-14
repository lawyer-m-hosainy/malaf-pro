import { useEffect } from 'react';
import { useLocalStore } from '@/store/useLocalStore';
import { useNotificationStore, NotificationType } from '@/store/useNotificationStore';

export function useNotificationEngine() {
  const cases = useLocalStore(state => state.cases);
  const finance = useLocalStore(state => state.finance);
  const addNotification = useNotificationStore(state => state.addNotification);
  const notifications = useNotificationStore(state => state.notifications);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // إشعارات الجلسات
    cases.forEach(c => {
      if (!c.nextSession || c.nextSession === '-' || c.nextSession === 'يحدد لاحقاً') return;
      
      const sessionDate = new Date(c.nextSession);
      sessionDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil(
        (sessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // لا ترسل إشعار لجلسة مرت ولا لجلسة بعيدة جداً
      if (diffDays < 0 || diffDays > 7) return;

      const type = getSessionType(diffDays);
      
      // تحقق إن الإشعار ده مش موجود خلاص لنفس القضية ونفس النوع
      const alreadyExists = notifications.some(
        n => n.caseId === c.id && n.type === type
      );
      if (alreadyExists) return;

      if (diffDays === 0) {
        addNotification({
          type: 'session_today',
          title: 'جلسة اليوم',
          message: `قضية "${c.title}" لديها جلسة اليوم.`,
          caseId: c.id,
        });
      } else if (diffDays === 1) {
        addNotification({
          type: 'session_tomorrow',
          title: 'جلسة غداً',
          message: `قضية "${c.title}" لديها جلسة غداً.`,
          caseId: c.id,
        });
      } else {
        addNotification({
          type: 'session_week',
          title: 'جلسة قريبة',
          message: `قضية "${c.title}" لديها جلسة بعد ${diffDays} أيام.`,
          caseId: c.id,
        });
      }
    });

    // إشعارات الأتعاب المستحقة
    finance
      .filter(f => f.status === 'pending')
      .forEach(f => {
        const alreadyExists = notifications.some(
          n => n.caseId === f.caseId && n.type === 'payment_due'
        );
        if (alreadyExists) return;
        
        addNotification({
          type: 'payment_due',
          title: 'أتعاب مستحقة',
          message: `الموكل ${f.client} عليه مبلغ مستحق ${f.amount.toLocaleString()} ج.م.`,
          caseId: f.caseId,
        });
      });

  }, [cases, finance, addNotification, notifications]);
}

function getSessionType(diffDays: number): NotificationType {
  if (diffDays === 0) return 'session_today';
  if (diffDays === 1) return 'session_tomorrow';
  return 'session_week';
}
