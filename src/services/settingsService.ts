import { getDoc, doc } from "firebase/firestore";
import { getDatabase } from "./firebase";

export interface SiteSettings {
    siteName: string;
    adminEmail: string;
    adminPhone: string;
    whatsappLink: string;
    facebookLink: string;
    instagramLink: string;
    tiktokLink: string;
}

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
