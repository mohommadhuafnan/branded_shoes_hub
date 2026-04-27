// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcqkWMyCih1ZcB_hOiWnCP1jeZISE3r94",
  authDomain: "shoe-shop-7ce28.firebaseapp.com",
  projectId: "shoe-shop-7ce28",
  storageBucket: "shoe-shop-7ce28.firebasestorage.app",
  messagingSenderId: "382658659932",
  appId: "1:382658659932:web:4f634a29fe9a4fb3674899",
  databaseURL: "https://shoe-shop-7ce28-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

// Export the initialized app for use elsewhere
export default app;
