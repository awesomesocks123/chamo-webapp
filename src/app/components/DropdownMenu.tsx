import React, { useState, useRef, useEffect } from 'react';
import { HiDotsVertical } from "react-icons/hi";

interface DropdownMenuProps {
  items: string[];
  onItemClick: (item: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        className="inline-flex items-center p-2 ml-1 text-sm font-medium text-center rounded-full hover:text-dark-grey hover:bg-light-green"
        onClick={toggleDropdown}
      >
        <HiDotsVertical size={25} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-light-green dark:divide-gray-600 z-10">
          <ul className="py-2 text-sm text-dark-grey">
            {items.map((item, index) => (
              <li key={index}>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-med-green dark:hover:bg-med-green"
                  onClick={() => {
                    onItemClick(item);
                    setIsOpen(false);
                  }}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
