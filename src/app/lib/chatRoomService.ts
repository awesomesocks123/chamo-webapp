import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit,
  where
} from 'firebase/firestore';

// Types
export interface ChatRoom {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: any;
  activeUsers: number;
  category?: string;
  creatorId?: string;
  isPinned?: boolean;
  isDefault?: boolean;
}

export interface RoomMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  timestamp: any;
}

export interface RoomParticipant {
  userId: string;
  username: string;
  photoURL?: string;
  status: 'online' | 'offline';
  joinedAt: any;
  lastActive: any;
}

// Default chat rooms for fallback when Firestore is not available
const defaultChatRoomsData = [
  {
    id: 'default-anime',
    title: 'Anime',
    description: 'Discuss your favorite anime series and characters',
    category: 'Entertainment',
    isDefault: true,
    isPinned: true,
    activeUsers: 0,
    createdAt: { toDate: () => new Date() }
  },
  {
    id: 'default-gaming',
    title: 'Gaming',
    description: 'Connect with fellow gamers and discuss the latest games',
    category: 'Entertainment',
    isDefault: true,
    isPinned: true,
    activeUsers: 0,
    createdAt: { toDate: () => new Date() }
  },
  {
    id: 'default-coding',
    title: 'Coding',
    description: 'Discuss programming languages, projects, and coding challenges',
    category: 'Technology',
    isDefault: true,
    isPinned: false,
    activeUsers: 0,
    createdAt: { toDate: () => new Date() }
  }
];

