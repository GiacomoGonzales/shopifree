import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  User 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()

// Register with email and password
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Save user data to Firestore
    await saveUserToFirestore(user, 'es') // Default language
    
    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    // Check if user exists in Firestore, if not create profile
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (!userDoc.exists()) {
      await saveUserToFirestore(user, 'es') // Default language
    }
    
    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Save user to Firestore
const saveUserToFirestore = async (user: User, language: string = 'es') => {
  const userData = {
    email: user.email,
    createdAt: new Date(),
    language: language,
    role: 'user'
  }
  
  await setDoc(doc(db, 'users', user.uid), userData)
}

// Get user profile from Firestore
export const getUserProfile = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data()
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
} 