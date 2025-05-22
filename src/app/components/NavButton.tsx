import React, { useState } from 'react';

interface NavButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, onClick, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative">
      <button 
        className="w-10 h-10 rounded-full flex items-center justify-center bg-med-green text-dark-grey hover:bg-light-green transition-colors"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {icon}
      </button>
      {tooltip && showTooltip && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default NavButton;
