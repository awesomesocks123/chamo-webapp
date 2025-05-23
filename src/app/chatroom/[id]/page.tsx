'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AuthProvider';
import NavBar from '../../components/NavBar';
import ChatRoom from '../../components/ChatRoom';
import ProfileModal from '../../components/ProfileModal';
import UserProfileModal from '../../components/UserProfileModal';
import SettingsModal from '../../components/SettingsModal';
import NotificationsPanel from '../../components/NotificationsPanel';
import { getChatRoom, ChatRoom as ChatRoomType } from '../../lib/chatRoomService';

// This function is required for static site generation with dynamic routes
export function generateStaticParams() {
  // For a school project, we can use a placeholder ID that will be replaced at runtime
  return [
    { id: 'placeholder' }
  ];
}

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const { authUser } = useContext(AuthContext);
  const router = useRouter();
  const roomId = params.id;
  
  const [room, setRoom] = useState<ChatRoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!authUser) {
      router.replace('/auth/login');
      return;
    }
    
    // Load room data
    const loadRoom = async () => {
      try {
        const roomData = await getChatRoom(roomId);
        
        if (roomData) {
          setRoom(roomData);
        } else {
          // Room not found
          setError('Chat room not found');
          setTimeout(() => {
            router.replace('/explore');
          }, 2000);
        }
      } catch (error) {
        console.error('Error loading chat room:', error);
        setError('Failed to load chat room');
      } finally {
        setLoading(false);
      }
    };
    
    loadRoom();
  }, [authUser, roomId, router]);
  
  const handleSignOut = () => {
    // Clear the auth user from context
    router.replace('/auth/login');
  };
  
  const handleNavButtonClick = (buttonName: string) => {
    switch (buttonName) {
      case 'messages':
        router.push('/chat');
        break;
      case 'explore':
        router.push('/explore');
        break;
      case 'profile':
        setShowUserProfileModal(true);
        break;
      case 'settings':
        setShowSettingsModal(true);
        break;
      case 'notifications':
        setShowNotifications(true);
        break;
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#191919]">
        <NavBar 
          onNavButtonClick={handleNavButtonClick}
          onSignOut={handleSignOut}
        />
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-med-green"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col h-screen bg-[#191919]">
        <NavBar 
          onNavButtonClick={handleNavButtonClick}
          onSignOut={handleSignOut}
        />
        <div className="flex items-center justify-center h-full">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <p className="mt-2">Redirecting to Explore page...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-[#191919]">
      <NavBar 
        onNavButtonClick={handleNavButtonClick}
        onSignOut={handleSignOut}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-full h-full bg-white dark:bg-zinc-800">
          <ChatRoom 
            roomId={roomId}
            roomTitle={room?.title || 'Chat Room'}
            onBackClick={() => router.push('/explore')}
            onViewProfile={setSelectedUserId}
          />
        </div>
      </div>
      
      {/* Modals */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50">
          <div className="h-full">
            <div onClick={() => setShowSettingsModal(false)} className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="relative h-full">
              <div className="absolute inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-zinc-800 shadow-lg">
                <SettingsModal onClose={() => setShowSettingsModal(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showUserProfileModal && (
        <div className="fixed inset-0 z-50">
          <div className="h-full">
            <div onClick={() => setShowUserProfileModal(false)} className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="relative h-full">
              <div className="absolute inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-zinc-800 shadow-lg">
                <UserProfileModal onClose={() => setShowUserProfileModal(false)} />
              </div>
            </div>
          </div>
        </div>
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
        <div className="fixed top-16 right-4 z-50">
          <NotificationsPanel onClose={() => setShowNotifications(false)} />
        </div>
      )}
    </div>
  );
}
