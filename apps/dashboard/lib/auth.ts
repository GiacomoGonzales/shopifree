import { onAuthStateChanged, User } from 'firebase/auth'
import { getFirebaseAuth } from './firebase'

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const auth = getFirebaseAuth()
  if (!auth) {
    console.warn('Firebase auth not available')
    callback(null)
    return () => {} // Return empty cleanup function
  }
  return onAuthStateChanged(auth, callback)
}

// Get current user
export const getCurrentUser = (): User | null => {
  const auth = getFirebaseAuth()
  return auth?.currentUser || null
}

// Sign out
export const signOut = async () => {
  try {
    const auth = getFirebaseAuth()
    if (auth) {
      await auth.signOut()
    }
  } catch (error) {
    console.error('Error signing out:', error)
  }
} 