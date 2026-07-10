import { useCallback, useState } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
}

let toastId = 0;

export function useToast(durationMs = 3000) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (text: string) => {
      const id = ++toastId;
      setToasts(prev => [...prev, { id, text }]);
      window.setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, durationMs);
    },
    [durationMs]
  );

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}
