import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'

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
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  )
}

// Initialize Firebase only if we have valid config
let app: FirebaseApp | null = null
let db: Firestore | null = null

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
    
    return app
  } catch (error) {
    console.error('Error initializing Firebase:', error)
    return null
  }
}

// Export functions that lazily initialize Firebase
export const getFirebaseDb = () => {
  if (!db && isValidConfig()) {
    initializeFirebase()
  }
  return db
}

export const getFirebaseApp = () => {
  if (!app && isValidConfig()) {
    initializeFirebase()
  }
  return app
}

export default getFirebaseApp 