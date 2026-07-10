import React from 'react';
import { createPortal } from 'react-dom';
import { ToastMessage } from '../../hooks/useToast';

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export default function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto animate-nexus-scale-in bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-2 max-w-xs"
        >
          <span className="flex-1">{toast.text}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white text-sm leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
