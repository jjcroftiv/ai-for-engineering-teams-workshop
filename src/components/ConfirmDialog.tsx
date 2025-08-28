'use client';

import { useCallback, useEffect } from 'react';
import { LoadingButton } from './LoadingButton';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  details?: string[];
}

/**
 * ConfirmDialog component for user confirmations
 * Supports different variants for different types of actions
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
  details = []
}: ConfirmDialogProps) {
  // Handle escape key to close dialog
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && !loading) {
      onCancel();
    }
  }, [onCancel, loading]);

  // Add/remove event listener for escape key
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !loading) {
      onCancel();
    }
  }, [onCancel, loading]);

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: (
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'bg-red-100',
          buttonVariant: 'danger' as const
        };
      case 'warning':
        return {
          icon: (
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'bg-yellow-100',
          buttonVariant: 'primary' as const
        };
      case 'info':
        return {
          icon: (
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'bg-blue-100',
          buttonVariant: 'primary' as const
        };
      default:
        return {
          icon: null,
          iconBg: 'bg-gray-100',
          buttonVariant: 'primary' as const
        };
    }
  };

  if (!isOpen) return null;

  const { icon, iconBg, buttonVariant } = getVariantStyles();

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      {/* Backdrop */}
      <div 
        className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0"
        onClick={handleBackdropClick}
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        {/* Dialog panel */}
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            {/* Icon */}
            {icon && (
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                {icon}
              </div>
            )}

            {/* Content */}
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
              <h3 className="text-lg font-semibold leading-6 text-gray-900" id="dialog-title">
                {title}
              </h3>
              
              <div className="mt-2">
                <p className="text-sm text-gray-500" id="dialog-description">
                  {message}
                </p>
                
                {/* Additional details */}
                {details.length > 0 && (
                  <div className="mt-4 rounded-md bg-gray-50 p-3">
                    <ul className="text-sm text-gray-700 space-y-1">
                      {details.map((detail, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-400 mr-2">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <LoadingButton
              onClick={onConfirm}
              variant={buttonVariant}
              isLoading={loading}
              loadingText="Processing..."
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {confirmText}
            </LoadingButton>
            
            <Button
              onClick={onCancel}
              variant="secondary"
              disabled={loading}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}