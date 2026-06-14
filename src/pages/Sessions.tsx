import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar as CalendarIcon, MapPin, AlertCircle, CheckCircle2, CalendarClock, Printer, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';

export default function Sessions() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await api.get('/sessions');
      // The API returns { data: sessions, total: ... }
      const sessionsData = res.data.data || [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return sessionsData.map((s: any) => {
        const sessionDate = new Date(s.date);
        return {
          id: s.id,
          caseId: s.case?.id,
          caseTitle: s.case?.title || 'قضية بدون عنوان',
          internalId: s.case?.internalId || '-',
          type: s.type,
          status: sessionDate >= today ? 'upcoming' : 'past',
          date: format(sessionDate, 'yyyy-MM-dd'),
          time: s.time,
          court: s.case?.jurisdiction || 'غير محدد',
          hall: s.case?.degree || '',
          priority: 'normal',
          requirements: s.notes || 'لا يوجد تكليفات',
          assignee: s.lawyer?.name || 'غير محدد',
          decision: s.result || 'يحدد لاحقاً',
          rollNumber: '-'
        };
      });
    }
  });

  const filteredSessions = sessions.filter((s: any) => {
    const matchesSearch = s.caseTitle.includes(searchQuery) || s.court.includes(searchQuery);
    const matchesTab = activeTab === 'upcoming' ? s.status === 'upcoming' : s.status === 'past';
    return matchesSearch && matchesTab;
  });

  // Group filtered sessions by date
  const groupedSessions = filteredSessions.reduce((acc: any, session: any) => {
    if (!acc[session.date]) {
      acc[session.date] = [];
    }
    acc[session.date].push(session);
    return acc;
  }, {});

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">أجندة ورول الجلسات</h2>
          <p className="text-sm text-muted-foreground mt-1">متابعة الجلسات ومواعيد المحاكم وترتيب المهام المطلوبة لها</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 shadow-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> طباعة رول اليوم
          </Button>
          {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> إضافة جلسة
            </Button>
          )}
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div className="relative w-full md:max-w-md">
             <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="بحث بالمحكمة، أو اسم القضية..." 
               className="pr-10 bg-muted/20"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
          
          <div className="flex rounded-md border bg-muted/50 p-1 w-full md:w-auto">
             <button 
               className={cn("px-6 py-1.5 text-sm font-semibold rounded-sm transition-all flex-1 md:flex-none", activeTab === 'upcoming' ? 'bg-background shadow-sm text-foreground ring-1 ring-border/50' : 'text-muted-foreground hover:text-foreground')}
               onClick={() => setActiveTab('upcoming')}
             >
                الجلسات القادمة
             </button>
             <button 
               className={cn("px-6 py-1.5 text-sm font-semibold rounded-sm transition-all flex-1 md:flex-none", activeTab === 'past' ? 'bg-background shadow-sm text-foreground ring-1 ring-border/50' : 'text-muted-foreground hover:text-foreground')}
               onClick={() => setActiveTab('past')}
             >
                الجلسات السابقة والمؤرشفة
             </button>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 print:p-0">
          
          {/* Header for Print / Display Date group */}
          <div className="hidden print:block mb-6 text-center border-b-2 border-black pb-4">
             <h1 className="text-3xl font-black mb-2">رول جلسات المكتب</h1>
             <p className="text-xl font-bold">المرفق به كشف القضايا والمهام المطلوبة من السادة الزملاء</p>
          </div>

          <div className="space-y-8">
            {isLoading ? (
              <div className="text-center p-12 text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 mb-3 animate-spin text-primary" />
                <p className="text-lg font-semibold">جاري تحميل الجلسات...</p>
              </div>
            ) : Object.keys(groupedSessions).length === 0 ? (
               <div className="text-center p-12 text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
                 <CalendarClock className="h-12 w-12 mb-3 opacity-20" />
                 <p className="text-lg font-semibold">لا توجد جلسات {activeTab === 'upcoming' ? 'قادمة' : 'سابقة'} مسجلة</p>
               </div>
            ) : (
               (Object.entries(groupedSessions) as [string, any[]][]).sort(([dateA], [dateB]) => activeTab === 'upcoming' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA)).map(([date, dateSessions]) => (
                 <div key={date} className="print:break-inside-avoid">
                    <h3 className="bg-muted px-4 py-3 rounded-lg font-bold text-lg mb-4 flex items-center gap-2 border shadow-sm print:bg-gray-200 print:text-black print:border-black print:shadow-none">
                      <CalendarIcon className="h-5 w-5 text-primary print:text-black" />
                      مواعيد جلسات يوم: <span className="font-mono text-indigo-700 dark:text-indigo-400 print:text-black tracking-widest bg-background print:bg-white px-2 py-0.5 rounded shadow-sm">{date}</span>
                      <span className="text-sm font-medium text-muted-foreground print:text-gray-700 mr-auto bg-background/50 px-2 rounded">
                        ({dateSessions.length} جلسات)
                      </span>
                    </h3>
                    
                    <div className="grid gap-4">
                       {dateSessions.map(session => (
                         <div key={session.id} className={cn(
                           "flex flex-col md:flex-row gap-4 p-4 rounded-xl border transition-all print:border-2 print:border-black print:rounded-none select-text",
                           session.priority === 'high' ? "border-r-4 border-r-rose-500 bg-rose-50/30 dark:bg-rose-900/10" : "bg-card hover:bg-muted/30"
                         )}>
                            
                            {/* Session Details */}
                            <div className="flex-1 space-y-3">
                               <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                  <div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold bg-primary/10 text-primary px-2 py-0.5 rounded text-xs print:border print:border-black print:text-black print:bg-white">
                                          {session.type === 'HEARING' ? 'مرافعة' : session.type === 'EXPERT' ? 'خبراء' : session.type === 'JUDGMENT' ? 'نطق بالحكم' : session.type}
                                        </span>
                                        {session.priority === 'high' && <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded print:border print:border-black print:text-black print:bg-white"><AlertCircle className="h-3 w-3" /> هام وعاجل</span>}
                                        {session.status === 'past' && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded print:border print:border-black print:text-black print:bg-white"><CheckCircle2 className="h-3 w-3" /> منتهية</span>}
                                     </div>
                                     <Link to={`/dashboard/cases/${session.caseId}`} className="text-lg font-bold hover:text-primary transition-colors inline-block print:hidden">
                                       {session.caseTitle}
                                     </Link>
                                     <h4 className="text-lg font-bold hidden print:block pt-1">{session.caseTitle}</h4>
                                     <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 print:text-black">
                                       <span className="font-medium">رقم الأرشيف الداخلي:</span> 
                                       <span className="font-mono bg-muted p-0.5 px-1.5 rounded text-foreground font-bold print:bg-gray-100 border print:border-gray-400">{session.internalId}</span>
                                     </p>
                                  </div>
                                  <div className="text-right border-r px-4 print:border-r-2 print:border-black bg-muted/10 print:bg-transparent p-2 rounded">
                                     <p className="text-sm font-bold flex items-center gap-1 text-foreground print:text-black"><MapPin className="h-4 w-4 text-muted-foreground print:text-black" /> {session.court}</p>
                                     <p className="text-xs text-muted-foreground font-medium mt-1 print:text-gray-700">{session.hall}</p>
                                  </div>
                               </div>

                               <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-3 rounded-lg print:border-black print:bg-white pb-3 text-sm">
                                  <p className="font-bold text-amber-800 dark:text-amber-400 print:text-black flex items-center gap-2 mb-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                    المطلوب والتكليفات لجلسة اليوم:
                                  </p>
                                  <p className="mr-3 font-semibold text-amber-900 dark:text-amber-300 print:text-black">{session.requirements}</p>
                               </div>

                               <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t print:border-gray-400 items-start sm:items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground print:text-black">
                                     <span className="font-semibold">المحامي المكلف بالحضور:</span>
                                     <span className="font-bold text-foreground print:text-black bg-muted print:bg-gray-100 px-2 py-0.5 rounded shadow-sm border print:border-gray-400 max-w-[150px] truncate" title={session.assignee}>{session.assignee}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-muted-foreground print:text-black">
                                     <div className="flex items-center gap-2">
                                       <span className="font-semibold">الوقت:</span>
                                       <span className="font-mono text-foreground">{session.time}</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <span className="font-semibold">القرار:</span>
                                       <span className="font-black text-foreground print:text-black bg-muted print:bg-gray-100 px-2 py-0.5 rounded border print:border-gray-400">{session.decision}</span>
                                     </div>
                                  </div>
                               </div>
                               
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
