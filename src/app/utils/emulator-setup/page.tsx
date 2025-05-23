'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, updateDoc, arrayUnion, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

export default function EmulatorSetupPage() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Test user data
  const testUsers = [
    {
      email: 'sopklol@gmail.com',
      password: 'password123',
      username: 'sopklol',
      uid: 'user1'
    },
    {
      email: 'sopheakchim123@gmail.com',
      password: 'password123',
      username: 'sopheakchim123',
      uid: 'user2'
    }
  ];

  const createTestUsers = async () => {
    setIsLoading(true);
    setStatus('Creating test users...');

    try {
      for (const user of testUsers) {
        try {
          // Create user in Auth
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            user.email,
            user.password
          );
          
          const uid = userCredential.user.uid;
          
          // Create user profile in Firestore
          await setDoc(doc(db, 'users', uid), {
            uid: uid,
            email: user.email,
            username: user.username,
            status: 'online',
            friends: [],
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          setStatus(prev => `${prev}\nCreated user: ${user.email} with UID: ${uid}`);
        } catch (error) {
          console.error(`Error creating user ${user.email}:`, error);
          setStatus(prev => `${prev}\nFailed to create user ${user.email}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } catch (error) {
      console.error('Error in createTestUsers:', error);
      setStatus(prev => `${prev}\nError: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addUserAsFriends = async () => {
    setIsLoading(true);
    setStatus('Adding users as friends...');

    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (users.length < 2) {
        setStatus('Not enough users found. Please create test users first.');
        setIsLoading(false);
        return;
      }
      
      // Add each user to the other's friends list
      for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < users.length; j++) {
          if (i !== j) {
            await updateDoc(doc(db, 'users', users[i].id), {
              friends: arrayUnion(users[j].id)
            });
          }
        }
      }
      
      setStatus(prev => `${prev}\nUsers have been added as friends successfully!`);
    } catch (error) {
      console.error('Error adding friends:', error);
      setStatus(prev => `${prev}\nError adding friends: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestMessages = async () => {
    setIsLoading(true);
    setStatus('Creating test messages...');

    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (users.length < 2) {
        setStatus('Not enough users found. Please create test users first.');
        setIsLoading(false);
        return;
      }
      
      // Create a chat session between the first two users
      const user1 = users[0];
      const user2 = users[1];
      
      // Create a chat session
      const chatSessionRef = await addDoc(collection(db, 'chatSessions'), {
        participants: [user1.id, user2.id],
        lastMessage: 'Hello there!',
        lastMessageTimestamp: new Date(),
        createdAt: new Date()
      });
      
      // Add some messages
      const messages = [
        {
          senderId: user1.id,
          text: 'Hello there!',
          timestamp: new Date(),
          status: 'delivered'
        },
        {
          senderId: user2.id,
          text: 'Hi! How are you?',
          timestamp: new Date(Date.now() + 1000),
          status: 'delivered'
        },
        {
          senderId: user1.id,
          text: 'I\'m doing great! Just testing this chat app.',
          timestamp: new Date(Date.now() + 2000),
          status: 'delivered'
        }
      ];
      
      for (const message of messages) {
        await addDoc(collection(db, 'chatSessions', chatSessionRef.id, 'messages'), message);
      }
      
      setStatus(prev => `${prev}\nTest messages created successfully!`);
    } catch (error) {
      console.error('Error creating test messages:', error);
      setStatus(prev => `${prev}\nError creating test messages: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Firebase Emulator Setup</h1>
      
      <div className="bg-[#313131] p-6 rounded-lg max-w-2xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Step 1: Create Test Users</h2>
        <p className="mb-4">
          This will create two test users in the Firebase Auth and Firestore emulators:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>sopklol@gmail.com (password: password123)</li>
          <li>sopheakchim123@gmail.com (password: password123)</li>
        </ul>
        
        <button
          onClick={createTestUsers}
          disabled={isLoading}
          className="bg-med-green hover:bg-dark-green text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 mb-4"
        >
          {isLoading ? 'Creating...' : 'Create Test Users'}
        </button>
      </div>
      
      <div className="bg-[#313131] p-6 rounded-lg max-w-2xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Step 2: Add Users as Friends</h2>
        <p className="mb-4">
          This will add all users as friends of each other in the Firestore emulator.
        </p>
        
        <button
          onClick={addUserAsFriends}
          disabled={isLoading}
          className="bg-med-green hover:bg-dark-green text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 mb-4"
        >
          {isLoading ? 'Adding...' : 'Add Users as Friends'}
        </button>
      </div>
      
      <div className="bg-[#313131] p-6 rounded-lg max-w-2xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Step 3: Create Test Messages</h2>
        <p className="mb-4">
          This will create a chat session with some test messages between the users.
        </p>
        
        <button
          onClick={createTestMessages}
          disabled={isLoading}
          className="bg-med-green hover:bg-dark-green text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 mb-4"
        >
          {isLoading ? 'Creating...' : 'Create Test Messages'}
        </button>
      </div>
      
      {status && (
        <div className="bg-[#313131] p-6 rounded-lg max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <pre className="whitespace-pre-wrap bg-[#474747] p-4 rounded">
            {status}
          </pre>
        </div>
      )}
    </div>
  );
}
