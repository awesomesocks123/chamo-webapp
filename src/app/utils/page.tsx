'use client';

import { useState } from 'react';
import { createTestUsers } from '../lib/userUtils';

export default function UtilsPage() {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCreateProfiles = async () => {
    setIsLoading(true);
    setMessage('Creating user profiles...');
    
    try {
      await createTestUsers();
      setMessage('User profiles created successfully! You can now search for users and add them as friends.');
    } catch (error) {
      console.error('Error creating profiles:', error);
      setMessage(`Error creating profiles: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Utilities</h1>
      
      <div className="bg-[#313131] p-6 rounded-lg max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Create User Profiles</h2>
        <p className="mb-4">
          This utility will create Firestore user profiles for your existing Firebase Authentication users.
          This is necessary for the friend search functionality to work properly.
        </p>
        
        <button
          onClick={handleCreateProfiles}
          disabled={isLoading}
          className="bg-med-green hover:bg-dark-green text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating Profiles...' : 'Create User Profiles'}
        </button>
        
        {message && (
          <div className="mt-4 p-3 bg-[#474747] rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
