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

// Determine if we're in development or production
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

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
  if (!user) return;
  if (!hasValidConfig) {
    console.warn('Firebase is not properly configured. User profile will not be created.');
    return;
  }
  
  try {
    const userRef = doc(db, 'users', user.uid);
    
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
