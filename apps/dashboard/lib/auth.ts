import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './firebase'

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

// Sign out
export const signOut = async () => {
  try {
    await auth.signOut()
  } catch (error) {
    console.error('Error signing out:', error)
  }
} 