import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDDMHSJFERAw0FbJibnPuJq7A7tDBtEgSQ",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lovely-link.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lovely-link",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lovely-link.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1086333728361",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1086333728361:web:cb4593937f2d13bed694f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
