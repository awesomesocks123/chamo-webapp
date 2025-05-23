'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthProvider';
import Link from 'next/link';
import { IoPerson, IoMenu, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { FaPlus } from 'react-icons/fa6';
import { FaUserFriends } from 'react-icons/fa';
import NavBar from '../components/NavBar';
import SettingsModal from '../components/SettingsModal';
import NotificationsPanel from '../components/NotificationsPanel';
import UserProfileModal from '../components/UserProfileModal';
import ProfileModal from '../components/ProfileModal';
import ChatInterface from '../components/ChatInterface';
import ChatSessionsList from '../components/ChatSessionsList';
import AddFriendsModal from '../components/AddFriendsModal';
// Quick add friends functionality removed
import { getUserFriends, UserProfile } from '../lib/userService';
import { auth } from '../lib/firebase';

export default function ChatPage() {
  const { authUser, setAuthUser, isInitializing } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showAddFriendsModal, setShowAddFriendsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Wait for authentication to initialize before checking
    if (isInitializing) {
      console.log('Auth is initializing, waiting...');
      return;
    }
    
    // Check if user is authenticated
    if (!authUser) {
      console.log('User not authenticated, redirecting to login');
      // Redirect to login if not authenticated
      router.replace('/');
    } else {
      // Load friends list to enable starting new chats
      loadFriends();
      setIsLoading(false);
    }
  }, [authUser, isInitializing, router]);
  
  // Load friends list
  const loadFriends = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const userFriends = await getUserFriends(currentUser.uid);
      setFriends(userFriends);
    } catch (err) {
      console.error('Error loading friends:', err);
    }
  };
  
  // Handle friend added event
  const handleFriendAdded = () => {
    loadFriends();
  };

  const handleSignOut = () => {
    // Clear the auth user from context
    setAuthUser(null);
    // Redirect to login page
    router.replace('/auth/login');
  };
  
  const handleNavButtonClick = (buttonName: string) => {
    // Handle different button actions
    switch (buttonName) {
      case 'messages':
        // Already on messages page, ensure sidebar is visible
        setSidebarCollapsed(false);
        break;
      case 'explore':
        // Navigate to explore page
        router.push('/explore');
        break;
      case 'profile':
        // Show user's profile modal
        setShowUserProfileModal(true);
        break;
      case 'settings':
        // Show settings modal
        setShowSettingsModal(true);
        break;
      case 'notifications':
        // Toggle notifications panel
        setShowNotifications(!showNotifications);
        break;
      case 'search':
        // Search functionality is handled in the NavBar component
        break;
      case 'notifications':
        // Toggle notifications panel
        setShowNotifications(!showNotifications);
        break;
      default:
        break;
    }
  };
  
  const handleUserSearch = (query: string) => {
    // Ensure the sidebar is visible to show search results
    setSidebarCollapsed(false);
    // The actual search is handled by the ChatSessionsList component
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    // Close sidebar on mobile when a chat is selected
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#191919] dark:bg-[#121212]">
        <p className="text-white font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#191919] dark:bg-[#121212]">
      {/* Header/Navbar */}
      <NavBar 
        onNavButtonClick={handleNavButtonClick} 
        onSignOut={handleSignOut}
        onNotificationUpdate={(count) => {
          // You can use this to update UI elements based on notification count
          console.log(`Notification count updated: ${count}`);
        }}
        onSearch={handleUserSearch}
      />

      {/* Friend Selection Modal for new chats */}
      {showFriendsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Start New Chat</h2>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowFriendsModal(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Select a friend to chat with</h3>

              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any friends yet</p>
                  <Link
                    href="/settings"
                    className="bg-med-green text-white py-2 px-4 rounded-md hover:bg-dark-green transition-colors"
                    onClick={() => setShowFriendsModal(false)}
                  >
                    Add Friends
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map(friend => (
                    <div
                      key={friend.uid}
                      onClick={() => {
                        handleChatSelect(friend.uid);
                        setShowFriendsModal(false);
                      }}
                      className="flex items-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-med-green text-white rounded-full flex items-center justify-center mr-3">
                        {friend.photoURL ? (
                          <img src={friend.photoURL} alt={friend.username} className="w-10 h-10 rounded-full" />
                        ) : (
                          friend.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">{friend.username}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{friend.status || 'Offline'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
      
      {/* User Profile Modal */}
      {showUserProfileModal && (
        <UserProfileModal onClose={() => setShowUserProfileModal(false)} />
      )}
      
      {/* View Other User Profile Modal */}
      {selectedUserId && (
        <ProfileModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}
      
      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel 
          onClose={() => setShowNotifications(false)} 
          onFriendRequestAction={() => {
            // Refresh friends list when a friend request is accepted or rejected
            loadFriends();
          }} 
        />
      )}
      
      {/* Add Friends Modal */}
      <AddFriendsModal 
        isOpen={showAddFriendsModal}
        onClose={() => setShowAddFriendsModal(false)}
        onFriendAdded={handleFriendAdded}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Always visible on mobile, can be collapsed on desktop */}
        <div className={`${sidebarCollapsed ? 'hidden md:hidden' : 'flex'} ${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 bg-[#f0f0f0] dark:bg-zinc-900 flex-col relative transition-all duration-300 ease-in-out`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-black dark:text-white text-xl font-semibold">Messages</h2>
            <div className="flex space-x-3">
              <button
                className="text-gray-700 dark:text-white hover:text-med-green transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddFriendsModal(true);
                }}
                title="Add friends"
                type="button"
              >
                <FaUserFriends size={20} />
              </button>
              <button
                className="text-gray-700 dark:text-white hover:text-med-green transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowFriendsModal(true);
                }}
                title="Start new chat"
                type="button"
              >
                <FaPlus size={20} />
              </button>
              {/* Collapse sidebar button - visible only on desktop */}
              <button
                className="hidden md:block text-gray-700 dark:text-white hover:text-med-green transition-colors"
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse sidebar"
                type="button"
              >
                <IoChevronBack size={20} />
              </button>
            </div>
          </div>
          
          {/* Chat Sessions List */}
          <div className="flex-1 overflow-hidden">
            <ChatSessionsList 
              onChatSelect={(userId) => {
                handleChatSelect(userId);
                // On mobile, collapse sidebar when a chat is selected
                if (window.innerWidth < 768) {
                  setSidebarCollapsed(true);
                }
              }}
              selectedChatId={selectedChat}
              onViewProfile={setSelectedUserId}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} ${sidebarCollapsed ? 'w-full' : 'w-full md:w-2/3 lg:w-3/4'} bg-[#f0f0f0] dark:bg-zinc-950 flex-col h-full relative`}>
          {/* Expand sidebar button - visible only when sidebar is collapsed on desktop */}
          {sidebarCollapsed && (
            <button
              className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-white p-1 rounded-r-md shadow-md z-10"
              onClick={() => setSidebarCollapsed(false)}
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <IoChevronForward size={16} />
            </button>
          )}
          {selectedChat ? (
            <ChatInterface 
              recipientId={selectedChat} 
              onBackClick={() => {
                // On mobile, just clear the selected chat to show the sidebar again
                // On desktop with collapsed sidebar, expand it
                if (window.innerWidth < 768) {
                  setSelectedChat(null);
                } else if (sidebarCollapsed) {
                  setSidebarCollapsed(false);
                }
              }}
              onViewProfile={setSelectedUserId}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 bg-[#474747] dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <IoPerson size={40} className="text-gray-400" />
              </div>
              <h3 className="text-white text-xl font-medium mb-2">No chat selected</h3>
              <p className="text-gray-400 mb-6">Select a chat from the sidebar or start a new conversation</p>
              <button 
                className="bg-med-green hover:bg-dark-green text-white py-2 px-4 rounded-md transition-colors mb-6"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowFriendsModal(true);
                }}
                type="button"
              >
                Start New Chat
              </button>
              
              {/* Quick add friends button removed */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
