import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ToastContainer = () => {
  const { toasts } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle size={20} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
