// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Lovely Moments — Reviews Public Service
//  Resilient: falls back to client-side sort if Firestore
//  composite indexes are not yet deployed.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    QueryDocumentSnapshot,
    DocumentData,
    Timestamp,
} from "firebase/firestore";
import { getDatabase } from "./firebase";

// ── Types ─────────────────────────────────────────────

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
    id: string;
    customerName: string;
    rating: number;
    reviewText: string;
    imageUrl: string | null;
    createdAt: Timestamp | Date | null;
    approved: boolean;
    featured: boolean;
    showOnHome: boolean;
    displayOrder: number;
    status: ReviewStatus;
}

export interface NewReviewInput {
    customerName: string;
    rating: number;
    reviewText: string;
    imageUrl?: string | null;
}

export interface PaginatedReviews {
    reviews: Review[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
}

const PAGE_SIZE = 9;

// ── Helpers ───────────────────────────────────────────

const getReviewsCollection = () => {
    const db = getDatabase();
    return collection(db, "reviews");
};

const mapDoc = (doc: QueryDocumentSnapshot<DocumentData>): Review => ({
    id: doc.id,
    ...(doc.data() as Omit<Review, "id">),
});

// ── Client-side sort (when composite index is missing) ─

const sortReviews = (reviews: Review[]): Review[] =>
    [...reviews].sort((a, b) => {
        // 1. featured first
        if ((b.featured ? 1 : 0) !== (a.featured ? 1 : 0)) {
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
        // 2. displayOrder asc
        if ((a.displayOrder ?? 0) !== (b.displayOrder ?? 0)) {
            return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
        }
        // 3. createdAt desc
        const aTime = (a.createdAt as any)?.toDate?.()?.getTime?.() ?? (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
        const bTime = (b.createdAt as any)?.toDate?.()?.getTime?.() ?? (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
        return bTime - aTime;
    });

// ── Submit new review (public — always pending) ───────

export const submitReview = async (input: NewReviewInput): Promise<string> => {
    const col = getReviewsCollection();
    const docRef = await addDoc(col, {
        customerName: input.customerName.trim(),
        rating: input.rating,
        reviewText: input.reviewText.trim(),
        imageUrl: input.imageUrl ?? null,
        createdAt: serverTimestamp(),
        approved: false,
        featured: false,
        showOnHome: false,
        displayOrder: 0,
        status: "pending" as ReviewStatus,
    });
    return docRef.id;
};

// ── Get paginated PUBLIC approved reviews ─────────────
// Strategy:
//   1. Try the optimised composite-index query
//   2. If that fails (index not deployed), fall back to a
//      simple single-field query + client-side sort/filter

export const getApprovedReviews = async (
    page = 0
): Promise<PaginatedReviews> => {
    const col = getReviewsCollection();

    // ── Strategy 1: composite index query ───────────
    try {
        const q = query(
            col,
            where("approved", "==", true),
            orderBy("featured", "desc"),
            orderBy("displayOrder", "asc"),
            orderBy("createdAt", "desc"),
            limit(PAGE_SIZE + 1)
        );

        const snapshot = await getDocs(q);
        const docs = snapshot.docs;
        const hasMore = docs.length > PAGE_SIZE;
        const sliced = hasMore ? docs.slice(0, PAGE_SIZE) : docs;

        // Simple pagination by page offset (since we removed startAfter/cursor)
        const all = sliced.map(mapDoc);
        return {
            reviews: all,
            lastDoc: sliced.length > 0 ? sliced[sliced.length - 1] : null,
            hasMore,
        };
    } catch (compositeErr: any) {
        // Index not ready — fall back to client-side approach
        console.warn(
            "Composite index not available, using client-side sort fallback:",
            compositeErr?.code || compositeErr?.message
        );
    }

    // ── Strategy 2: simple query + client-side sort ──
    try {
        const q = query(col, where("approved", "==", true));
        const snapshot = await getDocs(q);
        const all = sortReviews(snapshot.docs.map(mapDoc));

        const start = page * PAGE_SIZE;
        const sliced = all.slice(start, start + PAGE_SIZE);
        const hasMore = all.length > start + PAGE_SIZE;

        return {
            reviews: sliced,
            lastDoc: null, // cursor-based pagination not available in fallback
            hasMore,
        };
    } catch (err: any) {
        console.error("Failed to fetch reviews:", err);
        return { reviews: [], lastDoc: null, hasMore: false };
    }
};

// ── Get homepage reviews (approved + showOnHome) ──────

export const getHomepageReviews = async (): Promise<Review[]> => {
    const col = getReviewsCollection();

    // ── Strategy 1: composite index query ───────────
    try {
        const q = query(
            col,
            where("approved", "==", true),
            where("showOnHome", "==", true),
            orderBy("featured", "desc"),
            orderBy("displayOrder", "asc"),
            orderBy("createdAt", "desc"),
            limit(6)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapDoc);
    } catch {
        // Index not ready — fall back
    }

    // ── Strategy 2: client-side filter + sort ──────
    try {
        const q = query(col, where("approved", "==", true));
        const snapshot = await getDocs(q);
        const all = snapshot.docs.map(mapDoc);
        const filtered = all.filter((r) => r.showOnHome === true);
        return sortReviews(filtered).slice(0, 6);
    } catch (err) {
        console.error("Failed to fetch homepage reviews:", err);
        return [];
    }
};

export default {
    submitReview,
    getApprovedReviews,
    getHomepageReviews,
};
