import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from './userService';

/**
 * Creates a user profile in Firestore if it doesn't already exist
 */
export const ensureUserProfile = async (uid: string, email: string, username?: string): Promise<UserProfile> => {
  // Check if user profile exists
  const userRef = doc(db, 'users', uid);
  const userSnapshot = await getDoc(userRef);
  
  if (userSnapshot.exists()) {
    return userSnapshot.data() as UserProfile;
  }
  
  // Create new user profile
  const now = new Date();
  const newProfile: UserProfile = {
    uid,
    username: username || email.split('@')[0] || 'User',
    email,
    status: 'online',
    friends: [],
    friendRequests: [],
    sentRequests: [],
    createdAt: now,
    updatedAt: now
  };
  
  await setDoc(userRef, newProfile);
  console.log(`Created user profile for ${email}`);
  
  return newProfile;
};

/**
 * Creates profiles for test users
 */
export const createTestUsers = async (): Promise<void> => {
  const testUsers = [
    {
      uid: 'NtqxSVSthlTjdFqGUYBL57sVDz43',
      email: 'sopklol@gmail.com',
      username: 'sopklol'
    },
    {
      uid: 'Qm6eqCUrPxX970QeKgii1oH31yA3',
      email: 'sopheakchim123@gmail.com',
      username: 'sopheakchim123'
    }
  ];
  
  for (const user of testUsers) {
    await ensureUserProfile(user.uid, user.email, user.username);
  }
  
  console.log('Test users created or updated');
};
