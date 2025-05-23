'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

export default function ConnectionTestPage() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [apiKey, setApiKey] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [authDomain, setAuthDomain] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string>('Not signed in');
  
  useEffect(() => {
    // Check if we can access environment variables
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'Not found';
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not found';
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not found';
    
    setApiKey(apiKey);
    setProjectId(projectId);
    setAuthDomain(authDomain);
    
    // Check if user is signed in
    if (auth.currentUser) {
      setCurrentUser(`Signed in as: ${auth.currentUser.email}`);
    }
    
    // Test Firestore connection
    const testConnection = async () => {
      try {
        // Try to get a list of collections
        const snapshot = await getDocs(collection(db, 'users'));
        setStatus(`Connection successful! Found ${snapshot.size} user documents.`);
      } catch (error) {
        console.error('Connection test error:', error);
        setStatus(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    testConnection();
  }, []);
  
  const handleManualTest = async () => {
    setStatus('Testing connection...');
    try {
      // Try to get a specific document
      const docRef = doc(db, 'users', 'test-document');
      await getDoc(docRef);
      setStatus('Connection test completed. Check console for details.');
    } catch (error) {
      console.error('Manual test error:', error);
      setStatus(`Manual test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#191919] text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Firebase Connection Test</h1>
      
      <div className="bg-[#313131] p-6 rounded-lg max-w-2xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="p-3 bg-[#474747] rounded mb-4">
          {status}
        </div>
        
        <button
          onClick={handleManualTest}
          className="bg-med-green hover:bg-dark-green text-white py-2 px-4 rounded-md transition-colors"
        >
          Test Connection Manually
        </button>
      </div>
      
      <div className="bg-[#313131] p-6 rounded-lg max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Firebase Configuration</h2>
        <ul className="space-y-2">
          <li><strong>API Key:</strong> {apiKey}</li>
          <li><strong>Project ID:</strong> {projectId}</li>
          <li><strong>Auth Domain:</strong> {authDomain}</li>
          <li><strong>Auth Status:</strong> {currentUser}</li>
        </ul>
        
        <div className="mt-6 p-3 bg-[#474747] rounded">
          <p className="mb-2">If your Firebase configuration shows "Not found", it means your environment variables are not being loaded correctly.</p>
          <p>Make sure you have a <code>.env.local</code> file in your project root with the correct Firebase configuration.</p>
        </div>
      </div>
    </div>
  );
}
