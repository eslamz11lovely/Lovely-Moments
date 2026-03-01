/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  Lovely Moments — Telegram Order Notification Function
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 *  Trigger : Firestore  →  orders/{orderId}  (onCreate)
 *  Action  : Send formatted HTML message to Telegram Bot
 *  Runtime : Firebase Cloud Functions v2
 *
 *  Environment Variables (set via Secret Manager or env config):
 *    TELEGRAM_TOKEN  — Bot token (never exposed in frontend)
 *
 *  Telegram Chat ID is stored as a constant because it
 *  identifies the receiving chat, not a secret credential.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");

// ── Initialize Firebase Admin ─────────────────────────────
initializeApp();
const db = getFirestore();

// ── Secrets ───────────────────────────────────────────────
// The bot token is loaded from Firebase Secret Manager or
// Cloud Functions environment config — never hard‑coded.
const telegramToken = defineSecret("TELEGRAM_TOKEN");

// ── Constants ─────────────────────────────────────────────
const TELEGRAM_CHAT_ID = "6555571904";

// ── Helpers ───────────────────────────────────────────────

/**
 * Safely read a field from the order data, returning a
 * fallback string when the value is null / undefined.
 */
const safe = (value, fallback = "غير محدد") =>
    value !== null && value !== undefined && value !== ""
        ? String(value)
        : fallback;

/**
 * Format a Firestore Timestamp (or JS Date / ISO string)
 * into a human‑readable Arabic‑friendly date string.
 */
function formatDate(raw) {
    if (!raw) return "غير محدد";

    try {
        let date;

        // Firestore Timestamp object
        if (raw.toDate && typeof raw.toDate === "function") {
            date = raw.toDate();
        }
        // Firestore Timestamp‑like object { _seconds, _nanoseconds }
        else if (raw._seconds !== undefined) {
            date = new Date(raw._seconds * 1000);
        }
        // Plain JS Date or ISO string
        else {
            date = new Date(raw);
        }

        if (isNaN(date.getTime())) return "غير محدد";

        // Format: YYYY-MM-DD  hh:mm AM/PM  (Cairo timezone)
        return date.toLocaleString("ar-EG", {
            timeZone: "Africa/Cairo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return "غير محدد";
    }
}

/**
 * Build the HTML message body for Telegram.
 */
function buildMessage(orderId, data) {
    const customerName = safe(data.customerName);
    const phone = safe(data.phone);
    const customerCode = safe(data.customerCode);
    const occasionType = safe(data.occasionType);
    const packageName = safe(data.packageName);
    const giftDetails = safe(data.giftDetails);
    const formattedDate = formatDate(data.createdAt);

    return [
        `🆕 <b>طلب جديد في Lovely Moments 🎀</b>`,
        ``,
        `👤 <b>الاسم:</b> ${customerName}`,
        `📱 <b>واتساب:</b> ${phone}`,
        `🆔 <b>كود العميل:</b> ${customerCode}`,
        `🎉 <b>نوع المناسبة:</b> ${occasionType}`,
        `📦 <b>الباقة:</b> ${packageName}`,
        `🎁 <b>تفاصيل الهدية:</b>`,
        `${giftDetails}`,
        ``,
        `🕒 <b>الوقت:</b> ${formattedDate}`,
    ].join("\n");
}

// ── Cloud Function ────────────────────────────────────────

exports.onNewOrder = onDocumentCreated(
    {
        document: "orders/{orderId}",
        region: "us-central1",
        secrets: [telegramToken],
    },
    async (event) => {
        const snap = event.data;
        if (!snap) {
            console.warn("⚠️  No data in snapshot — skipping.");
            return null;
        }

        const orderId = event.params.orderId;
        const orderData = snap.data();

        console.log(`📦 New order detected: ${orderId}`);

        // ── Prevent duplicate sends ───────────────────────
        // If a previous invocation already notified for this
        // order, bail out immediately.
        if (orderData._telegramNotified === true) {
            console.log(`⏭️  Order ${orderId} already notified — skipping.`);
            return null;
        }

        // Build message
        const message = buildMessage(orderId, orderData);

        // ── Send to Telegram ──────────────────────────────
        const token = telegramToken.value();
        const url = `https://api.telegram.org/bot${token}/sendMessage`;

        try {
            const response = await axios.post(url, {
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "HTML",
            });

            console.log(
                `✅ Telegram notification sent for order ${orderId}`,
                `— Telegram message_id: ${response.data?.result?.message_id}`
            );

            // Mark the order as notified to prevent duplicates
            await db.collection("orders").doc(orderId).update({
                _telegramNotified: true,
            });

            console.log(`🔒 Order ${orderId} marked as notified.`);
        } catch (error) {
            // Log the full error but don't crash the function
            console.error(
                `❌ Failed to send Telegram notification for order ${orderId}:`,
                error?.response?.data || error.message
            );

            // Re‑throw so Cloud Functions records the failure and
            // can retry if retry‑on‑failure is enabled.
            throw new Error(
                `Telegram notification failed: ${error?.response?.data?.description || error.message}`
            );
        }
    }
);
