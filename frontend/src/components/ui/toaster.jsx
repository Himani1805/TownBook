import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Toast } from '@/components/ui/toast';

export const Toaster = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-0 z-[100] flex w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast
          key={id}
          className="mb-2 w-full border-none shadow-lg"
          {...props}
        >
          <div className="grid gap-1">
            {title && <div className="text-sm font-semibold">{title}</div>}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
          {action}
        </Toast>
      ))}
    </div>
  );
};
