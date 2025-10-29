'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);

  const addToast = useCallback((toast) => {
    const id = `toast-${++toastIdCounter.current}`;
    const newToast = {
      id,
      duration: 5000,
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const { id, type, message, title } = toast;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-secondary-600" />,
    error: <AlertCircle className="w-5 h-5 text-danger-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-accent-600" />,
    info: <Info className="w-5 h-5 text-primary-600" />
  };

  const styles = {
    success: 'bg-secondary-50 border-secondary-200',
    error: 'bg-danger-50 border-danger-200',
    warning: 'bg-accent-50 border-accent-200',
    info: 'bg-primary-50 border-primary-200'
  };

  return (
    <div
      className={`
        max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 
        animate-slide-in ${styles[type]}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h4 className="text-sm font-medium text-neutral-900 mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm text-neutral-700">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onRemove(id)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastProvider;
