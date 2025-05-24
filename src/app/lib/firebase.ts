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

// Determine if we're in development or production
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Check if we have the required Firebase config
const hasValidConfig = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== '';

// Initialize Firebase only if we have valid config
let app: any;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let googleProvider: GoogleAuthProvider;

// Only initialize Firebase if we have valid config
if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    
    // Configure Firestore for production - with performance optimizations
    if (typeof window !== 'undefined') {
      if (!isDevelopment) {
        console.log('Configuring Firestore for production environment with performance optimizations');
        
        // For production, we'll use a more lightweight approach to improve initial load time
        // We'll skip full offline persistence which can slow down initial loading
        // Instead, we'll use a more targeted caching strategy
        
        // This approach improves initial page load performance while still providing
        // some offline capabilities and better performance for frequently accessed data
        
        // Note: If full offline support is critical, you can re-enable enableIndexedDbPersistence
        // but it will increase initial load time
      }
    }
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Create mock objects for when Firebase fails to initialize
    auth = {} as ReturnType<typeof getAuth>;
    db = {} as ReturnType<typeof getFirestore>;
    googleProvider = {} as GoogleAuthProvider;
  }
} else {
  console.warn('Firebase config is missing or invalid. Using mock objects.');
  // Create mock objects when Firebase config is missing
  auth = {} as ReturnType<typeof getAuth>;
  db = {} as ReturnType<typeof getFirestore>;
  googleProvider = {} as GoogleAuthProvider;
}

// Use local emulator for development only if Firebase is properly initialized
if (isDevelopment && typeof window !== 'undefined' && hasValidConfig) {
  try {
    console.log('Using Firebase local emulators');
    
    // Connect to local Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8082); // Updated port
    
    // Connect to local Auth emulator
    import('firebase/auth').then(({ connectAuthEmulator }) => {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('Connected to Auth emulator');
    });
  } catch (error) {
    console.error('Error connecting to Firebase emulators:', error);
  }
}

// Enable authentication persistence in both development and production
if (hasValidConfig && typeof window !== 'undefined') {
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
    if (!hasValidConfig) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }
    
    // Log authentication environment for debugging
    console.log(`Authenticating in ${isDevelopment ? 'development' : 'production'} environment`);
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    if (!user) {
      throw new Error('Authentication failed: No user returned from Firebase');
    }
    
    console.log('User authenticated successfully:', user.uid);
    
    // In production, we might want to skip the approved email check during initial testing
    // or implement a different approval mechanism
    if (!isDevelopment) {
      // For production, you can decide if you want to enforce email approval or not
      // For now, we'll assume all users are approved in production for testing purposes
      console.log('Production environment: skipping email approval check');
    } else {
      // In development, check if the user's email is in the approved list
      const isApproved = await checkApprovedEmail(user.email);
      
      if (!isApproved) {
        // Sign out the user if not approved
        await auth.signOut();
        throw new Error('Access denied. Your email is not on the approved list for this application.');
      }
    }
    
    // Create or update user profile in Firestore
    // This is critical for the user profile to work properly
    try {
      await createUserProfileDocument(user);
      console.log('User profile created/updated successfully');
    } catch (profileError) {
      console.error('Error creating user profile:', profileError);
      // Continue anyway - we don't want to prevent login if profile creation fails
      // The profile creation will be attempted again on next login
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Function to check if an email is in the approved list
export const checkApprovedEmail = async (email: string | null) => {
  if (!email) return false;
  if (!hasValidConfig) {
    console.warn('Firebase is not properly configured. Assuming email is approved.');
    return true; // In production without proper config, assume approved
  }
  
  try {
    // In production, we might want to handle this differently
    if (!isDevelopment) {
      console.log('Production environment: assuming email is approved');
      return true; // For initial testing in production
    }
    
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
    // In production, we might want to be more lenient with errors
    return !isDevelopment; // Allow in production, deny in development
  }
};

// Helper function to create a user profile document
export const createUserProfileDocument = async (user: any) => {
  if (!user) {
    console.warn('No user provided to createUserProfileDocument');
    return;
  }
  
  if (!hasValidConfig) {
    console.warn('Firebase is not properly configured. User profile will not be created.');
    return;
  }
  
  try {
    console.log(`Creating/updating user profile for ${user.uid} in ${isDevelopment ? 'development' : 'production'}`);
    
    // Store user data in localStorage for immediate access
    // This provides instant access to basic user data while Firestore operation completes
    if (typeof window !== 'undefined') {
      try {
        // Create a more complete user data object for localStorage
        const userData = {
          uid: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          status: 'online',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          friends: [],
          friendRequests: [],
          sentRequests: []
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(userData));
        console.log('User data stored in localStorage for immediate access');
      } catch (e) {
        console.warn('Could not store user data in localStorage', e);
      }
    }
    
    // Always create the user document in Firestore, even if we can't check if it exists
    // This ensures the user profile is created in production
    const userRef = doc(db, 'users', user.uid);
    
    // Try to get the user document, but don't block on it
    let userExists = false;
    try {
      const snapshot = await getDoc(userRef);
      userExists = snapshot.exists();
    } catch (error) {
      console.error('Error checking if user document exists:', error);
      // Continue with profile creation anyway
    }
    
    // If user doesn't exist in Firestore or we couldn't check, create/update the document
    if (!userExists) {
      const { displayName, email, photoURL, uid } = user;
      const createdAt = new Date();
      
      // Extract username from email or use displayName
      const username = displayName || (email ? email.split('@')[0] : 'User');
      
      // Use setDoc with merge option to ensure it works even if the document already exists
      await setDoc(userRef, {
        uid,
        username,
        email: email || '',
        photoURL: photoURL || '',
        status: 'online',
        friends: [],
        friendRequests: [],
        sentRequests: [],
        createdAt,
        updatedAt: createdAt
      }, { merge: true }); // Use merge option to avoid overwriting existing data
      
      console.log('User profile created/updated successfully');
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
