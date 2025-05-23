import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserProfile } from './userService';

export interface Message {
  id?: string;
  senderId: string;
  text: string;
  timestamp: any; // Can be Timestamp or Date
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatSession {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTimestamp?: any; // Can be Timestamp or Date
  createdAt?: any; // Can be Timestamp or Date
  unreadCount?: number;
}

/**
 * Send a message to another user
 */
export const sendMessage = async (receiverId: string, text: string): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to send messages');
    }

    console.log('Sending message from', currentUser.uid, 'to', receiverId);

    // First, check if a chat session exists
    let chatSessionId = '';
    const participants = [currentUser.uid, receiverId];
    
    // Query for existing chat session that contains both users
    const chatSessionsQuery = query(
      collection(db, 'chatSessions'),
      where('participants', 'array-contains', currentUser.uid)
    );
    
    const chatSessionsSnapshot = await getDocs(chatSessionsQuery);
    
    // Check if any of the returned sessions contain the receiver
    let existingSession = false;
    for (const doc of chatSessionsSnapshot.docs) {
      const data = doc.data();
      if (data.participants && 
          data.participants.includes(receiverId)) {
        chatSessionId = doc.id;
        existingSession = true;
        console.log('Found existing chat session:', chatSessionId);
        break;
      }
    }
    
    // If chat session doesn't exist, create one
    if (!existingSession) {
      console.log('Creating new chat session between', currentUser.uid, 'and', receiverId);
      const newChatSession = {
        participants,
        lastMessage: text,
        lastMessageTimestamp: new Date(),
        createdAt: new Date()
      };
      
      const chatSessionRef = await addDoc(collection(db, 'chatSessions'), newChatSession);
      chatSessionId = chatSessionRef.id;
      console.log('Created new chat session:', chatSessionId);
    } else {
      // Update the last message
      await updateDoc(doc(db, 'chatSessions', chatSessionId), {
        lastMessage: text,
        lastMessageTimestamp: new Date()
      });
    }
    
    // Add the message to the chat session's messages subcollection
    const message = {
      senderId: currentUser.uid,
      text,
      timestamp: new Date(),
      status: 'sent'
    };
    
    console.log('Adding message to chat session:', chatSessionId);
    const messageRef = await addDoc(
      collection(db, 'chatSessions', chatSessionId, 'messages'),
      message
    );
    
    console.log('Message added with ID:', messageRef.id);
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

/**
 * Get messages between current user and another user
 * Returns a cleanup function to unsubscribe from real-time updates
 */
export const getMessages = (
  otherUserId: string, 
  callback: (messages: Message[]) => void
): (() => void) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error('You must be logged in to get messages');
    return () => {};
  }

  console.log('Setting up real-time listener for messages between', currentUser.uid, 'and', otherUserId);

  // First, find the chat session between these users
  const participants = [currentUser.uid, otherUserId].sort(); // Sort to ensure consistent order
  
  // For debugging
  console.log('Looking for chat session with participants:', participants);
  
  const chatSessionQuery = query(
    collection(db, 'chatSessions'),
    where('participants', 'array-contains', currentUser.uid)
  );

  // Subscribe to real-time updates of the chat session
  const unsubscribe = onSnapshot(chatSessionQuery, (querySnapshot) => {
    console.log('Chat sessions snapshot received, count:', querySnapshot.size);
    
    // Find the chat session that contains both users
    let chatSessionDoc = null;
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.participants && 
          data.participants.includes(currentUser.uid) && 
          data.participants.includes(otherUserId)) {
        chatSessionDoc = doc;
        break;
      }
    }
    
    if (!chatSessionDoc) {
      // No chat session exists yet
      console.log('No chat session found between these users');
      callback([]);
      return;
    }
    
    const chatSessionId = chatSessionDoc.id;
    console.log('Found chat session:', chatSessionId);
    
    // Now get the messages for this chat session
    const messagesQuery = query(
      collection(db, 'chatSessions', chatSessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    // Subscribe to real-time updates of the messages
    const messagesUnsubscribe = onSnapshot(messagesQuery, (messagesSnapshot) => {
      console.log('Messages snapshot received, count:', messagesSnapshot.size);
      
      const messages: Message[] = [];
      messagesSnapshot.forEach((doc) => {
        const data = doc.data() as Message;
        messages.push({
          id: doc.id,
          ...data
        });
      });
      
      console.log('Sending messages to UI:', messages.length);
      callback(messages);
    }, (error) => {
      console.error('Error getting messages:', error);
    });
  }, (error) => {
    console.error('Error getting chat session:', error);
  });

  return unsubscribe;
};

/**
 * Get all chat sessions for the current user
 * Returns a cleanup function to unsubscribe from real-time updates
 */
export const getChatSessions = (
  callback: (sessions: ChatSession[]) => void
): (() => void) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error('You must be logged in to get chat sessions');
    return () => {};
  }

  // Query for chat sessions where the current user is a participant
  const q = query(
    collection(db, 'chatSessions'),
    where('participants', 'array-contains', currentUser.uid),
    orderBy('lastMessageTimestamp', 'desc')
  );

  // Subscribe to real-time updates
  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    const sessions: ChatSession[] = [];
    
    // Process each chat session
    for (const doc of querySnapshot.docs) {
      const chatSession = doc.data() as ChatSession;
      chatSession.id = doc.id;
      
      // Find the other user in the participants array
      const otherUserId = chatSession.participants.find(id => id !== currentUser.uid);
      
      if (otherUserId) {
        try {
          // Get the other user's profile
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            // You can add user data to the session if needed
            // For example: chatSession.otherUserName = userData.username;
          }
        } catch (error) {
          console.error('Error fetching user data for chat session:', error);
        }
      }
      
      sessions.push(chatSession);
    }
    
    callback(sessions);
  }, (error) => {
    console.error('Error getting chat sessions:', error);
  });

  return unsubscribe;
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (chatSessionId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to mark messages as read');
    }

    // Query for unread messages in this chat session that were not sent by the current user
    const q = query(
      collection(db, 'chatSessions', chatSessionId, 'messages'),
      where('senderId', '!=', currentUser.uid),
      where('status', '!=', 'read')
    );

    const querySnapshot = await getDocs(q);
    
    // Update each message
    for (const document of querySnapshot.docs) {
      const docRef = doc(db, 'chatSessions', chatSessionId, 'messages', document.id);
      await updateDoc(docRef, { status: 'read' });
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};
