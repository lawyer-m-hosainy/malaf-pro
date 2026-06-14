import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // بيانات المكتب
  officeName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  licenseNumber: string;

  // إعدادات العرض
  theme: 'light' | 'dark' | 'system';
  language: 'ar' | 'en';
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD';
  currency: 'EGP' | 'USD';

  // إعدادات الإشعارات
  notifySessionToday: boolean;
  notifySessionTomorrow: boolean;
  notifySessionWeek: boolean;
  notifyPaymentDue: boolean;

  // إعدادات الطباعة
  printLogo: boolean;
  printOfficeName: boolean;
  printDate: boolean;
}

interface SettingsStore {
  settings: SettingsState;
  updateSettings: (updates: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

const defaultSettings: SettingsState = {
  officeName: 'مكتب المحاماة',
  ownerName: 'المحامي',
  phone: '',
  email: '',
  address: '',
  licenseNumber: '',

  theme: 'system',
  language: 'ar',
  dateFormat: 'DD/MM/YYYY',
  currency: 'EGP',

  notifySessionToday: true,
  notifySessionTomorrow: true,
  notifySessionWeek: false,
  notifyPaymentDue: true,

  printLogo: true,
  printOfficeName: true,
  printDate: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: { ...defaultSettings },

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetSettings: () =>
        set(() => ({
          settings: { ...defaultSettings },
        })),
    }),
    {
      name: 'malaf-pro-settings',
    }
  )
);
