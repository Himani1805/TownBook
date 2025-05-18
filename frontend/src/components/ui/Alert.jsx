import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-background border',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
  success: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
  warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800',
  error: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800',
};

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export const Alert = ({
  variant = 'default',
  title,
  message,
  className,
  onDismiss,
  showIcon = true,
  showDismiss = false,
  children,
}) => {
  const Icon = icons[variant] || Info;
  
  return (
    <div
      className={cn(
        'relative p-4 pr-12 rounded-md border',
        variants[variant] || variants.default,
        className
      )}
      role="alert"
    >
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0 mr-3">
            <Icon
              className={cn('w-5 h-5', {
                'text-blue-500': variant === 'info' || variant === 'default',
                'text-green-500': variant === 'success',
                'text-yellow-500': variant === 'warning',
                'text-red-500': variant === 'error',
              })}
            />
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h3
              className={cn('text-sm font-medium', {
                'text-blue-800 dark:text-blue-200': variant === 'info' || variant === 'default',
                'text-green-800 dark:text-green-200': variant === 'success',
                'text-yellow-800 dark:text-yellow-200': variant === 'warning',
                'text-red-800 dark:text-red-200': variant === 'error',
              })}
            >
              {title}
            </h3>
          )}
          {message && (
            <div
              className={cn('mt-1 text-sm', {
                'text-blue-700 dark:text-blue-300': variant === 'info' || variant === 'default',
                'text-green-700 dark:text-green-300': variant === 'success',
                'text-yellow-700 dark:text-yellow-300': variant === 'warning',
                'text-red-700 dark:text-red-300': variant === 'error',
              })}
            >
              {message}
            </div>
          )}
          {children}
        </div>
      </div>
      {showDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

// Convenience components for common alert types
export const InfoAlert = (props) => <Alert variant="info" {...props} />;
export const SuccessAlert = (props) => <Alert variant="success" {...props} />;
export const WarningAlert = (props) => <Alert variant="warning" {...props} />;
export const ErrorAlert = (props) => <Alert variant="error" {...props} />;
