import { getDoc, doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { getDatabase } from "./firebase";

export interface Announcement {
    enabled: boolean;
    text: string;
    emoji: string;
    style: "gradient" | "golden" | "pink" | "blue" | "green";
    link?: string;
    linkLabel?: string;
}

export interface SiteSettings {
    siteName: string;
    adminEmail: string;
    adminPhone: string;
    whatsappLink: string;
    facebookLink: string;
    instagramLink: string;
    tiktokLink: string;
    announcement?: Announcement;
}

export const DEFAULT_ANNOUNCEMENT: Announcement = {
    enabled: false,
    text: "",
    emoji: "🎉",
    style: "gradient",
    link: "",
    linkLabel: "",
};

export const getSiteSettings = async (): Promise<SiteSettings | null> => {
    try {
        const db = getDatabase();
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as SiteSettings;
        }
        return null;
    } catch (error) {
        console.error("Error fetching site settings:", error);
        return null;
    }
};

export const subscribeToSettings = (
    callback: (settings: SiteSettings | null) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const db = getDatabase();
    const docRef = doc(db, "settings", "general");

    return onSnapshot(
        docRef,
        (snap) => callback(snap.exists() ? (snap.data() as SiteSettings) : null),
        (err) => onError?.(err as Error)
    );
};