// Get all chat rooms with performance optimizations
export const getChatRooms = (callback: (rooms: ChatRoom[]) => void) => {
  try {
    // Check if Firestore is available
    if (!db) {
      console.warn('Firestore is not properly initialized. Using default chat rooms.');
      callback(defaultChatRoomsData as ChatRoom[]);
      return () => {}; // Return empty unsubscribe function
    }
    
    // First, check if we have cached rooms in localStorage
    if (typeof window !== 'undefined') {
      try {
        const cachedRooms = localStorage.getItem('cachedChatRooms');
        if (cachedRooms) {
          const parsedRooms = JSON.parse(cachedRooms);
          const cacheTimestamp = localStorage.getItem('chatRoomsCacheTimestamp');
          
          // If cache is less than 5 minutes old, use it immediately
          if (cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 300000) {
            console.log('Using cached chat rooms from localStorage');
            callback(parsedRooms);
          } else {
            // Cache is old but still usable while we fetch fresh data
            console.log('Using stale cached chat rooms while fetching fresh data');
            callback(parsedRooms);
          }
        } else {
          // No cache, use default rooms while waiting for Firestore
          console.log('No cached rooms found, using defaults while fetching');
          callback(defaultChatRoomsData as ChatRoom[]);
        }
      } catch (e) {
        console.warn('Error reading cached chat rooms:', e);
        callback(defaultChatRoomsData as ChatRoom[]);
      }
    }
    
    console.log('Fetching fresh chat rooms from Firestore...');
    const roomsRef = collection(db, 'chatRooms');
    
    // Set up error handling for the snapshot listener with timeout
    const timeoutId = setTimeout(() => {
      console.warn('Firestore fetch timed out, using default or cached rooms');
      // We've already called the callback with cached/default data, so no need to call again
    }, 10000); // 10 second timeout
    
    const unsubscribe = onSnapshot(
      roomsRef, 
      (snapshot) => {
        clearTimeout(timeoutId); // Clear the timeout since we got a response
        console.log(`Received ${snapshot.docs.length} chat rooms from Firestore`);
        
        // Filter out deleted rooms
        const rooms = snapshot.docs
          .filter(doc => !doc.data().deleted) // Skip deleted rooms
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ChatRoom[];
        
        // Sort rooms: pinned first, then by creation date (newest first)
        rooms.sort((a, b) => {
          // First sort by pinned status
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          
          // Then sort by creation date (newest first)
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        // Cache the rooms in localStorage for faster future access
        if (typeof window !== 'undefined' && rooms.length > 0) {
          try {
            // Prepare rooms for caching by converting timestamps
            const roomsForCache = rooms.map(room => ({
              ...room,
              createdAt: room.createdAt?.toDate?.() ? 
                room.createdAt.toDate().toISOString() : new Date().toISOString()
            }));
            
            localStorage.setItem('cachedChatRooms', JSON.stringify(roomsForCache));
            localStorage.setItem('chatRoomsCacheTimestamp', Date.now().toString());
            console.log('Chat rooms cached successfully');
          } catch (e) {
            console.warn('Failed to cache chat rooms:', e);
          }
        }
        
        callback(rooms);
      },
      (error) => {
        clearTimeout(timeoutId); // Clear the timeout since we got an error response
        console.error('Error fetching chat rooms:', error);
        // We've already called the callback with cached/default data, so no need to call again
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error('Exception in getChatRooms:', error);
    callback(defaultChatRoomsData as ChatRoom[]);
    return () => {}; // Return empty unsubscribe function
  }
}

// Get a single chat room
export const getChatRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (roomDoc.exists()) {
      return {
        id: roomDoc.id,
        ...roomDoc.data()
      } as ChatRoom;
    }
    return null;
  } catch (error) {
    console.error('Error getting chat room:', error);
    throw error;
  }
};

// Create a new chat room
export const createChatRoom = async (roomData: Omit<ChatRoom, 'id' | 'createdAt' | 'activeUsers'>): Promise<string> => {
  try {
    // Check if Firestore is available
    if (!db) {
      console.error('Firestore is not properly initialized. Cannot create chat room.');
      throw new Error('Database connection error');
    }

    console.log('Creating new chat room...');
    const user = auth.currentUser;
    if (!user) {
      console.warn('User not authenticated. Using fallback user ID');
      // In production, we might want to allow this for testing
      // Get user ID from localStorage as fallback
      const fallbackUserId = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
      if (!fallbackUserId) {
        throw new Error('User must be authenticated to create a chat room');
      }
      
      const roomsRef = collection(db, 'chatRooms');
      const newRoom = {
        ...roomData,
        createdAt: serverTimestamp(),
        activeUsers: 0,
        creatorId: fallbackUserId,
        isPinned: true,
        isDefault: roomData.isDefault || false
      };

      const docRef = await addDoc(roomsRef, newRoom);
      console.log(`Chat room created with ID: ${docRef.id}`);
      return docRef.id;
    } else {
      const roomsRef = collection(db, 'chatRooms');
      const newRoom = {
        ...roomData,
        createdAt: serverTimestamp(),
        activeUsers: 0,
        creatorId: user.uid,
        isPinned: true,
        isDefault: roomData.isDefault || false
      };

      const docRef = await addDoc(roomsRef, newRoom);
      console.log(`Chat room created with ID: ${docRef.id}`);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error creating chat room:', error);
    // In production, we might want to show a more user-friendly error
    throw new Error('Failed to create chat room. Please try again later.');
  }
};

// Join a chat room
export const joinChatRoom = async (roomId: string, userId: string, username: string, photoURL?: string) => {
  try {
    const participantRef = doc(db, 'chatRooms', roomId, 'participants', userId);
    await setDoc(participantRef, {
      userId,
      username,
      photoURL,
      status: 'online',
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });
    
    // Update active users count
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      await updateDoc(roomRef, {
        activeUsers: (roomDoc.data().activeUsers || 0) + 1
      });
    }
    
    // Add system message about user joining
    await addDoc(collection(db, 'chatRooms', roomId, 'messages'), {
      text: `${username} has joined the room`,
      senderId: 'system',
      senderName: 'System',
      timestamp: serverTimestamp(),
      type: 'system'
    });
  } catch (error) {
    console.error('Error joining chat room:', error);
    throw error;
  }
};

// Leave a chat room
export const leaveChatRoom = async (roomId: string, userId: string, username: string) => {
  try {
    const participantRef = doc(db, 'chatRooms', roomId, 'participants', userId);
    await updateDoc(participantRef, {
      status: 'offline',
      lastActive: serverTimestamp()
    });
    
    // Update active users count
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      await updateDoc(roomRef, {
        activeUsers: Math.max((roomDoc.data().activeUsers || 0) - 1, 0)
      });
    }
    
    // Add system message about user leaving
    await addDoc(collection(db, 'chatRooms', roomId, 'messages'), {
      text: `${username} has left the room`,
      senderId: 'system',
      senderName: 'System',
      timestamp: serverTimestamp(),
      type: 'system'
    });
  } catch (error) {
    console.error('Error leaving chat room:', error);
    throw error;
  }
};

// Get room messages
export const getRoomMessages = (roomId: string, callback: (messages: RoomMessage[]) => void) => {
  const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RoomMessage[];
    callback(messages);
  });
};

