// Telegram Notification Service
// Sends order notifications via Google Apps Script webhook (proxy)
// The bot token is stored securely in the Apps Script — never in frontend code.

const WEBHOOK_URL =
    "https://script.google.com/macros/s/AKfycbzRTeGjd6mR00Z4PPPVmtRMJKyIIhaoGnAKT_2w-JBbe704BTcFglVSiIX3oYFU98KC/exec";

export interface TelegramOrderPayload {
    customerName: string;
    phone: string;
    customerCode: string;
    occasionType: string;
    packageName: string;
    giftDetails: string;
}

/**
 * Send an order notification to Telegram via the Google Apps Script webhook.
 * This is a fire-and-forget call — it should never block or break the
 * order submission flow, so all errors are caught and logged silently.
 */
export const sendTelegramNotification = async (
    payload: TelegramOrderPayload
): Promise<void> => {
    try {
        console.log("📤 Sending Telegram notification...");

        // Google Apps Script requires 'no-cors' mode from browser
        // or you can use a regular fetch — the script handles CORS via doPost.
        // We use 'no-cors' as a safe fallback to prevent CORS blocking.
        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload),
            mode: "no-cors",
        });

        console.log("✅ Telegram notification sent successfully");
    } catch (error) {
        // Never let notification failure break the order flow
        console.error("⚠️ Telegram notification failed (non-blocking):", error);
    }
};
