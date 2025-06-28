import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { removeNotification } from '../store/slices/uiSlice';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export const NotificationToast: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  useEffect(() => {
    // Auto-remove notifications after 5 seconds
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [notifications, dispatch]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <FaExclamationTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <FaInfoCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm animate-in slide-in-from-right ${getBackgroundColor(notification.type)}`}
        >
          {getIcon(notification.type)}
          <p className="flex-1 text-sm font-medium text-slate-800">
            {notification.message}
          </p>
          <button
            onClick={() => dispatch(removeNotification(notification.id))}
            className="text-slate-400 hover:text-slate-600"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};