// Send message to room
export const sendRoomMessage = async (roomId: string, text: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  try {
    const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
    await addDoc(messagesRef, {
      text,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Anonymous',
      senderPhotoURL: auth.currentUser.photoURL || '',
      timestamp: serverTimestamp(),
      type: 'message'
    });
    
    // Update participant's last active timestamp
    const participantRef = doc(db, 'chatRooms', roomId, 'participants', auth.currentUser.uid);
    await updateDoc(participantRef, {
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending message to room:', error);
    throw error;
  }
};

// Get room participants
export const getRoomParticipants = (roomId: string, callback: (participants: RoomParticipant[]) => void) => {
  const participantsRef = collection(db, 'chatRooms', roomId, 'participants');
  
  return onSnapshot(participantsRef, (snapshot) => {
    const participants = snapshot.docs.map(doc => ({
      ...doc.data()
    })) as RoomParticipant[];
    callback(participants);
  });
};

// Get online participants count
export const getOnlineParticipantsCount = (roomId: string, callback: (count: number) => void) => {
  const participantsRef = collection(db, 'chatRooms', roomId, 'participants');
  const q = query(participantsRef, where('status', '==', 'online'));
  
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.length);
  });
};

// Toggle pin status for a chat room
export const togglePinChatRoom = async (roomId: string): Promise<boolean> => {
  try {
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const currentPinStatus = roomDoc.data().isPinned || false;
    await updateDoc(roomRef, {
      isPinned: !currentPinStatus
    });
    
    return !currentPinStatus;
  } catch (error) {
    console.error('Error toggling pin status:', error);
    throw error;
  }
};

// Delete a chat room
export const deleteChatRoom = async (roomId: string): Promise<boolean> => {
  try {
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomDoc.data();
    
    // Special case for the specific topic ID that needs to be deleted
    const bypassOwnershipCheck = roomId === 'q7GkIG4CrtSrvHmJ6KNl';
    
    // Only allow deletion if the user is the creator and it's not a default room
    if (roomData.isDefault) {
      throw new Error('Cannot delete default chat rooms');
    }
    
    if (!bypassOwnershipCheck && roomData.creatorId !== auth.currentUser?.uid) {
      throw new Error('You can only delete chat rooms you created');
    }
    
    // Delete the chat room
    await updateDoc(roomRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      title: `[DELETED] ${roomData.title || roomId}`,
      description: 'This topic has been deleted'
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting chat room:', error);
    throw error;
  }
};

// Claim ownership of a chat room (for existing topics)
export const claimChatRoomOwnership = async (roomId: string): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to claim ownership');
    }
    
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomDoc.data();
    
    // Don't allow claiming default rooms
    if (roomData.isDefault) {
      throw new Error('Cannot claim ownership of default chat rooms');
    }
    
    // Only allow claiming if no creator is set
    if (roomData.creatorId && roomData.creatorId !== auth.currentUser.uid) {
      throw new Error('This topic already has an owner');
    }
    
    // Update the chat room with current user as creator
    await updateDoc(roomRef, {
      creatorId: auth.currentUser.uid,
      isPinned: true
    });
    
    return true;
  } catch (error) {
    console.error('Error claiming chat room ownership:', error);
    throw error;
  }
};
