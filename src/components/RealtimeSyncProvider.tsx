'use client';

import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export default function RealtimeSyncProvider({ children }: { children: React.ReactNode }) {
  useRealtimeSync();
  return <>{children}</>;
}
