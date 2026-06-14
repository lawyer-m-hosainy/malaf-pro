import { usePWA } from '@/hooks/usePWA';

export default function PWAPrompt() {
  const {
    installPrompt,
    isInstalled,
    isOnline,
    needRefresh,
    installApp,
    updateServiceWorker,
    dismissPrompt,
  } = usePWA();

  return (
    <>
      {/* Banner تثبيت التطبيق */}
      {installPrompt && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-primary text-primary-foreground rounded-xl p-4 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
          <div>
            <p className="font-bold text-sm">ثبّت ملف برو على جهازك</p>
            <p className="text-xs opacity-90 mt-0.5">
              اعمل بدون إنترنت وافتح المنصة أسرع كبرنامج مستقل
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={dismissPrompt}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
            >
              لاحقاً
            </button>
            <button
              onClick={installApp}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary-foreground text-primary font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              تثبيت الآن
            </button>
          </div>
        </div>
      )}

      {/* Banner تحديث متاح */}
      {needRefresh && (
        <div className="fixed top-4 left-4 right-4 z-[100] bg-amber-500 text-white rounded-xl p-4 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <p className="text-sm font-bold">
            هناك تحديث جديد متاح للمنصة، هل تريد التحديث الآن؟
          </p>
          <button
            onClick={() => updateServiceWorker(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-white text-amber-600 font-bold shadow-sm hover:bg-amber-50 transition-colors shrink-0"
          >
            تحديث وإعادة تحميل
          </button>
        </div>
      )}

      {/* Banner عدم الاتصال */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground py-1.5 text-center text-sm font-bold shadow-md animate-in slide-in-from-top-0">
          ⚠️ لا يوجد اتصال بالإنترنت — المنصة تعمل في وضع عدم الاتصال (Offline Mode)
        </div>
      )}
    </>
  );
}
