import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  addDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  photoURL?: string;
  bio?: string;
  status?: string;
  friends?: string[];
  friendRequests?: string[];
  sentRequests?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  requestSent?: boolean; // Added for UI state tracking
}

export interface FriendRequest {
  id?: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

/**
 * Creates a new user profile in Firestore
 */
export const createUserProfile = async (user: User, additionalData?: Partial<UserProfile>): Promise<UserProfile> => {
  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  // If user doesn't exist, create a new profile
  if (!userSnapshot.exists()) {
    const { displayName, email, photoURL, uid } = user;
    const createdAt = new Date();
    
    const userData: UserProfile = {
      uid,
      username: displayName || email?.split('@')[0] || 'User',
      email: email || '',
      photoURL: photoURL || '',
      bio: '',
      status: 'online',
      friends: [],
      friendRequests: [],
      sentRequests: [],
      createdAt,
      updatedAt: createdAt,
      ...additionalData
    };

    try {
      await setDoc(userRef, userData);
      return userData;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Return existing user data
  return userSnapshot.data() as UserProfile;
};

/**
 * Gets a user profile by UID
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      return userSnapshot.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Updates a user profile
 */
export const updateUserProfile = async (
  uid: string, 
  updates: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const userRef = doc(db, 'users', uid);
    const updatedData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await updateDoc(userRef, updatedData);
    
    // Get and return the updated profile
    const updatedProfile = await getUserProfile(uid);
    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated profile');
    }
    
    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Searches for users by username or email
 */
export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
  try {
    // Convert search term to lowercase for case-insensitive search
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const results: UserProfile[] = [];
    
    // Get all users and filter client-side for case-insensitive search
    // This is a workaround since Firestore doesn't support case-insensitive search directly
    const usersRef = collection(db, 'users');
    const allUsersQuery = query(usersRef, limit(100)); // Limit to 100 users for performance
    const snapshot = await getDocs(allUsersQuery);
    
    snapshot.forEach((doc) => {
      const userData = doc.data() as UserProfile;
      
      // Check if username or email contains the search term (case-insensitive)
      if (userData.username?.toLowerCase().includes(lowercaseSearchTerm) || 
          userData.email?.toLowerCase().includes(lowercaseSearchTerm)) {
        results.push(userData);
      }
    });
    
    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aUsernameMatch = a.username.toLowerCase() === lowercaseSearchTerm ? 0 : 1;
      const bUsernameMatch = b.username.toLowerCase() === lowercaseSearchTerm ? 0 : 1;
      const aEmailMatch = a.email.toLowerCase() === lowercaseSearchTerm ? 0 : 1;
      const bEmailMatch = b.email.toLowerCase() === lowercaseSearchTerm ? 0 : 1;
      
      return (aUsernameMatch + aEmailMatch) - (bUsernameMatch + bEmailMatch);
    });
    
    // Limit results to 10
    return results.slice(0, 10);
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Adds a friend to a user's friend list
 */
export const addFriend = async (userId: string, friendId: string): Promise<void> => {
  try {
    // Add friend to user's friend list
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      friends: arrayUnion(friendId),
      updatedAt: new Date()
    });
    
    // Add user to friend's friend list
    const friendRef = doc(db, 'users', friendId);
    await updateDoc(friendRef, {
      friends: arrayUnion(userId),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error adding friend:', error);
    throw error;
  }
};

/**
 * Removes a friend from a user's friend list
 */
export const removeFriend = async (userId: string, friendId: string): Promise<void> => {
  try {
    // Remove friend from user's friend list
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      friends: arrayRemove(friendId),
      updatedAt: new Date()
    });
    
    // Remove user from friend's friend list
    const friendRef = doc(db, 'users', friendId);
    await updateDoc(friendRef, {
      friends: arrayRemove(userId),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

/**
 * Sends a friend request to another user
 */
export const sendFriendRequest = async (senderId: string, receiverId: string): Promise<string> => {
  try {
    // Check if users exist
    const senderProfile = await getUserProfile(senderId);
    const receiverProfile = await getUserProfile(receiverId);
    
    if (!senderProfile || !receiverProfile) {
      throw new Error('Sender or receiver profile not found');
    }
    
    // Check if they are already friends
    if (senderProfile.friends?.includes(receiverId)) {
      throw new Error('Users are already friends');
    }
    
    // Check if a request already exists
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
      requestsRef,
      where('senderId', '==', senderId),
      where('receiverId', '==', receiverId),
      where('status', '==', 'pending')
    );
    const existingRequests = await getDocs(q);
    
    if (!existingRequests.empty) {
      throw new Error('Friend request already sent');
    }
    
    // Create a new friend request
    const timestamp = serverTimestamp();
    const requestData: FriendRequest = {
      senderId,
      receiverId,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    const docRef = await addDoc(collection(db, 'friendRequests'), requestData);
    
    // Update sender's sentRequests array
    await updateDoc(doc(db, 'users', senderId), {
      sentRequests: arrayUnion(receiverId),
      updatedAt: new Date()
    });
    
    // Update receiver's friendRequests array
    await updateDoc(doc(db, 'users', receiverId), {
      friendRequests: arrayUnion(senderId),
      updatedAt: new Date()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

/**
 * Accepts a friend request
 */
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestSnapshot = await getDoc(requestRef);
    
    if (!requestSnapshot.exists()) {
      throw new Error('Friend request not found');
    }
    
    const request = requestSnapshot.data() as FriendRequest;
    
    if (request.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
    
    // Add both users to each other's friends list
    await addFriend(request.senderId, request.receiverId);
    
    // Remove from friendRequests and sentRequests arrays
    await updateDoc(doc(db, 'users', request.senderId), {
      sentRequests: arrayRemove(request.receiverId),
      updatedAt: new Date()
    });
    
    await updateDoc(doc(db, 'users', request.receiverId), {
      friendRequests: arrayRemove(request.senderId),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

/**
 * Rejects a friend request
 */
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestSnapshot = await getDoc(requestRef);
    
    if (!requestSnapshot.exists()) {
      throw new Error('Friend request not found');
    }
    
    const request = requestSnapshot.data() as FriendRequest;
    
    if (request.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'rejected',
      updatedAt: serverTimestamp()
    });
    
    // Remove from friendRequests and sentRequests arrays
    await updateDoc(doc(db, 'users', request.senderId), {
      sentRequests: arrayRemove(request.receiverId),
      updatedAt: new Date()
    });
    
    await updateDoc(doc(db, 'users', request.receiverId), {
      friendRequests: arrayRemove(request.senderId),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

/**
 * Gets pending friend requests for a user
 */
export const getPendingFriendRequests = async (userId: string): Promise<{request: FriendRequest, sender: UserProfile}[]> => {
  try {
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
      requestsRef,
      where('receiverId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const requests: {request: FriendRequest, sender: UserProfile}[] = [];
    
    for (const doc of querySnapshot.docs) {
      const request = { id: doc.id, ...doc.data() } as FriendRequest;
      const sender = await getUserProfile(request.senderId);
      
      if (sender) {
        requests.push({ request, sender });
      }
    }
    
    return requests;
  } catch (error) {
    console.error('Error getting pending friend requests:', error);
    throw error;
  }
};

/**
 * Gets a user's friends
 */
export const getUserFriends = async (userId: string): Promise<UserProfile[]> => {
  try {
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile || !userProfile.friends || userProfile.friends.length === 0) {
      return [];
    }
    
    const friendProfiles: UserProfile[] = [];
    
    // Get each friend's profile
    for (const friendId of userProfile.friends) {
      const friendProfile = await getUserProfile(friendId);
      if (friendProfile) {
        friendProfiles.push(friendProfile);
      }
    }
    
    return friendProfiles;
  } catch (error) {
    console.error('Error getting user friends:', error);
    throw error;
  }
};
