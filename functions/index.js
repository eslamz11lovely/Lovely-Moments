/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  Lovely Moments — Firebase Cloud Functions
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 *  Functions:
 *  1. onNewOrder      — Telegram notification on new order
 *  2. uploadReviewImage — Secure image upload via imgbb/freeimage
 *
 *  Environment Secrets (Firebase Secret Manager):
 *    TELEGRAM_TOKEN   — Telegram bot token
 *    IMGBB_API_KEY    — imgbb API key
 *    FREEIMAGE_KEY    — Freeimage.host API key
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");

// ── Initialize Firebase Admin ─────────────────────────────
initializeApp();
const db = getFirestore();

// ── Secrets ───────────────────────────────────────────────
const telegramToken = defineSecret("TELEGRAM_TOKEN");
const imgbbApiKey = defineSecret("IMGBB_API_KEY");
const freeimageKey = defineSecret("FREEIMAGE_KEY");

// ── Constants ─────────────────────────────────────────────
const TELEGRAM_CHAT_ID = "6555571904";

// ── Helpers ───────────────────────────────────────────────

const safe = (value, fallback = "غير محدد") =>
    value !== null && value !== undefined && value !== ""
        ? String(value)
        : fallback;

function formatDate(raw) {
    if (!raw) return "غير محدد";
    try {
        let date;
        if (raw.toDate && typeof raw.toDate === "function") {
            date = raw.toDate();
        } else if (raw._seconds !== undefined) {
            date = new Date(raw._seconds * 1000);
        } else {
            date = new Date(raw);
        }
        if (isNaN(date.getTime())) return "غير محدد";
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

function buildMessage(orderId, data) {
    return [
        `🆕 <b>طلب جديد في Lovely Moments 🎀</b>`,
        ``,
        `👤 <b>الاسم:</b> ${safe(data.customerName)}`,
        `📱 <b>واتساب:</b> ${safe(data.phone)}`,
        `🆔 <b>كود العميل:</b> ${safe(data.customerCode)}`,
        `🎉 <b>نوع المناسبة:</b> ${safe(data.occasionType)}`,
        `📦 <b>الباقة:</b> ${safe(data.packageName)}`,
        `🎁 <b>تفاصيل الهدية:</b>`,
        `${safe(data.giftDetails)}`,
        ``,
        `🕒 <b>الوقت:</b> ${formatDate(data.createdAt)}`,
    ].join("\n");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  FUNCTION 1: Telegram Order Notification
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

        if (orderData._telegramNotified === true) {
            console.log(`⏭️  Order ${orderId} already notified — skipping.`);
            return null;
        }

        const message = buildMessage(orderId, orderData);
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

            await db.collection("orders").doc(orderId).update({
                _telegramNotified: true,
            });

            console.log(`🔒 Order ${orderId} marked as notified.`);
        } catch (error) {
            console.error(
                `❌ Failed to send Telegram notification for order ${orderId}:`,
                error?.response?.data || error.message
            );
            throw new Error(
                `Telegram notification failed: ${error?.response?.data?.description || error.message}`
            );
        }
    }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  FUNCTION 2: Secure Review Image Upload
//  POST body: { image: base64string, filename: string }
//  Returns:   { url: string, source: "imgbb"|"freeimage"|"none" }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

exports.uploadReviewImage = onRequest(
    {
        region: "us-central1",
        secrets: [imgbbApiKey, freeimageKey],
        cors: true,
        timeoutSeconds: 30,
    },
    async (req, res) => {
        // ── CORS headers ───────────────────────────────
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }

        if (req.method !== "POST") {
            res.status(405).json({ error: "Method not allowed" });
            return;
        }

        const { image, filename } = req.body;

        if (!image) {
            res.status(400).json({ error: "No image provided" });
            return;
        }

        // Max base64 size check (~5MB raw ≈ ~6.7MB base64)
        if (image.length > 7_000_000) {
            res.status(400).json({ error: "Image too large (max 5MB)" });
            return;
        }

        // ── Try imgbb ──────────────────────────────────
        try {
            const formData = new URLSearchParams();
            formData.append("key", imgbbApiKey.value());
            formData.append("image", image);
            if (filename) formData.append("name", filename);

            const imgbbResp = await axios.post(
                "https://api.imgbb.com/1/upload",
                formData.toString(),
                {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    timeout: 20000,
                }
            );

            const url = imgbbResp.data?.data?.display_url || imgbbResp.data?.data?.url;
            if (url) {
                console.log("✅ Image uploaded via imgbb:", url);
                res.status(200).json({ url, source: "imgbb" });
                return;
            }
        } catch (imgbbError) {
            console.warn("imgbb upload failed:", imgbbError?.response?.data || imgbbError.message);
        }

        // ── Fallback: Freeimage.host ───────────────────
        try {
            const formData2 = new URLSearchParams();
            formData2.append("key", freeimageKey.value());
            formData2.append("source", image);
            formData2.append("format", "json");

            const freeResp = await axios.post(
                "https://freeimage.host/api/1/upload",
                formData2.toString(),
                {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    timeout: 20000,
                }
            );

            const url2 = freeResp.data?.image?.url;
            if (url2) {
                console.log("✅ Image uploaded via freeimage.host:", url2);
                res.status(200).json({ url: url2, source: "freeimage" });
                return;
            }
        } catch (freeError) {
            console.warn("freeimage.host upload failed:", freeError?.response?.data || freeError.message);
        }

        // ── Both failed — continue without image ──────
        console.warn("Both image upload APIs failed — returning none");
        res.status(200).json({ url: null, source: "none" });
    }
);
