// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// Your web app's Firebase configuration
// Note: Firebase API keys are designed to be public and identify your project on the client side
// Security is enforced through Firebase Authentication and Security Rules, not through API key secrecy
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Use local emulator for development
if (typeof window !== 'undefined') {
  console.log('Using Firebase local emulators');
  
  // Connect to local Firestore emulator
  connectFirestoreEmulator(db, 'localhost', 8082); // Updated port
  
  // Connect to local Auth emulator
  import('firebase/auth').then(({ connectAuthEmulator }) => {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('Connected to Auth emulator');
  });
  
  // Enable authentication persistence
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error);
  });
}

// Debugging utility functions have been removed


// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Helper function for Google sign-in with automatic profile creation
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if the user's email is in the approved list
    const isApproved = await checkApprovedEmail(user.email);
    
    if (!isApproved) {
      // Sign out the user if not approved
      await auth.signOut();
      throw new Error('Access denied. Your email is not on the approved list for this application.');
    }
    
    // Create or update user profile in Firestore
    await createUserProfileDocument(user);
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Function to check if an email is in the approved list
export const checkApprovedEmail = async (email: string | null) => {
  if (!email) return false;
  
  try {
    // Get the approved emails collection
    const approvedEmailsRef = doc(db, 'access_control', 'approved_emails');
    const snapshot = await getDoc(approvedEmailsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      const approvedEmails = data.emails || [];
      
      // Check if the user's email is in the approved list
      return approvedEmails.includes(email);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking approved email:', error);
    return false;
  }
};

// Helper function to create a user profile document
export const createUserProfileDocument = async (user: any) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  
  try {
    // Check if user document exists
    const snapshot = await getDoc(userRef);
    
    // If user doesn't exist in Firestore, create a new document
    if (!snapshot.exists()) {
      const { displayName, email, photoURL, uid } = user;
      const createdAt = new Date();
      
      // Extract username from email or use displayName
      const username = displayName || email.split('@')[0];
      
      await setDoc(userRef, {
        uid,
        username,
        email,
        photoURL,
        status: 'online',
        friends: [],
        friendRequests: [],
        sentRequests: [],
        createdAt,
        updatedAt: createdAt
      });
      
      console.log('User profile created successfully');
    } else {
      // Update last login time
      await updateDoc(userRef, {
        status: 'online',
        updatedAt: new Date()
      });
      
      console.log('User profile updated successfully');
    }
    
    return userRef;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export { auth, db, googleProvider };
