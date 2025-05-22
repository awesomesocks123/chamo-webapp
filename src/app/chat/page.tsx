'use client';

import { useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthProvider';
import Link from 'next/link';
import { IoPerson } from 'react-icons/io5';
import { HiDotsVertical } from 'react-icons/hi';
import { MdSearch, MdSend } from 'react-icons/md';
import { BiHappy } from 'react-icons/bi';
import { FaPlus } from 'react-icons/fa6';
import { IoMdPerson } from 'react-icons/io';
import NavBar from '../components/NavBar';
import DropdownMenu from '../components/DropdownMenu';
import ProfileModal from '../components/ProfileModal';
import SettingsModal from '../components/SettingsModal';
import NotificationsPanel from '../components/NotificationsPanel';
import UserProfileModal from '../components/UserProfileModal';

// Mock data for demonstration purposes
const mockChatSessions = [
  {
    id: '1',
    username: 'User1',
    lastMessage: 'Hey, how are you?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    iconColor: '#4CAF50'
  },
  {
    id: '2',
    username: 'User2',
    lastMessage: 'Did you see the new movie?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    iconColor: '#2196F3'
  },
  {
    id: '3',
    username: 'User3',
    lastMessage: "Let me know when you're free",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    iconColor: '#9C27B0'
  }
];

const mockMessages = [
  {
    id: '1',
    senderId: 'currentUser',
    message: 'Hey there!',
    timestamp: new Date(Date.now() - 1000 * 60 * 10)
  },
  {
    id: '2',
    senderId: 'otherUser',
    message: 'Hi! How are you doing?',
    timestamp: new Date(Date.now() - 1000 * 60 * 9)
  },
  {
    id: '3',
    senderId: 'currentUser',
    message: "I'm doing great! Just working on this chat app.",
    timestamp: new Date(Date.now() - 1000 * 60 * 8)
  },
  {
    id: '4',
    senderId: 'otherUser',
    message: 'That sounds interesting! What features are you implementing?',
    timestamp: new Date(Date.now() - 1000 * 60 * 7)
  }
];

export default function ChatPage() {
  const { authUser, setAuthUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [chatSessions, setChatSessions] = useState(mockChatSessions);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeNavButton, setActiveNavButton] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!authUser) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else {
      setIsLoading(false);
      // In a real app, you would fetch chat sessions from Firebase here
    }
  }, [authUser, router]);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Select the first chat by default
  useEffect(() => {
    if (chatSessions.length > 0 && !selectedChat) {
      setSelectedChat(chatSessions[0].id);
    }
  }, [chatSessions, selectedChat]);

  const handleSignOut = () => {
    // Clear the auth user from context
    setAuthUser(null);
    // Redirect to login page
    router.replace('/auth/login');
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  
  const handleNavButtonClick = (buttonName: string) => {
    setActiveNavButton(buttonName);
    
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
      case 'search':
        // Search functionality is handled in the NavBar component
        // The search input will be displayed when this is clicked
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
    // Filter chat sessions based on the search query
    setSearchQuery(query);
    // Ensure the sidebar is visible to show search results
    setSidebarCollapsed(false);
  };

  const handleDropdownItemClick = (item: string) => {
    // Handle dropdown menu actions
    switch (item) {
      case 'Add Friend':
        alert('Friend request sent!');
        break;
      case 'Block':
        alert('User blocked!');
        break;
      case 'Report':
        alert('Report submitted!');
        break;
      case 'Clear Chat':
        // Clear messages for the selected chat
        setMessages([]);
        break;
      case 'Close Chat':
        // Remove the chat from the list
        setChatSessions(chatSessions.filter(chat => chat.id !== selectedChat));
        // Select another chat if available
        if (chatSessions.length > 1) {
          const newSelectedChat = chatSessions.find(chat => chat.id !== selectedChat)?.id || null;
          setSelectedChat(newSelectedChat);
        } else {
          setSelectedChat(null);
        }
        break;
      default:
        break;
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    // In a real app, you would fetch messages for this chat from Firebase
  };
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const newMsg = {
      id: Date.now().toString(),
      senderId: 'currentUser',
      message: newMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    // In a real app, you would send this message to Firebase
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12) || 12;
    
    return `${formattedHours}:${minutes} ${ampm}`;
  };
  
  const getDisplayTime = (date: Date) => {
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
  
  const filteredChatSessions = chatSessions.filter(chat => 
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-light-green">
        <p className="text-dark-green font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#191919]">
      {/* Header/Navbar */}
      <NavBar 
        onNavButtonClick={handleNavButtonClick}
        onSignOut={handleSignOut}
        onSearch={handleUserSearch}
      />
      
      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className={`bg-med-green dark:bg-light-green flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'min-w-[340px] max-w-[500px] w-full'}`}>
          {/* Sidebar Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-300">
            <h2 className="text-xl font-medium text-dark-grey">Chats</h2>
            <div className="flex space-x-2">
              <button className="text-dark-grey hover:text-black">
                <MdSearch size={24} />
              </button>
              <button className="text-dark-grey hover:text-black">
                <HiDotsVertical size={24} />
              </button>
              {!sidebarCollapsed && (
                <button 
                  className="text-dark-grey hover:text-black"
                  onClick={() => setSidebarCollapsed(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex justify-between items-center p-3">
            <input
              type="text"
              placeholder="Find Users and Chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg bg-[#f7fee7] text-black text-sm font-light outline-none px-4 py-2 flex-grow h-[35px] placeholder:text-gray-500 placeholder:text-sm"
            />
          </div>
          
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChatSessions.length > 0 ? (
              filteredChatSessions.map((chat) => (
                <div 
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className={`flex items-center cursor-pointer w-full h-[85px] px-3 hover:bg-[#f0f9e9] ${selectedChat === chat.id ? 'bg-[#f0f9e9]' : ''}`}
                >
                  <IoPerson size={40} color={chat.iconColor} className="rounded-full w-[50px] mr-5" />
                  <div className="flex justify-between border-t border-neutral-700 w-full h-full py-3">
                    <div className="flex flex-col justify-between text-black">
                      <h3 className="font-medium ">{chat.username}</h3>
                      <p className="text-sm truncate max-w-[180px]">{chat.lastMessage}</p>
                    </div>
                    <div className="flex flex-col justify-between items-end h-full text-xs">
                      <p className="text-[#4c0519]">{getDisplayTime(chat.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                <p>No chats found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`bg-[#313131] dark:bg-light-grey flex flex-col relative transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'flex-1' : 'flex-1'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex justify-between bg-med-green dark:bg-dark-grey text-dark-grey dark:text-white h-[60px] p-3">
                <div className="flex items-center">
                  {/* Only show hamburger menu when sidebar is collapsed */}
                  {sidebarCollapsed && (
                    <button 
                      className="mr-3 text-dark-grey hover:text-black"
                      onClick={() => setSidebarCollapsed(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  )}
                  
                  <button onClick={() => setShowProfileModal(!showProfileModal)}>
                    <IoPerson 
                      size={45} 
                      color={chatSessions.find(c => c.id === selectedChat)?.iconColor || '#000'} 
                      className="rounded-full mr-5 cursor-pointer hover:opacity-80" 
                    />
                  </button>
                  <div className="flex justify-between w-[300px]">
                    <h1 className="text-black dark:text-dark-grey font-medium">
                      {chatSessions.find(c => c.id === selectedChat)?.username}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center">
                  <DropdownMenu 
                    items={['Add Friend', 'Block', 'Report', 'Clear Chat', 'Close Chat']} 
                    onItemClick={handleDropdownItemClick} 
                  />
                </div>
              </div>
              
              {/* Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 bg-[#f7fee7] dark:bg-off-white overflow-y-auto p-4"
              >
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex mb-4 ${msg.senderId === 'currentUser' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`rounded-xl p-5 px-4 py-2 max-w-xl border ${
                        msg.senderId === 'currentUser'
                          ? 'text-black bg-blue-200 border-blue-400'
                          : 'text-black bg-light-green border-[#7c9a6e]'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="flex items-center bg-light-green dark:bg-light-grey w-full h-[70px] p-3">
                <button className="px-2 text-gray-700 hover:text-black" onClick={toggleEmojiPicker}>
                  <BiHappy size={25} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-30 bg-white shadow-lg rounded-lg">
                    {/* Emoji picker would go here in a real implementation */}
                    <div className="p-2 grid grid-cols-8 gap-1">
                      {['😀', '😂', '😊', '❤️', '👍', '🎉', '🔥', '⭐'].map((emoji, i) => (
                        <button 
                          key={i} 
                          className="hover:bg-gray-100 p-1 rounded"
                          onClick={() => {
                            setNewMessage(prev => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Type a message"
                  className="bg-[#dcfce7] dark:bg-slate-100 rounded-xl outline-none text-sm text-black w-full h-full px-3 placeholder:text-sm placeholder:text-black"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  autoFocus
                />
                <button 
                  className="px-2 text-gray-700 hover:text-black"
                  onClick={handleSendMessage}
                >
                  <MdSend size={25} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex justify-center items-center bg-[#f7fee7] text-gray-500">
              <div className="text-center">
                <h2 className="text-xl font-medium text-dark-green mb-2">Welcome to Chamo Chat!</h2>
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Profile Modal */}
      {showProfileModal && selectedChat && (
        <div className="absolute top-0 right-0 h-full w-1/3 bg-white shadow-lg z-10 transition-all duration-300 transform translate-x-0">
          <ProfileModal 
            username={chatSessions.find(c => c.id === selectedChat)?.username || ''}
            iconColor={chatSessions.find(c => c.id === selectedChat)?.iconColor || '#000'}
            onClose={() => setShowProfileModal(false)}
          />
        </div>
      )}
      
      {/* User Profile Modal */}
      {showUserProfileModal && (
        <div className="absolute top-0 left-0 h-full w-1/3 bg-white shadow-lg z-10 transition-all duration-300 transform translate-x-0">
          <UserProfileModal 
            username={authUser || 'User'}
            email="user@example.com"
            onClose={() => setShowUserProfileModal(false)}
          />
        </div>
      )}
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="absolute top-0 right-0 h-full w-1/3 bg-white shadow-lg z-10 transition-all duration-300 transform translate-x-0">
          <SettingsModal 
            onClose={() => setShowSettingsModal(false)}
          />
        </div>
      )}
    </div>
  );
}
