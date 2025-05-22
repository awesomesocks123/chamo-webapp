import React from 'react';
import { IoPerson } from 'react-icons/io5';

interface UserProfileModalProps {
  username: string;
  email?: string;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ username, email, onClose }) => {
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
          <h2 className="text-xl font-medium text-dark-grey">My Profile</h2>
        </div>
        <div className="flex space-x-4">
          <button className="text-dark-grey hover:text-black">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-center p-6 space-y-4">
        <div className="relative">
          <IoPerson size={100} color="#4CAF50" className="rounded-full bg-light-green p-2" />
          <button className="absolute bottom-0 right-0 bg-med-green text-white rounded-full p-1 hover:bg-dark-green">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <h3 className="text-xl font-semibold text-dark-grey">{username}</h3>
        {email && <p className="text-gray-500">{email}</p>}
      </div>
      
      <div className="flex-1 p-4">
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2 text-dark-grey">Account Information</h4>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Username</span>
              <span className="font-medium text-dark-grey">{username}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-dark-grey">{email || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Account Created</span>
              <span className="font-medium text-dark-grey">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2 text-dark-grey">Privacy</h4>
          <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Show online status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-med-green"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Allow friend requests</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-med-green"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <button className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
