'use client';

import React from 'react';
import { IoClose } from 'react-icons/io5';
import FriendManager from './FriendManager';

interface AddFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded?: () => void;
}

const AddFriendsModal: React.FC<AddFriendsModalProps> = ({ isOpen, onClose, onFriendAdded }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Friends</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <FriendManager onFriendAdded={onFriendAdded} />
        </div>
      </div>
    </div>
  );
};

export default AddFriendsModal;
