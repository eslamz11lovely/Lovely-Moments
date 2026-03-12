// Firebase Service - Centralized Firebase initialization
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDDMHSJFERAw0FbJibnPuJq7A7tDBtEgSQ",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lovely-link.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lovely-link",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lovely-link.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1086333728361",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1086333728361:web:cb4593937f2d13bed694f8"
};

// Initialize Firebase only once
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

const initializeFirebase = () => {
    if (!app) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    }
    return { app, db: db! };
};

// Get Firestore instance
export const getDatabase = (): Firestore => {
    if (!db) {
        initializeFirebase();
    }
    return db!;
};

// Export singleton instances
export { app, db };

// Initialize on import
initializeFirebase();

export default initializeFirebase;
