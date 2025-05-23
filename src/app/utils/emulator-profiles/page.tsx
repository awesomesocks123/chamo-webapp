'use client';

import { useState } from 'react';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

export default function EmulatorProfilesPage() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uid1, setUid1] = useState<string>('');
  const [uid2, setUid2] = useState<string>('');

  const createProfiles = async () => {
    setIsLoading(true);
    setStatus('Creating user profiles...');

    try {
      // Create profiles for the emulator users
      const user1Data = {
        uid: uid1,
        username: 'otter.peach',
        email: 'otter.peach.934@example.com',
        status: 'online',
        friends: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const user2Data = {
        uid: uid2,
        username: 'chicken.chicken',
        email: 'chicken.chicken.63@example.com',
        status: 'online',
        friends: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Set the user documents directly
      await setDoc(doc(db, 'users', uid1), user1Data);
      await setDoc(doc(db, 'users', uid2), user2Data);
      
      setStatus('User profiles created successfully!');
    } catch (error) {
      console.error('Error creating profiles:', error);
      setStatus(`Error creating profiles: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addAsFriends = async () => {
    setIsLoading(true);
    setStatus('Adding users as friends...');

    try {
      // Add user2 to user1's friends list
      await updateDoc(doc(db, 'users', uid1), {
        friends: arrayUnion(uid2),
        updatedAt: new Date()
      });
      
      // Add user1 to user2's friends list
      await updateDoc(doc(db, 'users', uid2), {
        friends: arrayUnion(uid1),
        updatedAt: new Date()
      });
      
      setStatus('Users have been added as friends successfully!');
    } catch (error) {
      console.error('Error adding friends:', error);
      setStatus(`Error adding friends: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Emulator Profiles Setup</h1>
      
      <div className="bg-[#313131] p-6 rounded-lg max-w-2xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Profiles for Emulator Users</h2>
        <p className="mb-4">
          Enter the UIDs of your emulator users to create Firestore profiles for them:
        </p>
        
        <div className="mb-4">
          <label className="block mb-2">Otter Peach UID:</label>
          <input
            type="text"
            value={uid1}
            onChange={(e) => setUid1(e.target.value)}
            className="w-full p-2 bg-[#474747] text-white rounded mb-4"
            placeholder="Enter the UID for otter.peach.934@example.com"
          />
          
          <label className="block mb-2">Chicken Chicken UID:</label>
          <input
            type="text"
            value={uid2}
            onChange={(e) => setUid2(e.target.value)}
            className="w-full p-2 bg-[#474747] text-white rounded mb-4"
            placeholder="Enter the UID for chicken.chicken.63@example.com"
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={createProfiles}
            disabled={isLoading || !uid1 || !uid2}
            className="bg-med-green hover:bg-dark-green text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Profiles'}
          </button>
          
          <button
            onClick={addAsFriends}
            disabled={isLoading || !uid1 || !uid2}
            className="bg-med-green hover:bg-dark-green text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add As Friends'}
          </button>
        </div>
      </div>
      
      <div className="bg-[#313131] p-6 rounded-lg max-w-2xl mb-6">
        <h2 className="text-xl font-semibold mb-4">How to Find UIDs</h2>
        <p className="mb-2">
          You can find the UIDs of your emulator users in the Firebase Emulator UI:
        </p>
        <ol className="list-decimal pl-5 mb-4">
          <li>Go to the Firebase Emulator UI (usually at http://localhost:4000)</li>
          <li>Click on "Authentication" in the sidebar</li>
          <li>Find your users in the list</li>
          <li>The "User UID" column shows the UID for each user</li>
        </ol>
      </div>
      
      {status && (
        <div className="bg-[#313131] p-6 rounded-lg max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="bg-[#474747] p-4 rounded">
            {status}
          </div>
        </div>
      )}
    </div>
  );
}
