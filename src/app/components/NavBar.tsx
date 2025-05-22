import React, { useState } from 'react';
import { CiBellOn } from 'react-icons/ci';
import { LuMessagesSquare } from 'react-icons/lu';
import { FaCompass } from 'react-icons/fa';
import { IoMdPerson } from 'react-icons/io';
import { BsGearWideConnected } from 'react-icons/bs';
import { IoSearch } from 'react-icons/io5';
import { IoClose } from 'react-icons/io5';
import NavButton from './NavButton';

interface NavBarProps {
  onNavButtonClick: (buttonName: string) => void;
  onSignOut: () => void;
  onSearch?: (query: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onNavButtonClick, onSignOut, onSearch }) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchClick = () => {
    setShowSearchInput(!showSearchInput);
    onNavButtonClick('search');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="bg-[#313131] text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold m-0">Chamo Chat</h1>
      <div className="flex items-center space-x-3">
        {showSearchInput ? (
          <form onSubmit={handleSearchSubmit} className="flex items-center mr-2">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 rounded-l bg-gray-700 text-white outline-none"
              autoFocus
            />
            <button 
              type="button" 
              onClick={() => setShowSearchInput(false)}
              className="bg-gray-700 text-white px-2 py-2 rounded-r hover:bg-gray-600"
            >
              <IoClose size={20} />
            </button>
          </form>
        ) : (
          <>
            <NavButton 
              icon={<CiBellOn size={20} />} 
              onClick={() => onNavButtonClick('notifications')} 
              tooltip="Notifications"
            />
            <NavButton 
              icon={<LuMessagesSquare size={20} />} 
              onClick={() => onNavButtonClick('messages')} 
              tooltip="Messages"
            />
            <NavButton 
              icon={<FaCompass size={20} />} 
              onClick={() => onNavButtonClick('explore')} 
              tooltip="Explore"
            />
            <NavButton 
              icon={<IoMdPerson size={20} />} 
              onClick={() => onNavButtonClick('profile')} 
              tooltip="Profile"
            />
            <NavButton 
              icon={<BsGearWideConnected size={20} />} 
              onClick={() => onNavButtonClick('settings')} 
              tooltip="Settings"
            />
            <NavButton 
              icon={<IoSearch size={20} />} 
              onClick={handleSearchClick} 
              tooltip="Search"
            />
          </>
        )}
        <button
          onClick={onSignOut}
          className="bg-transparent text-white border border-white px-4 py-2 rounded hover:bg-white hover:text-dark-green transition-colors ml-2"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default NavBar;
