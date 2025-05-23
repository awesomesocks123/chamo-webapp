'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IoSend, IoPersonCircle, IoChevronBack, IoPeople } from 'react-icons/io5';
import { 
  getRoomMessages, 
  sendRoomMessage, 
  getRoomParticipants, 
  joinChatRoom, 
  leaveChatRoom,
  RoomMessage,
  RoomParticipant
} from '../lib/chatRoomService';
import { auth } from '../lib/firebase';

interface ChatRoomProps {
  roomId: string;
  roomTitle: string;
  onBackClick?: () => void;
  onViewProfile?: (userId: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, roomTitle, onBackClick, onViewProfile }) => {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Join chat room on mount
  useEffect(() => {
    if (!auth.currentUser) {
      setError('You must be logged in to join a chat room');
      return;
    }
    
    const userId = auth.currentUser.uid;
    const username = auth.currentUser.displayName || 'Anonymous';
    const photoURL = auth.currentUser.photoURL || '';
    
    // Join the room
    joinChatRoom(roomId, userId, username, photoURL)
      .catch(err => {
        console.error('Error joining room:', err);
        setError('Failed to join chat room');
      });
    
    // Subscribe to messages
    const unsubscribeMessages = getRoomMessages(roomId, (newMessages) => {
      setMessages(newMessages);
    });
    
    // Subscribe to participants
    const unsubscribeParticipants = getRoomParticipants(roomId, (newParticipants) => {
      setParticipants(newParticipants);
    });
    
    // Leave room on unmount
    return () => {
      if (auth.currentUser) {
        leaveChatRoom(roomId, userId, username)
          .catch(err => console.error('Error leaving room:', err));
      }
      unsubscribeMessages();
      unsubscribeParticipants();
    };
  }, [roomId]);

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
      await sendRoomMessage(roomId, newMessage);
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-white dark:bg-zinc-800 p-4 border-b border-gray-200 dark:border-zinc-700 flex items-center">
        {onBackClick && (
          <button 
            onClick={onBackClick}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-med-green dark:hover:text-med-green mr-2"
            aria-label="Back to topics"
          >
            <IoChevronBack size={24} />
          </button>
        )}
        
        <h2 className="font-semibold text-gray-800 dark:text-white flex-1">{roomTitle}</h2>
        
        <button 
          onClick={() => setShowParticipants(!showParticipants)}
          className="text-gray-600 dark:text-gray-300 hover:text-med-green dark:hover:text-med-green flex items-center"
          title={showParticipants ? "Hide participants" : "Show participants"}
        >
          <IoPeople size={24} className="mr-1" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{participants.length}</span>
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
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
                const isSystemMessage = message.senderId === 'system';
                
                if (isSystemMessage) {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <div className="bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full text-sm">
                        {message.text}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isCurrentUser && (
                      <div 
                        className="w-8 h-8 rounded-full bg-med-green text-white flex items-center justify-center mr-2 cursor-pointer"
                        onClick={() => onViewProfile && onViewProfile(message.senderId)}
                      >
                        {message.senderPhotoURL ? (
                          <img src={message.senderPhotoURL} alt={message.senderName} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <IoPersonCircle size={32} />
                        )}
                      </div>
                    )}
                    <div 
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isCurrentUser 
                          ? 'bg-med-green text-white' 
                          : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-white'
                      }`}
                    >
                      {!isCurrentUser && (
                        <p className="text-xs font-medium mb-1">{message.senderName}</p>
                      )}
                      <p>{message.text}</p>
                      <p className="text-xs text-right mt-1 opacity-70">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Participants sidebar */}
        {showParticipants && (
          <div className="w-64 border-l border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 dark:border-zinc-700">
              <h3 className="font-medium text-gray-800 dark:text-white">Participants ({participants.length})</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-zinc-700">
              {participants.map((participant) => (
                <div 
                  key={participant.userId}
                  className="p-3 flex items-center hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                  onClick={() => onViewProfile && onViewProfile(participant.userId)}
                >
                  <div className="w-8 h-8 rounded-full bg-med-green text-white flex items-center justify-center mr-2 relative">
                    {participant.photoURL ? (
                      <img src={participant.photoURL} alt={participant.username} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <IoPersonCircle size={32} />
                    )}
                    <div 
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        participant.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{participant.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {participant.status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-4 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-white rounded-l-md focus:outline-none"
          />
          <button
            type="submit"
            className="bg-med-green text-white px-4 py-2 rounded-r-md hover:bg-dark-green transition-colors"
          >
            <IoSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
