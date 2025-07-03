import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'
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

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      return { user: null, error: 'Firebase no está disponible' }
    }

    // Set persistence before signing in
    await setPersistence(auth, browserLocalPersistence)
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error: unknown) {
    console.error('Error signing in:', error)
    let errorMessage = 'Error al iniciar sesión'
    
    const firebaseError = error as { code?: string }
    if (firebaseError?.code === 'auth/user-not-found') {
      errorMessage = 'Usuario no encontrado'
    } else if (firebaseError?.code === 'auth/wrong-password') {
      errorMessage = 'Contraseña incorrecta'
    } else if (firebaseError?.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido'
    } else if (firebaseError?.code === 'auth/too-many-requests') {
      errorMessage = 'Demasiados intentos. Intenta más tarde'
    }
    
    return { user: null, error: errorMessage }
  }
}

// Register with email and password
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      return { user: null, error: 'Firebase no está disponible' }
    }

    // Set persistence before registering
    await setPersistence(auth, browserLocalPersistence)
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error: unknown) {
    console.error('Error registering:', error)
    let errorMessage = 'Error al crear la cuenta'
    
    const firebaseError = error as { code?: string }
    if (firebaseError?.code === 'auth/email-already-in-use') {
      errorMessage = 'Este email ya está registrado'
    } else if (firebaseError?.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido'
    } else if (firebaseError?.code === 'auth/weak-password') {
      errorMessage = 'La contraseña es muy débil'
    } else if (firebaseError?.code === 'auth/too-many-requests') {
      errorMessage = 'Demasiados intentos. Intenta más tarde'
    }
    
    return { user: null, error: errorMessage }
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      return { user: null, error: 'Firebase no está disponible' }
    }

    // Set persistence before signing in
    await setPersistence(auth, browserLocalPersistence)
    
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    return { user: userCredential.user, error: null }
  } catch (error: unknown) {
    console.error('Error signing in with Google:', error)
    let errorMessage = 'Error al iniciar sesión con Google'
    
    const firebaseError = error as { code?: string }
    if (firebaseError?.code === 'auth/popup-blocked') {
      errorMessage = 'Popup bloqueado. Permite popups para este sitio'
    } else if (firebaseError?.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Proceso cancelado por el usuario'
    }
    
    return { user: null, error: errorMessage }
  }
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