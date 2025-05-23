'use client';

import { useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../lib/userService';

export default function DirectAddPage() {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // These are the UIDs from your Firebase users
  const user1Id = 'NtqxSVSthlTjdFqGUYBL57sVDz43'; // sopklol@gmail.com
  const user2Id = 'Qm6eqCUrPxX970QeKgii1oH31yA3'; // sopheakchim123@gmail.com

  const createUserIfNotExists = async (uid: string, email: string) => {
    const userRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      const now = new Date();
      const username = email.split('@')[0];
      
      const userData: UserProfile = {
        uid,
        username,
        email,
        status: 'online',
        friends: [],
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(userRef, userData);
      return userData;
    }
    
    return userSnapshot.data() as UserProfile;
  };

  const handleDirectAdd = async () => {
    setIsLoading(true);
    setMessage('Adding users as friends...');
    
    try {
      // Create user profiles if they don't exist
      await createUserIfNotExists(user1Id, 'sopklol@gmail.com');
      await createUserIfNotExists(user2Id, 'sopheakchim123@gmail.com');
      
      // Add user2 to user1's friends list
      const user1Ref = doc(db, 'users', user1Id);
      await updateDoc(user1Ref, {
        friends: arrayUnion(user2Id),
        updatedAt: new Date()
      });
      
      // Add user1 to user2's friends list
      const user2Ref = doc(db, 'users', user2Id);
      await updateDoc(user2Ref, {
        friends: arrayUnion(user1Id),
        updatedAt: new Date()
      });
      
      setMessage('Users have been successfully added as friends! You can now chat with each other.');
    } catch (error) {
      console.error('Error adding friends:', error);
      setMessage(`Error adding friends: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Direct Friend Addition</h1>
      
      <div className="bg-[#313131] p-6 rounded-lg max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Add Users as Friends</h2>
        <p className="mb-4">
          This utility will directly add the two users as friends to each other:
        </p>
        <ul className="list-disc pl-5 mb-6">
          <li>User 1: sopklol@gmail.com (NtqxSVSthlTjdFqGUYBL57sVDz43)</li>
          <li>User 2: sopheakchim123@gmail.com (Qm6eqCUrPxX970QeKgii1oH31yA3)</li>
        </ul>
        
        <button
          onClick={handleDirectAdd}
          disabled={isLoading}
          className="bg-med-green hover:bg-dark-green text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Adding Friends...' : 'Add Users as Friends'}
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
