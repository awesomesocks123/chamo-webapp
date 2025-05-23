'use client';

import React, { useState, useEffect } from 'react';
import { IoPersonAdd, IoPersonRemove, IoSearch, IoCheckmarkCircle } from 'react-icons/io5';
import { getUserFriends, searchUsers, addFriend, removeFriend, UserProfile } from '../lib/userService';
import { auth } from '../lib/firebase';

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user's friends
  useEffect(() => {
    const loadFriends = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        setLoading(true);
        const userFriends = await getUserFriends(currentUser.uid);
        setFriends(userFriends);
      } catch (err) {
        console.error('Error loading friends:', err);
        setError('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      const results = await searchUsers(searchTerm);
      
      // Filter out current user and existing friends
      const currentUser = auth.currentUser;
      if (currentUser) {
        const filteredResults = results.filter(user => 
          user.uid !== currentUser.uid && 
          !friends.some(friend => friend.uid === user.uid)
        );
        setSearchResults(filteredResults);
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  // Add friend
  const handleAddFriend = async (friendId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('You must be logged in to add friends');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await addFriend(currentUser.uid, friendId);
      
      // Update the friends list
      const updatedFriends = await getUserFriends(currentUser.uid);
      setFriends(updatedFriends);
      
      // Remove the added user from search results
      setSearchResults(prev => prev.filter(user => user.uid !== friendId));
      
      setSuccess('Friend added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding friend:', err);
      setError('Failed to add friend');
    } finally {
      setLoading(false);
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friendId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('You must be logged in to remove friends');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await removeFriend(currentUser.uid, friendId);
      
      // Update the friends list
      setFriends(prev => prev.filter(friend => friend.uid !== friendId));
      
      setSuccess('Friend removed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Failed to remove friend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Friends</h2>
      
      {/* Search for new friends */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <input
            type="text"
            placeholder="Search for users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-med-green"
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            className="bg-med-green text-white p-2 rounded-r-md hover:bg-dark-green transition-colors"
          >
            <IoSearch size={20} />
          </button>
        </div>
        
        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Search Results</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map(user => (
                <div key={user.uid} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-zinc-700 rounded-md">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-med-green text-white rounded-full flex items-center justify-center mr-2">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-800 dark:text-white">{user.username}</span>
                  </div>
                  <button
                    onClick={() => handleAddFriend(user.uid)}
                    disabled={loading}
                    className="text-med-green hover:text-dark-green"
                  >
                    <IoPersonAdd size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {searchLoading && <p className="text-gray-600 dark:text-gray-400">Searching...</p>}
        {searchResults.length === 0 && searchTerm && !searchLoading && (
          <p className="text-gray-600 dark:text-gray-400">No users found</p>
        )}
      </div>
      
      {/* Friends list */}
      <div>
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Your Friends</h3>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading friends...</p>
        ) : friends.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {friends.map(friend => (
              <div key={friend.uid} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-zinc-700 rounded-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-med-green text-white rounded-full flex items-center justify-center mr-2">
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-gray-800 dark:text-white block">{friend.username}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{friend.email}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => handleRemoveFriend(friend.uid)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <IoPersonRemove size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">You don't have any friends yet</p>
        )}
      </div>
      
      {/* Success and error messages */}
      {success && (
        <div className="mt-4 p-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md flex items-center">
          <IoCheckmarkCircle className="mr-2" />
          {success}
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
