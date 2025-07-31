// src/hooks/useNotifier.ts (Optimize Edilmiş Hali)
import { toast } from 'react-hot-toast';
import { useCallback } from 'react';

interface Notifier {
  success: (message: string) => void;
  error: (message: string) => void;
}

export function useNotifier(): Notifier {
  const success = useCallback((message: string) => {
    toast.success(message);
  }, []); // useCallback ile fonksiyonun yeniden yaratılmasını engelle

  const error = useCallback((message: string) => {
    toast.error(message);
  }, []); // useCallback ile fonksiyonun yeniden yaratılmasını engelle

  return { success, error };
}
