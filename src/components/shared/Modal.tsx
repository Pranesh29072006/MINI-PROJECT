import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
  labelId: string;
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  headerActions,
  footer,
  maxWidthClass = 'sm:max-w-4xl',
  labelId
}: ModalProps) {
  const containerRef = useFocusTrap(open, onClose);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-4 md:p-6" role="presentation">
      <div onClick={handleBackdropClick} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-nexus-fade-in" aria-hidden="true" />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className={`relative w-full h-full sm:h-auto sm:max-h-[88vh] ${maxWidthClass} bg-white sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-nexus-scale-in outline-none`}
      >
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">{icon}</div>
            )}
            <div className="min-w-0">
              <h2 id={labelId} className="text-sm font-bold text-slate-900 truncate">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg p-1.5 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">{children}</div>

        {footer && <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
