'use client';

import React, { useState, useEffect } from 'react';
import { IoPersonAdd, IoCheckmark, IoClose } from 'react-icons/io5';
import { MdSearch } from 'react-icons/md';
import { 
  searchUsers, 
  sendFriendRequest, 
  getPendingFriendRequests, 
  acceptFriendRequest, 
  rejectFriendRequest,
  getUserFriends,
  UserProfile
} from '../lib/userService';
import { auth } from '../lib/firebase';

interface FriendManagerProps {
  onFriendAdded?: () => void;
}

const FriendManager: React.FC<FriendManagerProps> = ({ onFriendAdded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{request: any, sender: UserProfile}[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'requests' | 'friends'>('search');

  // Load pending friend requests and friends list
  useEffect(() => {
    const loadData = async () => {
      if (!auth.currentUser) return;
      
      try {
        // Load pending friend requests
        const requests = await getPendingFriendRequests(auth.currentUser.uid);
        setPendingRequests(requests);
        
        // Load friends list
        const friendsList = await getUserFriends(auth.currentUser.uid);
        setFriends(friendsList);
      } catch (err) {
        console.error('Error loading friend data:', err);
        setError('Failed to load friend data');
      }
    };
    
    loadData();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const results = await searchUsers(searchTerm);
      
      // Filter out current user and existing friends
      const filteredResults = results.filter(user => 
        user.uid !== auth.currentUser?.uid && 
        !friends.some(friend => friend.uid === user.uid)
      );
      
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Error searching for users:', err);
      setError('Failed to search for users');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending friend request
  const handleSendRequest = async (userId: string) => {
    if (!auth.currentUser) {
      setError('You must be logged in to send friend requests');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await sendFriendRequest(auth.currentUser.uid, userId);
      
      // Update search results to reflect sent request
      setSearchResults(prev => 
        prev.map(user => 
          user.uid === userId 
            ? { ...user, requestSent: true } 
            : user
        )
      );
      
      setSuccessMessage('Friend request sent successfully');
      
      // Notify parent component
      if (onFriendAdded) onFriendAdded();
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  // Handle accepting friend request
  const handleAcceptRequest = async (requestId: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await acceptFriendRequest(requestId);
      
      // Remove the accepted request from the list
      setPendingRequests(prev => 
        prev.filter(item => item.request.id !== requestId)
      );
      
      // Reload friends list
      if (auth.currentUser) {
        const updatedFriends = await getUserFriends(auth.currentUser.uid);
        setFriends(updatedFriends);
      }
      
      setSuccessMessage('Friend request accepted');
      
      // Notify parent component
      if (onFriendAdded) onFriendAdded();
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Failed to accept friend request');
    } finally {
      setLoading(false);
    }
  };

  // Handle rejecting friend request
  const handleRejectRequest = async (requestId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await rejectFriendRequest(requestId);
      
      // Remove the rejected request from the list
      setPendingRequests(prev => 
        prev.filter(item => item.request.id !== requestId)
      );
      
      setSuccessMessage('Friend request rejected');
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setError('Failed to reject friend request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-700">
        <button
          className={`flex-1 py-3 font-medium text-sm ${
            activeTab === 'search'
              ? 'text-med-green border-b-2 border-med-green'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
        <button
          className={`flex-1 py-3 font-medium text-sm ${
            activeTab === 'requests'
              ? 'text-med-green border-b-2 border-med-green'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('requests')}
        >
          Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
        </button>
        <button
          className={`flex-1 py-3 font-medium text-sm ${
            activeTab === 'friends'
              ? 'text-med-green border-b-2 border-med-green'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('friends')}
        >
          Friends
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Error and success messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md text-sm">
            {successMessage}
          </div>
        )}
        
        {/* Search tab */}
        {activeTab === 'search' && (
          <div>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search by username or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-med-green dark:bg-zinc-700 dark:text-white"
              />
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <button
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-med-green text-white px-3 py-1 rounded-md text-sm disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {/* Search results */}
            <div className="max-h-60 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  {searchTerm ? 'No users found' : 'Search for users to add as friends'}
                </p>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700 rounded-md">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-med-green text-white rounded-full flex items-center justify-center mr-3">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-lg">{user.username.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">{user.username}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user.uid)}
                        disabled={loading || user.requestSent}
                        className={`p-2 rounded-full ${user.requestSent ? 'bg-gray-200 dark:bg-zinc-600 text-gray-500 dark:text-gray-400' : 'bg-med-green text-white hover:bg-dark-green'}`}
                        title={user.requestSent ? 'Request sent' : 'Send friend request'}
                      >
                        {user.requestSent ? (
                          <span className="text-xs px-2">Sent</span>
                        ) : (
                          <IoPersonAdd size={18} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Requests tab */}
        {activeTab === 'requests' && (
          <div className="max-h-60 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No pending friend requests
              </p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((item) => (
                  <div key={item.request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700 rounded-md">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-med-green text-white rounded-full flex items-center justify-center mr-3">
                        {item.sender.photoURL ? (
                          <img src={item.sender.photoURL} alt={item.sender.username} className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-lg">{item.sender.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">{item.sender.username}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.sender.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(item.request.id)}
                        disabled={loading}
                        className="p-2 rounded-full bg-med-green text-white hover:bg-dark-green"
                        title="Accept"
                      >
                        <IoCheckmark size={18} />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(item.request.id)}
                        disabled={loading}
                        className="p-2 rounded-full bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-500"
                        title="Reject"
                      >
                        <IoClose size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Friends tab */}
        {activeTab === 'friends' && (
          <div className="max-h-60 overflow-y-auto">
            {friends.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                You don't have any friends yet
              </p>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.uid} className="flex items-center p-3 bg-gray-50 dark:bg-zinc-700 rounded-md">
                    <div className="w-10 h-10 bg-med-green text-white rounded-full flex items-center justify-center mr-3">
                      {friend.photoURL ? (
                        <img src={friend.photoURL} alt={friend.username} className="w-10 h-10 rounded-full" />
                      ) : (
                        <span className="text-lg">{friend.username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">{friend.username}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{friend.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendManager;
