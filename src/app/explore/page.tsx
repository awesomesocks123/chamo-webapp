'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthProvider';
import NavBar from '../components/NavBar';
import { IoPerson } from 'react-icons/io5';
import { IoSearch, IoCloseCircleOutline } from 'react-icons/io5';
import { FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import Image from 'next/image';
import SettingsModal from '../components/SettingsModal';
import UserProfileModal from '../components/UserProfileModal';
import NotificationsPanel from '../components/NotificationsPanel';

// Mock data for topics
const mockTopics = [
  {
    id: '1',
    topicTitle: 'Anime',
    topicDescription: 'Discuss your favorite anime series and characters',
    topicCreator: 'user1',
    subscribers: 1250,
    topicImage: '/anime.jpg'
  },
  {
    id: '2',
    topicTitle: 'Gaming',
    topicDescription: 'Share gaming experiences, tips, and find gaming buddies',
    topicCreator: 'user2',
    subscribers: 2100,
    topicImage: '/gaming.jpg'
  },
  {
    id: '3',
    topicTitle: 'Music',
    topicDescription: 'Talk about your favorite artists, songs, and music genres',
    topicCreator: 'user3',
    subscribers: 1800,
    topicImage: '/music.jpg'
  },
  {
    id: '4',
    topicTitle: 'Art',
    topicDescription: 'Share your artwork and get inspired by others',
    topicCreator: 'user4',
    subscribers: 950,
    topicImage: '/art.jpg'
  },
  {
    id: '5',
    topicTitle: 'Coding',
    topicDescription: 'Discuss programming languages, projects, and coding challenges',
    topicCreator: 'user5',
    subscribers: 1500,
    topicImage: '/coding.jpg'
  },
  {
    id: '6',
    topicTitle: 'Photography',
    topicDescription: 'Share photography tips, techniques, and your best shots',
    topicCreator: 'user6',
    subscribers: 1100,
    topicImage: '/photography.jpg'
  }
];

export default function ExplorePage() {
  const { authUser, setAuthUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<typeof mockTopics>([]);
  const [topics, setTopics] = useState<typeof mockTopics>(mockTopics);
  const [toggleTopicPage, setTopicPage] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [sorted, setSorted] = useState({ sorted: "topicTitle", reversed: false });
  
  // For NavBar functionality
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!authUser) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else {
      setIsLoading(false);
      // In a real app, you would fetch topics from the server here
    }
  }, [authUser, router]);

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
    const filtered = topics.filter(item =>
      item.topicTitle.toLowerCase().includes(query.toLowerCase()) ||
      item.topicDescription.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const sortByName = () => {
    const newReversed = !sorted.reversed;
    setSorted({ sorted: "topicTitle", reversed: newReversed });
    const topicsCopy = [...topics];
    topicsCopy.sort((topicA, topicB) => {
      if (newReversed) {
        return topicB.topicTitle.localeCompare(topicA.topicTitle);
      }
      return topicA.topicTitle.localeCompare(topicB.topicTitle);
    });
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
        className="bg-med-green text-dark-grey h-[45px] px-6 py-2 ml-4 rounded-md hover:bg-light-green transition-colors"
      >
        Add Topic
      </button>
    );
  };

  const ExitBtn = () => {
    return (
      <button onClick={() => setTopicPage(false)} className="text-dark-grey hover:text-black">
        <IoCloseCircleOutline size={42} />
      </button>
    );
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const CreateTopic = async () => {
    // In a real app, you would send this data to your server
    // For now, let's just add it to our local state
    const newTopic = {
      id: (topics.length + 1).toString(),
      topicTitle,
      topicDescription,
      topicCreator: authUser || 'anonymous',
      subscribers: 0,
      topicImage: selectedImage ? URL.createObjectURL(selectedImage) : '/default.jpg'
    };
    
    setTopics([...topics, newTopic]);
    setTopicTitle('');
    setTopicDescription('');
    setSelectedImage(null);
    setTopicPage(false);
  };

  const UploadImageButton = () => {
    return (
      <label
        htmlFor="image-upload"
        className="flex flex-col items-center justify-center w-full h-full bg-gray-300 rounded-md cursor-pointer hover:bg-light-green"
      >
        <div className="text-6xl font-bold text-med-green">+</div>
        <p className="text-2xl font-bold text-gray-700">[Insert image here]</p>
        <input
          id="image-upload"
          type="file"
          className="hidden"
          onChange={handleImageChange}
        />
      </label>
    );
  };

  const TopicCard = ({ topic }: { topic: any }) => {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-40 bg-gray-300 relative">
          {topic.topicImage && (
            <div className="w-full h-full relative">
              <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${topic.topicImage})` }}></div>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800">{topic.topicTitle}</h3>
          <p className="text-gray-600 text-sm mt-1">{topic.topicDescription}</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">{topic.subscribers} subscribers</span>
            <button className="bg-med-green text-white px-4 py-2 rounded-md hover:bg-dark-green transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>
    );
  };

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
        onSearch={handleSearch}
      />
      
      {/* Modals */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] overflow-hidden">
            <SettingsModal onClose={() => setShowSettingsModal(false)} />
          </div>
        </div>
      )}
      
      {showUserProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <UserProfileModal 
              username={authUser || 'User'} 
              email="user@example.com"
              onClose={() => setShowUserProfileModal(false)} 
            />
          </div>
        </div>
      )}
      
      {showNotifications && (
        <div className="fixed top-16 right-4 z-50">
          <NotificationsPanel onClose={() => setShowNotifications(false)} />
        </div>
      )}

      <div className="flex-1 bg-[#f7fee7] overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search and Add Topic */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-1/2">
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-med-green"
              />
              <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="flex items-center">
              <button 
                onClick={sortByName} 
                className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors mr-4"
              >
                Sort {sorted.sorted === "topicTitle" && renderArrow()}
              </button>
              <CreateTopicBtn />
            </div>
          </div>

          {/* Create Topic Form */}
          {toggleTopicPage && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Create Topic</h2>
                <ExitBtn />
              </div>
              <div className="flex gap-6">
                <div className="w-1/2">
                  <input
                    type="text"
                    placeholder="Enter your topic! (Ex. Anime, Gaming, Music, etc)"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-md py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-med-green"
                  />
                  <textarea
                    placeholder="Enter your topic description!"
                    value={topicDescription}
                    onChange={(e) => setTopicDescription(e.target.value)}
                    className="w-full h-32 bg-gray-100 text-gray-700 border border-gray-300 rounded-md py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-med-green resize-none"
                  />
                  <button 
                    onClick={CreateTopic} 
                    className="bg-med-green text-white font-medium py-2 px-6 rounded-md hover:bg-dark-green transition-colors"
                  >
                    Submit
                  </button>
                </div>
                <div className="w-1/2 h-64">
                  <UploadImageButton />
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
