import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Briefcase, Settings, LogOut, Scale, CalendarDays, FolderOpen, Menu, X, Wallet, Bot, BookOpen, UsersRound, FileArchive, PieChart, MessageSquare, CheckSquare, Globe, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { HeaderUserMenu } from '@/components/layout/HeaderUserMenu';
import { HeaderNotifications } from '@/components/layout/HeaderNotifications';
import PageLoader from '@/components/PageLoader';
import { useTheme } from 'next-themes';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { settings } = useSettingsStore();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme]);

  // إغلاق القائمة الجانبية عند تغيير المسار في الجوال
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navGroups = [
    {
      title: 'الرئيسية',
      items: [
        { icon: Home, label: 'لوحة التحكم', path: '/dashboard' },
      ]
    },
    {
      title: 'العمليات القانونية',
      items: [
        { icon: Users, label: 'الموكلون', path: '/dashboard/clients' },
        { icon: Briefcase, label: 'القضايا', path: '/dashboard/cases' },
        { icon: Gavel, label: 'التنفيذ والأحكام', path: '/dashboard/execution' },
        { icon: CalendarDays, label: 'المواعيد والجلسات', path: '/dashboard/sessions' },
        { icon: FolderOpen, label: 'الشغل الإداري', path: '/dashboard/administrative' },
        { icon: MessageSquare, label: 'الاستشارات', path: '/dashboard/consultations' },
      ]
    },
    {
      title: 'المالية والمستندات',
      items: [
        { icon: Wallet, label: 'المالية والفواتير', path: '/dashboard/finance' },
        { icon: FileArchive, label: 'الأرشيف والمستندات', path: '/dashboard/archive' },
        { icon: PieChart, label: 'التقارير والإحصائيات', path: '/dashboard/reports' },
      ]
    },
    {
      title: 'أدوات متقدمة',
      items: [
        { icon: Bot, label: 'المساعد القانوني AI', path: '/dashboard/ai-drafting' },
        { icon: BookOpen, label: 'المكتبة القانونية', path: '/dashboard/library' },
      ]
    },
    {
      title: 'إدارة النظام',
      items: [
        { icon: UsersRound, label: 'إدارة الفريق', path: '/dashboard/team' },
        { icon: Globe, label: 'بوابة الموكلين', path: '/dashboard/client-portal' },
        { icon: Settings, label: 'الإعدادات', path: '/dashboard/settings' },
      ]
    }
  ];

  const allNavItems = navGroups.flatMap(group => group.items);

  return (
    <div className="flex min-h-screen bg-muted/40 font-sans">
      {/* غطاء خلفي للموبايل */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-64 flex-col border-l bg-card transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:flex",
        isMobileMenuOpen ? "translate-x-0 flex" : "translate-x-full hidden"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Scale className="h-6 w-6" />
            <span>ملف برو</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-4 px-4 overflow-y-auto">
          {navGroups.map((group, index) => (
            <div key={index} className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground px-2 pb-1">
                {group.title}
              </span>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <Link key={item.path} to={item.path}>
                    <span
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t shrink-0">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground gap-3">
              <LogOut className="h-4 w-4 shrink-0" />
              تسجيل الخروج
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 flex items-center px-6 border-b bg-card justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold capitalize">
              {allNavItems.find(item => item.path === location.pathname)?.label || 'لوحة التحكم'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
             <HeaderNotifications />
             <HeaderUserMenu />
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">
          <React.Suspense fallback={<PageLoader />}>
            <Outlet />
          </React.Suspense>
        </div>
      </main>
    </div>
  );
}
