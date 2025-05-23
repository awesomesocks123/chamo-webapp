import React, { useEffect, useRef } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { IoMoon, IoSunny } from 'react-icons/io5';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle animation and keyboard events
  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => {
      if (modalRef.current) {
        console.log('Animating settings modal in');
        modalRef.current.classList.remove('translate-x-full');
        modalRef.current.classList.add('translate-x-0');
      } else {
        console.warn('Settings modal ref is null, cannot animate');
      }
    }, 50); // Slightly longer delay to ensure DOM is ready
    
    // Add event listener to handle escape key
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      clearTimeout(timer);
    };
  }, []);
  
  const handleClose = () => {
    if (modalRef.current) {
      // Trigger slide-out animation
      modalRef.current.classList.remove('translate-x-0');
      modalRef.current.classList.add('translate-x-full');

      // Wait for animation to complete before closing
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 md:bg-opacity-30" onClick={handleClose}>
      <div 
        ref={modalRef}
        className="w-full h-full md:w-[400px] bg-[#f0f0f0] dark:bg-zinc-800 transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex justify-between items-center h-[60px] px-4 bg-med-green">
        <div className="flex items-center">
          <button 
            onClick={handleClose}
            className="text-white hover:text-gray-200 mr-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-xl font-medium text-white">Settings</h2>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Account Settings</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
              <h4 className="font-medium text-black dark:text-white mb-2">Privacy</h4>
              <p className="text-gray-600 dark:text-gray-200 text-sm">Manage your privacy settings and control who can see your information.</p>
              <button className="mt-2 text-med-green hover:text-dark-green dark:hover:text-light-green dark:text-light-green font-medium">Edit</button>
            </div>
            
            <div className="p-4 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
              <h4 className="font-medium text-black dark:text-white mb-2">Notifications</h4>
              <p className="text-gray-600 dark:text-gray-200 text-sm">Control which notifications you receive and how you are notified.</p>
              <button className="mt-2 text-med-green hover:text-dark-green dark:hover:text-light-green dark:text-light-green font-medium">Edit</button>
            </div>
            
            <div className="p-4 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
              <h4 className="font-medium text-black dark:text-white mb-2">Appearance</h4>
              <p className="text-gray-600 dark:text-gray-200 text-sm">The application theme follows your system preference.</p>
              <div className="flex items-center mt-4">
                <div className="hidden dark:flex items-center text-white">
                  <IoMoon className="mr-2" size={18} />
                  <span>Dark Mode (System)</span>
                </div>
                <div className="flex dark:hidden items-center text-gray-700">
                  <IoSunny className="mr-2" size={18} />
                  <span>Light Mode (System)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Help & Support</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
              <h4 className="font-medium text-black dark:text-white mb-2">Privacy Policy</h4>
              <p className="text-gray-600 dark:text-gray-200 text-sm">Read our privacy policy to understand how we handle your data.</p>
              <button 
                onClick={() => {
                  router.push('/settings');
                  onClose();
                }} 
                className="mt-2 text-med-green hover:text-dark-green dark:hover:text-light-green font-medium"
              >View</button>
            </div>
            
            <div className="p-4 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
              <h4 className="font-medium text-black dark:text-white mb-2">Terms of Service</h4>
              <p className="text-gray-600 dark:text-gray-200 text-sm">Review our terms of service.</p>
              <button 
                onClick={() => {
                  router.push('/settings');
                  onClose();
                }} 
                className="mt-2 text-med-green hover:text-dark-green dark:hover:text-light-green font-medium"
              >View</button>
            </div>
            
            <div className="p-4 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
              <h4 className="font-medium text-black dark:text-white mb-2">Contact Support</h4>
              <p className="text-gray-600 dark:text-gray-200 text-sm">Need help? Contact our support team.</p>
              <button 
                onClick={() => {
                  router.push('/settings');
                  onClose();
                }} 
                className="mt-2 text-med-green hover:text-dark-green dark:hover:text-light-green font-medium"
              >Contact</button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SettingsModal;
