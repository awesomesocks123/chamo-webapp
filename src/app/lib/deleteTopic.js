// One-time script to delete a specific topic
import { db } from './firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Topic ID to delete
const topicId = 'q7GkIG4CrtSrvHmJ6KNl';

async function deleteTopicManually() {
  try {
    const roomRef = doc(db, 'chatRooms', topicId);
    
    // Mark as deleted instead of actually deleting
    await updateDoc(roomRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      title: '[DELETED] ' + topicId,
      description: 'This topic has been deleted'
    });
    
    console.log('Topic deleted successfully');
  } catch (error) {
    console.error('Error deleting topic:', error);
  }
}

// Execute the deletion
deleteTopicManually();

export {}; // Make this a module
