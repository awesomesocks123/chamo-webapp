'use client';

import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthProvider';

const Help: React.FC = () => {
  const { authUser } = useContext(AuthContext);
  const [textAreaValue, setTextAreaValue] = useState('');
  const [status, setStatus] = useState('');

  const handleInputChanges = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaValue(event.target.value);
  };

  const submitRequest = async () => {
    if (!(/^\s*$/.test(textAreaValue))) {
      try {
        // In a real app, you would send this to your server
        // For now, just show a success message
        setStatus('Request sent successfully!');
        
        // Clear the textarea after successful submission
        setTextAreaValue('');
      } catch (error: any) {
        console.error("Error sending request:", error);
        setStatus('Unable to send request: ' + error.message);
      } finally {
        // Clear the status message after 5 seconds
        setTimeout(() => {
          setStatus('');
        }, 5000);
      }
    } else {
      setStatus('Unable to send request: Empty Text Field');
      setTimeout(() => {
        setStatus('');
      }, 5000);
    }
  };

  return (
    <div className="w-full h-full bg-gray-200 dark:bg-dark-grey rounded-lg p-6">
      <div className="text-4xl font-semibold text-gray-700 dark:text-white mb-6">
        Help Request
      </div>
      <textarea
        className="w-full h-64 p-4 bg-gray-100 dark:bg-zinc-700 border border-transparent dark:border-gray-500 rounded-md text-gray-700 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-med-green"
        placeholder="Tell us about a problem..."
        onChange={handleInputChanges}
        value={textAreaValue}
      ></textarea>
      <button
        className="mt-4 bg-med-green hover:bg-dark-green text-white font-medium py-2 px-6 rounded-md transition-colors"
        onClick={submitRequest}
      >
        Submit
      </button>
      {status && (
        <div className="mt-4 p-3 rounded-md bg-opacity-80 text-center font-medium" 
          style={{ 
            backgroundColor: status.includes('Unable') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            color: status.includes('Unable') ? '#ef4444' : '#16a34a'
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default Help;
