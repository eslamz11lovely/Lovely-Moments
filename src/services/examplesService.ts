// Examples Service - Dedicated service for live examples management
// Handles CRUD, image upload (ImgBB + Freeimage fallback), real-time sync
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    Timestamp,
    serverTimestamp,
    onSnapshot,
    Unsubscribe,
} from "firebase/firestore";
import { getDatabase } from "./firebase";

// ─── Types ───────────────────────────────────────────
export interface LiveExample {
    id: string;
    title: string;
    description: string;
    imageURL: string;
    websiteLink: string;
    isActive: boolean;
    isFeatured: boolean;
    order: number;
    createdAt: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}

export type LiveExampleInput = Omit<LiveExample, "id" | "createdAt" | "updatedAt">;

// ─── Image Upload ────────────────────────────────────

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "4928381d580067cef94fe8759d7cf536";
const FREEIMAGE_API_KEY = import.meta.env.VITE_FREEIMAGE_API_KEY || "6d207e02198a847aa98d0a2a901485a5";

/**
 * Convert a File to base64 data string (without the data:... prefix)
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data:image/...;base64, prefix
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};

/**
 * Upload image to ImgBB. Returns the URL on success.
 */
const uploadToImgBB = async (base64Image: string): Promise<string> => {
    const formData = new FormData();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", base64Image);

    const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`ImgBB upload failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error("ImgBB upload returned unsuccessful response");
    }

    return data.data.url;
};

/**
 * Fallback: upload image to Freeimage.host
 */
const uploadToFreeimage = async (base64Image: string): Promise<string> => {
    const formData = new FormData();
    formData.append("key", FREEIMAGE_API_KEY);
    formData.append("source", base64Image);
    formData.append("type", "base64");
    formData.append("action", "upload");

    const response = await fetch("https://freeimage.host/api/1/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Freeimage upload failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.status_code !== 200) {
        throw new Error("Freeimage upload returned unsuccessful response");
    }

    return data.image.url;
};

/**
 * Upload an image file. Tries ImgBB first, falls back to Freeimage.host.
 * Returns the public URL of the uploaded image.
 */
export const uploadImage = async (file: File): Promise<string> => {
    const base64 = await fileToBase64(file);

    // Try ImgBB first
    try {
        return await uploadToImgBB(base64);
    } catch (imgbbError) {
        // Fallback to Freeimage.host
        try {
            return await uploadToFreeimage(base64);
        } catch (freeimageError) {
            console.error("❌ Both upload services failed");
            throw new Error("فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
        }
    }
};

// ─── Firestore Helpers ───────────────────────────────

const getExamplesCollection = () => {
    const db = getDatabase();
    return collection(db, "examples");
};

const getExampleDocRef = (exampleId: string) => {
    const db = getDatabase();
    return doc(db, "examples", exampleId);
};

// ─── Read Operations ─────────────────────────────────
// NOTE: We fetch all docs and sort/filter client-side to avoid
// requiring Firestore composite indexes.

/** Get all examples (admin) ordered by `order` ascending */
export const getAllExamples = async (): Promise<LiveExample[]> => {
    try {
        const snapshot = await getDocs(getExamplesCollection());

        const examples = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            } as LiveExample))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        return examples;
    } catch (error: any) {
        throw new Error(`Failed to fetch examples: ${error.message}`);
    }
};

/** Get only active examples (public page) ordered by `order` ascending */
export const getActiveExamples = async (): Promise<LiveExample[]> => {
    try {
        const snapshot = await getDocs(getExamplesCollection());

        const examples = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            } as LiveExample))
            .filter(ex => ex.isActive === true)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        return examples;
    } catch (error: any) {
        throw new Error(`Failed to fetch active examples: ${error.message}`);
    }
};

/** Real-time subscription for admin — fetches all, sorts client-side */
export const subscribeToExamples = (
    callback: (examples: LiveExample[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const unsubscribe = onSnapshot(getExamplesCollection(),
        (snapshot) => {
            const examples = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as LiveExample))
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            callback(examples);
        },
        (error) => {
            if (onError) onError(error as Error);
        }
    );

    return unsubscribe;
};

/** Get a single example by ID */
export const getExampleById = async (exampleId: string): Promise<LiveExample | null> => {
    try {
        const docSnap = await getDoc(getExampleDocRef(exampleId));

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as LiveExample;
        }

        return null;
    } catch (error: any) {
        throw new Error(`Failed to fetch example: ${error.message}`);
    }
};

// ─── Write Operations ────────────────────────────────

/** Add a new example */
export const addExample = async (exampleData: LiveExampleInput): Promise<string> => {
    try {
        const docRef = await addDoc(getExamplesCollection(), {
            ...exampleData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error: any) {
        throw new Error(`Failed to add example: ${error.message}`);
    }
};

/** Update an existing example */
export const updateExample = async (exampleId: string, updates: Partial<LiveExample>): Promise<void> => {
    try {
        await updateDoc(getExampleDocRef(exampleId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error: any) {
        throw new Error(`Failed to update example: ${error.message}`);
    }
};

/** Toggle isActive */
export const toggleExampleVisibility = async (exampleId: string, isActive: boolean): Promise<void> => {
    await updateExample(exampleId, { isActive });
};

/** Toggle isFeatured */
export const toggleExampleFeatured = async (exampleId: string, isFeatured: boolean): Promise<void> => {
    await updateExample(exampleId, { isFeatured });
};

/** Delete an example */
export const deleteExample = async (exampleId: string): Promise<void> => {
    try {
        await deleteDoc(getExampleDocRef(exampleId));
    } catch (error: any) {
        throw new Error(`Failed to delete example: ${error.message}`);
    }
};

export default {
    getAllExamples,
    getActiveExamples,
    getExampleById,
    addExample,
    updateExample,
    toggleExampleVisibility,
    toggleExampleFeatured,
    deleteExample,
    subscribeToExamples,
    uploadImage,
};
