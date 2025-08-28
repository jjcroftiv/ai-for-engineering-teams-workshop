'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // milliseconds, 0 for no auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => string;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Individual Toast component
 */
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Show animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(toast.id), 300); // Match animation duration
  }, [toast.id, onDismiss]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: (
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: (
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: (
            <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: (
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: null,
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className={`max-w-sm w-full ${styles.bg} ${styles.border} border rounded-lg shadow-lg pointer-events-auto`}>
        <div className="p-4">
          <div className="flex items-start">
            {styles.icon && (
              <div className="flex-shrink-0">
                {styles.icon}
              </div>
            )}
            
            <div className={`${styles.icon ? 'ml-3' : ''} w-0 flex-1`}>
              <p className={`text-sm font-medium ${styles.titleColor}`}>
                {toast.title}
              </p>
              
              {toast.message && (
                <p className={`mt-1 text-sm ${styles.messageColor}`}>
                  {toast.message}
                </p>
              )}

              {toast.action && (
                <div className="mt-3">
                  <button
                    onClick={toast.action.onClick}
                    className={`text-sm font-medium ${
                      toast.type === 'success' ? 'text-green-600 hover:text-green-500' :
                      toast.type === 'error' ? 'text-red-600 hover:text-red-500' :
                      toast.type === 'warning' ? 'text-yellow-600 hover:text-yellow-500' :
                      'text-blue-600 hover:text-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded`}
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>

            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={handleDismiss}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
                aria-label="Dismiss notification"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Toast container component
 */
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

/**
 * Toast Provider component
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toastData: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toastData
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Utility methods for common toast types
  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    hideAllToasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={hideToast} />
    </ToastContext.Provider>
  );
}

// Convenience hooks for common toast types
export function useSuccessToast() {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({ type: 'success', title, message, ...options });
  }, [showToast]);
}

export function useErrorToast() {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({ type: 'error', title, message, duration: 7000, ...options }); // Error toasts stay longer
  }, [showToast]);
}

export function useWarningToast() {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({ type: 'warning', title, message, ...options });
  }, [showToast]);
}

export function useInfoToast() {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({ type: 'info', title, message, ...options });
  }, [showToast]);
}