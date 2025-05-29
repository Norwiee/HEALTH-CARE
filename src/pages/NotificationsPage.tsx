import React, { useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'activity_reminder':
        return <Bell className="text-blue-500" />;
      case 'progress_update':
        return <Check className="text-green-500" />;
      case 'risk_alert':
        return <Bell className="text-red-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'activity_reminder':
        return 'border-blue-100 dark:border-blue-900';
      case 'progress_update':
        return 'border-green-100 dark:border-green-900';
      case 'risk_alert':
        return 'border-red-100 dark:border-red-900';
      default:
        return 'border-gray-100 dark:border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-2">Notifications</h1>
        <p className="opacity-90">Stay updated with your health journey</p>
      </div>

      {/* Notification controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {unreadCount} unread notifications
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <Bell className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 ${
                getNotificationColor(notification.type)
              } ${!notification.read ? 'bg-gray-50 dark:bg-gray-750' : ''}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
                {notification.link && (
                  <a
                    href={notification.link}
                    className="ml-4 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;