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

export interface Discount {
    enabled: boolean;
    percentage: number;       // e.g. 20 = 20% off
    label: string;            // e.g. "عرض العيد"
    expiresAt: string | null; // ISO date string, null = no expiry
}

export interface Pricing {
    id?: string;
    basic: number;
    medium: number;
    premium: number;
    discount: Discount;
    updatedAt: Timestamp | Date;
}

// Default discount state
export const DEFAULT_DISCOUNT: Discount = {
    enabled: false,
    percentage: 0,
    label: "",
    expiresAt: null,
};

// Pricing document ID in Firestore
const PRICING_DOC_ID = "current";

// Get pricing document reference
const getPricingDocRef = () => {
    const db = getDatabase();
    return doc(db, "pricing", PRICING_DOC_ID);
};

// ── Calculate discounted price ─────────────────────────

export const calcDiscountedPrice = (price: number, discount: Discount): number => {
    if (!discount.enabled || discount.percentage <= 0) return price;
    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) return price;
    return Math.round(price * (1 - discount.percentage / 100));
};

// ── Check if discount is currently active ─────────────

export const isDiscountActive = (discount: Discount): boolean => {
    if (!discount.enabled || discount.percentage <= 0) return false;
    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) return false;
    return true;
};

// ── Get current pricing from Firestore ────────────────

export const getPricing = async (): Promise<Pricing | null> => {
    try {
        const docSnap = await getDoc(getPricingDocRef());
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                discount: data.discount ?? DEFAULT_DISCOUNT,
            } as Pricing;
        }
        return null;
    } catch (error: any) {
        throw new Error(`Failed to fetch pricing: ${error.message}`);
    }
};

// ── Subscribe to real-time pricing updates ────────────

export const subscribeToPricing = (
    callback: (pricing: Pricing | null) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const unsubscribe = onSnapshot(
        getPricingDocRef(),
        (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                callback({
                    id: docSnap.id,
                    ...data,
                    discount: data.discount ?? DEFAULT_DISCOUNT,
                } as Pricing);
            } else {
                callback(null);
            }
        },
        (error) => {
            if (onError) onError(error as Error);
        }
    );
    return unsubscribe;
};

// ── Update prices ─────────────────────────────────────

export const updatePricing = async (pricing: Omit<Pricing, "updatedAt" | "id">): Promise<void> => {
    try {
        await updateDoc(getPricingDocRef(), {
            basic: pricing.basic,
            medium: pricing.medium,
            premium: pricing.premium,
            updatedAt: serverTimestamp(),
        });
    } catch (error: any) {
        if (error.code === "not-found") {
            await setDoc(getPricingDocRef(), {
                basic: pricing.basic,
                medium: pricing.medium,
                premium: pricing.premium,
                discount: DEFAULT_DISCOUNT,
                updatedAt: serverTimestamp(),
            });
        } else {
            throw new Error(`Failed to update pricing: ${error.message}`);
        }
    }
};

// ── Update discount settings ──────────────────────────

export const updateDiscount = async (discount: Discount): Promise<void> => {
    try {
        await updateDoc(getPricingDocRef(), {
            discount,
            updatedAt: serverTimestamp(),
        });
    } catch (error: any) {
        if (error.code === "not-found") {
            await setDoc(getPricingDocRef(), {
                basic: 299,
                medium: 499,
                premium: 899,
                discount,
                updatedAt: serverTimestamp(),
            });
        } else {
            throw new Error(`Failed to update discount: ${error.message}`);
        }
    }
};

// ── Create initial pricing if not exists ──────────────

export const createInitialPricing = async (): Promise<void> => {
    try {
        const docSnap = await getDoc(getPricingDocRef());
        if (!docSnap.exists()) {
            await setDoc(getPricingDocRef(), {
                basic: 299,
                medium: 499,
                premium: 899,
                discount: DEFAULT_DISCOUNT,
                updatedAt: serverTimestamp(),
            });
        }
    } catch (error: any) {
        throw new Error(`Failed to create initial pricing: ${error.message}`);
    }
};

// ── Reset pricing to defaults ─────────────────────────

export const resetPricing = async (): Promise<void> => {
    await updatePricing({ basic: 299, medium: 499, premium: 899, discount: DEFAULT_DISCOUNT });
};

export default {
    getPricing,
    subscribeToPricing,
    updatePricing,
    updateDiscount,
    createInitialPricing,
    resetPricing,
    calcDiscountedPrice,
    isDiscountActive,
};
