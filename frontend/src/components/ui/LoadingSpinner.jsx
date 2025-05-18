import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 6, className = '', text = 'Loading...' }) => {
  const sizeClasses = {
    4: 'w-4 h-4',
    5: 'w-5 h-5',
    6: 'w-6 h-6',
    8: 'w-8 h-8',
    10: 'w-10 h-10',
    12: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size] || 'w-6 h-6'} animate-spin`} />
      {text && <span className="ml-2">{text}</span>}
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <LoadingSpinner size={12} text="Loading..." />
  </div>
);

export const ButtonLoader = () => (
  <>
    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    Processing...
  </>
);
