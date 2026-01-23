'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ErrorToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastIcon({ type }: { type: ToastType }) {
  const iconClass = 'w-5 h-5';
  switch (type) {
    case 'success':
      return <CheckCircle className={`${iconClass} text-green-400`} aria-hidden="true" />;
    case 'error':
      return <AlertCircle className={`${iconClass} text-red-400`} aria-hidden="true" />;
    case 'warning':
      return <AlertTriangle className={`${iconClass} text-yellow-400`} aria-hidden="true" />;
    case 'info':
      return <Info className={`${iconClass} text-blue-400`} aria-hidden="true" />;
  }
}

function ToastComponent({ toast, onDismiss }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const bgColors = {
    success: 'bg-green-500/10 border-green-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  };

  return (
    <div
      className={`
        card border p-4 mb-3 transition-all duration-300
        ${bgColors[toast.type]}
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <ToastIcon type={toast.type} />
        <p className="flex-1 text-sm text-white">{toast.message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
          }}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="알림 닫기"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent<Omit<Toast, 'id'>>) => {
      const toast: Toast = {
        id: Date.now().toString(),
        ...event.detail,
      };
      setToasts((prev) => [...prev, toast]);
    };

    window.addEventListener('show-toast', handleToast as EventListener);
    return () => {
      window.removeEventListener('show-toast', handleToast as EventListener);
    };
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-50 max-w-md w-full"
      role="region"
      aria-label="알림"
    >
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}

/**
 * 토스트를 표시하는 헬퍼 함수
 */
export function showToast(message: string, type: ToastType = 'info', duration?: number) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('show-toast', {
        detail: { message, type, duration },
      })
    );
  }
}
