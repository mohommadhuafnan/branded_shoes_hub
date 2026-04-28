import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBcqkWMyCih1ZcB_hOiWnCP1jeZISE3r94',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'shoe-shop-7ce28.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shoe-shop-7ce28',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'shoe-shop-7ce28.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '382658659932',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:382658659932:web:4f634a29fe9a4fb3674899',
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://shoe-shop-7ce28-default-rtdb.firebaseio.com',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
export const storage = getStorage(app)

export default app
