import { AlertTriangle } from 'lucide-react';
import type { ConflictMatch } from '@/hooks/useConflictCheck';

export function ConflictWarningBanner({ matches }: { matches: ConflictMatch[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 p-3 rounded-lg flex items-start gap-3 text-sm animate-in slide-in-from-top-2">
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        <p className="font-bold mb-1">تنبيه تعارض مصالح محتمل</p>
        <ul className="space-y-0.5">
          {matches.map((m, i) => (
            <li key={i}>
              {m.type === 'existing_client'
                ? <>هذا الاسم يطابق موكل حالي: <span className="font-semibold">{m.name}</span></>
                : <>هذا الاسم يطابق خصم في قضية حالية: <span className="font-semibold">{m.name}</span> — {m.detail}</>
              }
            </li>
          ))}
        </ul>
        <p className="text-xs mt-1 opacity-80">راجع الأمر قبل الاستمرار — القرار النهائي ليك.</p>
      </div>
    </div>
  );
}
