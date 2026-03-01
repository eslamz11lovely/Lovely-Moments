import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { getAuthInstance } from "./firebase";

const auth = getAuthInstance();

// Admin credentials
const ADMIN_EMAIL = "admin@lovelylink.com";
const ADMIN_PASSWORD = "Okaeslam2020###";

// Listen for auth state changes
export const subscribeToAuthState = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Login as admin
export const loginAsAdmin = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        return { success: true };
    } catch (error: any) {
        // If user doesn't exist, create it first
        if (error.code === "auth/user-not-found") {
            // In Firebase, we need to create the user first via Firebase Console
            // For now, we'll use a custom approach - store admin status in localStorage
            console.error("Admin user not found in Firebase Auth");
            return { success: false, error: "Admin account not configured" };
        }
        return { success: false, error: error.message };
    }
};

// Logout
export const logout = async (): Promise<void> => {
    await signOut(auth);
};

// Check if user is admin (using custom localStorage approach)
export const isAdmin = (): boolean => {
    return localStorage.getItem("isAdmin") === "true";
};

// Set admin status
export const setAdminStatus = (status: boolean): void => {
    if (status) {
        localStorage.setItem("isAdmin", "true");
    } else {
        localStorage.removeItem("isAdmin");
    }
};

// Custom admin login (since we can't create users programmatically without Admin SDK)
export const adminLogin = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (password === ADMIN_PASSWORD) {
        setAdminStatus(true);
        return { success: true };
    }
    return { success: false, error: "Invalid password" };
};

// Custom admin logout
export const adminLogout = async (): Promise<void> => {
    setAdminStatus(false);
    try {
        await logout();
    } catch {
        // Ignore logout errors
    }
};

// Check if admin is logged in
export const checkAdminAuth = (): boolean => {
    return isAdmin();
};
