import React from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const router = useRouter();
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
          <h2 className="text-xl font-medium text-dark-grey">Settings</h2>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-dark-grey">Account Settings</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-medium text-dark-grey mb-2">Privacy</h4>
              <p className="text-gray-600 text-sm">Manage your privacy settings and control who can see your information.</p>
              <button className="mt-2 text-med-green hover:text-dark-green font-medium">Edit</button>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-medium text-dark-grey mb-2">Notifications</h4>
              <p className="text-gray-600 text-sm">Control which notifications you receive and how you are notified.</p>
              <button className="mt-2 text-med-green hover:text-dark-green font-medium">Edit</button>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-medium text-dark-grey mb-2">Appearance</h4>
              <p className="text-gray-600 text-sm">Customize the look and feel of the application.</p>
              <div className="mt-2 flex items-center">
                <span className="mr-2 text-gray-600 text-sm">Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-med-green"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-dark-grey">Help & Support</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-medium text-dark-grey mb-2">Privacy Policy</h4>
              <p className="text-gray-600 text-sm">Read our privacy policy to understand how we handle your data.</p>
              <button 
                onClick={() => {
                  router.push('/settings');
                  onClose();
                }} 
                className="mt-2 text-med-green hover:text-dark-green font-medium"
              >View</button>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-medium text-dark-grey mb-2">Terms of Service</h4>
              <p className="text-gray-600 text-sm">Review our terms of service.</p>
              <button 
                onClick={() => {
                  router.push('/settings');
                  onClose();
                }} 
                className="mt-2 text-med-green hover:text-dark-green font-medium"
              >View</button>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-medium text-dark-grey mb-2">Contact Support</h4>
              <p className="text-gray-600 text-sm">Need help? Contact our support team.</p>
              <button 
                onClick={() => {
                  router.push('/settings');
                  onClose();
                }} 
                className="mt-2 text-med-green hover:text-dark-green font-medium"
              >Contact</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
