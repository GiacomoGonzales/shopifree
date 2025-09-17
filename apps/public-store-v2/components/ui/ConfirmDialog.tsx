'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | undefined>(undefined);

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return context;
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

interface ConfirmDialogProviderProps {
  children: ReactNode;
}

export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [dialog, setDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
  });

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    dialog.resolve?.(true);
    setDialog(prev => ({ ...prev, isOpen: false }));
  }, [dialog.resolve]);

  const handleCancel = useCallback(() => {
    dialog.resolve?.(false);
    setDialog(prev => ({ ...prev, isOpen: false }));
  }, [dialog.resolve]);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {dialog.isOpen && (
        <ConfirmDialogModal
          {...dialog}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmDialogContext.Provider>
  );
}

interface ConfirmDialogModalProps extends ConfirmDialogOptions {
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialogModal({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  onConfirm,
  onCancel,
}: ConfirmDialogModalProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: '⚠️',
          color: 'text-yellow-600',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'error':
        return {
          icon: '❌',
          color: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
        };
      case 'success':
        return {
          icon: '✅',
          color: 'text-green-600',
          buttonColor: 'bg-green-600 hover:bg-green-700',
        };
      default:
        return {
          icon: 'ℹ️',
          color: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-scale-in">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${typeStyles.color}`}>
            <span className="text-2xl">{typeStyles.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {message}
            </p>

            {/* Actions */}
            <div className="flex space-x-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-medium text-white ${typeStyles.buttonColor} border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CSS for animation (add to your global CSS)
const styles = `
@keyframes scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
`;

export { styles as confirmDialogStyles };