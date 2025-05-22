'use client';

import React, { useContext, useState, useEffect } from 'react';
import { IoPerson } from 'react-icons/io5';
import { AuthContext } from '../../context/AuthProvider';

const Blocklist: React.FC = () => {
  // Mock data for blocked users
  const mockBlockedUsers = [
    { id: '1', username: 'User1' },
    { id: '2', username: 'User2' },
    { id: '3', username: 'User3' },
    { id: '4', username: 'User4' },
    { id: '5', username: 'User5' },
    { id: '6', username: 'User6' }
  ];

  const { authUser } = useContext(AuthContext);
  const [blockedUsers, setBlockedUsers] = useState(mockBlockedUsers);

  const handleUnblockUser = (userId: string) => {
    // In a real app, you would send this to your server
    // For now, just remove from the local state
    setBlockedUsers(blockedUsers.filter(user => user.id !== userId));
  };

  return (
    <div className="w-full h-full bg-gray-200 dark:bg-dark-grey rounded-lg p-6">
      <h1 className="text-4xl font-semibold text-gray-700 dark:text-white mb-8">Blocked Users</h1>
      
      <div className="bg-white dark:bg-zinc-700 rounded-lg shadow-sm overflow-hidden">
        {blockedUsers.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
            {blockedUsers.map((user) => (
              <li key={user.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <IoPerson size={40} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">{user.username}</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUnblockUser(user.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">You haven't blocked any users yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blocklist;
