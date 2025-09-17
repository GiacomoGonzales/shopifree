'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      id,
      autoClose: true,
      duration: 5000,
      ...toastData,
    };

    setToasts(prev => [...prev, toast]);

    // Auto-hide toast if autoClose is enabled
    if (toast.autoClose && toast.duration) {
      setTimeout(() => {
        hideToast(id);
      }, toast.duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onHide: (id: string) => void;
}

function ToastContainer({ toasts, onHide }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onHide: (id: string) => void;
}

function ToastItem({ toast, onHide }: ToastItemProps) {
  const getToastStyles = (type: ToastType) => {
    const baseStyles = "p-4 rounded-lg shadow-lg border-l-4 bg-white dark:bg-gray-800 animate-slide-in";

    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500 text-green-800 dark:text-green-200`;
      case 'error':
        return `${baseStyles} border-red-500 text-red-800 dark:text-red-200`;
      case 'warning':
        return `${baseStyles} border-yellow-500 text-yellow-800 dark:text-yellow-200`;
      case 'info':
        return `${baseStyles} border-blue-500 text-blue-800 dark:text-blue-200`;
      default:
        return `${baseStyles} border-gray-500 text-gray-800 dark:text-gray-200`;
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '';
    }
  };

  return (
    <div className={getToastStyles(toast.type)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <span className="text-lg">{getIcon(toast.type)}</span>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs mt-1 opacity-80">{toast.message}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onHide(toast.id)}
          className="ml-2 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Utility functions for common toast types
export const toast = {
  success: (title: string, message?: string) => {
    // This will be used with the hook context
    return { type: 'success' as ToastType, title, message };
  },
  error: (title: string, message?: string) => {
    return { type: 'error' as ToastType, title, message };
  },
  warning: (title: string, message?: string) => {
    return { type: 'warning' as ToastType, title, message };
  },
  info: (title: string, message?: string) => {
    return { type: 'info' as ToastType, title, message };
  },
};

// CSS for animation (add to your global CSS)
const styles = `
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
`;

// You can add this to your global CSS or use CSS modules
export { styles as toastStyles };