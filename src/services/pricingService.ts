// Pricing Service - Dedicated service for pricing management with real-time updates
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    serverTimestamp,
    onSnapshot,
    Unsubscribe,
    setDoc
} from "firebase/firestore";
import { getDatabase } from "./firebase";

export interface Pricing {
    id?: string;
    basic: number;
    medium: number;
    premium: number;
    updatedAt: Timestamp | Date;
}

// Pricing document ID in Firestore
const PRICING_DOC_ID = "current";

// Get pricing collection reference
const getPricingCollection = () => {
    const db = getDatabase();
    return collection(db, "pricing");
};

// Get pricing document reference
const getPricingDocRef = () => {
    const db = getDatabase();
    return doc(db, "pricing", PRICING_DOC_ID);
};

// Get current pricing from Firestore
export const getPricing = async (): Promise<Pricing | null> => {
    try {
        const docSnap = await getDoc(getPricingDocRef());

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Pricing;
        }

        return null;
    } catch (error: any) {
        throw new Error(`Failed to fetch pricing: ${error.message}`);
    }
};

// Subscribe to real-time pricing updates
export const subscribeToPricing = (
    callback: (pricing: Pricing | null) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const unsubscribe = onSnapshot(
        getPricingDocRef(),
        (docSnap) => {
            if (docSnap.exists()) {
                const pricing = {
                    id: docSnap.id,
                    ...docSnap.data()
                } as Pricing;
                callback(pricing);
            } else {
                callback(null);
            }
        },
        (error) => {
            if (onError) {
                onError(error as Error);
            }
        }
    );

    return unsubscribe;
};

// Update pricing in Firestore
export const updatePricing = async (pricing: Omit<Pricing, "updatedAt" | "id">): Promise<void> => {
    try {
        await updateDoc(getPricingDocRef(), {
            basic: pricing.basic,
            medium: pricing.medium,
            premium: pricing.premium,
            updatedAt: serverTimestamp()
        });
    } catch (error: any) {
        // If document doesn't exist, create it
        if (error.code === "not-found") {
            await setDoc(getPricingDocRef(), {
                basic: pricing.basic,
                medium: pricing.medium,
                premium: pricing.premium,
                updatedAt: serverTimestamp()
            });
        } else {
            throw new Error(`Failed to update pricing: ${error.message}`);
        }
    }
};

// Create initial pricing document if it doesn't exist
export const createInitialPricing = async (): Promise<void> => {
    try {
        const docSnap = await getDoc(getPricingDocRef());

        if (!docSnap.exists()) {
            await setDoc(getPricingDocRef(), {
                basic: 299,
                medium: 499,
                premium: 899,
                updatedAt: serverTimestamp()
            });
        }
    } catch (error: any) {
        throw new Error(`Failed to create initial pricing: ${error.message}`);
    }
};

// Reset pricing to default values
export const resetPricing = async (): Promise<void> => {
    await updatePricing({
        basic: 299,
        medium: 499,
        premium: 899
    });
};

export default {
    getPricing,
    subscribeToPricing,
    updatePricing,
    createInitialPricing,
    resetPricing
};
