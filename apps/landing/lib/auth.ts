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
  if (!auth || !db) {
    return { user: null, error: 'Firebase no está configurado. Por favor configura las variables de entorno.' }
  }

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
  if (!auth || !db) {
    return { user: null, error: 'Firebase no está configurado. Por favor configura las variables de entorno.' }
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  if (!auth || !db) {
    return { user: null, error: 'Firebase no está configurado. Por favor configura las variables de entorno.' }
  }

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
  if (!db) {
    throw new Error('Firebase no está configurado')
  }

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
  if (!db) {
    console.warn('Firebase no está configurado')
    return null
  }

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