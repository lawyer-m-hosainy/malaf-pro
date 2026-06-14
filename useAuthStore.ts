import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const rolePermissions: Record<string, string[]> = {
  admin: ['*'],
  partner: ['*'],
  lawyer: [
    'view_cases', 'edit_cases', 'view_clients', 'edit_clients', 
    'legal_qa', 'conflict_check', 'org_admin', 'view_reports', 
    'documents', 'view_calendar', 'view_tasks', 'finance_basic', 'view_wiki'
  ],
  secretary: [
    'view_clients', 'edit_clients', 'view_cases', 'documents', 
    'finance_basic', 'view_calendar', 'view_tasks'
  ],
  client: ['view_own_cases']
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        
        const userPermissions = rolePermissions[user.role] || [];
        if (userPermissions.includes('*')) return true;
        
        return userPermissions.includes(permission);
      },
    }),
    {
      name: 'malaf-auth-storage',
    }
  )
);
