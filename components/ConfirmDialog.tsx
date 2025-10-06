'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isOpen,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }
    if (isOpen) {
      document.addEventListener('keydown', onKeyDown);
    }
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
