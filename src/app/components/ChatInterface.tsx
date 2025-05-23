'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IoSend, IoPersonCircle, IoChevronBack } from 'react-icons/io5';
import { Message, sendMessage, getMessages, markMessagesAsRead } from '../lib/messageService';
import { getUserProfile, UserProfile } from '../lib/userService';
import { auth } from '../lib/firebase';

interface ChatInterfaceProps {
  recipientId: string;
  onBackClick?: () => void;
  onViewProfile?: (userId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ recipientId, onBackClick, onViewProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load recipient profile and messages
  useEffect(() => {
    const loadRecipientProfile = async () => {
      try {
        const profile = await getUserProfile(recipientId);
        setRecipient(profile);
      } catch (err) {
        console.error('Error loading recipient profile:', err);
        setError('Failed to load recipient profile');
      }
    };

    if (recipientId) {
      loadRecipientProfile();
      
      // Subscribe to messages
      const unsubscribe = getMessages(recipientId, (newMessages) => {
        if (newMessages.length > 0) {
          // Get the chat session ID from the first message
          const chatSessionId = newMessages[0].id?.split('/')[0];
          if (chatSessionId) {
            // Mark messages as read when chat is opened
            markMessagesAsRead(chatSessionId).catch(err => {
              console.error('Error marking messages as read:', err);
            });
          }
        }
        
        setMessages(newMessages);
        setLoading(false);
      });
      
      return () => {
        unsubscribe(); // Cleanup subscription when component unmounts
      };
    }
  }, [recipientId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    if (!auth.currentUser) {
      setError('You must be logged in to send messages');
      return;
    }
    
    try {
      await sendMessage(recipientId, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-white dark:bg-zinc-800 p-4 border-b border-gray-200 dark:border-zinc-700 flex items-center">
        {/* Back button - visible only on mobile */}
        {onBackClick && (
          <button 
            onClick={onBackClick}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-med-green dark:hover:text-med-green mr-2"
            aria-label="Back to chat list"
          >
            <IoChevronBack size={24} />
          </button>
        )}
        
        <div 
          className="w-10 h-10 bg-med-green text-white rounded-full flex items-center justify-center mr-3 cursor-pointer hover:bg-dark-green dark:hover:bg-light-green transition-colors"
          onClick={() => onViewProfile && recipient && onViewProfile(recipient.uid)}
          title="View profile"
        >
          {recipient?.photoURL ? (
            <img src={recipient.photoURL} alt={recipient?.username} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <IoPersonCircle size={40} />
          )}
        </div>
        <div 
          className="flex-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md p-1 transition-colors"
          onClick={() => onViewProfile && recipient && onViewProfile(recipient.uid)}
        >
          <h2 className="font-semibold text-gray-800 dark:text-white">{recipient?.username || 'User'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{recipient?.status || 'Offline'}</p>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100 dark:bg-zinc-900">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser = auth.currentUser?.uid === message.senderId;
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isCurrentUser 
                        ? 'bg-med-green text-gray-800 dark:text-white' 
                        : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-white'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-gray-600 dark:text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {formatTimestamp(message.timestamp)}
                      {message.status && isCurrentUser && (
                        <span className="ml-2">
                          {message.status === 'sent' ? '✓' : message.status === 'delivered' ? '✓✓' : '✓✓'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="bg-white dark:bg-zinc-800 p-4 border-t border-gray-200 dark:border-zinc-700">
        {error && (
          <div className="mb-2 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 dark:border-zinc-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-med-green dark:bg-zinc-700 dark:text-white"
          />
          <button
            type="submit"
            className="bg-med-green text-white p-2 rounded-r-md hover:bg-dark-green dark:hover:bg-light-green transition-colors"
          >
            <IoSend size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
