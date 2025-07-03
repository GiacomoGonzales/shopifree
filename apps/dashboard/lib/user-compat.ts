import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { getFirebaseDb } from './firebase'

export interface UserDocument {
  uid: string
  email: string | null
  displayName: string | null
  createdAt: unknown
  updatedAt: unknown
  // Add any other custom fields you need
  role?: string
  lastLoginAt?: unknown
  isActive?: boolean
  phone?: string
  photoURL?: string
}

/**
 * Get user document from Firestore
 */
export const getUserDocument = async (uid: string): Promise<UserDocument | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const userDocRef = doc(db, 'users', uid)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      return { uid, ...userDocSnap.data() } as UserDocument
    }

    return null
  } catch (error) {
    console.error('Error getting user document:', error)
    throw error
  }
}

/**
 * Create or update user document in Firestore
 */
export const createUserDocument = async (user: User, additionalData?: Record<string, unknown>): Promise<UserDocument> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const userDocRef = doc(db, 'users', user.uid)
    
    // Check if user document already exists
    const existingDoc = await getDoc(userDocRef)
    
    if (existingDoc.exists()) {
      // Update existing document with last login
      const updatedData = {
        ...existingDoc.data(),
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...additionalData
      }
      
      await setDoc(userDocRef, updatedData, { merge: true })
      return { uid: user.uid, ...updatedData } as UserDocument
    } else {
      // Create new user document
      const userData: Omit<UserDocument, 'uid'> = {
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        isActive: true,
        role: 'user',
        ...additionalData
      }
      
      await setDoc(userDocRef, userData)
      return { uid: user.uid, ...userData } as UserDocument
    }
  } catch (error) {
    console.error('Error creating/updating user document:', error)
    throw error
  }
}

/**
 * Update user document in Firestore
 */
export const updateUserDocument = async (uid: string, data: Partial<UserDocument>): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const userDocRef = doc(db, 'users', uid)
    await setDoc(userDocRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true })
  } catch (error) {
    console.error('Error updating user document:', error)
    throw error
  }
} 