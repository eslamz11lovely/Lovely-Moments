// useOrderNotifications - Custom hook for admin order notifications
import { useState, useEffect, useCallback, useRef } from "react";
import {
    isNotificationSupported,
    getNotificationPermission,
    isNotificationEnabled,
    isSoundEnabled,
    setSoundEnabled as setSoundEnabledService,
    requestNotificationPermission,
    disableNotifications,
    subscribeToNewOrders,
    unsubscribeFromOrders,
} from "../services/notificationsService";

export type NotificationStatus =
    | "idle"          // Not yet interacted
    | "enabled"       // Active and listening
    | "denied"        // Browser denied permission
    | "unsupported"   // Browser doesn't support Notifications API
    | "disabled";     // Admin manually disabled

export interface UseOrderNotificationsReturn {
    /** Current status of the notification system */
    status: NotificationStatus;
    /** Whether the notification banner should be shown */
    showBanner: boolean;
    /** Whether sound is enabled */
    soundEnabled: boolean;
    /** Request permission and start listening */
    enableNotifications: () => Promise<string | null>;
    /** Stop notifications */
    handleDisable: () => void;
    /** Toggle sound on/off */
    toggleSound: () => void;
    /** Dismiss the banner without disabling */
    dismissBanner: () => void;
}

export const useOrderNotifications = (): UseOrderNotificationsReturn => {
    const [status, setStatus] = useState<NotificationStatus>("idle");
    const [showBanner, setShowBanner] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const initialized = useRef(false);

    // ── Initialize on mount ──────────────────────────────────
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        // Check browser support
        if (!isNotificationSupported()) {
            setStatus("unsupported");
            return;
        }

        // Check if admin previously enabled notifications
        const enabled = isNotificationEnabled();
        const permission = getNotificationPermission();

        if (enabled && permission === "granted") {
            // Already enabled — auto-start listener
            setStatus("enabled");
            setShowBanner(false);
            subscribeToNewOrders();
        } else if (permission === "denied") {
            setStatus("denied");
            setShowBanner(false);
        } else {
            // Show the activation banner
            setStatus("idle");
            setShowBanner(true);
        }

        // Load sound preference
        setSoundEnabled(isSoundEnabled());

        // Cleanup on unmount
        return () => {
            unsubscribeFromOrders();
        };
    }, []);

    // ── Enable Notifications ─────────────────────────────────
    const enableNotifications = useCallback(async (): Promise<string | null> => {
        const result = await requestNotificationPermission();

        if (result.granted) {
            setStatus("enabled");
            setShowBanner(false);
            subscribeToNewOrders();
            return null; // No error
        } else {
            if (getNotificationPermission() === "denied") {
                setStatus("denied");
            }
            return result.error || "حدث خطأ غير معروف";
        }
    }, []);

    // ── Disable Notifications ────────────────────────────────
    const handleDisable = useCallback(() => {
        disableNotifications();
        setStatus("disabled");
        setShowBanner(false);
    }, []);

    // ── Toggle Sound ─────────────────────────────────────────
    const toggleSound = useCallback(() => {
        const newValue = !soundEnabled;
        setSoundEnabled(newValue);
        setSoundEnabledService(newValue);
    }, [soundEnabled]);

    // ── Dismiss Banner ───────────────────────────────────────
    const dismissBanner = useCallback(() => {
        setShowBanner(false);
    }, []);

    return {
        status,
        showBanner,
        soundEnabled,
        enableNotifications,
        handleDisable,
        toggleSound,
        dismissBanner,
    };
};

export default useOrderNotifications;
