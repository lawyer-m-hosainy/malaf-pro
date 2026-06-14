import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 
  | 'session_today'
  | 'session_tomorrow'
  | 'session_week'
  | 'payment_due'
  | 'case_updated';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  caseId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (n) => set((state) => {
        const newNotif: AppNotification = {
          ...n,
          id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        const newNotifications = [newNotif, ...state.notifications];
        return {
          notifications: newNotifications,
          unreadCount: newNotifications.filter(x => !x.isRead).length
        };
      }),
      markAsRead: (id) => set((state) => {
        const newNotifications = state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: newNotifications,
          unreadCount: newNotifications.filter(x => !x.isRead).length
        };
      }),
      markAllAsRead: () => set((state) => {
        const newNotifications = state.notifications.map(n => ({ ...n, isRead: true }));
        return {
          notifications: newNotifications,
          unreadCount: 0
        };
      }),
      removeNotification: (id) => set((state) => {
        const newNotifications = state.notifications.filter(n => n.id !== id);
        return {
          notifications: newNotifications,
          unreadCount: newNotifications.filter(x => !x.isRead).length
        };
      }),
      clearAll: () => set({ notifications: [], unreadCount: 0 })
    }),
    {
      name: 'malaf-notifications',
    }
  )
);
