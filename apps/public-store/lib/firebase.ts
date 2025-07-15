import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if we're in the browser and have valid config
const isValidConfig = () => {
  const hasConfig = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  )
  
  if (!hasConfig) {
    console.warn('Firebase configuration is missing or incomplete:', {
      apiKey: !!firebaseConfig.apiKey,
      authDomain: !!firebaseConfig.authDomain,
      projectId: !!firebaseConfig.projectId,
      storageBucket: !!firebaseConfig.storageBucket,
      messagingSenderId: !!firebaseConfig.messagingSenderId,
      appId: !!firebaseConfig.appId
    })
  }
  
  return hasConfig
}

// Initialize Firebase only if we have valid config
let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

const initializeFirebase = () => {
  if (!isValidConfig()) {
    console.warn('Firebase config is invalid or not available')
    return null
  }

  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApp()
    }

    db = getFirestore(app)
    auth = getAuth(app)
    
    return app
  } catch (error) {
    console.error('Error initializing Firebase:', error)
    return null
  }
}

// Export functions that lazily initialize Firebase
export const getFirebaseDb = () => {
  try {
    if (!db && isValidConfig()) {
      initializeFirebase()
    }
    return db
  } catch (error) {
    console.error('Error getting Firebase database:', error)
    return null
  }
}

export const getFirebaseApp = () => {
  if (!app && isValidConfig()) {
    initializeFirebase()
  }
  return app
}

export const getFirebaseAuth = () => {
  if (!auth && isValidConfig()) {
    initializeFirebase()
  }
  return auth
}

export default getFirebaseApp 