import React from 'react';
import { IoClose } from 'react-icons/io5';

interface NotificationsPanelProps {
  onClose: () => void;
}

// Mock notifications for demonstration
const mockNotifications = [
  {
    id: '1',
    type: 'message',
    content: 'User1 sent you a new message',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false
  },
  {
    id: '2',
    type: 'friend',
    content: 'User2 added you as a friend',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: false
  },
  {
    id: '3',
    type: 'system',
    content: 'Welcome to Chamo Chat! Explore the app and connect with friends.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true
  }
];

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute top-16 right-4 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-med-green">
        <h3 className="font-medium text-dark-grey">Notifications</h3>
        <button onClick={onClose} className="text-dark-grey hover:text-black">
          <IoClose size={20} />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {mockNotifications.length > 0 ? (
          <div>
            {mockNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                    {notification.content}
                  </p>
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>No notifications</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200 text-center">
        <button className="text-sm text-med-green hover:text-dark-green font-medium">
          Mark all as read
        </button>
      </div>
    </div>
  );
};

export default NotificationsPanel;
