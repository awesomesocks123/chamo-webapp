'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthProvider';
import NavBar from '../components/NavBar';
import { IoPerson } from 'react-icons/io5';
import { IoSearch, IoCloseCircleOutline } from 'react-icons/io5';
import { FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import SettingsModal from '../components/SettingsModal';
import UserProfileModal from '../components/UserProfileModal';
import NotificationsPanel from '../components/NotificationsPanel';
import { getChatRooms, createChatRoom, ChatRoom } from '../lib/chatRoomService';

// Default chat rooms to create if none exist
const defaultChatRooms: Omit<ChatRoom, 'id' | 'createdAt' | 'activeUsers'>[] = [
  {
    title: 'Anime',
    description: 'Discuss your favorite anime series and characters',
    category: 'Entertainment'
  },
  {
    title: 'Gaming',
    description: 'Connect with fellow gamers and discuss the latest games',
    category: 'Entertainment'
  },
  {
    title: 'Art',
    description: 'Share your artwork and get inspired by others',
    category: 'Creative'
  },
  {
    title: 'Coding',
    description: 'Discuss programming languages, projects, and coding challenges',
    category: 'Technology'
  },
  {
    title: 'Photography',
    description: 'Share photography tips, techniques, and your best shots',
    category: 'Creative'
  }
];

export default function ExplorePage() {
  const { authUser, setAuthUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<ChatRoom[]>([]);
  const [topics, setTopics] = useState<ChatRoom[]>([]);
  const [toggleTopicPage, setTopicPage] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');

  const [sorted, setSorted] = useState({ sorted: "title", reversed: false });
  
  // For NavBar functionality
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!authUser) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
      return;
    }
    
    // Subscribe to chat rooms
    const unsubscribe = getChatRooms((rooms) => {
      setTopics(rooms);
      setFilteredItems(rooms);
      
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
  }, [authUser, router]);
  
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



  const CreateTopic = async () => {
    try {
      // Create a new chat room in Firestore
      const newRoom = {
        title: topicTitle,
        description: topicDescription,
        category: 'User Created'
      };
      
      await createChatRoom(newRoom);
      
      // Reset form
      setTopicTitle('');
      setTopicDescription('');
      setTopicPage(false);
      
      // Note: We don't need to update the topics state manually
      // as our Firestore subscription will automatically update it
    } catch (error) {
      console.error('Error creating chat room:', error);
      alert('Failed to create chat room. Please try again.');
    }
  };



  const TopicCard = ({ topic }: { topic: ChatRoom }) => {
    const router = useRouter();
    
    const handleJoinRoom = () => {
      // Navigate to the chat room page
      router.push(`/chatroom/${topic.id}`);
    };
    
    return (
      <div className="rounded-lg shadow-md overflow-hidden bg-white dark:bg-zinc-700">
        <div className="h-40 relative flex items-center justify-center bg-gray-300 dark:bg-zinc-600">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-lighter-green">{topic.title}</h3>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{topic.title}</h3>
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
        <div className="fixed top-16 right-4 z-50">
          <NotificationsPanel onClose={() => setShowNotifications(false)} />
        </div>
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
                  <button 
                    onClick={CreateTopic} 
                    className="font-medium py-2 px-6 rounded-md transition-colors hover:opacity-90 bg-med-green dark:bg-dark-green text-dark-grey dark:text-lighter-green"
                  >
                    Submit
                  </button>
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
