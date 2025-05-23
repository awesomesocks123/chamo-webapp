'use client';

import React, { useState, useEffect } from 'react';
import { IoClose, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import { FaUserPlus } from 'react-icons/fa';
import { auth } from '../lib/firebase';
import { 
  getPendingFriendRequests, 
  acceptFriendRequest, 
  rejectFriendRequest,
  UserProfile
} from '../lib/userService';

interface NotificationsPanelProps {
  onClose: () => void;
  onFriendRequestAction?: () => void;
}

type NotificationType = 'friend-request' | 'message' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  content: string;
  timestamp: Date;
  read: boolean;
  data?: any; // Additional data specific to notification type
}



const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose, onFriendRequestAction }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  
  useEffect(() => {
    loadNotifications();
  }, []);
  
  const loadNotifications = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load friend requests
      const friendRequests = await getPendingFriendRequests(auth.currentUser.uid);
      
      // Convert friend requests to notifications
      const friendRequestNotifications: Notification[] = friendRequests.map(({ request, sender }) => ({
        id: request.id || '',
        type: 'friend-request',
        content: `${sender.username} sent you a friend request`,
        timestamp: request.createdAt?.toDate?.() || new Date(),
        read: false,
        data: { request, sender }
      }));
      
      // Add system notification if no notifications
      const allNotifications = [...friendRequestNotifications];
      
      if (allNotifications.length === 0) {
        const welcomeNotification: Notification = {
          id: 'welcome',
          type: 'system',
          content: 'Welcome to Chamo Chat! Explore the app and connect with friends.',
          timestamp: new Date(),
          read: true
        };
        allNotifications.push(welcomeNotification);
      }
      
      setNotifications(allNotifications);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcceptFriendRequest = async (requestId: string) => {
    if (processingIds.includes(requestId)) return;
    
    setProcessingIds(prev => [...prev, requestId]);
    
    try {
      await acceptFriendRequest(requestId);
      
      // Remove the notification
      setNotifications(prev => prev.filter(n => n.id !== requestId));
      
      // Notify parent component
      if (onFriendRequestAction) {
        onFriendRequestAction();
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Failed to accept friend request');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };
  
  const handleRejectFriendRequest = async (requestId: string) => {
    if (processingIds.includes(requestId)) return;
    
    setProcessingIds(prev => [...prev, requestId]);
    
    try {
      await rejectFriendRequest(requestId);
      
      // Remove the notification
      setNotifications(prev => prev.filter(n => n.id !== requestId));
      
      // Notify parent component
      if (onFriendRequestAction) {
        onFriendRequestAction();
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setError('Failed to reject friend request');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };
  
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
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden" 
        onClick={onClose}
      />
      
      {/* Notification panel */}
      <div className="fixed md:absolute top-0 md:top-16 right-0 md:right-4 w-full md:w-80 max-w-full h-full md:h-auto bg-white dark:bg-zinc-800 md:rounded-lg shadow-lg z-50 overflow-hidden flex flex-col md:max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-700 bg-med-green dark:bg-dark-green">
          <h3 className="font-medium text-dark-grey dark:text-lighter-green">Notifications</h3>
          <button onClick={onClose} className="text-dark-grey dark:text-lighter-green hover:text-black dark:hover:text-white">
            <IoClose size={20} />
          </button>
        </div>
      
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm">
            {error}
          </div>
        )}
      
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 md:p-3 border-b border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                >
                  {notification.type === 'friend-request' ? (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <FaUserPlus className="text-blue-500 dark:text-blue-400 mr-2" />
                          <p className={`text-sm text-gray-800 dark:text-gray-200 ${!notification.read ? 'font-medium' : ''}`}>
                            {notification.content}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <div className="flex justify-end space-x-2 mt-1">
                        <button 
                          onClick={() => handleAcceptFriendRequest(notification.id)}
                          disabled={processingIds.includes(notification.id)}
                          className="flex items-center text-xs px-3 py-2 md:px-2 md:py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors disabled:opacity-50"
                        >
                          <IoCheckmarkCircle className="mr-1" />
                          Accept
                        </button>
                        <button 
                          onClick={() => handleRejectFriendRequest(notification.id)}
                          disabled={processingIds.includes(notification.id)}
                          className="flex items-center text-xs px-3 py-2 md:px-2 md:py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
                        >
                          <IoCloseCircle className="mr-1" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <p className={`text-sm text-gray-800 dark:text-gray-200 ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.content}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p>No notifications</p>
            </div>
          )}
        </div>
        
        {notifications.some(n => !n.read) && (
          <div className="p-3 border-t border-gray-200 dark:border-zinc-700 text-center">
            <button 
              onClick={markAllAsRead}
              className="text-sm text-med-green dark:text-lighter-green hover:text-dark-green dark:hover:text-white font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsPanel;
