import { doc, setDoc, getDoc, serverTimestamp, query, collection, where, getDocs, Timestamp } from 'firebase/firestore'
import { User as FirebaseUser } from 'firebase/auth'
import { getFirebaseDb } from './firebase'

export interface UserDocument {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  [key: string]: unknown
  createdAt: unknown
  updatedAt: unknown
  // Add any other custom fields you need
  lastLoginAt?: unknown
  isActive?: boolean
  phone?: string
  timezone?: string
  onboardingUserCompleted?: boolean
  // Soft delete fields
  deleted?: boolean
  deletedAt?: unknown
  scheduledDeletionDate?: unknown
  restoredAt?: unknown
  // Legacy fields (deprecated - for backward compatibility)
  nombre?: string
  telefono?: string
  correo?: string
  zonaHoraria?: string
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
export const createUserDocument = async (user: FirebaseUser, additionalData?: Record<string, unknown>): Promise<UserDocument> => {
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

/**
 * Soft delete user account and associated store
 * Marks user and store as deleted with a 30-day grace period
 */
export const softDeleteUserAndStore = async (uid: string): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const now = Timestamp.now()
    const thirtyDaysFromNow = Timestamp.fromMillis(now.toMillis() + (30 * 24 * 60 * 60 * 1000))

    // 1. Mark user as deleted
    const userDocRef = doc(db, 'users', uid)
    await setDoc(userDocRef, {
      deleted: true,
      deletedAt: now,
      scheduledDeletionDate: thirtyDaysFromNow,
      updatedAt: serverTimestamp()
    }, { merge: true })

    console.log('✅ User marked as deleted:', uid)

    // 2. Find and mark user's store as deleted
    const storesQuery = query(collection(db, 'stores'), where('ownerId', '==', uid))
    const storesSnapshot = await getDocs(storesQuery)

    if (!storesSnapshot.empty) {
      const storeDoc = storesSnapshot.docs[0]
      const storeDocRef = doc(db, 'stores', storeDoc.id)

      await setDoc(storeDocRef, {
        deleted: true,
        deletedAt: now,
        scheduledDeletionDate: thirtyDaysFromNow,
        updatedAt: serverTimestamp()
      }, { merge: true })

      console.log('✅ Store marked as deleted:', storeDoc.id)
    }

    console.log('✅ Soft delete completed. Scheduled for permanent deletion:', thirtyDaysFromNow.toDate())
  } catch (error) {
    console.error('Error in soft delete:', error)
    throw error
  }
}

/**
 * Restore user account and associated store from soft delete
 * Removes deletion flags and restores access
 */
export const restoreUserAndStore = async (uid: string): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    // 1. Restore user
    const userDocRef = doc(db, 'users', uid)
    await setDoc(userDocRef, {
      deleted: false,
      deletedAt: null,
      scheduledDeletionDate: null,
      restoredAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })

    console.log('✅ User restored:', uid)

    // 2. Find and restore user's store
    const storesQuery = query(collection(db, 'stores'), where('ownerId', '==', uid))
    const storesSnapshot = await getDocs(storesQuery)

    if (!storesSnapshot.empty) {
      const storeDoc = storesSnapshot.docs[0]
      const storeDocRef = doc(db, 'stores', storeDoc.id)

      await setDoc(storeDocRef, {
        deleted: false,
        deletedAt: null,
        scheduledDeletionDate: null,
        restoredAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true })

      console.log('✅ Store restored:', storeDoc.id)
    }

    console.log('✅ Account restoration completed successfully')
  } catch (error) {
    console.error('Error restoring account:', error)
    throw error
  }
}

/**
 * Check if user account is deleted and get deletion info
 */
export const getAccountDeletionInfo = async (uid: string): Promise<{
  isDeleted: boolean
  deletedAt?: Date
  scheduledDeletionDate?: Date
  daysRemaining?: number
} | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const userDocRef = doc(db, 'users', uid)
    const userDocSnap = await getDoc(userDocRef)

    if (!userDocSnap.exists()) {
      return null
    }

    const data = userDocSnap.data()

    if (!data.deleted) {
      return { isDeleted: false }
    }

    const deletedAt = data.deletedAt?.toDate()
    const scheduledDeletionDate = data.scheduledDeletionDate?.toDate()

    let daysRemaining = 0
    if (scheduledDeletionDate) {
      const now = new Date()
      const diffTime = scheduledDeletionDate.getTime() - now.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return {
      isDeleted: true,
      deletedAt,
      scheduledDeletionDate,
      daysRemaining
    }
  } catch (error) {
    console.error('Error getting account deletion info:', error)
    throw error
  }
} 