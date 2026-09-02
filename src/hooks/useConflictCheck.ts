import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface ConflictMatch {
  type: 'existing_client' | 'existing_opponent';
  id: string;
  name: string;
  detail?: string;
}

// فحص تعارض مصالح أثناء الكتابة (مع debounce) - بيتحقق إن الاسم ده مش
// موكل حالي أو خصم في قضية حالية في المكتب
export function useConflictCheck(name: string) {
  const [matches, setMatches] = useState<ConflictMatch[]>([]);

  useEffect(() => {
    const trimmed = name?.trim() || '';
    if (trimmed.length < 3) {
      setMatches([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await api.get('/clients/check-conflict', { params: { name: trimmed } });
        setMatches(res.data.data || []);
      } catch {
        // فشل الفحص مش لازم يمنع المستخدم من الاستمرار
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [name]);

  return matches;
}
