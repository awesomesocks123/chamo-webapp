import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

/**
 * Utility functions for managing access control to the application
 * These functions help maintain the list of approved emails that can access the app
 */

/**
 * Add a new email to the approved list
 * @param email The email to add to the approved list
 * @returns Promise<boolean> indicating success or failure
 */
export const addApprovedEmail = async (email: string): Promise<boolean> => {
  if (!email || !email.includes('@')) return false;
  
  try {
    const approvedEmailsRef = doc(db, 'access_control', 'approved_emails');
    const snapshot = await getDoc(approvedEmailsRef);
    
    if (snapshot.exists()) {
      // Document exists, update it
      await updateDoc(approvedEmailsRef, {
        emails: arrayUnion(email)
      });
    } else {
      // Document doesn't exist, create it
      await setDoc(approvedEmailsRef, {
        emails: [email]
      });
    }
    
    console.log(`Email ${email} added to approved list`);
    return true;
  } catch (error) {
    console.error('Error adding approved email:', error);
    return false;
  }
};

/**
 * Remove an email from the approved list
 * @param email The email to remove from the approved list
 * @returns Promise<boolean> indicating success or failure
 */
export const removeApprovedEmail = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  try {
    const approvedEmailsRef = doc(db, 'access_control', 'approved_emails');
    const snapshot = await getDoc(approvedEmailsRef);
    
    if (snapshot.exists()) {
      await updateDoc(approvedEmailsRef, {
        emails: arrayRemove(email)
      });
      
      console.log(`Email ${email} removed from approved list`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error removing approved email:', error);
    return false;
  }
};

/**
 * Get the list of all approved emails
 * @returns Promise<string[]> Array of approved email addresses
 */
export const getApprovedEmails = async (): Promise<string[]> => {
  try {
    const approvedEmailsRef = doc(db, 'access_control', 'approved_emails');
    const snapshot = await getDoc(approvedEmailsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      return data.emails || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting approved emails:', error);
    return [];
  }
};
