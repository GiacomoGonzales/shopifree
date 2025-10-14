import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'

// Firebase config for server-side initialization
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase Client SDK for server-side use (API routes)
let app: FirebaseApp | null = null
let db: Firestore | null = null

const initializeFirebaseServer = () => {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApp()
    }

    db = getFirestore(app)
    return app
  } catch (error) {
    console.error('Error initializing Firebase for server:', error)
    throw error
  }
}

export const getFirebaseServerDb = () => {
  if (!db) {
    initializeFirebaseServer()
  }
  return db!
}

/**
 * Verify Firebase Auth ID token using Google's public API
 * This doesn't require Admin SDK or service account credentials
 */
export const verifyIdToken = async (idToken: string): Promise<{ uid: string; email?: string }> => {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      }
    )

    if (!response.ok) {
      throw new Error('Invalid token')
    }

    const data = await response.json()

    if (!data.users || data.users.length === 0) {
      throw new Error('User not found')
    }

    const user = data.users[0]
    return {
      uid: user.localId,
      email: user.email,
    }
  } catch (error) {
    console.error('Error verifying token:', error)
    throw new Error('Invalid authentication token')
  }
}
