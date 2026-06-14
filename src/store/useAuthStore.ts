import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const rolePermissions: Record<string, string[]> = {
  OWNER: ['*'],
  ADMIN: ['*'],
  LAWYER: [
    'view_cases', 'edit_cases', 'view_clients', 'edit_clients', 
    'legal_qa', 'conflict_check', 'org_admin', 'view_reports', 
    'documents', 'view_calendar', 'view_tasks', 'finance_basic', 'view_wiki'
  ],
  SECRETARY: [
    'view_clients', 'edit_clients', 'view_cases', 'documents', 
    'finance_basic', 'view_calendar', 'view_tasks'
  ],
  CLIENT: ['view_own_cases']
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        
        // تحويل الرول للحالة الكبيرة للتوافق مع الباك إند القديم والجديد
        const role = user.role.toUpperCase();
        const userPermissions = rolePermissions[role] || [];
        
        if (userPermissions.includes('*')) return true;
        return userPermissions.includes(permission);
      },
    }),
    {
      name: 'malaf-auth-storage',
    }
  )
);

