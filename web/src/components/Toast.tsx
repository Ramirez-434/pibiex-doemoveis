import React from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  }[type];

  const iconColor = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} border rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-up z-50`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${iconColor}`}></div>
        <p className={`${textColor} font-medium text-sm`}>{message}</p>
        <button onClick={onClose} className="ml-auto">
          <X size={16} className={textColor} />
        </button>
      </div>
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  return { toasts, showToast, ToastContainer };
};

export const ToastContainer: React.FC<{ toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => (
  <div className="fixed bottom-4 right-4 space-y-2 z-50">
    {toasts.map((toast) => (
      <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => onRemove(toast.id)} />
    ))}
  </div>
);
