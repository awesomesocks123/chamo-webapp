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

// Get all chat rooms
export const getChatRooms = (callback: (rooms: ChatRoom[]) => void) => {
  const roomsRef = collection(db, 'chatRooms');
  return onSnapshot(roomsRef, (snapshot) => {
    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatRoom[];
    callback(rooms);
  });
};

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
    const roomsRef = collection(db, 'chatRooms');
    const newRoom = {
      ...roomData,
      createdAt: serverTimestamp(),
      activeUsers: 0
    };
    
    const docRef = await addDoc(roomsRef, newRoom);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
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
