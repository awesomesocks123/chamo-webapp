'use client';

import React, { useState, useEffect } from 'react';
import { IoPersonCircle, IoChatbubble, IoPeople } from 'react-icons/io5';
import { MdSearch } from 'react-icons/md';
import { getChatSessions, ChatSession } from '../lib/messageService';
import { getUserProfile, getUserFriends, UserProfile } from '../lib/userService';
import { auth } from '../lib/firebase';

interface ChatSessionsListProps {
  onChatSelect: (userId: string) => void;
  selectedChatId: string | null;
  onViewProfile?: (userId: string) => void;
}

interface EnhancedChatSession extends ChatSession {
  username: string;
  photoURL?: string;
  otherUserId: string;
}

const ChatSessionsList: React.FC<ChatSessionsListProps> = ({ onChatSelect, selectedChatId, onViewProfile }) => {
  const [chatSessions, setChatSessions] = useState<EnhancedChatSession[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'chats' | 'friends'>('chats');

  // Load chat sessions and friends
  useEffect(() => {
    // Load chat sessions
    const loadChatSessions = () => {
      const unsubscribe = getChatSessions(async (sessions) => {
        try {
          console.log('Received chat sessions:', sessions);
          
          // Enhance sessions with user data
          const enhancedSessions = await Promise.all(
            sessions.map(async (session) => {
              // Get the current user ID
              const currentUserId = auth.currentUser?.uid;
              if (!currentUserId) {
                return {
                  ...session,
                  username: 'Unknown User',
                  otherUserId: 'unknown', // Add required property
                };
              }
              
              // Find the other user in the participants array
              const otherUserId = session.participants.find(id => id !== currentUserId);
              console.log('Session participants:', session.participants, 'Current user:', currentUserId, 'Other user:', otherUserId);
              
              if (!otherUserId) {
                return {
                  ...session,
                  username: 'Unknown User',
                  otherUserId: currentUserId, // Default to self
                };
              }
              
              // Get the other user's profile
              try {
                const userProfile = await getUserProfile(otherUserId);
                return {
                  ...session,
                  username: userProfile?.username || 'Unknown User',
                  photoURL: userProfile?.photoURL,
                  otherUserId,
                };
              } catch (err) {
                console.error('Error getting user profile:', err);
                return {
                  ...session,
                  username: 'Unknown User',
                  otherUserId,
                };
              }
            })
          );
          
          setChatSessions(enhancedSessions);
          setLoading(false);
        } catch (err) {
          console.error('Error enhancing chat sessions:', err);
          setError('Failed to load chat sessions');
          setLoading(false);
        }
      });
      
      return unsubscribe;
    };
    
    // Load friends list
    const loadFriends = async () => {
      if (!auth.currentUser) return;
      
      try {
        const friendsList = await getUserFriends(auth.currentUser.uid);
        setFriends(friendsList);
      } catch (err) {
        console.error('Error loading friends:', err);
        // Don't set error here to avoid overriding chat sessions error
      }
    };
    
    // Initialize both
    const unsubscribe = loadChatSessions();
    loadFriends();
    
    return () => unsubscribe();
  }, []);

  // Format timestamp
  const getDisplayTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const timeDiff = now.getTime() - date.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      return formatTime(date);
    } else if (hoursDiff < 48) {
      return 'Yesterday';
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12) || 12;
    
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // Filter sessions based on search query
  const filteredSessions = chatSessions.filter(session => 
    session.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Loading chats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter tabs and search bar */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-700 space-y-3">
        {/* Filter tabs */}
        <div className="flex border-b border-gray-200 dark:border-zinc-700">
          <button
            className={`flex-1 py-2 px-1 font-medium text-sm flex items-center justify-center ${
              activeView === 'chats'
                ? 'text-med-green border-b-2 border-med-green'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveView('chats')}
          >
            <IoChatbubble className="mr-2" size={16} /> Chats
          </button>
          <button
            className={`flex-1 py-2 px-1 font-medium text-sm flex items-center justify-center ${
              activeView === 'friends'
                ? 'text-med-green border-b-2 border-med-green'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveView('friends')}
          >
            <IoPeople className="mr-2" size={16} /> Friends
          </button>
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder={activeView === 'chats' ? "Search chats..." : "Search friends..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-med-green dark:bg-zinc-700 dark:text-white"
          />
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
        </div>
      </div>
      
      {/* Content based on active view */}
      <div className="flex-1 overflow-y-auto">
        {/* Chat Sessions View */}
        {activeView === 'chats' && (
          <>
            {filteredSessions.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No chats found</p>
              </div>
            ) : (
              <div>
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onChatSelect(session.otherUserId)}
                    className={`flex items-center p-4 border-b border-gray-200 dark:border-zinc-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 ${
                      selectedChatId === session.otherUserId ? 'bg-gray-100 dark:bg-zinc-700' : ''
                    }`}
                  >
                    <div 
                      className="w-12 h-12 bg-med-green text-white rounded-full flex items-center justify-center mr-3"
                    >
                      {session.photoURL ? (
                        <img src={session.photoURL} alt={session.username} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <IoPersonCircle size={48} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-gray-800 dark:text-white truncate">{session.username}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                          {session.lastMessageTimestamp ? getDisplayTime(session.lastMessageTimestamp) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {session.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    {session.unreadCount && session.unreadCount > 0 && (
                      <div className="ml-2 bg-med-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {session.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Friends List View */}
        {activeView === 'friends' && (
          <>
            {/* Filter friends based on search query */}
            {(() => {
              const filteredFriends = friends.filter(friend => 
                friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (friend.email && friend.email.toLowerCase().includes(searchQuery.toLowerCase()))
              );
              
              return filteredFriends.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">
                    {friends.length === 0 ? 'No friends yet' : 'No friends match your search'}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.uid}
                      onClick={() => onChatSelect(friend.uid)}
                      className="flex items-center p-4 border-b border-gray-200 dark:border-zinc-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700"
                    >
                      <div 
                        className="w-12 h-12 bg-med-green text-white rounded-full flex items-center justify-center mr-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the chat selection
                          if (onViewProfile) {
                            onViewProfile(friend.uid);
                          }
                        }}
                        title="View profile"
                      >
                        {friend.photoURL ? (
                          <img src={friend.photoURL} alt={friend.username} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <IoPersonCircle size={48} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 dark:text-white truncate">{friend.username}</h3>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {friend.status || 'Offline'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSessionsList;
