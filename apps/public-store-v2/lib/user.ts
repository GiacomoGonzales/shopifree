import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

export interface UserDocument {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  [key: string]: unknown;
  createdAt: unknown;
  updatedAt: unknown;
  lastLoginAt?: unknown;
  isActive?: boolean;
  phone?: string;
  timezone?: string;
  onboardingUserCompleted?: boolean;
}

/**
 * Get user document from Firestore
 */
export const getUserDocument = async (uid: string): Promise<UserDocument | null> => {
  try {
    const db = getFirebaseDb();
    if (!db) {
      console.error('[User] Firebase database not available');
      return null;
    }

    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return { uid, ...userDocSnap.data() } as UserDocument;
    }

    console.warn('[User] User document not found for uid:', uid);
    return null;
  } catch (error) {
    console.error('[User] Error getting user document:', error);
    return null;
  }
};

/**
 * Get user email by uid
 */
export const getUserEmail = async (uid: string): Promise<string | null> => {
  try {
    const userDoc = await getUserDocument(uid);
    return userDoc?.email || null;
  } catch (error) {
    console.error('[User] Error getting user email:', error);
    return null;
  }
};