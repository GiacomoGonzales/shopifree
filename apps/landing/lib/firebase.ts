import { initializeApp } from 'firebase/app'
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

// 🔍 DEBUGGING: Mostrar valores de configuración
console.log('🔍 FIREBASE CONFIG DEBUG:')
console.log('firebaseConfig.apiKey:', firebaseConfig.apiKey)
console.log('firebaseConfig.authDomain:', firebaseConfig.authDomain)
console.log('firebaseConfig.projectId:', firebaseConfig.projectId)
console.log('firebaseConfig.storageBucket:', firebaseConfig.storageBucket)
console.log('firebaseConfig.messagingSenderId:', firebaseConfig.messagingSenderId)
console.log('firebaseConfig.appId:', firebaseConfig.appId)
console.log('🔍 ALL ENV VARS:')
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app 