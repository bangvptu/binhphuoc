import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationToastProps extends NotificationItem {
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const styles = {
    success: 'bg-white border-l-4 border-green-500 text-slate-800 shadow-green-100',
    error: 'bg-white border-l-4 border-red-500 text-slate-800 shadow-red-100',
    info: 'bg-white border-l-4 border-blue-500 text-slate-800 shadow-blue-100'
  };

  const icons = {
    success: <CheckCircle2 size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg shadow-xl min-w-[320px] max-w-md transform transition-all duration-500 animate-[slideIn_0.3s_ease-out] hover:scale-[1.02] ${styles[type]}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium leading-tight">{message}</p>
      <button 
        onClick={() => onClose(id)} 
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationToast;