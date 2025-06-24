import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Verificar si las variables de entorno están configuradas
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => value && value !== 'undefined')

let app
let auth
let db

if (isFirebaseConfigured) {
  // Initialize Firebase only if not already initialized
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
} else {
  console.warn('⚠️ Firebase no está configurado. Variables de entorno faltantes.')
  // Create mock objects to prevent runtime errors
  app = null
  auth = null
  db = null
}

export { auth, db }
export default app 