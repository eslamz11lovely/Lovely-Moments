// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Lovely Moments — Reviews Admin Service
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Unsubscribe,
    QueryDocumentSnapshot,
    DocumentData,
} from "firebase/firestore";
import { getDatabase } from "./firebase";
import type { Review, ReviewStatus } from "./reviewsService";

// ── Helpers ───────────────────────────────────────────

const getReviewsCollection = () => {
    const db = getDatabase();
    return collection(db, "reviews");
};

const mapDoc = (d: QueryDocumentSnapshot<DocumentData>): Review => ({
    id: d.id,
    ...(d.data() as Omit<Review, "id">),
});

// ── Get all reviews (admin — no filter) ───────────────

export const getAllReviews = async (): Promise<Review[]> => {
    const col = getReviewsCollection();
    const q = query(col, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDoc);
};

// ── Subscribe real-time ───────────────────────────────

export const subscribeToAllReviews = (
    callback: (reviews: Review[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const col = getReviewsCollection();
    const q = query(col, orderBy("createdAt", "desc"));

    return onSnapshot(
        q,
        (snapshot) => callback(snapshot.docs.map(mapDoc)),
        (err) => onError?.(err as Error)
    );
};

// ── Approve ───────────────────────────────────────────

export const approveReview = async (reviewId: string): Promise<void> => {
    const db = getDatabase();
    await updateDoc(doc(db, "reviews", reviewId), {
        approved: true,
        status: "approved" as ReviewStatus,
        updatedAt: serverTimestamp(),
    });
};

// ── Reject ────────────────────────────────────────────

export const rejectReview = async (reviewId: string): Promise<void> => {
    const db = getDatabase();
    await updateDoc(doc(db, "reviews", reviewId), {
        approved: false,
        status: "rejected" as ReviewStatus,
        updatedAt: serverTimestamp(),
    });
};

// ── Toggle Featured ───────────────────────────────────

export const toggleFeatured = async (
    reviewId: string,
    featured: boolean
): Promise<void> => {
    const db = getDatabase();
    await updateDoc(doc(db, "reviews", reviewId), {
        featured,
        updatedAt: serverTimestamp(),
    });
};

// ── Toggle Show on Home ───────────────────────────────

export const toggleShowOnHome = async (
    reviewId: string,
    showOnHome: boolean
): Promise<void> => {
    const db = getDatabase();
    await updateDoc(doc(db, "reviews", reviewId), {
        showOnHome,
        updatedAt: serverTimestamp(),
    });
};

// ── Set Display Order ─────────────────────────────────

export const setDisplayOrder = async (
    reviewId: string,
    displayOrder: number
): Promise<void> => {
    const db = getDatabase();
    await updateDoc(doc(db, "reviews", reviewId), {
        displayOrder,
        updatedAt: serverTimestamp(),
    });
};

// ── Update Review Text ────────────────────────────────

export const updateReviewText = async (
    reviewId: string,
    reviewText: string
): Promise<void> => {
    const db = getDatabase();
    await updateDoc(doc(db, "reviews", reviewId), {
        reviewText: reviewText.trim(),
        updatedAt: serverTimestamp(),
    });
};

// ── Delete ────────────────────────────────────────────

export const deleteReview = async (reviewId: string): Promise<void> => {
    const db = getDatabase();
    await deleteDoc(doc(db, "reviews", reviewId));
};

export default {
    getAllReviews,
    subscribeToAllReviews,
    approveReview,
    rejectReview,
    toggleFeatured,
    toggleShowOnHome,
    setDisplayOrder,
    updateReviewText,
    deleteReview,
};
