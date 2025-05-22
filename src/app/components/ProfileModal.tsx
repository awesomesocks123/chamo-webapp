import React from 'react';
import { IoPerson } from 'react-icons/io5';
import { IoClose } from 'react-icons/io5';

interface ProfileModalProps {
  username: string;
  iconColor: string;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ username, iconColor, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-[#f0f0f0]">
      <div className="flex justify-between items-center h-[60px] px-4 bg-med-green">
        <div className="flex items-center">
          <button 
            onClick={onClose}
            className="text-dark-grey hover:text-black mr-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-xl font-medium text-dark-grey">Profile</h2>
        </div>
        <div className="flex space-x-4">
          <button className="text-dark-grey hover:text-black">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="text-dark-grey hover:text-black">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-center p-6 space-y-4">
        <div className="relative">
          <IoPerson size={100} color={iconColor} className="rounded-full" />
        </div>
        <h3 className="text-xl font-semibold text-dark-grey">{username}</h3>
      </div>
      
      <div className="flex-1 p-4">
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2 text-dark-grey">Actions</h4>
          <div className="space-y-2">
            <button className="w-full py-2 px-4 bg-med-green text-white rounded hover:bg-dark-green transition-colors">
              Add Friend
            </button>
            <button className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">
              Block User
            </button>
            <button className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
              Report User
            </button>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-medium mb-2 text-dark-grey">Info</h4>
          <p className="text-gray-800 font-medium">
            This is a private chat. Your identity is protected unless you choose to reveal it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
