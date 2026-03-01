// Notifications Service - Desktop notifications for new orders (Admin only)
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    Unsubscribe,
    Timestamp,
} from "firebase/firestore";
import { getDatabase } from "./firebase";

// ─── Constants ────────────────────────────────────────────────────
const STORAGE_KEY_PERMISSION = "lm_notifications_enabled";
const STORAGE_KEY_SOUND = "lm_notifications_sound";
const STORAGE_KEY_LAST_COUNT = "lm_last_order_count";
const STORAGE_KEY_INIT_TIMESTAMP = "lm_notifications_init_ts";
const DEBOUNCE_MS = 3000; // 3 seconds debounce
const NOTIFICATION_SOUND_PATH = "/sounds/notification.mp3";

// ─── State ────────────────────────────────────────────────────────
let firestoreUnsubscribe: Unsubscribe | null = null;
let lastNotificationTime = 0;
let isFirstSnapshot = true;

// ─── Permission Helpers ───────────────────────────────────────────

/**
 * Check if the Browser Notification API is supported.
 */
export const isNotificationSupported = (): boolean => {
    return "Notification" in window;
};

/**
 * Get current browser notification permission status.
 */
export const getNotificationPermission = (): NotificationPermission | "unsupported" => {
    if (!isNotificationSupported()) return "unsupported";
    return Notification.permission;
};

/**
 * Check if admin has previously enabled notifications (localStorage flag).
 */
export const isNotificationEnabled = (): boolean => {
    return localStorage.getItem(STORAGE_KEY_PERMISSION) === "true";
};

/**
 * Check if notification sound is enabled.
 */
export const isSoundEnabled = (): boolean => {
    return localStorage.getItem(STORAGE_KEY_SOUND) !== "false"; // default true
};

/**
 * Toggle sound preference.
 */
export const setSoundEnabled = (enabled: boolean): void => {
    localStorage.setItem(STORAGE_KEY_SOUND, String(enabled));
};

/**
 * Request browser notification permission.
 * Only called when admin explicitly clicks the activation button.
 */
export const requestNotificationPermission = async (): Promise<{
    granted: boolean;
    error?: string;
}> => {
    if (!isNotificationSupported()) {
        return { granted: false, error: "المتصفح لا يدعم الإشعارات" };
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            localStorage.setItem(STORAGE_KEY_PERMISSION, "true");
            // Store current timestamp so we don't fire notifications for existing orders
            localStorage.setItem(STORAGE_KEY_INIT_TIMESTAMP, String(Date.now()));
            return { granted: true };
        } else if (permission === "denied") {
            localStorage.removeItem(STORAGE_KEY_PERMISSION);
            return {
                granted: false,
                error: "تم رفض الإشعارات. يرجى تفعيلها من إعدادات المتصفح.",
            };
        } else {
            return { granted: false, error: "تم تجاهل طلب الإشعارات." };
        }
    } catch (err: any) {
        return { granted: false, error: err.message || "حدث خطأ غير متوقع" };
    }
};

/**
 * Disable notifications and clean up.
 */
export const disableNotifications = (): void => {
    localStorage.removeItem(STORAGE_KEY_PERMISSION);
    localStorage.removeItem(STORAGE_KEY_LAST_COUNT);
    localStorage.removeItem(STORAGE_KEY_INIT_TIMESTAMP);
    unsubscribeFromOrders();
};

// ─── Notification Trigger ─────────────────────────────────────────

/**
 * Show a desktop notification for a new order.
 * Includes debounce protection to prevent spam.
 */
const triggerNotification = (orderCount: number): void => {
    const now = Date.now();

    // Debounce: skip if fired too recently
    if (now - lastNotificationTime < DEBOUNCE_MS) return;
    lastNotificationTime = now;

    // Play sound if enabled
    if (isSoundEnabled()) {
        try {
            const audio = new Audio(NOTIFICATION_SOUND_PATH);
            audio.volume = 0.5;
            audio.play().catch(() => {
                // audio play may fail if user hasn't interacted with page
            });
        } catch {
            // Ignore audio errors
        }
    }

    // Show browser notification
    if (getNotificationPermission() === "granted") {
        const notification = new Notification("طلب جديد في Lovely Moments 🎀", {
            body: "تم استلام طلب جديد — اضغط لعرض التفاصيل",
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: `new-order-${orderCount}`, // Prevents duplicate notifications with same tag
            requireInteraction: false,
        });

        // On click: focus tab and navigate to orders page
        notification.onclick = () => {
            window.focus();
            window.location.href = "/admin";
            notification.close();
        };

        // Auto-close after 8 seconds
        setTimeout(() => notification.close(), 8000);
    }
};

// ─── Firestore Real-Time Listener ─────────────────────────────────

/**
 * Subscribe to Firestore orders collection and trigger notifications
 * when new documents are detected.
 *
 * IMPORTANT: This should ONLY be called inside the Admin Dashboard.
 */
export const subscribeToNewOrders = (): Unsubscribe => {
    // Prevent duplicate subscriptions
    if (firestoreUnsubscribe) {
        return firestoreUnsubscribe;
    }

    const db = getDatabase();
    const ordersCollection = collection(db, "orders");
    const q = query(ordersCollection, orderBy("createdAt", "desc"));

    // Reset first-snapshot flag
    isFirstSnapshot = true;

    // Get the stored last count — prevents notifications on refresh
    const storedCount = localStorage.getItem(STORAGE_KEY_LAST_COUNT);
    let lastKnownCount = storedCount ? parseInt(storedCount, 10) : -1;

    firestoreUnsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const currentCount = snapshot.docs.length;

            if (isFirstSnapshot) {
                // First snapshot after mount — record count, do NOT notify
                isFirstSnapshot = false;
                lastKnownCount = currentCount;
                localStorage.setItem(STORAGE_KEY_LAST_COUNT, String(currentCount));
                return;
            }

            // Check if new documents were added
            if (currentCount > lastKnownCount && lastKnownCount >= 0) {
                const newOrdersCount = currentCount - lastKnownCount;

                // Verify the addition is genuinely new using docChanges
                const addedDocs = snapshot.docChanges().filter((change) => change.type === "added");

                if (addedDocs.length > 0) {
                    triggerNotification(currentCount);
                }
            }

            // Update stored count
            lastKnownCount = currentCount;
            localStorage.setItem(STORAGE_KEY_LAST_COUNT, String(currentCount));
        },
        (error) => {
            console.error("Notification listener error:", error);
        }
    );

    return firestoreUnsubscribe;
};

/**
 * Unsubscribe from Firestore listener.
 * Called on logout or component unmount.
 */
export const unsubscribeFromOrders = (): void => {
    if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
    }
    isFirstSnapshot = true;
};

/**
 * Full cleanup — call on admin logout.
 */
export const cleanupNotifications = (): void => {
    unsubscribeFromOrders();
};

export default {
    isNotificationSupported,
    getNotificationPermission,
    isNotificationEnabled,
    isSoundEnabled,
    setSoundEnabled,
    requestNotificationPermission,
    disableNotifications,
    subscribeToNewOrders,
    unsubscribeFromOrders,
    cleanupNotifications,
};
