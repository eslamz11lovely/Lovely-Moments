// Firestore Service - Main entry point that re-exports from specialized services
// This maintains backward compatibility while using the new modular architecture

export * from "./ordersService";
export * from "./pricingService";
export * from "./examplesService";

// Legacy types for backward compatibility
export interface Order {
    id: string;
    name: string;
    phone: string;
    occasion: string;
    details: string;
    package: string;
    status: string;
    notes?: string;
    createdAt: any;
    updatedAt?: any;
}

export interface Message {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: any;
}

export interface Pricing {
    id?: string;
    basic: number;
    medium: number;
    premium: number;
    updatedAt: any;
}

// Legacy message functions (kept for backward compatibility)
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    doc,
    deleteDoc,
    getDoc,
    updateDoc
} from "firebase/firestore";
import { getDatabase } from "./firebase";

export const messagesCollection = collection(getDatabase(), "messages");

export const addMessage = async (messageData: Omit<Message, "id" | "createdAt">) => {
    const docRef = await addDoc(messagesCollection, {
        ...messageData,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const getMessages = async (): Promise<Message[]> => {
    const q = query(messagesCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Message));
};

export const deleteMessage = async (id: string) => {
    const messageDoc = doc(getDatabase(), "messages", id);
    await deleteDoc(messageDoc);
};
