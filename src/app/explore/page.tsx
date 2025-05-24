'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AuthContext } from '../context/AuthProvider';
import { useAppData } from '../context/AppDataProvider';
import NavBar from '../components/NavBar';
import { IoPerson } from 'react-icons/io5';
import { IoSearch, IoCloseCircleOutline } from 'react-icons/io5';
import { FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import SettingsModal from '../components/SettingsModal';
import UserProfileModal from '../components/UserProfileModal';
import NotificationsPanel from '../components/NotificationsPanel';
import { getChatRooms, createChatRoom, ChatRoom, togglePinChatRoom, deleteChatRoom, claimChatRoomOwnership } from '../lib/chatRoomService';

// Default chat rooms to create if none exist
const defaultChatRooms: Omit<ChatRoom, 'id' | 'createdAt' | 'activeUsers'>[] = [
  {
    title: 'Anime',
    description: 'Discuss your favorite anime series and characters',
    category: 'Entertainment',
    isDefault: true
  },
  {
    title: 'Gaming',
    description: 'Connect with fellow gamers and discuss the latest games',
    category: 'Entertainment',
    isDefault: true
  },
  {
    title: 'Art',
    description: 'Share your artwork and get inspired by others',
    category: 'Creative',
    isDefault: true
  },
  {
    title: 'Coding',
    description: 'Discuss programming languages, projects, and coding challenges',
    category: 'Technology',
    isDefault: true
  },
  {
    title: 'Photography',
    description: 'Share photography tips, techniques, and your best shots',
    category: 'Creative',
    isDefault: true
  }
];

export default function ExplorePage() {
  const { authUser, setAuthUser, isInitializing } = useContext(AuthContext);
  const { chatRooms, setChatRooms, isLoading: isDataLoading } = useAppData();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<ChatRoom[]>([]);
  const [topics, setTopics] = useState<ChatRoom[]>([]);
  const [toggleTopicPage, setTopicPage] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicCategory, setTopicCategory] = useState('User Created');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [sorted, setSorted] = useState({ sorted: "title", reversed: false });
  
  // For NavBar functionality
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);

  useEffect(() => {
    // Don't do anything while auth is initializing
    if (isInitializing) {
      console.log('Auth is initializing, waiting...');
      return;
    }
    
    // Check if user is authenticated after initialization is complete
    if (!authUser) {
      console.log('User not authenticated, redirecting to login');
      // Redirect to login if not authenticated
      router.replace('/');
      return;
    }
    
    // First, check if we already have cached chat rooms in our global state
    if (chatRooms.length > 0) {
      console.log('Using cached chat rooms from global state');
      setTopics(chatRooms);
      setFilteredItems(chatRooms);
      setIsLoading(false);
    }
    
    // Subscribe to chat rooms even if we have cached data to ensure it stays fresh
    const unsubscribe = getChatRooms((rooms) => {
      // Update both local state and global state
      setTopics(rooms);
      setFilteredItems(rooms);
      setChatRooms(rooms); // Store in global AppDataProvider state
      
      // If no rooms exist, create default rooms
      if (rooms.length === 0) {
        console.log('No chat rooms found, creating default rooms...');
        createDefaultRooms();
      }
      
      setIsLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [authUser, router, chatRooms.length, setChatRooms]);
  
  // Create default chat rooms
  const createDefaultRooms = async () => {
    try {
      for (const room of defaultChatRooms) {
        await createChatRoom(room);
      }
      console.log('Default chat rooms created successfully');
    } catch (error) {
      console.error('Error creating default chat rooms:', error);
    }
  };

  const handleSignOut = () => {
    // Clear the auth user from context
    setAuthUser(null);
    // Redirect to login page
    router.replace('/auth/login');
  };

  const handleNavButtonClick = (buttonName: string) => {
    switch (buttonName) {
      case 'messages':
        router.push('/chat');
        break;
      case 'explore':
        // Already on explore page
        break;
      case 'profile':
        setShowUserProfileModal(true);
        break;
      case 'settings':
        setShowSettingsModal(true);
        break;
      case 'search':
        // Focus on search input
        const searchInput = document.querySelector('input[placeholder="Search topics..."]');
        if (searchInput) {
          (searchInput as HTMLInputElement).focus();
        }
        break;
      case 'notifications':
        setShowNotifications(!showNotifications);
        break;
      default:
        break;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query) {
      setFilteredItems(topics);
      return;
    }
    
    const filtered = topics.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredItems(filtered);
  };

  const sortByName = () => {
    const topicsCopy = [...topics];
    if (sorted.sorted === "title") {
      topicsCopy.sort((a, b) => {
        if (sorted.reversed) {
          return b.title.localeCompare(a.title);
        }
        return a.title.localeCompare(b.title);
      });
      setSorted({ sorted: "title", reversed: !sorted.reversed });
    }
    setTopics([...topicsCopy]);
  };

  const renderArrow = () => {
    if (sorted.reversed) {
      return <FaArrowUp />;
    }
    return <FaArrowDown />;
  };

  const CreateTopicBtn = () => {
    return (
      <button 
        onClick={() => setTopicPage(!toggleTopicPage)} 
        className="h-[45px] px-6 py-2 ml-4 rounded-md transition-colors hover:opacity-90 bg-med-green dark:bg-dark-green text-dark-grey dark:text-lighter-green"
      >
        Add Topic
      </button>
    );
  };

  const ExitBtn = () => {
    return (
      <button 
        onClick={() => setTopicPage(false)} 
        className="text-dark-grey dark:text-lighter-green hover:opacity-80"
      >
        <IoCloseCircleOutline size={42} />
      </button>
    );
  };



  const handleTogglePin = async (roomId: string) => {
    try {
      setError(null);
      await togglePinChatRoom(roomId);
      setSuccessMessage('Topic pin status updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error toggling pin status:', error);
      setError(error.message || 'Failed to update pin status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteTopic = async (roomId: string) => {
    try {
      setError(null);
      if (window.confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
        await deleteChatRoom(roomId);
        setSuccessMessage('Topic deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Error deleting topic:', error);
      setError(error.message || 'Failed to delete topic');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleClaimOwnership = async (roomId: string) => {
    try {
      setError(null);
      if (window.confirm('Do you want to claim ownership of this topic? This will allow you to delete it.')) {
        await claimChatRoomOwnership(roomId);
        setSuccessMessage('You now own this topic and can delete it');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Error claiming topic ownership:', error);
      setError(error.message || 'Failed to claim topic ownership');
      setTimeout(() => setError(null), 3000);
    }
  };

  const CreateTopic = async () => {
    try {
      setError(null);
      
      if (!topicTitle.trim()) {
        setError('Topic title is required');
        return;
      }
      
      if (!topicDescription.trim()) {
        setError('Topic description is required');
        return;
      }
      
      // Create a new chat room in Firestore
      const newRoom = {
        title: topicTitle,
        description: topicDescription,
        category: topicCategory
      };
      
      await createChatRoom(newRoom);
      
      // Reset form
      setTopicTitle('');
      setTopicDescription('');
      setTopicCategory('User Created');
      setTopicPage(false);
      setSuccessMessage('Topic created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Note: We don't need to update the topics state manually
      // as our Firestore subscription will automatically update it
    } catch (error: any) {
      console.error('Error creating chat room:', error);
      setError(error.message || 'Failed to create chat room');
    }
  };



  // Function to get the appropriate image path based on topic title
  const getTopicImagePath = (title: string) => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('anime')) return '/topics/topic-anime.png';
    if (titleLower.includes('art')) return '/topics/topic-art.jpg';
    if (titleLower.includes('coding') || titleLower.includes('programming')) return '/topics/topic-coding.jpg';
    if (titleLower.includes('comic')) return '/topics/topic-comic.png';
    if (titleLower.includes('cooking') || titleLower.includes('food')) return '/topics/topic-cooking.jpg';
    if (titleLower.includes('gaming') || titleLower.includes('game')) return '/topics/topic-game.png';
    if (titleLower.includes('movie') || titleLower.includes('film')) return '/topics/topic-movies.jpg';
    if (titleLower.includes('music')) return '/topics/topic-music.png';
    if (titleLower.includes('photo') || titleLower.includes('photography')) return '/topics/topic-photo.jpg';
    if (titleLower.includes('sports') || titleLower.includes('sport')) return '/topics/topic-sports.jpg';
    if (titleLower.includes('tabletop') || titleLower.includes('board game')) return '/topics/topic-tabletop.jpg';
    
    // Default to a random image if no match is found
    const imagePaths = [
      '/topics/topic-anime.png',
      '/topics/topic-art.jpg',
      '/topics/topic-coding.jpg',
      '/topics/topic-game.png',
      '/topics/topic-music.png',
      '/topics/topic-photo.jpg'
    ];
    return imagePaths[Math.floor(Math.random() * imagePaths.length)];
  };

  const TopicCard = ({ topic }: { topic: ChatRoom }) => {
    const router = useRouter();
    
    const handleJoinRoom = () => {
      // Navigate to the chat room page
      router.push(`/chatroom/${topic.id}`);
    };
    
    // Get the appropriate image path for this topic
    const topicImagePath = getTopicImagePath(topic.title);
    
    // Check if the current user is the creator of this topic
    const isCreator = topic.creatorId === authUser;
    
    // Determine if the topic can be deleted (only user-created topics by the current user)
    const canDelete = isCreator && !topic.isDefault;
    
    // Determine if the topic can be claimed (not default and has no creator or creator is current user)
    const canClaim = !topic.isDefault && (!topic.creatorId || topic.creatorId === authUser);
    
    return (
      <div className="rounded-lg shadow-md overflow-hidden bg-white dark:bg-zinc-700">
        {/* Topic Image with Background */}
        <div 
          className="h-40 flex items-center justify-center relative"
          style={{
            backgroundImage: `url(${topicImagePath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center p-2">
            <h3 className="text-xl font-semibold text-white drop-shadow-md">{topic.title}</h3>
          </div>
          
          {/* Pin/Unpin Button */}
          <div className="absolute top-2 right-2 z-20">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (topic.id) handleTogglePin(topic.id);
              }}
              className="p-1 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-colors"
              title={topic.isPinned ? 'Unpin topic' : 'Pin topic'}
            >
              {topic.isPinned ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Delete Button - Only shown for user-created topics */}
          {canDelete && (
            <div className="absolute top-2 left-2 z-20">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (topic.id) handleDeleteTopic(topic.id);
                }}
                className="p-1 rounded-full bg-white/80 hover:bg-red-100 text-red-600 transition-colors"
                title="Delete topic"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Claim Ownership Button - For topics without an owner */}
          {canClaim && !isCreator && (
            <div className="absolute top-2 left-2 z-20">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (topic.id) handleClaimOwnership(topic.id);
                }}
                className="p-1 rounded-full bg-white/80 hover:bg-green-100 text-green-600 transition-colors"
                title="Claim ownership of this topic"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {/* Topic Details */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{topic.title}</h3>
            {topic.isDefault && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">Default</span>
            )}
            {isCreator && !topic.isDefault && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">Created by you</span>
            )}
          </div>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{topic.description}</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">{topic.category}</span>
            <button 
              onClick={handleJoinRoom}
              className="px-4 py-2 rounded-md transition-colors hover:opacity-90 bg-med-green dark:bg-dark-green text-dark-grey dark:text-lighter-green"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-light-green dark:bg-[#191919]">
        <p className="font-medium text-dark-grey dark:text-lighter-green">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-light-green dark:!bg-[#191919]">
      {/* Header/Navbar */}
      <NavBar 
        onNavButtonClick={handleNavButtonClick}
        onSignOut={handleSignOut}
        onSearch={handleSearch}
      />
      
      {/* Modals */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
      
      {showUserProfileModal && (
        <UserProfileModal onClose={() => setShowUserProfileModal(false)} />
      )}
      
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      <div className="flex-1 overflow-y-auto bg-light-green dark:!bg-[#191919]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search and Add Topic */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-1/2">
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-med-green"
              />
              <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="flex items-center">
              <button 
                onClick={sortByName} 
                className="flex items-center px-4 py-2 rounded-md transition-colors mr-4 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600"
              >
                Sort {sorted.sorted === "title" && renderArrow()}
              </button>
              <CreateTopicBtn />
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="rounded-lg p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
              <p>{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="rounded-lg p-3 mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
              <p>{successMessage}</p>
            </div>
          )}
          
          {/* Create Topic Form */}
          {toggleTopicPage && (
            <div className="rounded-lg shadow-md p-6 mb-6 bg-white dark:bg-zinc-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Create Topic</h2>
                <ExitBtn />
              </div>
              <div className="flex gap-6">
                <div className="w-1/2">
                  <input
                    type="text"
                    placeholder="Enter your topic! (Ex. Anime, Gaming, Music, etc)"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    className="w-full border rounded-md py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-med-green bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-zinc-600"
                  />
                  <textarea
                    placeholder="Enter your topic description!"
                    value={topicDescription}
                    onChange={(e) => setTopicDescription(e.target.value)}
                    className="w-full h-32 border rounded-md py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-med-green resize-none bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-zinc-600"
                  />
                  <select
                    value={topicCategory}
                    onChange={(e) => setTopicCategory(e.target.value)}
                    className="w-full border rounded-md py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-med-green bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-zinc-600"
                  >
                    <option value="User Created">User Created</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Technology">Technology</option>
                    <option value="Creative">Creative</option>
                    <option value="Education">Education</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Other">Other</option>
                  </select>
                  <button 
                    onClick={CreateTopic} 
                    className="font-medium py-2 px-6 rounded-md transition-colors hover:opacity-90 bg-med-green dark:bg-dark-green text-dark-grey dark:text-lighter-green"
                  >
                    Submit
                  </button>
                </div>
                <div className="w-1/2 border-l pl-6 border-gray-200 dark:border-zinc-600">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Topic Guidelines</h3>
                  <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-2">
                    <li>You can create your own topics to discuss with others</li>
                    <li>You can pin/unpin any topic to customize your view</li>
                    <li>You can only delete topics that you've created</li>
                    <li>Default topics cannot be deleted but can be unpinned</li>
                    <li>Be respectful and follow community guidelines</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredItems.length > 0 ? filteredItems : topics).map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
